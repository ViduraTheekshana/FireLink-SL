import api from "./api";

const SHIFT_CHANGE_REQUEST_BASE_URL = "/api/v1/shift-change-requests";

export const shiftChangeRequestService = {
	// Create a new shift change request
	async createShiftChangeRequest(requestData) {
		const response = await api.post(SHIFT_CHANGE_REQUEST_BASE_URL, requestData);
		return response.data;
	},

	// Get all shift change requests (for admins/managers)
	async getAllShiftChangeRequests(filters = {}) {
		const params = new URLSearchParams();

		if (filters.status) params.append("status", filters.status);
		if (filters.priority) params.append("priority", filters.priority);
		if (filters.shiftId) params.append("shiftId", filters.shiftId);
		if (filters.requesterId) params.append("requesterId", filters.requesterId);
		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.sortBy) params.append("sortBy", filters.sortBy);
		if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

		const response = await api.get(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}?${params.toString()}`
		);
		return response.data;
	},

	// Get user's own shift change requests
	async getMyShiftChangeRequests(filters = {}) {
		const params = new URLSearchParams();

		if (filters.status) params.append("status", filters.status);
		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);

		const response = await api.get(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/my-requests?${params.toString()}`
		);
		return response.data;
	},

	// Get specific shift change request by ID
	async getShiftChangeRequestById(id) {
		const response = await api.get(`${SHIFT_CHANGE_REQUEST_BASE_URL}/${id}`);
		return response.data;
	},

	// Update shift change request
	async updateShiftChangeRequest(id, updateData) {
		const response = await api.put(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/${id}`,
			updateData
		);
		return response.data;
	},

	// Cancel shift change request
	async cancelShiftChangeRequest(id) {
		const response = await api.patch(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/${id}/cancel`
		);
		return response.data;
	},

	// Approve shift change request (admin/manager only)
	async approveShiftChangeRequest(id, reviewComments = "") {
		const response = await api.patch(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/${id}/approve`,
			{
				reviewComments,
			}
		);
		return response.data;
	},

	// Reject shift change request (admin/manager only)
	async rejectShiftChangeRequest(id, reviewComments = "") {
		const response = await api.patch(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/${id}/reject`,
			{
				reviewComments,
			}
		);
		return response.data;
	},

	// Get pending requests for a specific shift
	async getPendingRequestsForShift(shiftId) {
		const response = await api.get(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/shift/${shiftId}/pending`
		);
		return response.data;
	},

	// Get shift change request statistics
	async getShiftChangeRequestStats(startDate = null, endDate = null) {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		const response = await api.get(
			`${SHIFT_CHANGE_REQUEST_BASE_URL}/stats/overview?${params.toString()}`
		);
		return response.data;
	},

	// Utility functions
	async getPendingRequestsCount() {
		try {
			const response = await this.getMyShiftChangeRequests({
				status: "pending",
				limit: 1,
			});
			return response.data.pagination.totalItems;
		} catch (error) {
			console.error("Error getting pending requests count:", error);
			return 0;
		}
	},

	async getUrgentRequests() {
		try {
			const response = await this.getAllShiftChangeRequests({
				priority: "urgent",
				status: "pending",
				limit: 10,
			});
			return response.data.data;
		} catch (error) {
			console.error("Error getting urgent requests:", error);
			return [];
		}
	},

	async getRequestsByStatus(status) {
		try {
			const response = await this.getAllShiftChangeRequests({
				status,
				limit: 50,
			});
			return response.data.data;
		} catch (error) {
			console.error(`Error getting ${status} requests:`, error);
			return [];
		}
	},

	async getRequestsByShift(shiftId) {
		try {
			const response = await this.getAllShiftChangeRequests({
				shiftId,
				limit: 50,
			});
			return response.data.data;
		} catch (error) {
			console.error("Error getting requests by shift:", error);
			return [];
		}
	},

	async getRequestsByRequester(requesterId) {
		try {
			const response = await this.getAllShiftChangeRequests({
				requesterId,
				limit: 50,
			});
			return response.data.data;
		} catch (error) {
			console.error("Error getting requests by requester:", error);
			return [];
		}
	},

	// Export functions
	async exportRequests(filters = {}, format = "csv") {
		try {
			const params = new URLSearchParams();
			Object.keys(filters).forEach((key) => {
				if (filters[key]) params.append(key, filters[key]);
			});
			params.append("format", format);

			const response = await api.get(
				`${SHIFT_CHANGE_REQUEST_BASE_URL}/export?${params.toString()}`,
				{
					responseType: "blob",
				}
			);

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `shift-change-requests.${format}`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error exporting requests:", error);
			throw error;
		}
	},

	// Bulk operations
	async bulkApproveRequests(requestIds, reviewComments = "") {
		try {
			const response = await api.post(
				`${SHIFT_CHANGE_REQUEST_BASE_URL}/bulk-approve`,
				{
					requestIds,
					reviewComments,
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error bulk approving requests:", error);
			throw error;
		}
	},

	async bulkRejectRequests(requestIds, reviewComments = "") {
		try {
			const response = await api.post(
				`${SHIFT_CHANGE_REQUEST_BASE_URL}/bulk-reject`,
				{
					requestIds,
					reviewComments,
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error bulk rejecting requests:", error);
			throw error;
		}
	},

	// Helper functions for request types
	getRequestTypeLabel(requestType) {
		const types = {
			swap: "Swap with Replacement",
			replacement: "Request Replacement",
			cancellation: "Request Cancellation",
		};
		return types[requestType] || requestType;
	},

	getPriorityLabel(priority) {
		const priorities = {
			low: "Low",
			medium: "Medium",
			high: "High",
			urgent: "Urgent",
		};
		return priorities[priority] || priority;
	},

	getStatusLabel(status) {
		const statuses = {
			pending: "Pending",
			approved: "Approved",
			rejected: "Rejected",
			cancelled: "Cancelled",
		};
		return statuses[status] || status;
	},

	getStatusColor(status) {
		const colors = {
			pending: "warning",
			approved: "success",
			rejected: "danger",
			cancelled: "secondary",
		};
		return colors[status] || "primary";
	},

	getPriorityColor(priority) {
		const colors = {
			low: "success",
			medium: "info",
			high: "warning",
			urgent: "danger",
		};
		return colors[priority] || "primary";
	},

	// Validation helpers
	validateRequestData(data) {
		const errors = {};

		if (!data.shiftId) {
			errors.shiftId = "Shift is required";
		}

		if (!data.requestType) {
			errors.requestType = "Request type is required";
		}

		if (!data.reason || data.reason.length < 10) {
			errors.reason = "Reason must be at least 10 characters";
		}

		if (data.requestType === "swap" && !data.requestedReplacement) {
			errors.requestedReplacement =
				"Replacement person is required for swap requests";
		}

		if (
			data.priority &&
			!["low", "medium", "high", "urgent"].includes(data.priority)
		) {
			errors.priority = "Invalid priority level";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	},
};

export default shiftChangeRequestService;
