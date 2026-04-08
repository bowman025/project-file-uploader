require('dotenv/config');

const express = require('express');
const helmet = require('helmet');
const passport = require('./lib/passport');
const sessionConfig = require('./lib/session');
const setViewLocals = require('./middleware/viewMiddleware');
const { handle404, globalErrorHandler } = require('./middleware/errorMiddleware');
const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const folderRouter = require('./routes/folderRouter');
const fileRouter = require('./routes/fileRouter');
const path = require('node:path');

const assetsPath = path.join(__dirname, 'public');
const port = process.env.PORT || 3000;
const app = express();

app.set('views', path.join(__dirname, '/views/pages'));
app.set('view engine', 'ejs');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  })
);
app.use(sessionConfig);
app.use(passport.session());
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.use(setViewLocals);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/folders', folderRouter);
app.use('/files', fileRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(handle404);
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`App listening on port: ${port}.`);
});