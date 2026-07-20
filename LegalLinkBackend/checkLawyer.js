// ==========================================
// IMPORTS & DATABASE CHECK SCRIPTS
// ==========================================
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// ==========================================
// DB CONNECTION & LAWYER QUERY
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/legallink');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const LawyerSchema = new mongoose.Schema({}, { strict: false });
    const Lawyer = mongoose.model('Lawyer', LawyerSchema, 'lawyers');
    
    const lawyers = await Lawyer.find({ profilePic: { $ne: "" } });
    console.log(`Found ${lawyers.length} lawyers with pictures:`);
    lawyers.forEach(l => {
      console.log(`- ${l.name} (${l.email}): profilePic="${l.profilePic}", profilePicUri="${l.profilePicUri}"`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
