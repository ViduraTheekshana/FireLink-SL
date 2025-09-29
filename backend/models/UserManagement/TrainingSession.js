const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  venue: String,
  teamMembers: [{ type: String }],
  createdBy: String,
});

module.exports = mongoose.model("TrainingSession", sessionSchema);
