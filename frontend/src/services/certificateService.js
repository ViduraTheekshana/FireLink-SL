// services/certificateService.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificatePDF = async (certificateData) => {
	const doc = new PDFDocument();
	const filename = `certificate_${certificateData.certificateCode}.pdf`;
	const filepath = path.join(__dirname, "../uploads/certificates", filename);

	// Ensure directory exists
	const dir = path.dirname(filepath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	doc.pipe(fs.createWriteStream(filepath));

	// Certificate content
	doc
		.fontSize(24)
		.text("Certificate of Completion", 100, 100, { align: "center" });

	doc
		.fontSize(16)
		.text(`This certifies that`, 100, 150, { align: "center" })
		.fontSize(20)
		.text(`${certificateData.attendeeName}`, 100, 180, { align: "center" })
		.fontSize(16)
		.text(`has successfully completed`, 100, 220, { align: "center" })
		.fontSize(18)
		.text(`${certificateData.trainingTitle}`, 100, 250, { align: "center" });

	doc
		.fontSize(12)
		.text(`Training Date: ${certificateData.trainingDate}`, 100, 320)
		.text(`Duration: ${certificateData.duration} hours`, 100, 340)
		.text(`Trainer: ${certificateData.trainerName}`, 100, 360)
		.text(`Certificate Code: ${certificateData.certificateCode}`, 100, 380)
		.text(`Issue Date: ${new Date().toLocaleDateString()}`, 100, 400);

	// QR code for verification
	const QRCode = require("qrcode");
	const verifyUrl = `${process.env.BASE_URL}/verify/${certificateData.certificateCode}`;
	const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
	const qrImage = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");
	doc.image(qrImage, 450, 350, { width: 100 });

	doc.end();

	return filepath;
};

// API endpoint
const issueCertificate = async (req, res) => {
	try {
		const { trainingSessionId, attendeeId } = req.body;

		// Verify attendance
		const attendance = await Attendance.findOne({
			trainingSession: trainingSessionId,
			attendee: attendeeId,
		});

		if (!attendance) {
			return res
				.status(400)
				.json({ error: "Attendance required for certificate" });
		}

		// Check if certificate already exists
		const existing = await Certificate.findOne({
			trainingSession: trainingSessionId,
			attendee: attendeeId,
		});

		if (existing) {
			return res.status(400).json({ error: "Certificate already issued" });
		}

		// Generate certificate code
		const certificateCode = `CERT-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		// Get training and attendee details
		const training = await TrainingSession.findById(trainingSessionId).populate(
			"trainer"
		);
		const attendee = await User.findById(attendeeId);

		const certificateData = {
			certificateCode,
			attendeeName: `${attendee.firstName} ${attendee.lastName}`,
			trainingTitle: training.title,
			trainingDate: training.startDateTime.toLocaleDateString(),
			duration: Math.ceil(
				(training.endDateTime - training.startDateTime) / (1000 * 60 * 60)
			),
			trainerName: `${training.trainer.firstName} ${training.trainer.lastName}`,
		};

		// Generate PDF
		const pdfPath = await generateCertificatePDF(certificateData);
		const pdfUrl = `/api/v1/certificates/${certificateCode}/download`;

		// Save certificate record
		const certificate = new Certificate({
			trainingSession: trainingSessionId,
			attendee: attendeeId,
			certificateCode,
			issueDate: new Date(),
			pdfUrl,
			metadata: {
				duration: certificateData.duration,
			},
		});

		await certificate.save();

		res.json({
			certificateId: certificate._id,
			downloadUrl: pdfUrl,
			certificateCode,
		});
	} catch (error) {
		res.status(500).json({ error: "Certificate generation failed" });
	}
};
