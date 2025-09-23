const mongoose = require("mongoose");
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: "TrainingSession", required: true },
  staffId: { type: String, required: true },
  name: { type: String, required: true },
  attendedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
