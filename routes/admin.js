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

router.get('/deleteProduct/:id', (req, res, next) => {
  let productID = req.params.id;
  productHelpers.deleteProduct(productID).then((response) => {
    console.log(response);
    res.redirect('/admin/')
  })
})

router.get('/editProduct/:id', async (req, res, next) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product', { product });
})

router.post('/edit-product/:id', async (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    let id = req.params.id;
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv('./public/product-images/'+id+'.jpg',(err)=>{
        if(err){
          console.log('uploading image error');
        }else{
          res.redirect('/admin/')
        }
      })
      
    }
    
  })
})

module.exports = router;
