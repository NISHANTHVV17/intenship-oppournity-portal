// Connects to MongoDB Atlas using the MONGO_URI from server/.env

const mongoose = require('mongoose');

// All collections are stored in this database inside the cluster
const DB_NAME = process.env.DB_NAME || 'internship_portal';

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to server/.env (see .env.example).');
  }

  const connection = await mongoose.connect(uri, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 15000, // fail after 15s instead of hanging
  });

  console.log(`MongoDB connected: ${connection.connection.host} (database: ${DB_NAME})`);
  return connection;
}

module.exports = connectDB;
