var express = require('express');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();

const verifyLogin = (req, res, next) => { //this we verify , without login we can't continue next page
  if (req.session.Loggedin) {
    next();
  } else {
    res.redirect('/login')
  }

}

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;
  adminHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { admin: false, products, user })
  })
});

router.get('/login', (req, res, next) => {
  res.set('Cache-Control', 'no-store'); //no cache stored in browser
  if (req.session.Loggedin) {
    res.redirect('/');
  } else {
    res.render('user/login', { loginErr: req.session.loginErr })
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
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/')
})

router.get('/signup', (req, res, next) => {
  res.set('Cache-Control', 'no-store'); //no cache stored in browser
  if (req.session.Loggedin) {
    res.redirect('/')
  } else {
    res.render('user/signup')
  }

})
router.post('/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((user) => {
    req.session.Loggedin = true;
    req.session.user = user;
    res.redirect('/');
  })

})

router.get('/cart', verifyLogin, (req, res, next) => {
  userHelpers.getCartProducts(req.session.user._id).then((cart) => {
    console.log(cart);
    if (cart.length === 0) {
      res.render('user/cart')
    } else {
      console.log(cart[0].cartItems);
      res.render('user/cart', { cartItems: cart[0].cartItems, user: req.session.user })
    }

  })

})

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  let productID = req.params.id;
  let userID = req.session.user._id;
  userHelpers.addToCart(productID, userID).then((response) => {
    console.log(response);
    res.redirect('/')
  })
})

module.exports = router;
