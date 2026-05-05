const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.send("user profile");
});


app.post("/test", (req, res) => {
  res.send("test ru");
});

 

app.use("/hello", (req, res) => {
  res.send("hello");
});



app.listen(3000, () => {
  console.log("server is running on port 3000");
});
