const User = require("../../models/UserManagement/UserReg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


//data insert

const addUsers = async (req, res, next) => {
  const { name, gmail, age, phone, position, status, password, address } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique staff ID based on position and count
    const prefix = position
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toUpperCase(); // e.g., "1ST" for "1stclassofficer"
    const count = await User.countDocuments({ position });
    const staffId = `${prefix}${Date.now().toString().slice(-5)}`; // unique

    const users = new User({
      name,
      gmail,
      age,
      phone,
      position,
      status,
      password: hashedPassword,
      address,
      staffId, // assign unique staff ID
    });

    await users.save();

    return res.status(200).json({ status: "ok", users, staffId });
  } catch (err) {
  console.error("Add user error:", err); // <-- show full error
  return res.status(500).json({
    status: "error",
    message: "Server error while adding user",
    error: err.message,  // <-- send error to frontend for debugging
  });
}
};



const staffLogin = async (req, res) => {
  try {
    const { staffId, password } = req.body;

    if (!staffId || !password) {
      return res.status(400).json({ status: "error", message: "Staff ID and password are required" });
    }

    const user = await User.findOne({ staffId });
    if (!user) {
      return res.status(401).json({ status: "error", err: "Invalid Staff ID or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", err: "Invalid Staff ID or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({ status: "ok", user, token });
  } catch (err) {
  console.error("Staff login error:", err);
  return res.status(500).json({
    status: "error",
    message: "Server error during login",
    error: err.message,
  });
}
};

exports.addUsers = addUsers;
exports.staffLogin = staffLogin;
