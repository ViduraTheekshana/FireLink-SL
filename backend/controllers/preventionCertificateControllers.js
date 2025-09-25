const PreventionCertificate = require("../models/PreventionCertificate");

// Civilian applies for a certificate
exports.applyCertificate = async (req, res) => {
  try {
    // Build documents array from uploaded files
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path
      }));
    }

    // Merge documents into request body
    const applicationData = {
      ...req.body,
      documents
    };

    const newApplication = new PreventionCertificate(applicationData);
    await newApplication.save();
    res.status(201).json({
      message: "Application submitted successfully",
      data: newApplication,
    });
  } catch (error) {
    res.status(400).json({ message: "Error submitting application", error: error.message });
  }
};

// Officer views all applications
exports.getAllCertificates = async (req, res) => {
  try {
    const applications = await PreventionCertificate.find().populate(
      "assignedOfficer",
      "name email"
    );
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications", error: error.message });
  }
};

// Officer updates status
exports.updateCertificateStatus = async (req, res) => {
  try {
    const { status, assignedOfficer } = req.body; // optionally allow officer assignment
    const updatedApplication = await PreventionCertificate.findByIdAndUpdate(
      req.params.id,
      { status, assignedOfficer },
      { new: true }
    );
    if (!updatedApplication)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Status updated", data: updatedApplication });
  } catch (error) {
    res.status(400).json({ message: "Error updating status", error: error.message });
  }
};
