const validator = require("validator");
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("g is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }
  else if (!validator.isStrongPassword(password)) {
    throw new Error("please enter strog password");
  }
};

module.exports = {
    validateSignUpData,
}
