export const attendanceService = {
	scanQR: (qrPayload, deviceInfo) =>
		api.post("/api/v1/attendance/scan", { qrPayload, deviceInfo }),

	getByTraining: (trainingId) =>
		api.get(`/api/v1/attendance/training/${trainingId}`),

	getUserHistory: (userId) => api.get(`/api/v1/attendance/user/${userId}`),
};
