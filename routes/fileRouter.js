const { Router } = require('express');
const { uploadFile } = require('../controllers/fileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

const fileRouter = Router();

fileRouter.use(isAuthenticated);

fileRouter.post('/upload', upload.single('file'), uploadFile);

module.exports = fileRouter;
