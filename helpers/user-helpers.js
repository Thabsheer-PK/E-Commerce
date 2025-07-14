const { getDB } = require('../config/connect');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      getDB().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
        resolve(data)
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
  }
}