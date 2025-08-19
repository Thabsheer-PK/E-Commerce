var express = require('express');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const { getDB } = require('../config/connect');
const collections = require('../config/collections');
var router = express.Router();
const session = require('express-session');
const crypto = require('crypto')

const verifyLogin = (req, res, next) => { //this we verify , without login we can't continue next page
  if (req.session.user && req.session.user.Loggedin) {
    next();
  } else {
    res.redirect('/login')
  }
}
const nocache = (req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '-1');
  next();
};
async function getCartTotalPrice(userId) {
  try {
    const products = await userHelpers.getCartProducts(userId);
    let totalCartPrice = 0;

    products.forEach((item) => {
      totalCartPrice += item.totalPrice;
    });

    return totalCartPrice;
  } catch (err) {
    console.error('Error calculating total price:', err);
    return 0;
  }
}

router.get('/', nocache,async function (req, res, next) {
  let user = req.session.user;
  let cartQty = 0;
  if(!user){
     return res.redirect('/login')
  }
  cartQty = await userHelpers.getCartQuantity(req.session.user._id);
 

  adminHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { admin: false, products, user, cartQty })
  })
});

router.get('/login', nocache, (req, res, next) => {
  if (req.session.user && req.session.user.Loggedin) {
    res.redirect('/');
  } else {
    res.render('user/login')
  }

})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.user.Loggedin = true;
      res.json({ status: true })
    } else {
      res.json({ status: false, message: response.message })
    }
  })


})
router.get('/logout', nocache, (req, res, next) => {
  req.session.user = null;
  res.redirect('/')
})

router.get('/signup', nocache, (req, res, next) => {
  if (req.session.user && req.session.user.Loggedin) {
    res.redirect('/')
  } else {
    res.render('user/signup')
  }

})
router.post('/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.user.Loggedin = true;
      res.json({ status: true })
    } else {
      res.json({ status: false, message: response.message })
    }
  })
})

router.get('/cart', verifyLogin, async (req, res, next) => {
  let cartQty = await userHelpers.getCartQuantity(req.session.user._id);
  let totalCartPrice = await getCartTotalPrice(req.session.user._id);

  userHelpers.getCartProducts(req.session.user._id).then((products) => {
    if (products.length === 0) {
      res.render('user/cart', { user: req.session.user, cartQty })
    } else {
      res.render('user/cart', { products, user: req.session.user, totalCartPrice, cartQty })
    }
  })

})

router.post('/add-to-cart', (req, res, next) => {
  let userID = req.session.user._id;
  const { productID } = req.body;
  userHelpers.addToCart(productID, userID).then(() => {
    res.json({ status: true, productID })
  })
})

router.post('/change-count-qty', (req, res, next) => {
  userHelpers.changeProductQty(req.body).then(() => {
    res.json({ status: true })
  })
})

router.post('/remove-from-cart', (req, res, next) => {
  userHelpers.removeFromCart(req.body).then(() => {
    res.json({ status: true })
  })
})

router.get('/place-order-form', async (req, res, next) => {
  let user = req.session.user;
  let cartQty = await userHelpers.getCartQuantity(user._id)
  if (req.query.productId) {
    userHelpers.getOrderProducts(user._id, req.query).then((orderItems) => {
      let grandTotal = orderItems[0].totalPrice;
      res.render('user/place-order-form', { user, cartQty, orderItems, grandTotal })
    })
  } else {
    userHelpers.getOrderProducts(user._id).then(async (orderItems) => {
      let grandTotal = await getCartTotalPrice(user._id)
      res.render('user/place-order-form', { user, cartQty, grandTotal, orderItems })
    })

  }
})

router.post('/place-order', async (req, res, next) => {
  let orderItems = await userHelpers.getOrderedCartList(req.session.user._id, req.body.productIds)
  userHelpers.placeOrder(req.body, orderItems).then(async (response) => {
    let orderId = response.insertedId.toString()
    let totalAmount = await userHelpers.getOrderAmount(orderId);
    if (req.body.paymentMethod === 'COD') {
      res.json({ codSuccess: true })
    } else {
      const razorpayOrder = await userHelpers.generateRazorpay(orderId, totalAmount)
      if (razorpayOrder) {
        res.json({ razorpayOrder })
      }

    }
  })
})

router.get('/order-result', async (req, res, next) => {
  let user = req.session.user;
  let cartQty = await userHelpers.getCartQuantity(req.session.user._id)
  
  let orderResult = true;
  if (req.query.status == 'failed') {
    orderResult = false
  }
  res.render('user/order-result', { user, cartQty, succsses: orderResult })
})
router.get('/orders', async (req, res, next) => {
  let user = req.session.user
  let orders = await userHelpers.getOrderDetails(user._id)
  let cartQty = await userHelpers.getCartQuantity(user._id)
  // let products = await userHelpers.getOrderProducts(user._id)

  res.render('user/orders', { user: user._id, orders, cartQty, user })
})

router.get('/ordered-products', async (req, res, next) => {
  let user = req.session.user;
  let orderId = req.query.orderId
  let order = await userHelpers.getViewOrderProducts(user._id, orderId);
  let cartQty = await userHelpers.getCartQuantity(user._id);
  res.render('user/ordered-products', { products: order[0].OrderProducts.products, user, cartQty })
})

router.get('/profile', nocache, async (req, res, next) => {
  let user = req.session.user;
  if (!user) {
    return res.redirect('/login')
  }
  let cartQty = await userHelpers.getCartQuantity(user._id);
  let orders = await userHelpers.getOrderDetails(user._id)
  res.render('user/profile', { user, cartQty, orders })
})

router.post('/verify-payment', async (req, res, next) => {
  userHelpers.verifyPayment(req.body).then((response) => {
    if (response.status) {
      res.json({ response })
    }
  })

})

module.exports = router;
