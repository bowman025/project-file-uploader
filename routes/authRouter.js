const { Router } = require('express');
const {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  postLogout
} = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');
const authRouter = Router();

authRouter.get('/signup', isGuest, getSignup);
authRouter.post('/signup', isGuest, postSignup);

authRouter.get('/login', isGuest, getLogin);
authRouter.post('/login', isGuest, postLogin);

authRouter.post('/logout', isAuthenticated, postLogout);

module.exports = authRouter;