const express = require("express");
const { userAuth } = require("../middlewarse/auth");

const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    res.send(user.firstName + "send the request");
  });
  

module.exports = requestRouter