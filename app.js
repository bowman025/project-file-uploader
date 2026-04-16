require('dotenv/config');

const path = require('node:path');

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const passport = require('./lib/passport');
const sessionConfig = require('./lib/session');

const setViewLocals = require('./middleware/viewMiddleware');
const checkTheme = require('./middleware/themeMiddleware');
const { handle404, globalErrorHandler } = require('./middleware/errorMiddleware');

const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const fileRouter = require('./routes/fileRouter');
const folderRouter = require('./routes/folderRouter');
const shareRouter = require('./routes/shareRouter');

const assetsPath = path.join(__dirname, 'public');
const uploadsPath = path.join(__dirname, 'uploads');

const port = process.env.PORT || 3000;
const app = express();

app.set('trust proxy', 1);
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
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(sessionConfig);
app.use(passport.session());
app.use(express.static(assetsPath));
app.use(setViewLocals);
app.use(checkTheme);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/folders', folderRouter);
app.use('/files', fileRouter);
app.use('/share', shareRouter);
app.use('/uploads', express.static(uploadsPath));

app.use(handle404);
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`App listening on port: ${port}.`);
});