const express = require("express");
const router = express.Router();
const sessionController = require("../../controllers/UserManagement/TrainingSessionController");
const Session = require("../../models/UserManagement/TrainingSession");
const Attendance = require("../../models/UserManagement/Attendance");
const User = require("../../models/UserManagement/UserReg");
const { validateQRCodeToken } = require("../../utils/qrTokens");

// QR Token utility (temporary 5 min token)
const crypto = require("crypto");
const activeTokens = new Map(); // { token: { sessionId, expiresAt } }

function generateQRCodeToken(sessionId) {
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  activeTokens.set(token, { sessionId, expiresAt });
  return token;
}

function validateQRCodeToken(token) {
  const data = activeTokens.get(token);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    activeTokens.delete(token);
    return null;
  }
  return data.sessionId;
}

// ----------------- Session CRUD -----------------
router.post("/", sessionController.createSession);
router.get("/", sessionController.getSessions);
router.put("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);

// ----------------- Staff Members -----------------
router.get("/staff-members", async (req, res) => {
  try {
    const staffMembers = await User.find({
      position: { $ne: "Training Session Manager" },
    });
    res.status(200).json({ users: staffMembers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- QR Code Token -----------------
router.get("/generate/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const token = generateQRCodeToken(sessionId);
  res.json({ status: "ok", token });
});

// ----------------- Attendance -----------------
// Mark attendance using QR scan
router.post("/attendance/mark", async (req, res) => {
  const { token, staffId, name } = req.body;
  if (!token || !staffId || !name) {
    return res.status(400).json({ status: "error", message: "Missing data" });
  }

  const sessionId = validateQRCodeToken(token);
  if (!sessionId) {
    return res.status(400).json({ status: "error", message: "Invalid or expired QR" });
  }

  try {
    const attendance = new Attendance({
      sessionId,
      staffId,
      name,
      attendedAt: new Date(),
    });
    await attendance.save();
    res.json({ status: "ok", message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Get all attendance for a session
router.get("/attendance/:sessionId", async (req, res) => {
  try {
    const attendance = await Attendance.find({ sessionId: req.params.sessionId });
    res.json({ status: "ok", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// ----------------- Get single session -----------------
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found",
      });
    }
    res.status(200).json({ status: "ok", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

// ✅ Add this at the bottom of TrainingSessionRoutes.js
const { validateQRCodeToken } = require("../../utils/qrTokens");

router.get("/attendance/scan/:token", async (req, res) => {
  const { token } = req.params;
  const sessionId = validateQRCodeToken(token);

  if (!sessionId) {
    return res.status(400).send("<h1>❌ Invalid or expired QR</h1>");
  }

  res.send(`
    <html>
      <head>
        <title>Attendance Marking</title>
      </head>
      <body style="font-family: Arial; text-align:center; padding:50px;">
        <h1>✅ QR Scanned</h1>
        <p>Session ID: ${sessionId}</p>
        <form method="POST" action="/api/sessions/attendance/mark">
          <input type="hidden" name="sessionId" value="${sessionId}" />
          <label>Staff ID: <input name="staffId" /></label><br/><br/>
          <label>Name: <input name="name" /></label><br/><br/>
          <button type="submit">Mark Attendance</button>
        </form>
      </body>
    </html>
  `);
});

module.exports = router;
