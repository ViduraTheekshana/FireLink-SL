const express = require("express");
const router = express.Router();
const CivilianController = require("../../controllers/UserManagement/CivilianController");

// Civilian routes
router.post("/register", CivilianController.register);
router.post("/login", CivilianController.login);
router.post("/google-login", CivilianController.googleLogin);
router.post("/forgot-password", CivilianController.forgotPassword);
router.post("/reset-password", CivilianController.resetPassword);
router.get("/profile", CivilianController.getProfile);
router.put("/profile", CivilianController.updateProfile);
router.post("/logout", CivilianController.logout);

module.exports = router;
