const CustomNotFoundError = require('../errors/CustomNotFoundError');

exports.handle404 = (req, res, next) => {
  console.error('Unmatched URL:', req.url);
  next(new CustomNotFoundError('Page Not Found.'));
};

exports.globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('error', {
    title: 'img Stack: Error',
    message: err.message,
  });
};