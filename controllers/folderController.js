const fs = require('node:fs');
const path = require('node:path');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../lib/prisma');
const cloudinary = require('../lib/cloudinary');

const getFolderAndCheckOwnership = async (folderId, userId, includeOptions = {}) => {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: includeOptions,
  });

  if (!folder || folder.userId !== userId) {
    const error = new Error('Folder not found');
    error.status = 404;
    throw error;
  }

  return folder;
};

exports.createFolder = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder name must be between 1 and 255 characters.'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('error', {
          title: 'Invalid Request',
          message: errors.array()[0].msg,
        });
      }

      const { name } = req.body;
      await prisma.folder.create({
        data: {
          name,
          userId: req.user.id,
        },
      });
      res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  }
]

exports.getFolder = async (req, res, next) => {
  try {
    const folder = await getFolderAndCheckOwnership(req.params.id, req.user.id, {
      files: { orderBy: { uploadedAt: 'desc' } },
      sharedFolders: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: 'asc' },
      },
    });

    res.render('folder', {
      title: `img Stack: ${folder.name}`,
      folder,
      shareId: req.query.shareId,
      origin: `${req.protocol}://${req.get('host')}`,
      activeShares: folder.sharedFolders,
    });
  } catch (error) {
    next(error);
  }
}

exports.getDeleteFolderConfirmation = async (req, res, next) => {
  try {
    const folder = await getFolderAndCheckOwnership(req.params.id, req.user.id, {
      files: { orderBy: { uploadedAt: 'desc' } },
      _count: { select: { files: true } },
    });

    res.render('deleteFolderConfirmation', {
      title: 'Confirm Delete',
      folder,
      fileCount: folder._count.files,
    });
  } catch (error) {
    next(error);
  }
}

exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await getFolderAndCheckOwnership(req.params.id, req.user.id, {
      files: true,
    });

    const cloudIds = folder.files.map(f => f.cloudId).filter(Boolean);
    if (cloudIds.length > 0) {
      await cloudinary.api.delete_resources(cloudIds);
    }

    const localFiles = folder.files.filter(f => !f.cloudId);
    for (const file of localFiles) {
      const filePath = path.join(__dirname, '../uploads', file.name);
      try {
        await fs.promises.access(filePath);
        await fs.promises.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }

    await prisma.folder.delete({ where: { id: req.params.id } });
    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
}

