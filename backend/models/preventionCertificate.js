const mongoose = require("mongoose");

const preventionCertificateSchema = new mongoose.Schema({
    fullName: {
        type:String,
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
    constructionType: {
        type: String,
        required: true,
        enum: ["Building", "Renovation", "Demolition", "Other"],
    },
    documents: [
        {
            fileName: String,
            filePath: String,
        },
    ],
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    assignedofficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    appliedDate: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model(
  "PreventionCertificate",//file name
  preventionCertificateSchema//function name
);