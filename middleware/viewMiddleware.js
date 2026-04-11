const { format } = require('date-fns');

const setViewLocals = (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.formatExactDate = (date) => {
    return format(new Date(date), "PPP 'at' p");
  };
  res.locals.formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  next();
}

module.exports = setViewLocals;