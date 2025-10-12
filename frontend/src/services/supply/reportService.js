import api from "../api";

export const getStats = async () => {
	const response = await api.get("/v1/reports/stats");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Failed to fetch Dashboard stats!"
		);
	}
	return response.data;
};

export const getProcurementKpi = async (range) => {
	const response = await api.get(`/v1/reports/procurement-kpi?range=${range}`);

	if (!response.data.success) {
		return new Error(
			response.data.message || "Failed to fetch procurement kips!"
		);
	}
	return response.data;
};

export const getRequestTrend = async ({
	mode,
	range,
	year,
	supplier,
	status,
	category,
}) => {
	let response;
	if (mode === "default") {
		response = await api.get(`/v1/reports/supply-requests-trend`);
	} else {
		response = await api.get(
			`/v1/reports/supply-requests-trend?range=${range}&supplier=${supplier}&status=${status}&category=${category}`
		);
	}

	if (!response.data.success) {
		return new Error(
			response.data.message || "Failed to fetch Request trends!"
		);
	}
	return response.data;
};

export const getAlerts = async () => {
	const response = await api.get("/v1/reports/alerts");

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to fetch alerts!");
	}
	return response.data;
};

export const getRecentRequests = async () => {
	const response = await api.get("/v1/supply-requests/?limit=5");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests fetching failed!"
		);
	}
	return response.data;
};
