import api from "../api";

export const getSuppliers = async () => {
	const response = await api.get("/v1/supplier/all");
	return response.data;
};

export const createSupplier = async (supplierData) => {
	const response = await api.post("/supplier", supplierData);
	return response.data;
};
