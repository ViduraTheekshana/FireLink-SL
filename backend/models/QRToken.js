const mongoose = require('mongoose');

const qrTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  trainingSession: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingSession', required: true },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  usedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// TTL index for automatic cleanup
qrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
qrTokenSchema.index({ tokenHash: 1, used: 1 });