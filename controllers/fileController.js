const { prisma } = require('../prisma');

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    const { folderId } = req.body;

    await prisma.file.create({
      data: {
        name: req.file.originalname,
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
