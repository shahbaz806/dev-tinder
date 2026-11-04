// const express = require("express");
// const paymentRouter = express.Router();
// const razorpayInstance = require("../utils/razorPay");
// const { userAuth } = require("../middlewarse/auth");
// const Payment = require("../modals/payment");
// const { memberShipAmount } = require("../utils/constant");
// const {
//   validateWebhookSignature,
// } = require("razorpay/dist/utils/razorpay-utils");
// const User = require("../modals/user");

// paymentRouter.post("/payment/create", userAuth, async (req, res) => {
//   try {
//     const { memberShipType } = req.body;
//     const { firstName, lastName, emailId } = req.user;
//     const order = await razorpayInstance.orders.create({
//       amount: memberShipAmount[memberShipType] * 100,
//       currency: "INR",
//       receipt: "receipt#1",
//       notes: {
//         firstName,
//         lastName,
//         emailId,
//         memberShipType: memberShipType,
//       },
//     });
//     // save it in my db
//     console.log(order);
//     const payment = new Payment({
//       userId: req.user._id,
//       orderId: order.id,
//       status: order.status,
//       amount: order.amount,
//       currency: order.currency,
//       receipt: order.receipt,
//       notes: order.notes,
//     });

//     const savePayment = await payment.save();

//     // return back my order details to fronted
//     res.json({ ...savePayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
//   } catch (err) {
//     return res.status(500).json({
//       msg: err.message,
//     });
//   }
// });

// paymentRouter.post("/payment/webhook", async (req, res) => {
//   const webhookSignature = req.get("x-Razorpay-Signature");
//   try {
//     const iswebhookValid = validateWebhookSignature(
//       JSON.stringify(req.body),
//       webhookSignature,
//       process.env.RAZORPAY_WEBHOOK_SECRET
//     );

//     if (!iswebhookValid) {
//       return res.status(400).json({ msg: "webhook signature is invalid" });
//     }

//     //update payment status in db
//     const paymentDetails = req.body.payload.payment.entity;

//     const payment = await Payment.findOne({
//       orderId: paymentDetails.order_id,
//     });
//     payment.status = paymentDetails.status;
//     await payment.save();

//     const user = await User.findOne({ _id: payment.userId });
//     user.isPremium = true;
//     user.memberShipType = payment.notes.memberShipType;
//     await user.save();
//     // update user as prmium
//     //return success response in razorpay

//     // if(req.body.event == "payment.captured") {

//     // }

//     // if(req.body.event == "payment.failed") {

//     // }
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// });

// paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
//   const user = req.user.toJSON();
//   if (user.isPremium) {
//     return res.json({ ...user });
//   }
//   return res.json({ ...user });
// });

// module.exports = paymentRouter;


const express = require("express");
const paymentRouter = express.Router();

const razorpayInstance = require("../utils/razorPay");
const { userAuth } = require("../middlewarse/auth");
const Payment = require("../modals/payment");
const User = require("../modals/user");
const { memberShipAmount } = require("../utils/constant");
const crypto = require("crypto");

const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

// CREATE PAYMENT ORDER
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { memberShipType } = req.body;

    if (!memberShipAmount[memberShipType]) {
      return res.status(400).json({
        msg: "Invalid membership type",
      });
    }

    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: memberShipAmount[memberShipType] * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        firstName,
        lastName,
        emailId,
        memberShipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    return res.json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.log("Create Payment Error:", err.message);

    return res.status(500).json({
      msg: err.message,
    });
  }
});

// RAZORPAY WEBHOOK
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("x-razorpay-signature");

    if (!webhookSignature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(400).json({
        msg: "Webhook signature or secret missing",
      });
    }

    // Verify webhook signature using raw request body
    const isWebhookValid = validateWebhookSignature(
      req.body.toString("utf8"),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({
        msg: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    // Activate premium only after successful capture
    if (event.event !== "payment.captured") {
      return res.status(200).json({
        msg: "Event received",
      });
    }

    const paymentDetails = event.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      return res.status(404).json({
        msg: "Payment record not found",
      });
    }

    // Prevent duplicate webhook processing
    if (payment.status === "captured") {
      return res.status(200).json({
        msg: "Payment already processed",
      });
    }

    payment.paymentId = paymentDetails.id;
    payment.status = paymentDetails.status;

    await payment.save();

    const user = await User.findById(payment.userId);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    user.isPremium = true;
    user.memberShipType = payment.notes.memberShipType;

    await user.save();

    return res.status(200).json({
      msg: "Premium activated successfully",
    });

  } catch (err) {
    console.log("Webhook Error:", err.message);

    return res.status(500).json({
      msg: err.message,
    });
  }
});

// VERIFY PAYMENT WITHOUT WEBHOOK
paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;
  
      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          msg: "Payment details are missing",
        });
      }
  
      // 1. Verify payment signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
  
      const generatedBuffer = Buffer.from(generatedSignature);
      const receivedBuffer = Buffer.from(razorpay_signature);
  
      if (
        generatedBuffer.length !== receivedBuffer.length ||
        !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
      ) {
        return res.status(400).json({
          success: false,
          msg: "Invalid payment signature",
        });
      }
  
      // 2. Find payment belonging to logged-in user
      const payment = await Payment.findOne({
        orderId: razorpay_order_id,
        userId: req.user._id,
      });
  
      if (!payment) {
        return res.status(404).json({
          success: false,
          msg: "Payment record not found",
        });
      }
  
      // 3. Fetch actual payment status from Razorpay
      const razorpayPayment = await razorpayInstance.payments.fetch(
        razorpay_payment_id
      );
  
      // 4. Validate payment details
      if (
        razorpayPayment.order_id !== razorpay_order_id ||
        Number(razorpayPayment.amount) !== Number(payment.amount) ||
        razorpayPayment.currency !== payment.currency
      ) {
        return res.status(400).json({
          success: false,
          msg: "Payment details do not match",
        });
      }
  
      if (razorpayPayment.status !== "captured") {
        return res.status(400).json({
          success: false,
          msg: "Payment is not captured yet",
          paymentStatus: razorpayPayment.status,
        });
      }
  
      // 5. Prevent duplicate processing
      if (payment.status === "captured") {
        return res.json({
          success: true,
          msg: "Payment already verified",
        });
      }
  
      // 6. Update payment in database
      payment.paymentId = razorpayPayment.id;
      payment.status = "captured";
      await payment.save();
  
      // 7. Activate premium
      const user = await User.findById(payment.userId);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }
  
      user.isPremium = true;
      user.memberShipType = payment.notes.memberShipType;
  
      await user.save();
  
      return res.json({
        success: true,
        msg: "Payment verified and premium activated",
        isPremium: user.isPremium,
        memberShipType: user.memberShipType,
      });
  
    } catch (err) {
      console.log("Payment Verification Error:", err.message);
  
      return res.status(500).json({
        success: false,
        msg: err.message,
      });
    }
  });

// VERIFY PREMIUM USER
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    return res.json({
      isPremium: req.user.isPremium,
      memberShipType: req.user.memberShipType,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
});

module.exports = paymentRouter;

