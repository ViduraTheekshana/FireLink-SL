import api from "../api";

export const getSupplyRequests = async () => {
	const response = await api.get("/v1/supply-requests/");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests fetching failed!"
		);
	}
	return response.data;
};

export const getSupplyRequestsById = async (requestId) => {
	const response = await api.get(`/v1/supply-requests/public/${requestId}`);

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests fetching failed!"
		);
	}
	return response.data;
};

export const getMyBids = async () => {
	const response = await api.get("/v1/supply-requests/?bids=true");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests fetching failed!"
		);
	}
	return response.data;
};

export const addBid = async (requestId, bidData) => {
	const response = await api.post(
		`/v1/supply-requests/${requestId}/bid`,
		bidData
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Bid adding failed!");
	}
	return response.data;
};

export const updateBid = async (requestId, bidData) => {
	const response = await api.put(
		`/v1/supply-requests/${requestId}/bid`,
		bidData
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Bid updating failed!");
	}
	return response.data;
};

export const deleteBid = async (requestId) => {
	const response = await api.delete(`/v1/supply-requests/${requestId}/bid`);

	if (!response.data.success) {
		return new Error(response.data.message || "Bid deletion failed!");
	}
	return response.data;
};

export const createSupplyRequest = async () => {
	const response = await api.post();
};
