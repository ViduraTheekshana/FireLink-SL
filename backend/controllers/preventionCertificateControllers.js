const PreventionCertificate = require("../models/PreventionCertificate");

// Civilian applies for a certificate
exports.applyCertificate = async (req, res) => {
	try {
		const { fullName, nic, address, contactNumber, constructionType, documents, price } = req.body;

		// Validate price
		if (!price || price <= 0) {
			return res.status(400).json({ message: "Price must be provided and greater than 0" });
		}

		const newApplication = new PreventionCertificate(req.body);
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
		const applications = await PreventionCertificate.find()
			.populate("assignedofficer", "name email")
			.select("fullName nic address contactNumber constructionType documents status appliedDate price assignedofficer");

		res.status(200).json({
			message: "Certificates fetched successfully",
			data: applications,
		});
	} catch (error) {
		res.status(500).json({ message: "Error fetching applications", error: error.message });
	}
};

// Officer updates status
exports.updateCertificateStatus = async (req, res) => {
	try {
		const { status } = req.body;
		const updatedApplication = await PreventionCertificate.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true }
		);
		if (!updatedApplication)
			return res.status(404).json({ message: "Application not found" });

		res.status(200).json({ message: "Status updated", data: updatedApplication });
	} catch (error) {
		res.status(400).json({ message: "Error updating status", error: error.message });
	}
};
