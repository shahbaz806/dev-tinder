// require("dotenv").config();

const { SESClient } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET,
  },
});

module.exports = { sesClient };