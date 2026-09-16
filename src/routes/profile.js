const express = require("express");
const { userAuth } = require("../middlewarse/auth");
const profileRouter = express.Router()

profileRouter.get("/profile", userAuth, async (req, res) => {
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

  module.exports = profileRouter
  