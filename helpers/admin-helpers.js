const { getDB } = require('../config/connect')
const collection = require('../config/collections')
const { ObjectId } = require('mongodb');

module.exports = {
  addProduct: async (product) => {
    await getDB().collection(collection.PRODUCT_COLLECTION).insertOne(product);
    return product._id.toString();//this return image id
  },
  getAllProducts: () => { // can deal with asyn or callback or promise ,now we with deal promise
    return new Promise(async (resolve, reject) => {
      let products = await getDB().collection(collection.PRODUCT_COLLECTION).find().toArray();
      //prodcts _id in object mode, we want convert into string
      products = products.map((product) => {
        return {
          ...product, _id: product._id.toString()
        }
      })
      resolve(products)
    })
  },
  deleteProduct: (productID) => {
    return new Promise((resolve, reject) => {
      getDB().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new ObjectId(productID) }).then((response) => {
        resolve(response);
      })

    })
  },
  getProductDetails: (productID) => {
    return new Promise((resolve, reject) => {
      getDB().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(productID) }).then((response) => {
        resolve(response)
      })
    })
  },
  updateProduct: (productID, productDetails) => {
    return new Promise((resolve, reject) => {
      getDB().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(productID) }, {
        $set: {
          Name: productDetails.Name,
          Category: productDetails.Category,
          Description: productDetails.Description,
          Price: productDetails.Price

        }
      }).then((response) => {
        resolve(response);
      })
    })
  }
}
