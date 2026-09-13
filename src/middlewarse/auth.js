const jwt = require("jsonwebtoken");
const User = require("../modals/user");
const userAuth = async (req, res, next) => {
  try {
    // read the token from req cookies
    const { token } = req.cookies;

    //validate tokem
    const decodedObj = await jwt.verify(token, "DEV@Tinder$799987");

    //find user
    const { _id } = decodedObj;
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("token is not valid");
  }
};
module.exports = {
  userAuth,
};
