require('dotenv/config');

const express = require('express');
const passport = require('./config/passport');
const sessionConfig = require('./config/session');
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

app.use(sessionConfig);
app.use(passport.session());
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.use(setViewLocals);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/folders', folderRouter);
app.use('/files', fileRouter);

app.use(handle404);
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`App listening on port: ${port}.`);
});