// const mongoose = require("mongoose");

// const connectDb = async () => {
//   await mongoose.connect(
//     "mongodb+srv://shahbaz85116_db_user:FaCAxrVnJlXukN3S@namastenodejs.t9fmrfx.mongodb.net/devTinder"
//     // "mongodb+srv://shahbaz85116_db_user:FaCAxrVnJlXukN3S@namastenode.kyhynj3.mongodb.net/devTinder"
//     // mongodb+srv://shahbaz85116_db_user:FaCAxrVnJlXukN3S@namastenode.kyhynj3.mongodb.net/?appName=namasteNode
//   );
// };

// module.exports = connectDb;


const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://shahbaz85116_db_user:FaCAxrVnJlXukN3S@namastenodejs.t9fmrfx.mongodb.net/devTinder",
      {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      }
    );
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDb;
