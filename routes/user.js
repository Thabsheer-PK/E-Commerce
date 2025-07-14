var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { admin: false, products })
  })
});

router.get('/login', (req, res, next) => {
  res.render('user/login')
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.redirect('/');
    }else{
      res.redirect('/login');
    }
  })
})

router.get('/signup', (req, res, next) => {
  res.render('user/signup')
})
router.post('/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
  })
})

module.exports = router;
