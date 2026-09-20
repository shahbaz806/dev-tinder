const express = require("express");
const { userAuth } = require("../middlewarse/auth");
const ConnectionRequestModel = require("../modals/connectionRequest");
const User = require("../modals/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
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
        message: req.user.firstName  +  " is "  +  status  + " in "  +  toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(404).send("Error " + err.message);
    }
  }
);

module.exports = requestRouter;
