const { Router } = require('express');
const {
  createShare,
  getSharedFolder,
  downloadSharedFile
} = require('../controllers/shareController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const shareRouter = Router();

shareRouter.post('/create', isAuthenticated, createShare);
shareRouter.get('/download/:id', downloadSharedFile);
shareRouter.get('/:id', getSharedFolder);

module.exports = shareRouter;