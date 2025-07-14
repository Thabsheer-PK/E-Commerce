const { getDB } = require('../config/connect')
const collection = require('../config/collections')

module.exports = {
  addProduct: async (product) => {
    await getDB().collection(collection.PRODUCT_COLLECTION).insertOne(product);
    return product._id.toString();//this return image id
  },
  getAllProducts:()=>{ // can deal with asyn or callback or promise ,now we with deal promise
    return new Promise (async (resolve,reject)=>{
      let products = await getDB().collection(collection.PRODUCT_COLLECTION).find().toArray();
      //prodcts _id in object mode, we want convert into string
      products = products.map((product)=>{
        return{
          ...product,_id: product._id.toString()
        }
      })
      resolve(products)
    })
  }
}
