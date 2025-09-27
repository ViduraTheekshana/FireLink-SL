import api from "./api.js";

export const missionService = {
	// Create a new mission
	createMission: async (missionData) => {
		const response = await api.post("/v1/missions", missionData);
		return response.data;
	},

	// Get all missions with pagination and filtering
	getMissions: async (params = {}) => {
		const response = await api.get("/v1/missions", { params });
		// Backend returns { success, message, data }
		return response.data?.data || response.data;
	},

	// Get a single mission by ID
	getMissionById: async (id) => {
		const response = await api.get(`/v1/missions/${id}`);
		return response.data;
	},

	// Update a mission
	updateMission: async (id, missionData) => {
		const response = await api.put(`/v1/missions/${id}`, missionData);
		return response.data;
	},

	// Delete a mission
	deleteMission: async (id) => {
		const response = await api.delete(`/v1/missions/${id}`);
		return response.data;
	},

	// Get mission statistics
	getMissionStats: async (params = {}) => {
		const response = await api.get("/v1/missions/stats", { params });
		return response.data;
	},
};

export default missionService;
