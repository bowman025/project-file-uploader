const { prisma } = require('../lib/prisma');

exports.getHome = async (req, res, next) => {
  res.render('index', { title: 'img Stack' })
}

exports.getDashboard = async (req, res, next) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        folders: {
          orderBy: { createdAt: 'desc' }
        },
        files: {
          where: { folderId: null },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    res.render('dashboard', {
      title: 'img Stack: Dashboard',
      folders: userData.folders,
      files: userData.files,
    });
  } catch (error) {
    next(error);
  }
}