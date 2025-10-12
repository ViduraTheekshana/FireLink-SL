import api from "../api";

export const getExpenses = async (year, month) => {
	const response = await api.get(
		`/v1/finance/expenses?month=${month}&year=${year}`
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to fetch Expense!");
	}
	return response.data;
};

export const createExpense = async (expenseData) => {
	const response = await api.post("/v1/finance/expenses", expenseData);

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to create Expense");
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
