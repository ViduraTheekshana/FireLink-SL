const ShiftSchedule = require("../../models/UserManagement/ShiftSchedule.js");

//  Get all ready vehicles with their shift schedule
exports.getReadyShifts = async (req, res) => {
  try {
    const shifts = await ShiftSchedule.find()
      .populate("members", "name position")
      .sort({ date: 1 });

    //  only include vehicles that are ready today or upcoming
    const today = new Date();
    const readyShifts = shifts.filter((s) => new Date(s.date) >= today);

    res.status(200).json({
      success: true,
      shifts: readyShifts.map((s) => ({
        _id: s._id,
        vehicleId: s.vehicle,
        vehicleName: s.vehicle,
        date: s.date,
        shiftType: s.shiftType,
        status: "Ready",
      })),
    });
  } catch (err) {
    console.error("Error fetching ready shifts:", err);
    res.status(500).json({
      success: false,
      message: "Server Error - Cannot fetch ready shifts",
    });
  }
};
