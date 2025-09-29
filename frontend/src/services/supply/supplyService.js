import api from "../api";

export const getSuppliers = async () => {
	const response = await api.get("/v1/supplier/all");

	if (!response.data.success) {
		throw new Error(response.data.message || "Supplier fetching failed");
	}
	return response.data;
};

export const getSupplierProfile = async () => {
	const response = await api.get("/v1/supplier/profile");

	if (!response.data.success) {
		throw new Error(
			response.data.message || "Supplier Profile fetching failed"
		);
	}
	return response.data;
};

export const createSupplier = async (supplierData) => {
	const response = await api.post("/v1/supplier/register", supplierData);

	if (!response.data.success) {
		throw new Error(response.data.message || "Supplier creating failed");
	}
	return response.data;
};

export const updateSupplier = async (requestId, supplierData) => {
	const response = await api.put(`/v1/supplier/${requestId}`, supplierData);

	if (!response.data.success) {
		throw new Error(response.data.message || "Supplier creating failed");
	}
	return response.data;
};

export const deleteSupplier = async (requestId) => {
	const response = await api.delete(`/v1/supplier/${requestId}`);

	if (!response.data.success) {
		return new Error(
			response.data.message || "Supply requests deletion failed!"
		);
	}

	return response.data;
};
