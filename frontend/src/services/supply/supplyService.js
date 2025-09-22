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
	const response = await api.post("/supplier", supplierData);

	if (!response.data.success) {
		throw new Error(response.data.message || "Supplier creating failed");
	}
	return response.data;
};
