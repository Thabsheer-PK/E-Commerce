var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;

  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { admin: false, products, user })
  })
});

router.get('/login', (req, res, next) => {
  res.set('Cache-Control', 'no-store'); //no cache stored in browser
  if(req.session.Loggedin){
    res.redirect('/');
  }else{
      res.render('user/login',{loginErr:req.session.loginErr})
  }

})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.Loggedin = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      req.session.loginErr = "inavlid username or password";
      res.redirect('/login');
    }
  })
})
router.get('/logout',(req,res,next)=>{
  req.session.destroy();
  res.redirect('/')
})

router.get('/signup', (req, res, next) => {
  res.render('user/signup')
})
router.post('/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
  })
  res.redirect('/');
})

router.get('/cart',(req,res,next)=>{
  res.render('user/cart.hbs')
})

module.exports = router;
