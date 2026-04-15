const multer = require('multer');
const path = require('node:path');

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

const memoryStorage = multer.memoryStorage();

const storageMode = process.env.STORAGE_MODE === 'cloudinary' ? memoryStorage : diskStorage;

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only images (JPEG, PNG, GIF) are allowed!');
    error.status = 400;
    cb(error, false);
  }
}

const upload = multer({
  storage: storageMode,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;