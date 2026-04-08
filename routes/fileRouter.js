const { Router } = require('express');
const {
  uploadFile,
  downloadFile,
  getFileDetails,
  getDeleteConfirmation,
  deleteFile
} = require('../controllers/fileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

const fileRouter = Router();

fileRouter.use(isAuthenticated);

fileRouter.post('/upload', upload.single('file'), uploadFile);
fileRouter.get('/:id', getFileDetails);
fileRouter.get('/:id/download', downloadFile);
fileRouter.get('/:id/confirm-delete', getDeleteConfirmation);
fileRouter.post('/:id/delete', deleteFile);

module.exports = fileRouter;
