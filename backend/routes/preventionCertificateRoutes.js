const express = require("express");
const router = express.Router();
const preventionController = require("../controllers/preventionCertificateControllers");

const multer = require("multer");

// Simple file storage for now (not GridFS to avoid complications)
const storage = multer.memoryStorage(); // Store in memory temporarily
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Civilian applies (with single file upload)
router.post("/apply", upload.single("photo"), preventionController.applyCertificate);

// Officer views all submissions
router.get("/", preventionController.getAllCertificates);

// Officer updates status
router.patch("/:id/status", preventionController.updateCertificateStatus);

// Officer updates payment
router.patch("/:id/payment", preventionController.updatePayment);

// Officer adds inspection notes
router.patch("/:id/inspection-notes", preventionController.updateInspectionNotes);

// Officer marks as inspected
router.patch("/:id/inspect", preventionController.markAsInspected);

// Get all inspected applications
router.get("/inspected", preventionController.getInspectedApplications);

// Officer deletes application
router.delete("/:id", preventionController.deleteCertificate);

// Route to fetch uploaded photo by file ID
router.get("/file/:id", async (req, res) => {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
    const _id = new mongoose.Types.ObjectId(req.params.id);

    // Stream the file to the response
    gfs.openDownloadStream(_id).pipe(res);
  } catch (err) {
    res.status(404).json({ error: "File not found" });
  }
});

// Get all inspected applications
router.get("/inspected", preventionController.getInspectedApplications);

module.exports = router;
