const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const civilianController = require("../controllers/civilianAuthController");
const { protect } = require("../middlewares/authMiddleware");

// Registration
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("gmail").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("age").isNumeric().withMessage("Age must be a number"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  civilianController.register
);

// Login
router.post("/login", civilianController.login);

// Get profile (protected)
router.get("/profile", protect, civilianController.getProfile);

// Update profile (protected)
router.put("/profile", protect, civilianController.updateProfile);

// Forgot password
router.post("/forgot-password", civilianController.forgotPassword);

// Reset password
router.post("/reset-password", civilianController.resetPassword);

// Logout
router.post("/logout", protect, civilianController.logout);

module.exports = router;
