const fs = require('fs');
const path = require('path');
const { prisma } = require('../lib/prisma');

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    const { folderId } = req.body;

    await prisma.file.create({
      data: {
        name: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
        userId: req.user.id,
        folderId: folderId || null,
      },
    });

    res.redirect(folderId ? `/folders/${folderId}` : '/dashboard');
  } catch (error) {
    next(error);
  }
};

exports.getFileDetails = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
      include: { folder: true }
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(404).render('error', { message: 'File not found' });
    }

    res.render('fileDetails', { title: file.name, file });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id }
    });

    if (!file || file.userId !== req.user.id) {
      throw new Error('Unauthorized or file not found');
    }

    await prisma.file.delete({ where: { id: file.id } });

    const filePath = path.join(__dirname, '../uploads', file.name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.redirect(file.folderId ? `/folders/${file.folderId}` : '/dashboard');
  } catch (error) {
    next(error);
  }
};
