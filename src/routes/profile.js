const express = require("express");
const { userAuth } = require("../middlewarse/auth");
const profileRouter = express.Router();
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../modals/user");
const crypto = require("crypto");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
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

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("invalid Edit Request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName},your profile updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(404).send("Error" + err.message);
  }
});

profileRouter.post("/profile/password", async (req, res) => {
  try {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("user not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink =
      `http://localhost:3000/reset-password/${resetToken}`;

    console.log(resetLink);

    res.send("Reset password link sent successfully");
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.patch("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.password = passwordHash;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.send("Password reset successfully");
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

module.exports = profileRouter;
