const { Router } = require('express');
const { getFolder, createFolder } = require('../controllers/folderController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const folderRouter = Router();

folderRouter.use(isAuthenticated);

folderRouter.get('/:id', getFolder);
folderRouter.post('/create', createFolder);

module.exports = folderRouter;

