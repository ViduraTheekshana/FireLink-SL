// In your backend route file (UserRoute.js)
const express = require("express");
const router = express.Router();
const User = require("../models/UserReg.js");
const UserController = require("../controllers/authController.js");
const auth = require("../middlewares/auth");

// Protected route example
router.get("/protected", auth, (req, res) => {
  res.send("This is a protected route");
});


router.post("/",auth, UserController.addUsers);

// Add this new route to find user by staffId
router.get("/staff/:staffId", auth,async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const user = await User.findOne({ staffId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Add this route to get user by ID
router.get("/:id", auth,async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Add this route to get all users
router.get("/",auth, async (req, res) => {
  try {
    const users = await User.find();
    
    if (!users) {
      return res.status(404).json({ message: "Users not found" });
    }
    
    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// Add this route to your backend (UserRoute.js)
router.put("/:id", auth,async (req, res) => {
  try {
    const id = req.params.id;
    const { name, gmail, age, phone, address, position, status } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, gmail, age, phone, address, position, status },
      { new: true } // Return the updated document
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// Delete a user by ID
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;