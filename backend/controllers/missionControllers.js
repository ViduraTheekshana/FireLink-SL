const Mission = require("../models/Mission");
const Inventory = require("../models/Inventory");
const InventoryLog = require("../models/InventoryLog");
const { validationResult } = require("express-validator");

// Create a new mission record

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

		
		const currentUserId =
			(req.user && (req.user.userId || req.user.id)) ||
			(req.supplier && req.supplier._id);

		if (!currentUserId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized: missing authenticated identity",
			});
		}

		
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

		// Process damaged items - reduce inventory quantity
		if (inventoryItems && inventoryItems.length > 0) {
			for (const item of inventoryItems) {
				if (item.isDamaged && item.damagedQuantity > 0 && item.inventoryItemId) {
					try {
						// Find inventory item by MongoDB _id
						const inventoryItem = await Inventory.findById(item.inventoryItemId);
						
						if (inventoryItem) {
							// Reduce quantity by damaged amount
							const newQuantity = inventoryItem.quantity - item.damagedQuantity;
							
							if (newQuantity >= 0) {
								const previousQuantity = inventoryItem.quantity;
								inventoryItem.quantity = newQuantity;
								await inventoryItem.save();

								// Create inventory log entry with correct schema
								await InventoryLog.create({
									action: 'STOCK_CHANGE',
									itemId: inventoryItem._id,
									itemName: inventoryItem.item_name,
									itemCategory: inventoryItem.category || 'Uncategorized',
									description: `Damaged in mission: ${missionType} (Mission ID: ${savedMission._id})`,
									previousValue: { quantity: previousQuantity },
									newValue: { quantity: newQuantity },
									quantityChange: -item.damagedQuantity,
									performedBy: currentUserId,
									performedByName: req.user?.name || req.user?.email || 'System'
								});

								console.log(`✅ Reduced ${item.damagedQuantity} damaged units from ${inventoryItem.item_name} (ID: ${inventoryItem.item_ID})`);
							} else {
								console.error(`❌ Cannot reduce inventory below 0 for item ${inventoryItem.item_ID}`);
							}
						}
					} catch (invError) {
						console.error(`Error reducing inventory for item ${item.itemCode}:`, invError);
						// Don't fail the mission creation if inventory update fails
					}
				}
			}
		}

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

		// filters
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

// Get  mission record by ID

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

