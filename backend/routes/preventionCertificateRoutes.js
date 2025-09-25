const express = require("express");
const router = express.Router();
const preventionController = require("../controllers/preventionCertificateControllers");
const { uploadDocuments } = require("../middlewares/uploadMiddleware");

// Civilian applies (with file upload)
router.post("/apply", uploadDocuments, preventionController.applyCertificate);

// Officer views all
router.get("/", preventionController.getAllCertificates);

// Officer updates status
router.patch("/:id/status", preventionController.updateCertificateStatus);

module.exports = router;
