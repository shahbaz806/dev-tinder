const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    toUserId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    status: {
      type: String,
      required: true,

      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);



connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request yourself");
  }
});
const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = ConnectionRequestModel;
