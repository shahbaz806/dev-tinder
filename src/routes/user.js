const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewarse/auth");
const ConnectionRequestModel = require("../modals/connectionRequest");

const USER_SAFE_DATA = "firstName lastName age skills about";

// get all the pending connection request for the logeIn user
userRouter.get("/user/request/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequest,
    });
  } catch (err) {
    req.statusCode(400).send("error" + err.message);
  }
});

userRouter.get("/user/connection", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    req.statusCode(400).send("error" + err.message);
  }
});

module.exports = userRouter;
