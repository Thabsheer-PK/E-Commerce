const { getDB } = require('../config/connect');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_FXNzEBflDxqzt7',
  key_secret: 'an8yyUbjekvrxiONEnmJDJkX',
});

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
  },
  getOrderProducts(userId, queryData = 0) {
    return new Promise(async (resolve, reject) => {
      if (queryData != 0) {
        let orderItem = await getDB().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: {
              user: new ObjectId(userId)
            }
          }, {
            $unwind: '$products'
          }, {
            $match: {
              'products.item': new ObjectId(queryData.productId)
            }
          }, {
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
              quantity: 1,
              'product._id': 1,
              'product.Name': 1,
              'product.Price': 1,
              'totalPrice': {
                $multiply: ['$quantity', { $toDouble: '$product.Price' }]
              }
            }
          }
        ]).toArray();
        orderItem.forEach((item) => {
          item.product.Price = Number(item.product.Price)
        })
        resolve(orderItem);
      } else {
        let orderItems = await getDB().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: {
              user: new ObjectId(userId)
            }
          }, {
            $unwind: "$products"
          }, {
            $project: {
              item: '$products.item',
              quantity: '$products.quantity'

            }
          }, {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'product'
            }
          }, {
            $unwind: '$product'
          },
          {
            $project: {
              quantity: 1,
              'product._id': 1,
              'product.Name': 1,
              'product.Price': 1,
              'totalPrice': {
                $multiply: ['$quantity', { $toDouble: '$product.Price' }]
              }
            }
          }
        ]).toArray();
        resolve(orderItems);
      }
    })

  },
  placeOrder: (userOrderDetails, orderItems) => {
    return new Promise(async (resolve, reject) => {
      let status = userOrderDetails.paymentMethod === 'COD' ? 'placed' : 'pending'
      const db = getDB();
      let counter = await db.collection('counters').findOneAndUpdate( //need updated document so use findOneUpdate()
        { _id: 'orderId' },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true } //returnDocAfter-counter have updated value, upsert-create collection and insert document if counters collection does't exist
      )
      let orderNumber = `ORD00${counter.seq}`

      let orderObj = {
        userId: new ObjectId(userOrderDetails.userId),
        orderNumber: orderNumber,
        delivaryAddress: {
          name: userOrderDetails.name,
          city: userOrderDetails.city,
          pincode: userOrderDetails.pincode,
          mobile: userOrderDetails.mobile,
          email: userOrderDetails.email,
          addressLine: userOrderDetails.addressLine
        },
        OrderProducts: orderItems,
        grandTotal: userOrderDetails.grandTotal,
        paymentMethod: userOrderDetails.paymentMethod,
        date: new Date(),
        status: status
      }
      let orderDatas = await getDB().collection(collection.ORDER_COLLECTION).insertOne(orderObj)

      let userId = userOrderDetails.userId
      if (!Array.isArray(userOrderDetails.productIds)) {
        let oneProductId = userOrderDetails.productIds
        await getDB().collection(collection.CART_COLLECTION).updateOne({
          user: new ObjectId(userId),
          'products.item': new ObjectId(oneProductId)
        }, {
          $pull: {
            products: {
              item: new ObjectId(oneProductId)
            }
          }
        })
      } else {
        await getDB().collection(collection.CART_COLLECTION).deleteOne({ user: new ObjectId(userId) })
      }
      resolve(orderDatas);
    })
  },
  getOrderedCartList: (userId, productIds) => {
    return new Promise(async (resolve, reject) => {
      if (!Array.isArray(productIds)) { //not in array format, so only one product 
        let orderProduct = await getDB().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: {
              user: new ObjectId(userId)
            }
          }, {
            $unwind: '$products'
          }, {
            $match: {
              'products.item': new ObjectId(productIds)
            }
          }
        ]).toArray();
        let formatted = {
          _id: orderProduct[0]._id,
          user: orderProduct[0].user,
          products: [orderProduct[0].products] // single object so manualy add array to products
        }
        resolve(formatted)

      } else {
        getDB().collection(collection.CART_COLLECTION).findOne({
          user: new ObjectId(userId)
        }).then((orderItems) => {
          resolve(orderItems)
        })
      }
    })
  },
  getOrderDetails: (userID) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await getDB().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            userId: new ObjectId(userID)
          }
        },
        {
          $unwind: "$OrderProducts.products"
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "OrderProducts.products.item",
            foreignField: "_id",
            as: "productDetails"
          }
        }, {
          $unwind: "$productDetails"
        }, {
          $addFields: {
            "OrderProducts.products.productInfo": "$productDetails"
          }
        }, {
          $group: {
            _id: "$_id",
            orderNumber: { $first: "$orderNumber" },
            userId: { $first: "$userId" },
            delivaryAddress: { $first: "$delivaryAddress" },
            grandTotal: { $first: "$grandTotal" },
            paymentMethod: { $first: "$paymentMethod" },
            date: { $first: "$date" },
            status: { $first: "$status" },
            OrderProducts_duplicate: {
              $first: {
                _id: "$OrderProducts._id",
                user: "$OrderProducts.user"
              }
            },
            products: {
              $push: "$OrderProducts.products"
            }
          }
        }, {
          $addFields: {
            OrderProducts: {
              _id: "$OrderProducts_duplicate._id",
              user: "$OrderProducts_duplicate.user",
              products: "$products"
            }
          }
        }, {
          $project: {
            products: 0,
            OrderProducts_duplicate: 0
          }
        }
      ]).sort({ date: -1 }).toArray()
      resolve(orderDetails);
    })
  },
  getViewOrderProducts: (userID, orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderProducts = await getDB().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: new ObjectId(orderId),
            userId: new ObjectId(userID)
          }
        }, {
          $unwind: '$OrderProducts.products'
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'OrderProducts.products.item',
            foreignField: '_id',
            as: 'productDetails'
          }
        }, {
          $unwind: '$productDetails'
        }, {
          $addFields: {
            'OrderProducts.products.productInfo': '$productDetails'
          }
        }, {
          $group: {
            _id: '$_id',
            orderNumber: { $first: '$orderNumber' },
            userId: { $first: '$userId' },
            delivaryAddress: { $first: '$delivaryAddress' },
            grandTotal: { $first: '$grandTotal' },
            paymentMethod: { $first: '$paymentMethod' },
            date: { $first: '$date' },
            status: { $first: '$status' },
            OrderProducts_duplicate: {
              $first: {
                _id: '$OrderProducts._id',
                user: '$OrderProducts.user'
              }
            },
            products: {
              $push: '$OrderProducts.products'
            }
          }
        }, {
          $addFields: {
            OrderProducts: {
              _id: 'OrderProducts_duplicate._id',
              user: '$OrderProducts_duplicate.user',
              products: '$products'
            }
          }
        }, {
          $project: {
            products: 0,
            OrderProducts_duplicate: 0
          }
        }
      ]).toArray();
      resolve(orderProducts);
    })
  },
  generateRazorpay: (orderId, totalAmount) => {
    return new Promise((resolve, reject) => {
      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: orderId,
        payment_capture: 1,
      };
      razorpayInstance.orders.create(options, (err, order) => {
        if(err){
          reject(err);
        }else{
          console.log('new order',order);
          resolve(order)
        }
      })
    })
  },
  getOrderAmount: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let total = await getDB().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: new ObjectId(orderId)
          }
        }, {
          $project: {
            grandTotal: 1
          }
        }
      ]).toArray()
      let grandTotal = Number(total[0].grandTotal)
      resolve(grandTotal)
    })

  }
}