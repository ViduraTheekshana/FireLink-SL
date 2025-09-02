const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 500 },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  location: { type: String, required: true, maxLength: 200 },
  capacity: { type: Number, required: true, min: 1, max: 100 },
  registeredAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
  certificateEligible: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
trainingSessionSchema.index({ startDateTime: 1, status: 1 });
trainingSessionSchema.index({ trainer: 1, startDateTime: 1 });