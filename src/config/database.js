
const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(
     process.env.MONGO_SECRET,
      {
        serverSelectionTimeoutMS: 5000,
      }
    );
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); 
  }
};

module.exports = connectDb;
