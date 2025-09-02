import api from "./api";

const TRAINING_BASE_URL = "/api/v1/trainings";

export const trainingService = {
	// Get all training sessions with filtering
	async getTrainingSessions(filters = {}) {
		const params = new URLSearchParams();

		if (filters.page) params.append("page", filters.page);
		if (filters.limit) params.append("limit", filters.limit);
		if (filters.status) params.append("status", filters.status);
		if (filters.trainer) params.append("trainer", filters.trainer);
		if (filters.startDate) params.append("startDate", filters.startDate);
		if (filters.endDate) params.append("endDate", filters.endDate);

		const response = await api.get(`${TRAINING_BASE_URL}?${params.toString()}`);
		return response.data;
	},

	// Get training session by ID
	async getTrainingSessionById(id) {
		const response = await api.get(`${TRAINING_BASE_URL}/${id}`);
		return response.data;
	},

	// Create new training session
	async createTrainingSession(trainingData) {
		const response = await api.post(TRAINING_BASE_URL, trainingData);
		return response.data;
	},

	// Update training session
	async updateTrainingSession(id, trainingData) {
		const response = await api.put(`${TRAINING_BASE_URL}/${id}`, trainingData);
		return response.data;
	},

	// Delete training session
	async deleteTrainingSession(id) {
		const response = await api.delete(`${TRAINING_BASE_URL}/${id}`);
		return response.data;
	},

	// Register attendees (bulk)
	async registerAttendees(trainingId, attendeeIds) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/${trainingId}/attendees`,
			{
				attendeeIds,
			}
		);
		return response.data;
	},

	// Generate QR code for attendee
	async generateQRCode(trainingId, attendeeId) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/${trainingId}/qrcode?attendeeId=${attendeeId}`
		);
		return response.data;
	},

	// Scan QR code and mark attendance
	async scanQRCode(qrPayload, deviceInfo = {}) {
		const response = await api.post(`${TRAINING_BASE_URL}/scan-qr`, {
			qrPayload,
			deviceInfo,
		});
		return response.data;
	},

	// Issue certificate
	async issueCertificate(trainingId, attendeeId) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/${trainingId}/certificate?attendeeId=${attendeeId}`
		);
		return response.data;
	},

	// Get attendance for training session
	async getAttendance(trainingId) {
		const response = await api.get(
			`${TRAINING_BASE_URL}/${trainingId}/attendance`
		);
		return response.data;
	},

	// Update training session status
	async updateTrainingStatus(id, status) {
		const response = await api.patch(`${TRAINING_BASE_URL}/${id}/status`, {
			status,
		});
		return response.data;
	},

	// Get training sessions for current user (as attendee)
	async getMyTrainingSessions(filters = {}) {
		const currentUser = JSON.parse(localStorage.getItem("user"));
		if (!currentUser) {
			throw new Error("User not authenticated");
		}

		// This would need a backend endpoint to get training sessions where user is registered
		const response = await api.get(
			`${TRAINING_BASE_URL}/my-sessions?${new URLSearchParams(filters)}`
		);
		return response.data;
	},

	// Get training sessions for current user (as trainer)
	async getMyTrainingSessionsAsTrainer(filters = {}) {
		const currentUser = JSON.parse(localStorage.getItem("user"));
		if (!currentUser) {
			throw new Error("User not authenticated");
		}

		const trainerFilters = { ...filters, trainer: currentUser.id };
		return this.getTrainingSessions(trainerFilters);
	},

	// Get upcoming training sessions
	async getUpcomingTrainingSessions(limit = 10) {
		const now = new Date().toISOString();
		const filters = {
			startDate: now,
			limit,
			status: "scheduled",
		};

		return this.getTrainingSessions(filters);
	},

	// Get ongoing training sessions
	async getOngoingTrainingSessions() {
		const filters = {
			status: "ongoing",
		};

		return this.getTrainingSessions(filters);
	},

	// Get completed training sessions
	async getCompletedTrainingSessions(filters = {}) {
		const completedFilters = { ...filters, status: "completed" };
		return this.getTrainingSessions(completedFilters);
	},

	// Get training sessions by trainer
	async getTrainingSessionsByTrainer(trainerId, filters = {}) {
		const trainerFilters = { ...filters, trainer: trainerId };
		return this.getTrainingSessions(trainerFilters);
	},

	// Get training sessions by date range
	async getTrainingSessionsByDateRange(startDate, endDate, filters = {}) {
		const dateFilters = { ...filters, startDate, endDate };
		return this.getTrainingSessions(dateFilters);
	},

	// Bulk register attendees
	async bulkRegisterAttendees(trainingId, attendeeIds) {
		return this.registerAttendees(trainingId, attendeeIds);
	},

	// Remove attendee from training session
	async removeAttendee(trainingId, attendeeId) {
		const response = await api.delete(
			`${TRAINING_BASE_URL}/${trainingId}/attendees/${attendeeId}`
		);
		return response.data;
	},

	// Get training session statistics
	async getTrainingStats(trainingId) {
		const response = await api.get(`${TRAINING_BASE_URL}/${trainingId}/stats`);
		return response.data;
	},

	// Get all training statistics
	async getAllTrainingStats(filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${TRAINING_BASE_URL}/stats?${params.toString()}`
		);
		return response.data;
	},

	// Export training sessions to CSV
	async exportTrainingSessions(filters = {}) {
		const params = new URLSearchParams({
			...filters,
			format: "csv",
		});

		const response = await api.get(
			`${TRAINING_BASE_URL}/export?${params.toString()}`,
			{
				responseType: "blob",
			}
		);

		return response.data;
	},

	// Export attendance to CSV
	async exportAttendance(trainingId) {
		const response = await api.get(
			`${TRAINING_BASE_URL}/${trainingId}/attendance/export`,
			{
				responseType: "blob",
			}
		);

		return response.data;
	},

	// Duplicate training session
	async duplicateTrainingSession(id, newDate) {
		const response = await api.post(`${TRAINING_BASE_URL}/${id}/duplicate`, {
			newDate,
		});
		return response.data;
	},

	// Get training templates
	async getTrainingTemplates() {
		const response = await api.get(`${TRAINING_BASE_URL}/templates`);
		return response.data;
	},

	// Create training from template
	async createTrainingFromTemplate(templateId, trainingData) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/templates/${templateId}`,
			trainingData
		);
		return response.data;
	},

	// Send training reminders
	async sendTrainingReminders(trainingId) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/${trainingId}/send-reminders`
		);
		return response.data;
	},

	// Get QR code statistics
	async getQRStats(trainingId) {
		const response = await api.get(
			`${TRAINING_BASE_URL}/${trainingId}/qr-stats`
		);
		return response.data;
	},

	// Validate QR code (for testing)
	async validateQRCode(qrPayload) {
		const response = await api.post(`${TRAINING_BASE_URL}/validate-qr`, {
			qrPayload,
		});
		return response.data;
	},

	// Get certificate statistics
	async getCertificateStats(trainingId) {
		const response = await api.get(
			`${TRAINING_BASE_URL}/${trainingId}/certificate-stats`
		);
		return response.data;
	},

	// Bulk issue certificates
	async bulkIssueCertificates(trainingId, attendeeIds) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/${trainingId}/bulk-certificates`,
			{
				attendeeIds,
			}
		);
		return response.data;
	},

	// Get training session conflicts
	async getTrainingConflicts(trainingData) {
		const response = await api.post(
			`${TRAINING_BASE_URL}/check-conflicts`,
			trainingData
		);
		return response.data;
	},

	// Get training session suggestions
	async getTrainingSuggestions(filters = {}) {
		const params = new URLSearchParams(filters);
		const response = await api.get(
			`${TRAINING_BASE_URL}/suggestions?${params.toString()}`
		);
		return response.data;
	},
};

export default trainingService;
