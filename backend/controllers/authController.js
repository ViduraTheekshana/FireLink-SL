const UserReg = require("../models/UserReg"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d", // valid for 1 day
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, phone, age, gmail, position, status, address, password, staffId } = req.body;

    // check if email already exists
    const existingUser = await UserReg.findOne({ gmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // create new user (password will be hashed automatically by your schema)
    const user = await UserReg.create({
      name,
      phone,
      age,
      gmail,
      position,
      status,
      address,
      password,
      staffId,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    const user = await UserReg.findOne({ gmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// Add Users (this was missing!)
exports.addUsers = async (req, res) => {
  try {
    const { name, phone, age, gmail, position, status, address, password, staffId } = req.body;

    // check if email already exists
    const existingUser = await UserReg.findOne({ gmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // create new user (password will be hashed automatically by your schema)
    const user = await UserReg.create({
      name,
      phone,
      age,
      gmail,
      position,
      status,
      address,
      password,
      staffId,
    });

    res.status(201).json({
      message: "User added successfully",
      user: user
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding user", error: err.message });
  }
};