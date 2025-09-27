const generateUniqueId = (prefix) => {
	const timestampPart = Date.now().toString(36);

	const randomPart = Math.random().toString(36).substring(2, 9);

	return `${prefix}-${timestampPart}-${randomPart}`;
};

module.exports = generateUniqueId;