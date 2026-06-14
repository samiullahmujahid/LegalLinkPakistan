const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We use process.env to keep the URI secret and flexible
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DATABASE STATUS: Connected to ${conn.connection.host}`);
  } catch (error) {
    console.error(`DATABASE ERROR: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;