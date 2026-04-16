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
    const usage = await prisma.file.aggregate({
      where: { userId: req.user.id },
      _sum: { size: true },
    });
    const totalSize = Number(usage._sum.size) || 0;
    const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
    const percentUsed = (totalSize / (50 * 1024 * 1024)) * 100;

    res.render('dashboard', {
      title: 'img Stack: Dashboard',
      folders: userData.folders,
      files: userData.files,
      usedMB,
      percentUsed: Math.min(percentUsed, 100),
    });
  } catch (error) {
    next(error);
  }
}