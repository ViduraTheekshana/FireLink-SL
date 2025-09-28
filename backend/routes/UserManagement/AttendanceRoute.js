const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { generateQRCodeToken, validateQRCodeToken } = require("../../utils/qrTokens");

const TrainingSession = require("../../models/UserManagement/TrainingSession");
const Attendance = require("../../models/UserManagement/Attendance");

// Mark attendance
router.post("/mark", async (req, res) => {
  const { sessionId, staffId, name } = req.body;

  try {
    // Find session
    const session = await TrainingSession.findById(sessionId);
    if (!session) return res.status(404).json({ status: "error", err: "Session not found" });

    // Check if user is assigned
    if (!session.teamMembers.includes(staffId)) {
      return res.status(403).json({ status: "error", err: "You are not assigned to this session" });
    }

    // Check if attendance already marked
    const alreadyMarked = await Attendance.findOne({ sessionId, staffId });
    if (alreadyMarked) {
      return res.json({ status: "error", err: "Attendance already marked" });
    }

    // Save attendance
    const attendance = await Attendance.create({ sessionId, staffId, name });
    res.json({ status: "ok", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
});

// Get attendance for a session
router.get("/:sessionId", async (req, res) => {
  try {
    const attendanceList = await Attendance.find({ sessionId: req.params.sessionId });
    res.json({ status: "ok", attendance: attendanceList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
});

// Generate QR token for a session
router.get("/generate/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const token = generateQRCodeToken(sessionId);
  res.json({ status: "ok", token });
});

// Mark attendance by scanning QR
router.post("/mark-qr", async (req, res) => {
  const { token, staffId, name } = req.body;

  const sessionId = validateQRCodeToken(token);
  if (!sessionId) return res.status(400).json({ status: "error", err: "Invalid or expired QR" });

  try {
    const attendance = new Attendance({
      sessionId,
      staffId,
      name,
      attendedAt: new Date(),
    });
    await attendance.save();
    res.json({ status: "ok", message: "Attendance marked ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
});

module.exports = router;
