const fs = require('node:fs');
const path = require('node:path');
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

exports.createFolder = async (req, res, next) => {
  try {
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

exports.getFolder = async (req, res, next) => {
  try {
    const folder = await getFolderAndCheckOwnership(req.params.id, req.user.id, {
      files: { orderBy: { uploadedAt: 'desc' } },
    });

    res.render('folder', {
      title: `img Stack: ${folder.name}`,
      folder,
      files: folder.files,
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

    for (const file of folder.files) {
      if (file.cloudId) {
        await cloudinary.uploader.destroy(file.cloudId);
      } else {
        const filePath = path.join(__dirname, '../uploads', file.name);
        try {
          await fs.promises.access(filePath);
          await fs.promises.unlink(filePath);
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
    }

    await prisma.folder.delete({ where: { id: req.params.id } });
    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
}

