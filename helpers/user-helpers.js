const { getDB } = require('../config/connect');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      getDB().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
        let insertedId = data.insertedId;
        let user = await getDB().collection(collection.USER_COLLECTION).findOne({ _id: insertedId })
        resolve(user)
      })
    })
  },
  doLogin: async (userData) => {
    try {
      let response = {};
      const user = await getDB().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });

      if (user) {
        const status = await bcrypt.compare(userData.Password, user.Password);
        if (status) {
          console.log('Login success');
          response.user = user;
          response.status = true;
          return response;
        } else {
          console.log('Login failed - password mismatch');
          return { status: false };
        }
      } else {
        console.log('Login failed - user not found');
        return { status: false };
      }

    } catch (err) {
      console.error('Login error:', err);
      return { status: false, error: 'Something went wrong' };
    }
  },
  addToCart: (productID, userID) => {
    return new Promise(async (resolve, reject) => {
      let productObj = {
        item: new ObjectId(productID),
        quantity: 1,
      }

      try {
        let userCart = await getDB().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userID) });
        if (userCart) {
          let productExist = await userCart.products.findIndex(product => product.item == productID)
          if (productExist != -1) {
            console.log('product exist');
            await getDB().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userID), 'products.item': new ObjectId(productID) },
              {
                $inc: { 'products.$.quantity': 1 }
              }
            )
            resolve()
          } else {
            await getDB().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userID) }, {
              $push: {
                products: productObj
              }
            })

            resolve()
          }
        } else {
          let cartObj = {
            user: new ObjectId(userID),
            products: [productObj]
          }
          await getDB().collection(collection.CART_COLLECTION).insertOne(cartObj);
          resolve();

        }
      } catch (error) {
        reject(error)
        console.log("error: ", error);
      }
    })
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = await getDB().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: {
              user: new ObjectId(userId)
            }
          },
          {
            $unwind: "$products"
          },
          {
            $project: {
              item: '$products.item',
              quantity: '$products.quantity'
            }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'product'
            }
          }, {
            $unwind: '$product'
          }, {
            $project: {
              item: 1,
              quantity: 1,
              product: 1,
              totalPrice: {
                $multiply: ['$quantity', { $toDouble: "$product.Price" }]
              }
            }
          }


        ]).toArray();
        cartItems.forEach((item) => {
          item.product.Price = Number(item.product.Price)
        })
        resolve(cartItems)

      } catch (error) {
        console.log('not get the item', error);
      }
    })

  },
  getCartQuantity: async (userId) => {
    let quantity = 0;
    let cart = await getDB().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
    if (cart) {
      let result = await getDB().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: {
            user: new ObjectId(userId)
          }
        }, {
          $project: {
            totalQty: {
              $sum: "$products.quantity"
            }
          }
        }
      ]).toArray();

      if (result.length >= 0) {
        quantity = result[0].totalQty;
      }
    }

    return quantity;

  },

  changeProductQty: (details) => {
    return new Promise((resolve, reject) => {
      let cartId = details.cartId
      let productId = details.productId
      let count = parseInt(details.count)
      getDB().collection(collection.CART_COLLECTION).updateOne({ _id: new ObjectId(cartId), 'products.item': new ObjectId(productId) }, {
        $inc: { "products.$.quantity": count } // count 1 or -1, done properly
      }).then((response) => {
        resolve(response)
      })
    })
  },

  removeFromCart: (details) => {
    return new Promise((resolve, reject) => {
      let cartId = details.cartId
      let productId = details.productId
      getDB().collection(collection.CART_COLLECTION).updateOne({
        _id: new ObjectId(cartId),
        'products.item': new ObjectId(productId)
      }, {
        $pull: {
          products: { item: new ObjectId(productId) }
        }
      }).then(() => {
        resolve()
      })
    })
  }
}