const PreventionCertificate = require("../models/preventionCertificate");

// Civilian applies for a certificate
exports.applyCertificate = async (req, res) => {
  try {
    // For GridFS, we store the file ID and filename
    let documents = [];
    if (req.file) {
      documents.push({
        fileName: req.file.originalname,
        fileId: req.file.id,
        filePath: req.file.filename
      });
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
    const { status, assignedOfficer, rejectionReason } = req.body;
    const updateData = { status, assignedOfficer };
    
    // Add timestamp fields based on status
    if (status === "Approved") {
      updateData.approvedAt = new Date();
    } else if (status === "Rejected") {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }
    
    const updatedApplication = await PreventionCertificate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedApplication)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Status updated", data: updatedApplication });
  } catch (error) {
    res.status(400).json({ message: "Error updating status", error: error.message });
  }
};

// Update payment amount
exports.updatePayment = async (req, res) => {
  try {
    const { payment } = req.body;
    const updatedApplication = await PreventionCertificate.findByIdAndUpdate(
      req.params.id,
      { payment },
      { new: true }
    );
    if (!updatedApplication)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Payment updated", data: updatedApplication });
  } catch (error) {
    res.status(400).json({ message: "Error updating payment", error: error.message });
  }
};

// Add inspection notes
exports.updateInspectionNotes = async (req, res) => {
  try {
    const { inspectionNotes } = req.body;
    const updatedApplication = await PreventionCertificate.findByIdAndUpdate(
      req.params.id,
      { inspectionNotes },
      { new: true }
    );
    if (!updatedApplication)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Inspection notes updated", data: updatedApplication });
  } catch (error) {
    res.status(400).json({ message: "Error updating inspection notes", error: error.message });
  }
};

// Mark application as inspected
exports.markAsInspected = async (req, res) => {
  try {
    const { inspectionNotes, inspectedBy } = req.body;
    const updateData = {
      status: "Inspected",
      inspectionDate: new Date(),
      inspectedBy: inspectedBy || req.user?.id, // Use authenticated user if available
    };
    
    if (inspectionNotes) {
      updateData.inspectionNotes = inspectionNotes;
    }
    
    const updatedApplication = await PreventionCertificate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedApplication)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Application marked as inspected", data: updatedApplication });
  } catch (error) {
    res.status(400).json({ message: "Error marking as inspected", error: error.message });
  }
};
