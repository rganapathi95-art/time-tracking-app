const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Make sure MongoDB is running on your system.');
    console.error('Start MongoDB with: net start MongoDB (Windows) or mongod (manual start)');
    process.exit(1);
  }
};

module.exports = connectDB;
