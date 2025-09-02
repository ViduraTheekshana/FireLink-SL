const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
	trainingSession: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "TrainingSession",
		required: true,
	},
	attendee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	checkInTime: { type: Date, required: true },
	deviceInfo: {
		ip: String,
		userAgent: String,
		deviceId: String,
	},
	qrCodeUsed: { type: String, required: true }, // Hash of QR payload for audit
	status: {
		type: String,
		enum: ["present", "late", "absent"],
		default: "present",
	},
	createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicates
attendanceSchema.index({ trainingSession: 1, attendee: 1 }, { unique: true });
attendanceSchema.index({ trainingSession: 1, checkInTime: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
