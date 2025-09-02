// middleware/qrValidationMiddleware.js
const validateQR = async (req, res, next) => {
	try {
		const { qrPayload } = req.body;

		// Verify JWT
		const decoded = jwt.verify(qrPayload, process.env.QR_SECRET);

		// Check expiration (double-check)
		if (Date.now() > decoded.exp) {
			return res.status(400).json({ error: "QR_EXPIRED" });
		}

		// Check if already used
		const tokenHash = crypto
			.createHash("sha256")
			.update(qrPayload)
			.digest("hex");
		const existingToken = await QRToken.findOne({ tokenHash });

		if (!existingToken) {
			return res.status(400).json({ error: "QR_INVALID" });
		}

		if (existingToken.used) {
			return res.status(400).json({ error: "QR_ALREADY_USED" });
		}

		// BEFORE
		if (Date.now() > decoded.exp)
			return res.status(400).json({ error: "QR_EXPIRED" });

		// AFTER
		const nowSec = Math.floor(Date.now() / 1000);
		if (nowSec > decoded.exp) {
			return res.status(400).json({ error: "QR_EXPIRED" });
		}

		// Mark as used
		existingToken.used = true;
		existingToken.usedAt = new Date();
		await existingToken.save();

		req.qrData = decoded;
		next();
	} catch (error) {
		res.status(400).json({ error: "QR_INVALID" });
	}
};
