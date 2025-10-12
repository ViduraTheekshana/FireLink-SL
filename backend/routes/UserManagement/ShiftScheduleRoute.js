const express = require("express");
const router = express.Router();
const ShiftSchedule = require("../../models/UserManagement/ShiftSchedule");
const UserReg = require("../../models/UserManagement/UserReg");
const { Parser } = require("json2csv"); // for CSV conversion
const { get } = require("mongoose");
const { getReadyShifts } = require("../../controllers/UserManagement/shiftController.js"); 
// Create new shift schedule
router.post("/", async (req, res) => {
  try {
    const { date, vehicle, shiftType, members, notes } = req.body;

    if (members.length > 8) return res.status(400).json({ message: "Maximum 8 members allowed" });

    const existing = await ShiftSchedule.findOne({ date, vehicle, shiftType });
    if (existing) return res.status(400).json({ message: "Schedule already exists" });

    const newSchedule = new ShiftSchedule({ date, vehicle, shiftType, members, notes });
    await newSchedule.save();
    res.status(201).json({ message: "Shift schedule created", schedule: newSchedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET schedules by date range (optional)
router.get("/download", async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // e.g., ?startDate=2025-09-01&endDate=2025-09-30

    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const schedules = await ShiftSchedule.find(query).populate("members");

    if (!schedules.length) return res.status(404).send({ message: "No schedules found" });

    // Convert to CSV
    const csvFields = ["date", "vehicle", "shiftType", "notes", "members"];
    const csvData = schedules.map(s => ({
      date: s.date.toISOString().split("T")[0],
      vehicle: s.vehicle,
      shiftType: s.shiftType,
      notes: s.notes || "",
      members: s.members.map(m => `${m.name} (${m.position})`).join("; ")
    }));

    const parser = new Parser({ fields: csvFields });
    const csv = parser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("shift_schedules.csv");
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
});
// GET ready vehicles
router.get("/ready", getReadyShifts);
// Get all shift schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await ShiftSchedule.find()
      .populate("members", "name staffId position")
      .sort({ date: -1 });
    console.log(schedules); // <-- check what data is returned
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
