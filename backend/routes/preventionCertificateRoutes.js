const express = require("express");
const router = express.Router();
const preventionController = require("../controllers/preventionCertificateControllers");

// Civilian applies
router.post("/apply", preventionController.applyCertificate);

// Officer views all
router.get("/", preventionController.getAllCertificates);

// Officer updates status
router.patch("/:id/status", preventionController.updateCertificateStatus);

module.exports = router;
