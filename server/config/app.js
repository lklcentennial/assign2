// installed 3rd party packages

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

// modules for authentication
let session = require('express-session')
let passport = require('passport')
let passportLocal = require('passport-local')
let localStrategy = passportLocal.Strategy
let flash = require('connect-flash')

// --body parser
const bodyParser = require('body-parser');

// --MongoDB connection
const dbConfig = require('./database.config');
const mongoose = require('mongoose');

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let listsRouter = require('../routes/list');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// setup express session
app.use(session({
  secret: "SomeSecret",
  saveUninitialized: false,
  resave: false
}))

// initialize flash
app.use(flash());

// initialize passport
app.use(passport.initialize())
app.use(passport.session())

// passport user configuration

// create a User Model Instance
let userModel = require('../models/user')
let User = userModel.User;

// implement a User Authentication Strategy
passport.use(User.createStrategy())

// serialize and deserialize the User info
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// --body parser
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

// --mongoose connection
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true
})
.then(() => console.log("DB connection successful!!!"))
.catch(err => {
  console.log("DB connection is not successful!!!", err)
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contact-list', listsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',
  {
    title: 'Error'
  });
});

module.exports = app;
