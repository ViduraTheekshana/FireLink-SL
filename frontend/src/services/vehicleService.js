import api from "./api";

const VEHICLE_BASE_URL = "/api/v1/vehicles";

export const vehicleService = {
	// Get all vehicles with filtering
	async getVehicles(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.status) params.append("status", filters.status);
		if (filters.type) params.append("type", filters.type);
		if (filters.station) params.append("station", filters.station);

		const response = await api.get(`${VEHICLE_BASE_URL}?${params.toString()}`);
		return response.data;
	},

	// Get vehicle by ID
	async getVehicleById(id) {
		const response = await api.get(`${VEHICLE_BASE_URL}/${id}`);
		return response.data;
	},

	// Create new vehicle
	async createVehicle(vehicleData) {
		const response = await api.post(VEHICLE_BASE_URL, vehicleData);
		return response.data;
	},

	// Update vehicle
	async updateVehicle(id, vehicleData) {
		const response = await api.put(`${VEHICLE_BASE_URL}/${id}`, vehicleData);
		return response.data;
	},

	// Delete vehicle
	async deleteVehicle(id) {
		const response = await api.delete(`${VEHICLE_BASE_URL}/${id}`);
		return response.data;
	},

	// Update vehicle status
	async updateVehicleStatus(id, status) {
		const response = await api.patch(`${VEHICLE_BASE_URL}/${id}/status`, {
			status,
		});
		return response.data;
	},

	// Get maintenance schedule
	async getMaintenanceSchedule(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.station) params.append("station", filters.station);

		const response = await api.get(
			`${VEHICLE_BASE_URL}/maintenance/schedule?${params.toString()}`
		);
		return response.data;
	},

	// Update maintenance record
	async updateMaintenance(id, maintenanceData) {
		const response = await api.patch(
			`${VEHICLE_BASE_URL}/${id}/maintenance`,
			maintenanceData
		);
		return response.data;
	},

	// Get vehicle utilization
	async getVehicleUtilization(vehicleId, startDate, endDate) {
		const params = new URLSearchParams({
			vehicleId,
			startDate,
			endDate,
		});

		const response = await api.get(
			`${VEHICLE_BASE_URL}/utilization?${params.toString()}`
		);
		return response.data;
	},

	// Get vehicles by station
	async getVehiclesByStation(station, filters = {}) {
		const params = new URLSearchParams();

		if (filters.status) params.append("status", filters.status);
		if (filters.type) params.append("type", filters.type);

		const response = await api.get(
			`${VEHICLE_BASE_URL}/station/${station}?${params.toString()}`
		);
		return response.data;
	},

	// Bulk update vehicle status
	async bulkUpdateVehicleStatus(vehicleIds, status) {
		const response = await api.patch(`${VEHICLE_BASE_URL}/bulk-status`, {
			vehicleIds,
			status,
		});
		return response.data;
	},

	// Get available vehicles
	async getAvailableVehicles(filters = {}) {
		const availableFilters = { ...filters, status: "available" };
		return this.getVehicles(availableFilters);
	},

	// Get vehicles by type
	async getVehiclesByType(type, filters = {}) {
		const typeFilters = { ...filters, type };
		return this.getVehicles(typeFilters);
	},

	// Get vehicles by status
	async getVehiclesByStatus(status, filters = {}) {
		const statusFilters = { ...filters, status };
		return this.getVehicles(statusFilters);
	},

	// Get vehicles needing maintenance
	async getVehiclesNeedingMaintenance(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.station) params.append("station", filters.station);

		const response = await api.get(
			`${VEHICLE_BASE_URL}/maintenance/needed?${params.toString()}`
		);
		return response.data;
	},

	// Get vehicles due for maintenance soon
	async getVehiclesDueForMaintenanceSoon(days = 30, filters = {}) {
		const params = new URLSearchParams({
			days: days.toString(),
			...filters,
		});

		const response = await api.get(
			`${VEHICLE_BASE_URL}/maintenance/due-soon?${params.toString()}`
		);
		return response.data;
	},

	// Get vehicle statistics
	async getVehicleStats(filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/stats?${params.toString()}`
		);
		return response.data;
	},

	// Get vehicle utilization statistics
	async getVehicleUtilizationStats(filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/utilization/stats?${params.toString()}`
		);
		return response.data;
	},

	// Export vehicles to CSV
	async exportVehicles(filters = {}) {
		const params = new URLSearchParams({
			...filters,
			format: "csv",
		});

		const response = await api.get(
			`${VEHICLE_BASE_URL}/export?${params.toString()}`,
			{
				responseType: "blob",
			}
		);

		return response.data;
	},

	// Export maintenance schedule to CSV
	async exportMaintenanceSchedule(filters = {}) {
		const params = new URLSearchParams({
			...filters,
			format: "csv",
		});

		const response = await api.get(
			`${VEHICLE_BASE_URL}/maintenance/export?${params.toString()}`,
			{
				responseType: "blob",
			}
		);

		return response.data;
	},

	// Get vehicle types
	async getVehicleTypes() {
		const response = await api.get(`${VEHICLE_BASE_URL}/types`);
		return response.data;
	},

	// Get vehicle statuses
	async getVehicleStatuses() {
		const response = await api.get(`${VEHICLE_BASE_URL}/statuses`);
		return response.data;
	},

	// Get vehicle equipment
	async getVehicleEquipment() {
		const response = await api.get(`${VEHICLE_BASE_URL}/equipment`);
		return response.data;
	},

	// Add equipment to vehicle
	async addEquipmentToVehicle(vehicleId, equipment) {
		const response = await api.post(
			`${VEHICLE_BASE_URL}/${vehicleId}/equipment`,
			{ equipment }
		);
		return response.data;
	},

	// Remove equipment from vehicle
	async removeEquipmentFromVehicle(vehicleId, equipment) {
		const response = await api.delete(
			`${VEHICLE_BASE_URL}/${vehicleId}/equipment`,
			{
				data: { equipment },
			}
		);
		return response.data;
	},

	// Get vehicle history
	async getVehicleHistory(vehicleId, filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/${vehicleId}/history?${params.toString()}`
		);
		return response.data;
	},

	// Get vehicle assignments
	async getVehicleAssignments(vehicleId, filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/${vehicleId}/assignments?${params.toString()}`
		);
		return response.data;
	},

	// Get vehicle incidents
	async getVehicleIncidents(vehicleId, filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/${vehicleId}/incidents?${params.toString()}`
		);
		return response.data;
	},

	// Report vehicle incident
	async reportVehicleIncident(vehicleId, incidentData) {
		const response = await api.post(
			`${VEHICLE_BASE_URL}/${vehicleId}/incidents`,
			incidentData
		);
		return response.data;
	},

	// Get vehicle maintenance history
	async getVehicleMaintenanceHistory(vehicleId, filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/${vehicleId}/maintenance-history?${params.toString()}`
		);
		return response.data;
	},

	// Schedule maintenance
	async scheduleMaintenance(vehicleId, maintenanceData) {
		const response = await api.post(
			`${VEHICLE_BASE_URL}/${vehicleId}/maintenance`,
			maintenanceData
		);
		return response.data;
	},

	// Complete maintenance
	async completeMaintenance(vehicleId, maintenanceData) {
		const response = await api.patch(
			`${VEHICLE_BASE_URL}/${vehicleId}/maintenance/complete`,
			maintenanceData
		);
		return response.data;
	},

	// Get vehicle fuel consumption
	async getVehicleFuelConsumption(vehicleId, filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${VEHICLE_BASE_URL}/${vehicleId}/fuel-consumption?${params.toString()}`
		);
		return response.data;
	},

	// Record fuel consumption
	async recordFuelConsumption(vehicleId, fuelData) {
		const response = await api.post(
			`${VEHICLE_BASE_URL}/${vehicleId}/fuel-consumption`,
			fuelData
		);
		return response.data;
	},

	// Get vehicle mileage
	async getVehicleMileage(vehicleId) {
		const response = await api.get(`${VEHICLE_BASE_URL}/${vehicleId}/mileage`);
		return response.data;
	},

	// Update vehicle mileage
	async updateVehicleMileage(vehicleId, mileage) {
		const response = await api.patch(
			`${VEHICLE_BASE_URL}/${vehicleId}/mileage`,
			{ mileage }
		);
		return response.data;
	},

	// Get vehicle documents
	async getVehicleDocuments(vehicleId) {
		const response = await api.get(
			`${VEHICLE_BASE_URL}/${vehicleId}/documents`
		);
		return response.data;
	},

	// Upload vehicle document
	async uploadVehicleDocument(vehicleId, documentData) {
		const response = await api.post(
			`${VEHICLE_BASE_URL}/${vehicleId}/documents`,
			documentData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	},

	// Delete vehicle document
	async deleteVehicleDocument(vehicleId, documentId) {
		const response = await api.delete(
			`${VEHICLE_BASE_URL}/${vehicleId}/documents/${documentId}`
		);
		return response.data;
	},

	// Get vehicle images
	async getVehicleImages(vehicleId) {
		const response = await api.get(`${VEHICLE_BASE_URL}/${vehicleId}/images`);
		return response.data;
	},

	// Upload vehicle image
	async uploadVehicleImage(vehicleId, imageData) {
		const response = await api.post(
			`${VEHICLE_BASE_URL}/${vehicleId}/images`,
			imageData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	},

	// Delete vehicle image
	async deleteVehicleImage(vehicleId, imageId) {
		const response = await api.delete(
			`${VEHICLE_BASE_URL}/${vehicleId}/images/${imageId}`
		);
		return response.data;
	},
};

export default vehicleService;
