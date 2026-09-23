const express = require("express");
const { userAuth } = require("../middlewarse/auth");
const ConnectionRequestModel = require("../modals/connectionRequest");
const User = require("../modals/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  // (req, res, next) => {
  //   console.log("REQUEST ROUTE HIT");
  //   next();
  // },
  userAuth,
  async (req, res) => {
    try {
      // console.log("API HANDLER HIT");
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid Status Type" + status });
      }
         
      
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "user not found" });
      }

      const existingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!!" });
      }

      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(404).send("Error " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedstatus = ["accepted", "rejected"];
      if (!allowedstatus.includes(status)) {
        return res.status(400).json({ message: "status not allowed" });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return (
          res.status(400).json({ message: "connection request not found" })
        );
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "connection request " + status, data });
    } catch (err) {
      res.status(400).send("Error" + err.message);
    }
  }
);

module.exports = requestRouter;
