const { getDB } = require('../config/connect')

module.exports = {
  addProduct: async (product) => {
    await getDB().collection('products').insertOne(product);
    return product._id.toString();
  }
}
