const express = require("express");
const router = express.Router();
const User = require("../../models/UserManagement/UserReg");
const UserController = require("../../controllers/UserManagement/UserController");
const { auth } = require("../../middlewares/authMiddleware");
const bcrypt = require("bcrypt");

// Public routes
router.post("/", UserController.addUsers); // Add user
router.post("/stafflogin", UserController.staffLogin); // Login

// Protected routes
router.get("/staff/:staffId", auth, async (req, res) => {
	try {
		const staffId = req.params.staffId;
		const user = await User.findOne({ staffId });
		if (!user) return res.status(404).json({ message: "User not found" });
		return res.status(200).json({ user });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

router.get("/:id", auth, async (req, res) => {
	try {
		const id = req.params.id;
		const user = await User.findById(id);
		if (!user) return res.status(404).json({ message: "User not found" });
		return res.status(200).json({ user });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

router.get("/", auth, async (req, res) => {
	try {
		const users = await User.find();
		if (!users) return res.status(404).json({ message: "Users not found" });
		return res.status(200).json({ users });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

router.put("/:id", auth, async (req, res) => {
	try {
		const { name, gmail, age, phone, address, position, status } = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ name, gmail, age, phone, address, position, status },
			{ new: true }
		);
		if (!updatedUser)
			return res.status(404).json({ message: "User not found" });
		return res.status(200).json({ user: updatedUser });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

router.put("/:id/password", auth, async (req, res) => {
	try {
		const { password } = req.body;
		
		if (!password) {
			return res.status(400).json({ message: "Password is required" });
		}

		if (password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters long" });
		}

		// Hash the password before saving
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ password: hashedPassword },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({ message: "Password updated successfully" });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

router.delete("/:id", auth, async (req, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id);
		if (!deletedUser)
			return res.status(404).json({ message: "User not found" });
		return res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
