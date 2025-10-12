const express = require("express");
const router = express.Router();
const {
	getSupplyRequestsTrend,
	getAlerts,
	getDashboardStats,
	procurementKpi,
} = require("../controllers/test");

// Reporting APIs
router.get("/supply-requests-trend", getSupplyRequestsTrend);
router.get("/alerts", getAlerts);
router.get("/stats", getDashboardStats);
router.get("/procurement-kpi", procurementKpi);

module.exports = router;
