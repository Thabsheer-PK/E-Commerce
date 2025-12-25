const { MongoClient } = require('mongodb');

let db = null;        // store DB instance
let client = null;   // store client instance

async function connectDB() {
  if (db) {
    return db; // already connected
  }

  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    db = client.db(); // DB name comes from URI
    console.log('MongoDB Connected (Atlas)');

    return db;
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('DB not connected. Call connectDB() first');
  }
  return db;
}

module.exports = { connectDB, getDB };

