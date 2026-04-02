const express = require("express")

 const app = express();

  app.use("/hello",(req,res)=> {
    res.send("hello")
  })

  app.use("/",(req,res)=> {
    res.send("hello node")
  })
  
 app.listen(3000, ()=> {
    console.log("server is running on port 3000");
 });