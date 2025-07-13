const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'shopping';

let db; //store connected db

async function connectDB() {
  const client = await MongoClient.connect(url);
  db = client.db(dbName);
  console.log('MongoDB connected..');
}

function getDB() {
  if (!db) {
    throw new Error('Db not Connected first call connectDB()')
  }
  return db;
}


module.exports = { connectDB, getDB };