const express = require("express");
const router = express.Router();
const preventionController = require("../controllers/preventionCertificateControllers");

const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");

// MongoDB URI (reuse the same as in server.js)
const mongoURI = process.env.DB_URI || "mongodb://127.0.0.1:27017/fire_department";
const conn = mongoose.connection;

// GridFS storage for uploading photos
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => ({
    filename: `${Date.now()}-${file.originalname}`,
    bucketName: "uploads"
  })
});
const upload = multer({ storage });

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

module.exports = router;
