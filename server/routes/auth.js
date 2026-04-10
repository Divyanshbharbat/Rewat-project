const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    console.log(`Login attempt: ${email}, role: ${role}`);
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (user) {
      const isMatch = await user.matchPassword(password);
      console.log("Password match:", isMatch);

      if (isMatch) {
        // Check if role matches
        if (role && user.role !== role) {
          console.log(`Role mismatch: expected ${role}, got ${user.role}`);
          return res
            .status(401)
            .json({ message: "Invalid role for this user" });
        }

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (In a real app, this might be restricted to Admin)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Verify token and get user data
// @route   GET /api/auth/verify
// @access  Private
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = router;
