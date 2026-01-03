const { getDB } = require('../config/connect');
const collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

async function createAdmin() {
  console.log('in create admin');
  const db = getDB(); // ← this will work ONLY after connectDB()

  const existing = await db.collection('admin').findOne({
    username: 'admin'
  });

  if (!existing) {
    const hashedPass = await bcrypt.hash('admin123', 10);

    await db.collection('admin').insertOne({
      username: 'admin',
      password: hashedPass
    });

    console.log('admin created');
  }
}


module.exports = {
  createAdmin,
  addProduct: async (product) => {
    const result = await getDB().collection(collection.PRODUCT_COLLECTION).insertOne(product);

    return result.insertedId.toString();
  }
  ,
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
    return getDB()
      .collection(collection.PRODUCT_COLLECTION)
      .updateOne(
        { _id: new ObjectId(productID) },
        { $set: productDetails }
      );
  },
  getAllOrderes: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await getDB().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        }, {
          $unwind: '$userDetails'
        }

      ]).toArray();
      resolve(orders)
    })
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await getDB().collection(collection.USER_COLLECTION).find().toArray();
      console.log(users);
      resolve(users)

    })
  },

  doAdminLogin: (details) => {
    console.log('in details ', details);
    return new Promise(async (resolve, reject) => {
      let admin = await getDB().collection('admin').findOne({ username: details.username });
      if (!admin) {
        return resolve({ status: false, message: 'Admin not found' })
      }
      let match = await bcrypt.compare(details.password, admin.password)
      if (match) {
        resolve({ status: true, admin })
      } else {
        resolve({ staus: false, message: 'Incorrect Password' })
      }

    })
  }

}
