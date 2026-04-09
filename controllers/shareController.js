const path = require('node:path');
const { prisma } = require('../lib/prisma');
const cloudinary = require('../lib/cloudinary');

exports.createShare = async (req, res, next) => {
  try {
    const { folderId, duration } = req.body;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
    const share = await prisma.sharedFolder.create({
      data: {
        folderId,
        expiresAt,
      },
    });

    res.redirect(`/folders/${folderId}?shareId=${share.id}`);
  } catch (error) {
    next(error);
  }
}

exports.getSharedFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shared = await prisma.sharedFolder.findUnique({
      where: { id },
      include: {
        folder: {
          include: { files: true }
        }
      }
    });

    if (!shared || new Date() > shared.expiresAt) {
      return res.status(410).render('error', {
        title: 'Link Expired',
        message: 'This share link has expired or never existed.',
      });
    }

    res.render('sharedFolder', {
      title: `Shared Folder: ${shared.folder.name}`,
      folder: shared.folder,
      files: shared.folder.files,
      expiresAt: shared.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

exports.downloadSharedFile = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId }
    });

    if (!file || !file.cloudId) throw new Error('File not found');

    const downloadName = path.parse(file.displayName).name;
    const downloadUrl = cloudinary.url(file.cloudId, {
      flags: `attachment:${downloadName}`,
    });

    res.redirect(downloadUrl);
  } catch (error) {
    next(error);
  }
}