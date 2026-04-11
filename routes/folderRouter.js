const { Router } = require('express');
const {
  getFolder,
  createFolder,
  getDeleteFolderConfirmation,
  deleteFolder
} = require('../controllers/folderController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const folderRouter = Router();

folderRouter.use(isAuthenticated);

folderRouter.post('/create', createFolder);
folderRouter.get('/:id', getFolder);
folderRouter.get('/:id/confirm-delete', getDeleteFolderConfirmation);
folderRouter.post('/:id/delete', deleteFolder);

module.exports = folderRouter;