import api from "./api";

const SHIFT_BASE_URL = "/api/v1/shifts";

export const shiftService = {
	// Get all shifts with filtering
	async getShifts(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.status) params.append("status", filters.status);
		if (filters.station) params.append("station", filters.station);
		if (filters.startDate) params.append("startDate", filters.startDate);
		if (filters.endDate) params.append("endDate", filters.endDate);
		if (filters.crewMember) params.append("crewMember", filters.crewMember);

		const response = await api.get(`${SHIFT_BASE_URL}?${params.toString()}`);
		return response.data;
	},

	// Get shift by ID
	async getShiftById(id) {
		const response = await api.get(`${SHIFT_BASE_URL}/${id}`);
		return response.data;
	},

	// Create new shift
	async createShift(shiftData) {
		const response = await api.post(SHIFT_BASE_URL, shiftData);
		return response.data;
	},

	// Update shift
	async updateShift(id, shiftData) {
		const response = await api.put(`${SHIFT_BASE_URL}/${id}`, shiftData);
		return response.data;
	},

	// Delete shift
	async deleteShift(id) {
		const response = await api.delete(`${SHIFT_BASE_URL}/${id}`);
		return response.data;
	},

	// Get shifts for specific crew member
	async getCrewMemberShifts(memberId, filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.status) params.append("status", filters.status);

		const response = await api.get(
			`${SHIFT_BASE_URL}/crew/${memberId}?${params.toString()}`
		);
		return response.data;
	},

	// Get current user's shifts
	async getMyShifts(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.status) params.append("status", filters.status);
		if (filters.startDate) params.append("startDate", filters.startDate);
		if (filters.endDate) params.append("endDate", filters.endDate);
		if (filters.upcoming) params.append("upcoming", filters.upcoming);

		const response = await api.get(
			`${SHIFT_BASE_URL}/my-shifts?${params.toString()}`
		);
		return response.data;
	},

	// Get current user's upcoming shifts
	async getMyUpcomingShifts(limit = 5) {
		const response = await api.get(
			`${SHIFT_BASE_URL}/my-upcoming-shifts?limit=${limit}`
		);
		return response.data;
	},

	// Get available vehicles for time period
	async getAvailableVehicles(startDateTime, endDateTime, station = null) {
		const params = new URLSearchParams({
			startDateTime,
			endDateTime,
		});

		if (station) params.append("station", station);

		const response = await api.get(
			`${SHIFT_BASE_URL}/available-vehicles?${params.toString()}`
		);
		return response.data;
	},

	// Update shift status
	async updateShiftStatus(id, status) {
		const response = await api.patch(`${SHIFT_BASE_URL}/${id}/status`, {
			status,
		});
		return response.data;
	},

	// Get shifts for current user
	async getMyShifts(filters = {}) {
		// This assumes the current user ID is available from auth context
		const currentUser = JSON.parse(localStorage.getItem("user"));
		if (!currentUser) {
			throw new Error("User not authenticated");
		}

		return this.getCrewMemberShifts(currentUser.id, filters);
	},

	// Get upcoming shifts
	async getUpcomingShifts(limit = 10) {
		const now = new Date().toISOString();
		const filters = {
			startDate: now,
			limit,
			status: "scheduled",
		};

		return this.getShifts(filters);
	},

	// Get active shifts
	async getActiveShifts() {
		const filters = {
			status: "active",
		};

		return this.getShifts(filters);
	},

	// Get shifts by station
	async getShiftsByStation(station, filters = {}) {
		const stationFilters = { ...filters, station };
		return this.getShifts(stationFilters);
	},

	// Get shifts by date range
	async getShiftsByDateRange(startDate, endDate, filters = {}) {
		const dateFilters = { ...filters, startDate, endDate };
		return this.getShifts(dateFilters);
	},

	// Bulk operations
	async bulkUpdateShiftStatus(shiftIds, status) {
		const promises = shiftIds.map((id) => this.updateShiftStatus(id, status));
		return Promise.all(promises);
	},

	// Export shifts to CSV
	async exportShifts(filters = {}) {
		const params = new URLSearchParams({
			...filters,
			format: "csv",
		});

		const response = await api.get(
			`${SHIFT_BASE_URL}/export?${params.toString()}`,
			{
				responseType: "blob",
			}
		);

		return response.data;
	},

	// Get shift statistics
	async getShiftStats(filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${SHIFT_BASE_URL}/stats?${params.toString()}`
		);
		return response.data;
	},

	// Get shift conflicts
	async getShiftConflicts(shiftData) {
		const response = await api.post(
			`${SHIFT_BASE_URL}/check-conflicts`,
			shiftData
		);
		return response.data;
	},

	// Duplicate shift
	async duplicateShift(id, newDate) {
		const response = await api.post(`${SHIFT_BASE_URL}/${id}/duplicate`, {
			newDate,
		});
		return response.data;
	},

	// Get shift templates
	async getShiftTemplates() {
		const response = await api.get(`${SHIFT_BASE_URL}/templates`);
		return response.data;
	},

	// Create shift from template
	async createShiftFromTemplate(templateId, shiftData) {
		const response = await api.post(
			`${SHIFT_BASE_URL}/templates/${templateId}`,
			shiftData
		);
		return response.data;
	},
};

export default shiftService;
