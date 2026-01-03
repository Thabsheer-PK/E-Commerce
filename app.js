var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config(); // OK for local, ignored by Render


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var exphbs = require('express-handlebars');
var fileUpload = require('express-fileupload');
const session = require('express-session');
const MongoStore = require('connect-mongo');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout',
    partialsDir: __dirname + '/views/partials',
    helpers: {
      inc: (v) => parseInt(v) + 1,
      multiply: (a, b) => parseFloat(a) * parseFloat(b),
      priceFormat: (price) => '₹ ' + parseInt(price).toLocaleString('en-IN'),
      multiplyAndFormat: (q, p) =>
        '₹ ' + Number(q * p).toLocaleString('en-IN'),
      formatDate: (date) =>
        new Date(date).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      capitalize: (d) => d.toUpperCase(),
      getStatusColor: (status) => {
        switch (status) {
          case 'placed':
            return 'bg-dark';
          case 'pending':
            return 'bg-danger';
          default:
            return 'bg-primary';
        }
      },
      eq: (a, b) => a == b,
    },
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* 🔹 FIXED SESSION CONFIG */
app.use(
  session({
    secret: process.env.SESSION_SECRET, // ✅ ENV VARIABLE
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),

    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
