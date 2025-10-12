import api from "../api";

export const getTransaction = async (year, month) => {
	const response = await api.get(
		`/v1/finance/transaction?month=${month}&year=${year}`
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to fetch Transaction!");
	}
	return response.data;
};

export const createTransaction = async (transactionData) => {
	const response = await api.post("/v1/finance/transaction", transactionData);

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to create Transaction");
	}
	return response.data;
};

export const getAllocationData = async () => {
	const response = await api.get("/v1/finance/budget/allocation-data");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Failed to fetch Allocation Data!"
		);
	}
	return response.data;
};

export const getUtilizationData = async () => {
	const response = await api.get("/v1/finance/budget/utilization-data");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Failed to fetch Utilization Data!"
		);
	}
	return response.data;
};

export const assignBudget = async (amount) => {
	const response = await api.post("/v1/finance/budget", { amount });

	if (!response.data.success) {
		return new Error(
			response.data.message || "Failed to fetch Utilization Data!"
		);
	}
	return response.data;
};
