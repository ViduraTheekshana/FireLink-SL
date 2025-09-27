import api from "./api.js";

export const salaryService = {
	create: async (payload) => {
		const res = await api.post("/v1/salaries", payload);
		return res.data?.data || res.data;
	},
	list: async (params = {}) => {
		const res = await api.get("/v1/salaries", { params });
		return res.data?.data || res.data;
	},
	update: async (id, payload) => {
		const res = await api.put(`/v1/salaries/${id}`, payload);
		return res.data?.data || res.data;
	},
	remove: async (id) => {
		const res = await api.delete(`/v1/salaries/${id}`);
		return res.data?.data || res.data;
	},
};

export default salaryService;


