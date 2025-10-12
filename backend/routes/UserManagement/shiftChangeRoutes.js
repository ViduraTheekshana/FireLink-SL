const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");   

const ShiftChangeRequest = require("../../models/UserManagement/ShiftChangeRequest.js");
const ShiftSchedule = require("../../models/UserManagement/ShiftSchedule.js");
const User = require("../../models/UserManagement/UserReg.js");

// POST: Create a new shift change request
router.post("/", async (req, res) => {
  const { fighterId, shiftId, note } = req.body;

  try {
    // Optional: validate fighter and shift exist
    const fighter = await User.findById(fighterId);
    if (!fighter) return res.status(404).json({ message: "Fighter not found" });

    const shift = await ShiftSchedule.findById(shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    const newRequest = new ShiftChangeRequest({
      fighterId,
      shiftId,
      note,
      status: "Pending",
    });

    await newRequest.save();
    res.json({ success: true, request: newRequest });
  } catch (err) {
    console.error("Error creating shift change request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: All shift change requests
router.get("/", async (req, res) => {
  try {
    const requests = await ShiftChangeRequest.find()
      .populate({
        path: "fighterId",
        select: "name staffId", // choose fields to show
      })
      .populate({
        path: "shiftId",
        select: "shiftType date vehicle", // choose fields to show
      })
      .exec();

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching shift change requests:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