// Update a mission record

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

		//  inventory items
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

		// Store old inventory items for comparison (to calculate damage delta)
		const oldInventoryItems = mission.inventoryItems || [];

		// Update 
		if (missionType) mission.missionType = missionType;
		if (missionDate) mission.missionDate = missionDate;
		if (missionTime) mission.missionTime = missionTime;
		if (description) mission.description = description;
		if (inventoryItems) mission.inventoryItems = inventoryItems;
		if (status) mission.status = status;

		const updatedMission = await mission.save();
		await updatedMission.populate("createdBy", "name email");

		// Process damaged items - reduce inventory ONLY for NEW/INCREASED damaged quantities
		if (inventoryItems && inventoryItems.length > 0) {
			const currentUserId = (req.user && (req.user.userId || req.user.id)) || (req.supplier && req.supplier._id);
			
			console.log(`\n🔍 Processing damaged items for mission update ${updatedMission._id}`);
			console.log(`📋 Old inventory items:`, JSON.stringify(oldInventoryItems.map(i => ({ 
				itemCode: i.itemCode, 
				inventoryItemId: i.inventoryItemId, 
				isDamaged: i.isDamaged, 
				damagedQty: i.damagedQuantity 
			})), null, 2));
			console.log(`📋 New inventory items:`, JSON.stringify(inventoryItems.map(i => ({ 
				itemCode: i.itemCode, 
				inventoryItemId: i.inventoryItemId, 
				isDamaged: i.isDamaged, 
				damagedQty: i.damagedQuantity 
			})), null, 2));
			
			for (const newItem of inventoryItems) {
				console.log(`\n🔎 Checking item: ${newItem.itemCode}, isDamaged: ${newItem.isDamaged}, damagedQty: ${newItem.damagedQuantity}`);
				
				if (newItem.isDamaged && newItem.damagedQuantity > 0 && newItem.inventoryItemId) {
					try {
						// Find the old item to compare damaged quantities
						// Try matching by inventoryItemId first, then fall back to itemCode
						let oldItem = oldInventoryItems.find(
							(old) => old.inventoryItemId && old.inventoryItemId.toString() === newItem.inventoryItemId.toString()
						);
						
						// Fallback: match by itemCode if inventoryItemId not found
						if (!oldItem) {
							oldItem = oldInventoryItems.find(
								(old) => old.itemCode === newItem.itemCode
							);
							console.log(`⚠️ Matched by itemCode (fallback) for ${newItem.itemCode}`);
						}
						
						const oldDamagedQty = (oldItem && oldItem.isDamaged) ? (oldItem.damagedQuantity || 0) : 0;
						const newDamagedQty = newItem.damagedQuantity || 0;
						
						console.log(`📊 Old damaged qty: ${oldDamagedQty}, New damaged qty: ${newDamagedQty}`);
						
						// Calculate delta (only reduce additional damage)
						const damageDelta = newDamagedQty - oldDamagedQty;
						
						console.log(`📈 Damage delta: ${damageDelta}`);
						
						if (damageDelta > 0) {
							// Only reduce if there's NEW damage
							const inventoryItem = await Inventory.findById(newItem.inventoryItemId);
							
							if (inventoryItem) {
								console.log(`📦 Found inventory item: ${inventoryItem.item_name}, current qty: ${inventoryItem.quantity}`);
								
								const newQuantity = inventoryItem.quantity - damageDelta;
								
								if (newQuantity >= 0) {
									const previousQuantity = inventoryItem.quantity;
									inventoryItem.quantity = newQuantity;
									await inventoryItem.save();

									// Create inventory log entry with correct schema
									await InventoryLog.create({
										action: 'STOCK_CHANGE',
										itemId: inventoryItem._id,
										itemName: inventoryItem.item_name,
										itemCategory: inventoryItem.category || 'Uncategorized',
										description: `Damaged in mission update: ${missionType} (Mission ID: ${updatedMission._id}) - Additional damage: ${damageDelta} units`,
										previousValue: { quantity: previousQuantity },
										newValue: { quantity: newQuantity },
										quantityChange: -damageDelta,
										performedBy: currentUserId,
										performedByName: req.user?.name || req.user?.email || 'System'
									});

									console.log(`✅ Reduced ${damageDelta} additional damaged units from ${inventoryItem.item_name} (ID: ${inventoryItem.item_ID})`);
									console.log(`✅ New inventory quantity: ${newQuantity}`);
								} else {
									console.error(`❌ Cannot reduce inventory below 0 for item ${inventoryItem.item_ID}. Would be: ${newQuantity}`);
								}
							} else {
								console.error(`❌ Inventory item not found with ID: ${newItem.inventoryItemId}`);
							}
						} else if (damageDelta < 0) {
							console.log(`ℹ️ Damaged quantity decreased by ${Math.abs(damageDelta)} for item ${newItem.itemCode}. Not restoring inventory (damage is permanent).`);
						} else {
							console.log(`ℹ️ No change in damaged quantity for item ${newItem.itemCode}`);
						}
					} catch (invError) {
						console.error(`❌ Error processing damaged inventory for item ${newItem.itemCode}:`, invError);
						// Don't fail the mission update if inventory update fails
					}
				} else {
					console.log(`⏭️ Skipping item ${newItem.itemCode} - not damaged or missing data`);
				}
			}
			
			console.log(`\n✅ Finished processing damaged items\n`);
		}

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

//   Delete a mission record

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

//     Get mission 

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
