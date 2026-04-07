const { prisma } = require('../lib/prisma');

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
};

exports.getFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).render('error', { message: 'Folder not found' });
    }

    res.render('folder', {
      title: `img Stack: ${folder.name}`,
      folder,
      files: folder.files,
    });
  } catch (error) {
    next(error);
  }
};