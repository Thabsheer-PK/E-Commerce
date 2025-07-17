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
      try {
        let userCart = await getDB().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userID) });
        if (userCart) {
          await getDB().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userID) }, {
            $push: {
              products: new ObjectId(productID)
            }
          })
          resolve()
        } else {
          let cartObj = {
            user: new ObjectId(userID),
            products: [new ObjectId(productID)]
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
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              let: { productList: "$products" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$productList"]
                    }
                  }
                }
              ],
              as: "cartItems"

            }

          }

        ]).toArray();
        resolve(cartItems)

      } catch (error) {
        console.log('not get the item', error);
      }
    })


  }
}