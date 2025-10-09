const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  trainingSession: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingSession', required: true },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateCode: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  pdfUrl: { type: String, required: true },
  isValid: { type: Boolean, default: true },
  revokedAt: Date,
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: {
    duration: Number, // Training duration in hours
    passingScore: Number,
    actualScore: Number
  },
  createdAt: { type: Date, default: Date.now }
});

certificateSchema.index({ attendee: 1, issueDate: -1 });
certificateSchema.index({ certificateCode: 1 });