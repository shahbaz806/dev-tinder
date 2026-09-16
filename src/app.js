const express = require("express");
const connectDb = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

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
