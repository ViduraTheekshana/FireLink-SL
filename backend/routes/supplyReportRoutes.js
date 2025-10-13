const express = require("express");
const router = express.Router();
const {
	getSupplyRequestsTrend,
	getAlerts,
	getDashboardStats,
	procurementKpi,
	getSupplierNames,
	getPdfData,
} = require("../controllers/supplyReportController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizePositions } = require("../middlewares/roleMiddleware");

router.use(protect, authorizePositions(["supply_manager"]));
router.get("/supply-requests-trend", getSupplyRequestsTrend);
router.get("/alerts", getAlerts);
router.get("/stats", getDashboardStats);
router.get("/procurement-kpi", procurementKpi);
router.get("/supplier-names", getSupplierNames);
router.get("/pdf-data", getPdfData);

module.exports = router;
