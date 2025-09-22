const TrainingSession = require("../Model/TrainingSession");

// Create a new training session
exports.createSession = async (req, res) => {
  try {
    const { title, description, date, venue, teamMembers, createdBy } =
      req.body;

    if (
      !title ||
      !description ||
      !date ||
      !venue ||
      !teamMembers ||
      !createdBy
    ) {
      return res
        .status(400)
        .json({ status: "error", err: "All fields are required" });
    }

    const session = await TrainingSession.create({
      title,
      description,
      date,
      venue,
      teamMembers, // <-- just use the array of strings
      createdBy,
    });

    res.json({ status: "ok", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
};

// Get all training sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await TrainingSession.find().sort({ date: -1 });
    res.json({ status: "ok", sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
};

// Update a training session (can update multiple fields including teamMembers)
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const session = await TrainingSession.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!session) {
      return res
        .status(404)
        .json({ status: "error", err: "Session not found" });
    }

    res.json({ status: "ok", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await TrainingSession.findByIdAndDelete(id);

    if (!session)
      return res
        .status(404)
        .json({ status: "error", err: "Session not found" });

    res.json({ status: "ok", message: "Session deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", err: "Server error" });
  }
};
