import api from "./api";

const USER_BASE_URL = "/api/v1/users";

export const userService = {
	// Get all users
	async getUsers(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.search) params.append("search", filters.search);
		if (filters.role) params.append("role", filters.role);
		if (filters.isActive !== undefined)
			params.append("isActive", filters.isActive);

		const response = await api.get(`${USER_BASE_URL}?${params.toString()}`);
		return response.data;
	},

	// Get user by ID
	async getUserById(id) {
		const response = await api.get(`${USER_BASE_URL}/${id}`);
		return response.data;
	},

	// Get current user profile
	async getCurrentUser() {
		const response = await api.get(`${USER_BASE_URL}/profile`);
		return response.data;
	},

	// Update current user profile
	async updateProfile(profileData) {
		const response = await api.put(`${USER_BASE_URL}/profile`, profileData);
		return response.data;
	},

	// Change password
	async changePassword(passwordData) {
		const response = await api.put(
			`${USER_BASE_URL}/change-password`,
			passwordData
		);
		return response.data;
	},

	// Create new user (admin only)
	async createUser(userData) {
		const response = await api.post(USER_BASE_URL, userData);
		return response.data;
	},

	// Update user (admin only)
	async updateUser(id, userData) {
		const response = await api.put(`${USER_BASE_URL}/${id}`, userData);
		return response.data;
	},

	// Delete user (admin only)
	async deleteUser(id) {
		const response = await api.delete(`${USER_BASE_URL}/${id}`);
		return response.data;
	},

	// Activate/deactivate user (admin only)
	async toggleUserStatus(id) {
		const response = await api.patch(`${USER_BASE_URL}/${id}/toggle-status`);
		return response.data;
	},

	// Assign roles to user (admin only)
	async assignRoles(id, roleIds) {
		const response = await api.patch(`${USER_BASE_URL}/${id}/assign-roles`, {
			roleIds,
		});
		return response.data;
	},

	// Get users by role
	async getUsersByRole(roleName) {
		const response = await api.get(`${USER_BASE_URL}/by-role/${roleName}`);
		return response.data;
	},

	// Get available firefighters for shift assignment
	async getAvailableFirefighters(dateTime, station = null) {
		const params = new URLSearchParams();
		params.append("dateTime", dateTime);
		if (station) params.append("station", station);

		const response = await api.get(
			`${USER_BASE_URL}/available-firefighters?${params.toString()}`
		);
		return response.data;
	},

	// Get user statistics
	async getUserStats() {
		const response = await api.get(`${USER_BASE_URL}/stats`);
		return response.data;
	},

	// Search users
	async searchUsers(query, filters = {}) {
		const params = new URLSearchParams();
		params.append("q", query);

		Object.keys(filters).forEach((key) => {
			if (filters[key]) params.append(key, filters[key]);
		});

		const response = await api.get(
			`${USER_BASE_URL}/search?${params.toString()}`
		);
		return response.data;
	},

	// Export users
	async exportUsers(filters = {}, format = "csv") {
		try {
			const params = new URLSearchParams();
			Object.keys(filters).forEach((key) => {
				if (filters[key]) params.append(key, filters[key]);
			});
			params.append("format", format);

			const response = await api.get(
				`${USER_BASE_URL}/export?${params.toString()}`,
				{
					responseType: "blob",
				}
			);

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `users.${format}`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error exporting users:", error);
			throw error;
		}
	},

	// Bulk operations
	async bulkUpdateUsers(userIds, updateData) {
		const response = await api.patch(`${USER_BASE_URL}/bulk-update`, {
			userIds,
			updateData,
		});
		return response.data;
	},

	async bulkDeleteUsers(userIds) {
		const response = await api.delete(`${USER_BASE_URL}/bulk-delete`, {
			data: { userIds },
		});
		return response.data;
	},

	// Utility functions
	async getActiveUsers() {
		try {
			const response = await this.getUsers({ isActive: true, limit: 1000 });
			return response.data.docs || response.data;
		} catch (error) {
			console.error("Error getting active users:", error);
			return [];
		}
	},

	async getFirefighters() {
		try {
			const response = await this.getUsersByRole("Firefighter");
			return response.data;
		} catch (error) {
			console.error("Error getting firefighters:", error);
			return [];
		}
	},

	async getUsersByStation(station) {
		try {
			const response = await this.getUsers({ station, limit: 1000 });
			return response.data.docs || response.data;
		} catch (error) {
			console.error("Error getting users by station:", error);
			return [];
		}
	},

	// Helper functions for user roles
	getUserRoleLabel(roles) {
		if (!roles || roles.length === 0) return "No Role";

		const roleNames = roles.map((role) =>
			typeof role === "string" ? role : role.name
		);

		return roleNames.join(", ");
	},

	getUserStatusLabel(isActive) {
		return isActive ? "Active" : "Inactive";
	},

	getUserStatusColor(isActive) {
		return isActive ? "success" : "danger";
	},

	// Validation helpers
	validateUserData(data) {
		const errors = {};

		if (!data.name || data.name.trim().length < 2) {
			errors.name = "Name must be at least 2 characters";
		}

		if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
			errors.email = "Valid email is required";
		}

		if (data.password && data.password.length < 6) {
			errors.password = "Password must be at least 6 characters";
		}

		if (data.roles && (!Array.isArray(data.roles) || data.roles.length === 0)) {
			errors.roles = "At least one role must be assigned";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	},

	validateProfileData(data) {
		const errors = {};

		if (!data.name || data.name.trim().length < 2) {
			errors.name = "Name must be at least 2 characters";
		}

		if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
			errors.email = "Valid email is required";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	},

	validatePasswordChange(data) {
		const errors = {};

		if (!data.currentPassword) {
			errors.currentPassword = "Current password is required";
		}

		if (!data.newPassword || data.newPassword.length < 6) {
			errors.newPassword = "New password must be at least 6 characters";
		}

		if (data.newPassword !== data.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	},
};

export default userService;
