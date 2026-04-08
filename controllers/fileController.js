const fs = require('node:fs');
const path = require('node:path');
const streamifier = require('streamifier');
const cloudinary = require('../lib/cloudinary');
const { prisma } = require('../lib/prisma');

const getFileAndCheckOwnership = async (fileId, userId, includeOptions = {}) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: includeOptions,
  });

  if (!file || file.userId !== userId) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }

  return file;
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    const { folderId } = req.body;

    let fileData = {
      displayName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user.id,
      folderId: folderId || null,
    }

    if (process.env.STORAGE_MODE === 'cloudinary') {
      const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'project_file_uploader' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      }

      const result = await uploadFromBuffer();

      fileData.name = result.public_id;
      fileData.cloudId = result.public_id;
      fileData.cloudUrl = result.secure_url;
      fileData.cloudVer = result.version;
    } else {
      fileData.name = req.file.filename;
    }

    await prisma.file.create({ data: fileData });
    res.redirect(folderId ? `/folders/${folderId}` : '/dashboard');
  } catch (error) {
    next(error);
  }
}

exports.downloadFile = async (req, res, next) => {
  try {
    const file = await getFileAndCheckOwnership(req.params.id, req.user.id);

    if (file.cloudUrl) {
      const downloadUrl = cloudinary.url(file.cloudId, {
        flags: "attachment",
        attachment_filename: file.displayName,
      });
      return res.redirect(downloadUrl);
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

exports.getFileDetails = async (req, res, next) => {
  try {
    const file = await getFileAndCheckOwnership(req.params.id, req.user.id, { folder: true });

    res.render('fileDetails', { title: file.displayName, file });
  } catch (error) {
    next(error);
  }
}

exports.getDeleteConfirmation = async (req, res, next) => {
  try {
    const file = await getFileAndCheckOwnership(req.params.id, req.user.id, { folder: true });

    res.render('deleteConfirmation', { title: 'Confirm Delete', file });
  } catch (error) {
    next(error);
  }
}

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await getFileAndCheckOwnership(req.params.id, req.user.id);

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

    await prisma.file.delete({ where: { id: file.id } });
    res.redirect(file.folderId ? `/folders/${file.folderId}` : '/dashboard');
  } catch (error) {
    next(error);
  }
}
