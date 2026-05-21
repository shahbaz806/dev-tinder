const mongoose = require("mongoose");
const validator = require("validator");


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
       
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      minLength: 10,
      maxLength: 25,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid email address:" + value);
        }
      },

    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("enter strong  password :" + value);
        }
      }

    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
