const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shiftScheduleSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  vehicle: {
    type: String,
    required: true,
    enum: ["Engine 1", "Engine 2", "Ladder 1", "Rescue 1", "Tanker 1", "Command 1"]
  },
  shiftType: {
    type: String,
    required: true,
    enum: ["Day Shift (08:00-20:00)", "Night Shift (20:00-08:00)", "24-Hour Shift"]
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true
  }],
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

// Compound index to prevent duplicate schedules
shiftScheduleSchema.index({ date: 1, vehicle: 1, shiftType: 1 }, { unique: true });

module.exports = mongoose.model("ShiftSchedule", shiftScheduleSchema);
