const express = require("express");
const router = express.Router();
const preventionOfficerController = require("../controllers/preventionOfficerController");

// GET all applications
router.get("/applications", preventionOfficerController.getApplications);

// PUT update application status (approve/reject)
router.put("/applications/:id/status", preventionOfficerController.updateApplicationStatus);

// PUT reactivate rejected application
router.put("/applications/:id/reactivate", preventionOfficerController.reactivateApplication);

// PUT assign payment
router.put("/applications/:id/payment", preventionOfficerController.assignPayment);

// GET assigned payments for financial officer
router.get("/assigned-payments", preventionOfficerController.getAssignedPayments);

module.exports = router;
