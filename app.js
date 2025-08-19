var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { connectDB } = require('./config/connect');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var exphbs = require('express-handlebars')
var fileUpload = require('express-fileupload')
const session = require('express-session')
const MongoStore = require('connect-mongo'); //session store in DB even nodemon restart

var app = express();

connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout',
  partialsDir: __dirname + '/views/partials',
  helpers: {
    inc: function (value) {
      return parseInt(value) + 1;
    },
    multiply: function (a, b) {
      return parseFloat(a) * parseFloat(b);
    },
    priceFormat: (price) => {
      return '₹ ' + parseInt(price).toLocaleString('en-IN') //indian format
    },
    multiplyAndFormat: (qty, price) => {
      let total = qty * price;
      return '₹ ' + Number(total).toLocaleString('en-IN');
    },
    formatDate: (date)=>{
      return new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    },
    capitalize: (data)=>{
      return data.toUpperCase();
    },
    getStatusColor: (status)=>{
      switch (status){
        case 'placed': 
        return 'bg-dark'
        case 'pending':
        return 'bg-danger'
        default: 
        return 'bg-primary'
      }
    },
    eq:(a,b)=>{
      return a==b;
    }
  }
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({
  secret: 'Key',
  resave: false,
  store: MongoStore.create({      //session store in DB even nodemon restart
    mongoUrl: 'mongodb://localhost:27017/',
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 }

}))// cookie expired in 1 day

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
