const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (error.message.includes('querySrv')) {
      console.error('\n>>> SRV DNS resolution failed. Try this fix:');
      console.error('    1. Check your internet connection');
      console.error('    2. Make sure password in .env has @ encoded as %40');
      console.error('    3. If still failing, use standard connection string instead of srv\n');
    }

    process.exit(1);
  }
};

module.exports = connectDB;