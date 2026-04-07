const { Router } = require('express');
const { getHome, getDashboard } = require('../controllers/indexController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const indexRouter = Router();

indexRouter.get('/', getHome);
indexRouter.get('/dashboard', isAuthenticated, getDashboard);

module.exports = indexRouter;