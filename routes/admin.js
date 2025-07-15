var express = require('express');
var router = express.Router();
const { getDB } = require('../config/connect');
const productHelpers = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products })
  })
});

router.get('/add-product', (req, res) => {
  res.render('admin/add-product-form', { admin: true })
})

router.post('/add-product', async (req, res) => {
  const id = await productHelpers.addProduct(req.body) //id have image id
  let image = req.files.Image;
  await image.mv('./public/product-images/' + id + '.jpg')//imag save this path
  res.render('admin/add-product-form', { admin: true });
})

router.get('/deleteProduct/:id',(req,res,next)=>{
  let productID = req.params.id;
  productHelpers.deleteProduct(productID).then((response)=>{
    console.log(response);
    res.redirect('/admin/')
  })
  
  
})


module.exports = router;
