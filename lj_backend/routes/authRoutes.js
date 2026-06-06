const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =================== SIGNUP ===================
router.post("/signup", async (req, res) => {
  try {
    const { role, username, password, fullName } = req.body;

    if (!role || !username || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      role,
      username,
      password: hashedPassword,
      fullName,
    });

    await newUser.save();

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// =================== LOGIN ===================
router.post("/login", async (req, res) => {
  try {
    const { role, username, password } = req.body;

    // Validate inputs
    if (!role || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find user by username and role
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured: JWT_SECRET missing." });
    }

    const token = jwt.sign(
      { userId: user._id, fullName: user.fullName, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return token and user info
    res.json({
      message: "Login successful!",
      token,
      userId: user._id,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

module.exports = router;
