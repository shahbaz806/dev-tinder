const validator = require("validator");
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("please enter strog password");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditdFields = [
    "firstNAme",
    "lastName",
    "emailId",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditdFields.includes(field)
  );
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
