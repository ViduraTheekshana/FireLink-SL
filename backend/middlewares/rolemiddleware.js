const authorizePositions = (positions) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: "Not authorized" });
		}

		const userPosition = req.user.position.toLowerCase();
		const allowedPositions = positions.map((pos) => pos.toLowerCase());

		if (!allowedPositions.includes(userPosition)) {
			return res
				.status(403)
				.json({ message: `Access denied for position: ${req.user.position}` });
		}

		next();
	};
};

module.exports = { authorizePositions };
