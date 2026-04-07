const bcrypt = require('bcryptjs');
const passport = require('passport');
const { prisma } = require('../lib/prisma');
const { body, matchedData, validationResult } = require('express-validator');

exports.getSignup = (_, res) => {
  res.render('signup', { title: 'Sign Up', errors: [], user: {} });
};

exports.postSignup = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username should be between 1 and 50 characters.')
    .isAlphanumeric()
    .withMessage('Username should only contain letters and numbers.')
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: { username: value },
      });
      if (user) {
        throw new Error('Username already in use.');
      }
    }),
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters.'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('signup', {
        title: 'Sign Up',
        errors: errors.array(),
        user: req.body,
      });
    }

    try {
      const { username, password } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword,
        },
      });

      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.redirect('/dashboard');
      });
    } catch (error) {
      next(error);
    }
  },
];

exports.getLogin = (req, res) => {
  const errors = req.session.messages || [];
  req.session.messages = [];
  res.render('login', { title: 'Log In', errors });
};

exports.postLogin = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login',
  failureMessage: true,
});

exports.getLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};
