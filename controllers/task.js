const Task = require("../models/Task");

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailService = require("../utils/emailService");
const { signupSchema,loginSchema } = require("../utils/vaildation");



exports.addTask = async (req, res) => {
    try {
      // validate data before adding
    //   const { error } = taskSchema.validate(req.body);
  
    //   if (error) {
    //     return res.status(400).json({ error: error.details[0].message });
    //   }
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ username: decoded.username });
        const authorize = user.isAdmin
    if (!authorize) {
      return res.status(404).json({ error: "ERROR: User not Admin." });
    }

  
      const { name, description, state, priority } = req.body;
  
      const taskData = new Task({
        name, description, state, priority
      });
  
  
      const task = await taskData.save();
  
      res
        .status(201)
        .json({
          message: "Task created by admin.",
          task,
        });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };

exports.deleteTask = async (req, res) => {
    try {

const { token } = req.params;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ username: decoded.username });
        const authorize = user.isAdmin
    if (!authorize) {
      return res.status(404).json({ error: "ERROR: User not Admin." });
    }
    const { taskId } = req.body;
    const getTask = await Task.findOne({ _id: taskId });
if (!getTask) {
  return res.status(404).json({ error: "ERROR: Task not exist." });
}

      getTask.isDeleted = true;
    await getTask.save();
    
      res
        .status(201)
        .json({
          message: "Task deleted by admin.",
          getTask,
        });
    } catch (error) {
      res.status(500).json( error.message);
    }
  };


  exports.addAdmin = async (req, res) => {
    try {
      // validate data before signup
      const { error } = signupSchema.validate(req.body);
  
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { token } = req.params;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const checkAdmin = await User.findOne({ username: decoded.username });
        const authorize = checkAdmin.isAdmin
    if (!authorize) {
      return res.status(404).json({ error: "ERROR: User not Admin." });
    }
  
      const { username, email, password } = req.body;
  
      const exist = await User.findOne({ username });
  
      if (exist) {
        return res.status(404).json({ error: "Username in use." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userData = new User({
        username,
        email,
        password: hashedPassword,
        isAdmin: true
      });
  
      // Generate a verification token
      const verificationToken = jwt.sign(
        { username: userData.username },
        process.env.VERIFY_SECRET_KEY,
        { expiresIn: "1d" }
      );
  
      const user = await userData.save();
  
      const verificationLink = `http://localhost:3000/api/auth/verify/${verificationToken}`;
  
      const emailOptions = {
        to: email,
        subject: "Account Verification",
        text: `Click the following link to verify your Admin account: ${verificationLink}`,
      };
      // Send verification email using nodemailer
  
      emailService(emailOptions);
  
      res
        .status(201)
        .json({
          message: "Admin User created. Check your email for verification.",
          user,
        });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };