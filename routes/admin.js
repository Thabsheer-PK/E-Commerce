var express = require('express');
var router = express.Router();
const { getDB } = require('../config/connect');
const adminHelpers = require('../helpers/admin-helpers');
const { doLogin } = require('../helpers/user-helpers');
const upload = require("../config/multer");



const verifyAdmin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.redirect('/admin/login')
  }
}

router.get('/login', async (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('admin/login')
  }

})

router.post('/login', async (req, res, next) => {
  let { username, password } = req.body;
  let missingField = [];
  if (!username) missingField.push('Username')
  if (!password) missingField.push('Password')
  if (missingField.length > 0) {
    res.json({ status: false, message: `Please Enter ${missingField.join(" and ")}` })
  }
  if (missingField.length === 0) {
    adminHelpers.doAdminLogin(req.body).then((response) => {
      console.log(response);
      if (response.status) {
        req.session.admin = response.admin;
        req.session.adminloggedIn = true;
        res.json({ status: true })
      } else {
        res.json({ status: false, message: response.message })
      }
    })
  }

})
router.get('/admin-logout', (req, res, next) => {
  req.session.admin = null;
  res.redirect('/admin/login')
})

router.get('/', verifyAdmin, function (req, res, next) {
  res.set('Cache-Control', 'no-store');
  if (req.session.admin) {
    adminHelpers.getAllProducts().then((products) => {
      res.render('admin/view-products', { admin: true, products })
    })
  } else {
    res.redirect('/admin/login')
  }

});

router.get('/add-product', (req, res) => {
  res.render('admin/add-product-form', { admin: true })
})

router.post('/add-product',upload.single('Image'),async (req, res) => {

    const product = {
      Name: req.body.Name,
      Category: req.body.Category,
      Price: req.body.Price,
      Description: req.body.Description,
      Image: req.file.path, // Cloudinary URL
    };

    await adminHelpers.addProduct(product);
    res.render('admin/add-product-form', { admin: true });
  }
);




router.get('/deleteProduct/:id', (req, res, next) => {
  let productID = req.params.id;
  adminHelpers.deleteProduct(productID).then((response) => {
    console.log(response);
    res.redirect('/admin/')
  })
})

router.get('/editProduct/:id', async (req, res, next) => {
  let product = await adminHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product', { product, admin: true });
})

router.post('/edit-product/:id',upload.single('Image'),async (req, res) => {

    const productDetails = {
      Name: req.body.Name,
      Category: req.body.Category,
      Description: req.body.Description,
      Price: req.body.Price,
    };

    // If new image uploaded
    if (req.file) {
      productDetails.Image = req.file.path; // Cloudinary URL
    }

    await adminHelpers.updateProduct(req.params.id, productDetails);
    res.redirect('/admin/');
  }
);


router.get('/orders', (req, res, next) => {
  adminHelpers.getAllOrderes().then((orders) => {
    res.render('admin/all-orders', { admin: true, orders })
  })
})

router.get('/users', (req, res, next) => {
  adminHelpers.getAllUsers().then((users) => {
    res.render('admin/all-users', { admin: true, users })
  })
})

module.exports = router;
