const mongoose = require("mongoose");

const shiftChangeRequestSchema = new mongoose.Schema({
  fighterId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "ShiftSchedule", required: true },
  note: { type: String },
  status: { type: String, default: "Pending" },
});

module.exports = mongoose.model("ShiftChangeRequest", shiftChangeRequestSchema);
