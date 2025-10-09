const PreventionCertificate = require("../models/preventionCertificate");

// Get all civilian applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await PreventionCertificate.find();
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err });
  }
};

// Assign or update payment for an application
exports.assignPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment } = req.body;

    const updatedApp = await PreventionCertificate.findByIdAndUpdate(
      id,
      { payment },
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: "Error updating payment", error: err });
  }
};

// Update application status (approve/reject)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const updateData = { status };
    
    // Add rejection reason if rejecting
    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.rejectedAt = new Date();
    }
    
    // Add approval timestamp if approving
    if (status === 'Approved') {
      updateData.approvedAt = new Date();
    }

    const updatedApp = await PreventionCertificate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      data: updatedApp
    });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ message: "Error updating application status", error: err.message });
  }
};

// Reactivate rejected application (move back to pending)
exports.reactivateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedApp = await PreventionCertificate.findByIdAndUpdate(
      id,
      { 
        status: 'Pending',
        rejectionReason: null,
        rejectedAt: null,
        approvedAt: null
      },
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      message: "Application reactivated successfully",
      data: updatedApp
    });
  } catch (err) {
    console.error("Error reactivating application:", err);
    res.status(500).json({ message: "Error reactivating application", error: err.message });
  }
};
