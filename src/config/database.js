const mongoose = require("mongoose");

const connectDb = async () => {
  mongoose.connect(
    "mongodb+srv://shahbaz85116_db_user:FaCAxrVnJlXukN3S@namastenode.kyhynj3.mongodb.net/devTinder"
    // mongodb+srv://shahbaz85116_db_user:FaCAxrVnJlXukN3S@namastenode.kyhynj3.mongodb.net/?appName=namasteNode
  );
};

module.exports = connectDb;
