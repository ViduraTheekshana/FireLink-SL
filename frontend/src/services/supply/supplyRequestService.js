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

export const deleteSupplyRequest = async (requestId) => {
	const response = await api.delete(`/v1/supply-requests/${requestId}`);

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests deletion failed!"
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

export const createSupplyRequest = async (requestData) => {
	const response = await api.post("/v1/supply-requests", requestData);

	if (!response.data.success) {
		return new Error(response.data.message || "Bid creation failed!");
	}
	return response.data;
};

export const updateSupplyRequest = async (requestId, updateData) => {
	const response = await api.put(
		`/v1/supply-requests/${requestId}`,
		updateData
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Bid updated failed!");
	}
	return response.data;
};

export const getSupplyRequestsByStaff = async () => {
	const response = await api.get("/v1/supply-requests/");

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests fetching failed!"
		);
	}
	return response.data;
};

export const assignSupplierToRequest = async (requestId, supplierId) => {
	const response = await api.put(`/v1/supply-requests/${requestId}/assign`, {
		supplierId,
	});

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests fetching failed!"
		);
	}
	return response.data;
};
export const confirmRequest = async (requestId) => {
	const response = await api.put(
		`/v1/supply-requests/${requestId}/confirm-delivery`
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to confirm delivery!");
	}
	return response.data;
};

export const rejectRequest = async (requestId) => {
	const response = await api.put(
		`/v1/supply-requests/${requestId}/reject-delivery`
	);

	if (!response.data.success) {
		return new Error(response.data.message || "Failed to reject request!");
	}
	return response.data;
};
