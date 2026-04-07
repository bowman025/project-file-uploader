const { format } = require('date-fns');

const setViewLocals = (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.formatExactDate = (date) => {
    return format(new Date(date), "PPP 'at' p");
  }

  next();
}

module.exports = setViewLocals;