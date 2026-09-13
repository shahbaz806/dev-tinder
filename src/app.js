const express = require("express");
const connectDb = require("./config/database");
const app = express();
const User = require("./modals/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("../src/middlewarse/auth");
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credential");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      // create a jwt token
      const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$799987", {
        expiresIn: "1d",
      });

      // add the token to cookie and send the response back to the user
      res.cookie("token", token);
      res.send("Login Successfull");
    } else {
      throw new Error("Invalid credential");
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Logged in again");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + "send the request");
});

connectDb()
  .then(() => {
    console.log("Databse connected");
    app.listen(3000, () => {
      console.log("server is running on port 3000.....");
    });
  })
  .catch((err) => {
    console.log("not connected");
  });
