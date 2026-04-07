const { Router } = require('express');
const {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  getLogout
} = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');
const authRouter = Router();

authRouter.get('/signup', isGuest, getSignup);
authRouter.post('/signup', isGuest, postSignup);

authRouter.get('/login', isGuest, getLogin);
authRouter.post('/login', isGuest, postLogin);

authRouter.get('/logout', isAuthenticated, getLogout);

module.exports = authRouter;