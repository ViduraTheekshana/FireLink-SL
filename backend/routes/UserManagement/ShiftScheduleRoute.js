const express = require("express");
const router = express.Router();
const ShiftSchedule = require("../../models/UserManagement/ShiftSchedule");
const UserReg = require("../../models/UserManagement/UserReg");

// Create new shift schedule
router.post("/", async (req, res) => {
  try {
    const { date, vehicle, shiftType, members, notes} = req.body;

    if (members.length > 8) return res.status(400).json({ message: "Maximum 8 members allowed" });

    const existing = await ShiftSchedule.findOne({ date, vehicle, shiftType });
    if (existing) return res.status(400).json({ message: "Schedule already exists" });

    const newSchedule = new ShiftSchedule({ date, vehicle, shiftType, members, notes});
    await newSchedule.save();
    res.status(201).json({ message: "Shift schedule created", schedule: newSchedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all shift schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await ShiftSchedule.find()
      .populate("members", "name staffId position")
      .sort({ date: -1 });
    res.status(200).json({ schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update shift schedule
router.put("/:id", async (req, res) => {
  try {
    const { members, notes } = req.body;
    if (members && members.length > 8) return res.status(400).json({ message: "Max 8 members allowed" });

    const updated = await ShiftSchedule.findByIdAndUpdate(req.params.id, { members, notes }, { new: true })
      .populate("members", "name staffId position");

    if (!updated) return res.status(404).json({ message: "Schedule not found" });
    res.status(200).json({ message: "Schedule updated", schedule: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete shift schedule
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ShiftSchedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Schedule not found" });
    res.status(200).json({ message: "Schedule deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all members (for dropdown)
router.get("/members/all", async (req, res) => {
  try {
    const users = await UserReg.find().select("name staffId position");
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
