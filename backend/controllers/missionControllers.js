const Mission = require("../models/Mission");
const { validationResult } = require("express-validator");

// @desc    Create a new mission record
// @route   POST /api/missions
// @access  Private
const createMission = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation errors",
				errors: errors.array(),
			});
		}

		const {
			missionType,
			missionDate,
			missionTime,
			description,
			inventoryItems,
		} = req.body;

		// Resolve current actor (user via Bearer token or supplier via cookie)
		const currentUserId =
			(req.user && (req.user.userId || req.user.id)) ||
			(req.supplier && req.supplier._id);

		if (!currentUserId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized: missing authenticated identity",
			});
		}

		// Validate inventory items
		if (inventoryItems && inventoryItems.length > 0) {
			for (const item of inventoryItems) {
				if (item.usedQuantity > item.quantity) {
					return res.status(400).json({
						success: false,
						message: `Used quantity cannot exceed available quantity for item ${item.itemCode}`,
					});
				}
			}
		}

		const mission = new Mission({
			missionType,
			missionDate,
			missionTime,
			description,
			inventoryItems: inventoryItems || [],
			createdBy: currentUserId,
		});

		const savedMission = await mission.save();

		await savedMission.populate("createdBy", "name gmail");

		res.status(201).json({
			success: true,
			message: "Mission record created successfully",
			data: savedMission,
		});
	} catch (error) {
		console.error("Create mission error:", error);
		res.status(500).json({
			success: false,
			message: "Error creating mission record",
			error: error.message,
		});
	}
};

// @desc    Get all mission records with pagination and filtering
// @route   GET /api/missions
// @access  Private
const getMissions = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			missionType,
			startDate,
			endDate,
			status,
			sortBy = "missionDate",
			sortOrder = "desc",
		} = req.query;

		const query = {};

		// Apply filters
		if (missionType) {
			query.missionType = missionType;
		}
		if (status) {
			query.status = status;
		}
		if (startDate || endDate) {
			query.missionDate = {};
			if (startDate) {
				query.missionDate.$gte = new Date(startDate);
			}
			if (endDate) {
				query.missionDate.$lte = new Date(endDate);
			}
		}

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === "desc" ? -1 : 1;

		const options = {
			page: parseInt(page),
			limit: parseInt(limit),
			sort,
			populate: {
				path: "createdBy",
				select: "name gmail",
			},
		};

		const missions = await Mission.paginate(query, options);

		res.json({
			success: true,
			message: "Missions retrieved successfully",
			data: missions,
		});
	} catch (error) {
		console.error("Get missions error:", error);
		res.status(500).json({
			success: false,
			message: "Error retrieving missions",
			error: error.message,
		});
	}
};

// @desc    Get a single mission record by ID
// @route   GET /api/missions/:id
// @access  Private
const getMissionById = async (req, res) => {
	try {
		const mission = await Mission.findById(req.params.id).populate(
			"createdBy",
			"name email"
		);

		if (!mission) {
			return res.status(404).json({
				success: false,
				message: "Mission record not found",
			});
		}

		res.json({
			success: true,
			message: "Mission retrieved successfully",
			data: mission,
		});
	} catch (error) {
		console.error("Get mission by ID error:", error);
		res.status(500).json({
			success: false,
			message: "Error retrieving mission",
			error: error.message,
		});
	}
};

// @desc    Update a mission record
// @route   PUT /api/missions/:id
// @access  Private
const updateMission = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation errors",
				errors: errors.array(),
			});
		}

		const {
			missionType,
			missionDate,
			missionTime,
			description,
			inventoryItems,
			status,
		} = req.body;

		const mission = await Mission.findById(req.params.id);
		if (!mission) {
			return res.status(404).json({
				success: false,
				message: "Mission record not found",
			});
		}

		// Validate inventory items
		if (inventoryItems && inventoryItems.length > 0) {
			for (const item of inventoryItems) {
				if (item.usedQuantity > item.quantity) {
					return res.status(400).json({
						success: false,
						message: `Used quantity cannot exceed available quantity for item ${item.itemCode}`,
					});
				}
			}
		}

		// Update fields
		if (missionType) mission.missionType = missionType;
		if (missionDate) mission.missionDate = missionDate;
		if (missionTime) mission.missionTime = missionTime;
		if (description) mission.description = description;
		if (inventoryItems) mission.inventoryItems = inventoryItems;
		if (status) mission.status = status;

		const updatedMission = await mission.save();
		await updatedMission.populate("createdBy", "name email");

		res.json({
			success: true,
			message: "Mission record updated successfully",
			data: updatedMission,
		});
	} catch (error) {
		console.error("Update mission error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating mission record",
			error: error.message,
		});
	}
};

// @desc    Delete a mission record
// @route   DELETE /api/missions/:id
// @access  Private
const deleteMission = async (req, res) => {
	try {
		const mission = await Mission.findById(req.params.id);

		if (!mission) {
			return res.status(404).json({
				success: false,
				message: "Mission record not found",
			});
		}

		await Mission.findByIdAndDelete(req.params.id);

		res.json({
			success: true,
			message: "Mission record deleted successfully",
		});
	} catch (error) {
		console.error("Delete mission error:", error);
		res.status(500).json({
			success: false,
			message: "Error deleting mission record",
			error: error.message,
		});
	}
};

// @desc    Get mission statistics
// @route   GET /api/missions/stats
// @access  Private
const getMissionStats = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;

		const query = {};
		if (startDate || endDate) {
			query.missionDate = {};
			if (startDate) {
				query.missionDate.$gte = new Date(startDate);
			}
			if (endDate) {
				query.missionDate.$lte = new Date(endDate);
			}
		}

		const stats = await Mission.aggregate([
			{ $match: query },
			{
				$group: {
					_id: "$missionType",
					count: { $sum: 1 },
					totalItems: {
						$sum: {
							$reduce: {
								input: "$inventoryItems",
								initialValue: 0,
								in: { $add: ["$$value", "$$this.usedQuantity"] },
							},
						},
					},
				},
			},
			{ $sort: { count: -1 } },
		]);

		const totalMissions = await Mission.countDocuments(query);
		const activeMissions = await Mission.countDocuments({
			...query,
			status: "Active",
		});
		const completedMissions = await Mission.countDocuments({
			...query,
			status: "Completed",
		});

		res.json({
			success: true,
			message: "Mission statistics retrieved successfully",
			data: {
				totalMissions,
				activeMissions,
				completedMissions,
				missionsByType: stats,
			},
		});
	} catch (error) {
		console.error("Get mission stats error:", error);
		res.status(500).json({
			success: false,
			message: "Error retrieving mission statistics",
			error: error.message,
		});
	}
};

module.exports = {
	createMission,
	getMissions,
	getMissionById,
	updateMission,
	deleteMission,
	getMissionStats,
};
