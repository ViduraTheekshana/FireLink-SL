const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true }, // session start time
  venue: String,
  teamMembers: [{ type: String }], // keep as strings
});

module.exports = mongoose.model("TrainingSession", sessionSchema);
