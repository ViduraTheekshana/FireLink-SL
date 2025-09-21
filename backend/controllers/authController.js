const UserReg = require("../models/UserReg"); 
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jsonWebToken");
const jwt = require("../utils/jsonWebToken");



exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
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

    const hashedPassword = await bcrypt.hash(req.body.password, 10); // saltRounds = 10

    // create new user (password will be hashed automatically by your schema)
    const user = await UserReg.create({
      name,
      phone,
      age,
      gmail,
      position,
      status,
      address,
      password :hashedPassword,
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
    const { staffId, password } = req.body;

    const user = await UserReg.findOne({ staffId });
    if (!user) {
      return res.status(400).json({ message: "Invalid ID or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(FormData.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "lo Invalid ID or password" });
    }

    res.json({
      status: "ok",
      user: {
        name: user.name,
        position: user.position,
        staffId: user.staffId,
        _id: user._id,
      },
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

    // check if staff ID already exists (fixed logic)
    const existingUser = await UserReg.findOne({ staffId });
    if (existingUser) {
      return res.status(400).json({ message: "Staff ID already registered" });
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