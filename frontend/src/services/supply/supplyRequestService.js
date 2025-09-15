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

export const createSupplyRequest = async () => {
	const response = await api.post();
};
