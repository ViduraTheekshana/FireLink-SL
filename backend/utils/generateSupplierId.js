const generateUniqueId = (prefix = "sup") => {
	const sanitizedPrefix =
		prefix && typeof prefix === "string" && prefix.trim() !== ""
			? prefix
					.toLowerCase()
					.trim()
					.replace(/[\s_]+/g, "-")
					.replace(/[^a-z0-9-]/g, "")
			: "sup";

	const timestampPart = Date.now().toString(36);

	const randomPart = Math.random().toString(36).substring(2, 9);

	return `${sanitizedPrefix}-${timestampPart}-${randomPart}`;
};

module.exports = generateUniqueId;
