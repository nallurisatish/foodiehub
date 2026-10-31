import mongoose from 'mongoose';

let isDbConnected = false;
let dbMode = 'disconnected';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodiehub';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    isDbConnected = true;
    dbMode = 'mongodb';
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('⚡ Operating in resilient local memory mode so all endpoints, checkout, and admin features stay 100% operational.');
    isDbConnected = false;
    dbMode = 'in-memory-resilient';
  }
};

export const getDbStatus = () => ({
  connected: isDbConnected,
  mode: dbMode,
  message: isDbConnected
    ? 'MongoDB is actively connected and persisting records.'
    : 'Running in resilient in-memory fallback. To persist in MongoDB, run local mongod or set MONGODB_URI in backend/.env'
});
