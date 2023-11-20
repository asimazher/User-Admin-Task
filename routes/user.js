const express = require("express");
const {
  addUser,
  loginUser,
  verifyUser,
} = require("../controllers/user");
const userRouter = express.Router();

// Register User

userRouter.post("/signup", addUser);

userRouter.get("/verify/:token", verifyUser);

userRouter.post("/login", loginUser);



module.exports = userRouter;
