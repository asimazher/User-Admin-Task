const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailService = require("../utils/emailService");
const { signupSchema,loginSchema } = require("../utils/vaildation");
const createEmailJob = require("../utils/emailService");


exports.addUser = async (req, res) => {
  try {
    // validate data before signup
    const { error } = signupSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password } = req.body;

    const exist = await User.findOne({ username });

    if (exist) {
      return res.status(404).json({ error: "User Already exist." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      username,
      email,
      password: hashedPassword,
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
      text: `Click the following link to verify your account: ${verificationLink}`,
    };
    // Send verification email using nodemailer

    createEmailJob(emailOptions);

    res
      .status(201)
      .json({
        message: "User created. Check your email for verification.",
        user,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.VERIFY_SECRET_KEY);

    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's isVerified field to true
    user.isVerified = true;
    await user.save();

    res.json({
      message: "Account verified successfully. You can now log in.",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    // validate data before login
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({
          error:
            "Account not verified. Check your email for verification instructions.",
        });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    const { password, ...other } = user._doc;
    res.status(200).json({ ...other, accessToken });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", error });
  }
};
