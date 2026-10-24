
const jwt = require("jsonwebtoken");
const User = require("../modals/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Token missing. Please login again.",
      });
    }

    const decodedObj = jwt.verify(token, "DEV@Tinder$799987");

    const user = await User.findById(decodedObj._id);

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = { userAuth };
