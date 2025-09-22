const express = require("express");
const router = express.Router();
const sessionController = require("../../controllers/UserManagement/TrainingSessionController");
const Session = require("../../models/UserManagement/TrainingSession"); 
const User = require("../../models/UserManagement/UserReg"); 

// Create a new session
router.post("/", sessionController.createSession);


// Get all sessions
router.get("/", sessionController.getSessions);

// Update a session
router.put("/:id", sessionController.updateSession);

// Delete a session
router.delete("/:id", sessionController.deleteSession);


// Get staff members for session creation (excluding managers)
router.get("/staff-members", async (req, res) => {
  try {
    const staffMembers = await User.find({ position: { $ne: "Training Session Manager" } });
    res.status(200).json({ users: staffMembers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ 
        status: "error", 
        message: "Session not found" 
      });
    }
    
    // Return in the expected format with status: "ok"
    res.status(200).json({ 
      status: "ok", 
      session: session 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: "Server error" 
    });
  }
});
module.exports = router;
