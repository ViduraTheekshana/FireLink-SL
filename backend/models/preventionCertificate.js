const mongoose = require("mongoose");

const preventionCertificateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String, // new optional field
  },
  constructionType: {
    type: String,
    required: true,
    enum: ["Building", "Renovation", "Demolition", "Other"],
  },
  serviceType: { // new dropdown
    type: String,
    enum: ["Fire Prevention", "Safety Audit", "Inspection", "Other"],
    required: true,
    default: "Other",
  },
  urgencyLevel: { // new dropdown
    type: String,
    enum: ["Normal", "Urgent", "Critical"],
    default: "Normal",
  },
  preferredDate: {
    type: Date, // optional preferred inspection date
  },
  additionalNotes: {
    type: String, // optional notes
  },
  // Array of uploaded documents/photos
  documents: [
    {
      fileName: { type: String }, // original file name
      filePath: { type: String }, // server path or URL
      // Optionally: fileType, fileSize, uploadedAt
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Payment Assigned", "Inspected", "Completed"],
    default: "Pending",
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  payment: {
    type: Number,
    default: null,
  },
  // Inspection-related fields
  inspectionNotes: {
    type: String,
    default: "",
  },
  inspectionDate: {
    type: Date,
  },
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model(
  "PreventionCertificate",
  preventionCertificateSchema
);
