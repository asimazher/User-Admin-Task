const express = require("express");

const { addTask, addAdmin, deleteTask } = require("../controllers/task");
const adminRouter = express.Router();

// Register User

adminRouter.post("/addtask/:token", addTask);

adminRouter.post("/deletetask/:token", deleteTask);


adminRouter.post("/addadmin/:token", addAdmin);


module.exports = adminRouter;
