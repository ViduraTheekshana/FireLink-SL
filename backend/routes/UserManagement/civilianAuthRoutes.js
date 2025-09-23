// routes/civilianAuthRoutes.js
const express = require("express");
const router = express.Router();
const civilianAuthController = require("../../controllers/UserManagement/civilianAuthController");

// Routes
router.post("/register", civilianAuthController.register);
router.post("/login", civilianAuthController.login);
router.post("/google-login", civilianAuthController.googleLogin);
router.post("/forgot-password", civilianAuthController.forgotPassword);

module.exports = router;
