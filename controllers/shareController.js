const path = require('node:path');
const { prisma } = require('../lib/prisma');
const cloudinary = require('../lib/cloudinary');

exports.createShare = async (req, res, next) => {
  try {
    const { folderId, duration } = req.body;

    const days = parseInt(duration);
    if (isNaN(days) || days < 1 || days > 30) {
      return res.status(400).render('error', {
        title: 'Invalid Request',
        message: 'Invalid duration.',
      });
    }

    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have access to the requested folder.',
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

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

    const shared = await prisma.sharedFolder.findFirst({
      where: {
        id,
        expiresAt: { gt: new Date() },
      },
      include: {
        folder: {
          include: { files: true }
        },
      },
    });
    if (!shared || !shared.folder) {
      return res.status(410).render('error', {
        title: 'Link Expired',
        message: 'This share link has expired or never existed.',
      });
    }

    res.render('sharedFolder', {
      title: `Shared Folder: ${shared.folder.name}`,
      folder: shared.folder,
      expiresAt: shared.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

exports.downloadSharedFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        folder: {
          include: { sharedFolders: true },
        },
      },
    });
    if (!file) {
      return res.status(404).render('error', {
        title: 'File Not Found',
        message: 'The requested file could not be found.',
      });
    }

    const hasActiveShare = file.folder?.sharedFolders.some(
      share => share.expiresAt > new Date()
    );
    if (!hasActiveShare) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'This file is not available for download.',
      });
    }

    if (file.cloudId && file.cloudUrl) {
      const downloadName = path.parse(file.displayName).name;
      const downloadUrl = cloudinary.url(file.cloudId, {
        flags: `attachment:${downloadName}`,
      });

      res.redirect(downloadUrl);
    } else {
      const filePath = path.join(__dirname, '../uploads', file.name);

      res.download(filePath, file.displayName, (err) => {
        if (err) next(err);
      });
    }
  } catch (error) {
    next(error);
  }
}