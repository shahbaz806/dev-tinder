const express = require("express")
const bcrypt = require("bcrypt");
const User = require("../modals/user");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router()

authRouter.post("/signup", async (req, res) => {
    try {
      // validation of data
      validateSignUpData(req);
      //encrypted password
      const { firstName, lastName, emailId, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
      });
      await user.save();
      res.send("user added successfully");
    } catch (err) {
      res.status(400).send("ERROR:" + err.message);
    }
  });

  authRouter.post("/login", async (req, res) => {
    try {
      const { emailId, password } = req.body;
      const user = await User.findOne({ emailId: emailId });
      if (!user) {
        throw new Error("Invalid credential");
      }
      const isPasswordValid = await user.validatePassword(password);
      if (isPasswordValid) {
        // create a jwt token
        const token = await user.getJWT();
  
        // add the token to cookie and send the response back to the user
        res.cookie("token", token, {
          expires: new Date(Date.now() + 8 * 36000),
        });
        res.send("Login Successfull");
      } else {
        throw new Error("Invalid credential");
      }
    } catch (err) {
      res.status(400).send("ERROR:" + err.message);
    }
  });

  authRouter.post("/logout", (req,res)=> {
    res.cookie("token",null,{
        expires: new Date(Date.now())
    });
    res.send("Logout successfull!!");
  })
  module.exports = authRouter;