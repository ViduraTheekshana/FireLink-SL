const InventoryReorder = require('../models/inventoryReorder');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');

// Create a new reorder
const createReorder = async (req, res) => {
  try {
    const {
      inventoryItemId,
      quantity,
      priority,
      expectedDate,
      supplier,
      notes
    } = req.body;

    // Validate required fields
    if (!inventoryItemId || !quantity || !priority || !expectedDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: inventoryItemId, quantity, priority, expectedDate'
      });
    }

    // Get inventory item details
    const inventoryItem = await Inventory.findById(inventoryItemId);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Create reorder with item details
    const reorder = new InventoryReorder({
      inventoryItemId,
      item_ID: inventoryItem.item_ID,
      item_name: inventoryItem.item_name,
      category: inventoryItem.category,
      quantity,
      priority,
      expectedDate: new Date(expectedDate),
      supplier,
      notes
    });

    await reorder.save();

    // Create log entry for reorder creation
    try {
      const log = new InventoryLog({
        action: 'REORDER_CREATED',
        itemId: inventoryItem._id,
        itemName: inventoryItem.item_name,
        itemCategory: inventoryItem.category,
        description: `Created reorder for ${inventoryItem.item_name} - Quantity: ${quantity}, Priority: ${priority}`,
        // TODO: Auth - Uncomment when auth is implemented
        // performedBy: req.user?._id || null,
        // performedByName: req.user?.name || 'System User',
        performedBy: null, // Temporary - will be replaced with actual user ID
        performedByName: 'System User', // Temporary - will be replaced with actual user name
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.status(201).json({
      success: true,
      message: 'Reorder created successfully',
      data: reorder
    });

  } catch (error) {
    console.error('Create reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reorder',
      error: error.message
    });
  }
};

// Get all reorders with pagination and filtering
const getReorders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      supplier,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };
    if (search) {
      filter.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalReorders = await InventoryReorder.countDocuments(filter);
    const totalPages = Math.ceil(totalReorders / parseInt(limit));

    // Get reorders
    const reorders = await InventoryReorder
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('inventoryItemId', 'item_ID item_name category quantity threshold');

    res.json({
      success: true,
      data: reorders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalReorders,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get reorders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reorders',
      error: error.message
    });
  }
};

// Get reorder by ID
const getReorderById = async (req, res) => {
  try {
    const { id } = req.params;
    const reorder = await InventoryReorder
      .findById(id)
      .populate('inventoryItemId', 'item_ID item_name category quantity threshold');

    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Reorder not found'
      });
    }

    res.json({
      success: true,
      data: reorder
    });

  } catch (error) {
    console.error('Get reorder by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reorder',
      error: error.message
    });
  }
};

// Update reorder
const updateReorder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.inventoryItemId;
    delete updateData.item_ID;
    delete updateData.item_name;
    delete updateData.category;
    delete updateData.createdAt;

    const reorder = await InventoryReorder.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Reorder not found'
      });
    }

    res.json({
      success: true,
      message: 'Reorder updated successfully',
      data: reorder
    });

  } catch (error) {
    console.error('Update reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reorder',
      error: error.message
    });
  }
};

// Delete reorder
const deleteReorder = async (req, res) => {
  try {
    const { id } = req.params;
    const reorder = await InventoryReorder.findByIdAndDelete(id);

    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Reorder not found'
      });
    }

    res.json({
      success: true,
      message: 'Reorder deleted successfully'
    });

  } catch (error) {
    console.error('Delete reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reorder',
      error: error.message
    });
  }
};

// Get reorder statistics
const getReorderStats = async (req, res) => {
  try {
    const stats = await InventoryReorder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const totalReorders = await InventoryReorder.countDocuments();
    const urgentReorders = await InventoryReorder.findUrgent().countDocuments();
    const overdueReorders = await InventoryReorder.findOverdue().countDocuments();

    const formattedStats = {
      totalReorders,
      urgentReorders,
      overdueReorders,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalQuantity: stat.totalQuantity
        };
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get reorder stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reorder statistics',
      error: error.message
    });
  }
};

// Approve reorder
const approveReorder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'Approver name is required'
      });
    }

    const reorder = await InventoryReorder.findById(id);
    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Reorder not found'
      });
    }

    await reorder.approve(approvedBy);

    // Create log entry for reorder approval
    try {
      const log = new InventoryLog({
        action: 'REORDER_STATUS_CHANGE',
        itemId: reorder.inventoryItemId,
        itemName: reorder.item_name,
        itemCategory: reorder.category,
        description: `Reorder approved for ${reorder.item_name} by ${approvedBy}`,
        // TODO: Auth - Uncomment when auth is implemented
        // performedBy: req.user?._id || null,
        // performedByName: req.user?.name || 'System User',
        performedBy: null, // Temporary - will be replaced with actual user ID
        performedByName: 'System User', // Temporary - will be replaced with actual user name
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.json({
      success: true,
      message: 'Reorder approved successfully',
      data: reorder
    });

  } catch (error) {
    console.error('Approve reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve reorder',
      error: error.message
    });
  }
};

// Mark reorder as delivered
const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualQuantity } = req.body;

    if (!actualQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Actual quantity is required'
      });
    }

    const reorder = await InventoryReorder.findById(id);
    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Reorder not found'
      });
    }

    await reorder.markDelivered(actualQuantity);

    // Create log entry for reorder delivery
    try {
      const log = new InventoryLog({
        action: 'REORDER_STATUS_CHANGE',
        itemId: reorder.inventoryItemId,
        itemName: reorder.item_name,
        itemCategory: reorder.category,
        description: `Reorder delivered for ${reorder.item_name} - Actual quantity: ${actualQuantity}`,
        // TODO: Auth - Uncomment when auth is implemented
        // performedBy: req.user?._id || null,
        // performedByName: req.user?.name || 'System User',
        performedBy: null, // Temporary - will be replaced with actual user ID
        performedByName: 'System User', // Temporary - will be replaced with actual user name
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.json({
      success: true,
      message: 'Reorder marked as delivered successfully',
      data: reorder
    });

  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark reorder as delivered',
      error: error.message
    });
  }
};

// Send reorder report to Supply Manager
const sendReorderToManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdfData, reportData } = req.body;

    // Find the reorder
    const reorder = await InventoryReorder.findById(id);
    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Reorder not found'
      });
    }

    // Update reorder with send tracking
    reorder.sentToManager = true;
    reorder.sentToManagerAt = new Date();
    // TODO: Uncomment when auth is implemented
    // reorder.sentBy = req.user?._id || null;
    reorder.pdfData = pdfData; // Store base64 PDF
    reorder.reportData = reportData; // Store complete report details

    await reorder.save();

    // Create log entry
    try {
      const log = new InventoryLog({
        action: 'REORDER_SENT_TO_MANAGER',
        itemId: reorder.inventoryItemId,
        itemName: reorder.item_name,
        itemCategory: reorder.category,
        description: `Reorder report sent to Supply Manager for ${reorder.item_name} - Quantity: ${reorder.quantity}`,
        // TODO: Auth - Uncomment when auth is implemented
        // performedBy: req.user?._id || null,
        // performedByName: req.user?.name || 'System User',
        performedBy: null,
        performedByName: 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
    }

    res.status(200).json({
      success: true,
      message: 'Reorder report sent to Supply Manager successfully',
      data: {
        reorderId: reorder._id,
        sentAt: reorder.sentToManagerAt,
        itemName: reorder.item_name,
        quantity: reorder.quantity,
        priority: reorder.priority
      }
    });

  } catch (error) {
    console.error('Send reorder to manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reorder report',
      error: error.message
    });
  }
};

// Get all reorders sent to Supply Manager
const getSentReorders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      sortBy = 'sentToManagerAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter - only sent reorders
    const filter = { sentToManager: true };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reorders = await InventoryReorder.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('inventoryItemId', 'item_name category quantity threshold location')
      .lean();

    // Get total count for pagination
    const total = await InventoryReorder.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reorders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get sent reorders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent reorders',
      error: error.message
    });
  }
};

// Get specific sent reorder details with PDF
const getSentReorderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the reorder that was sent to manager
    const reorder = await InventoryReorder.findOne({
      _id: id,
      sentToManager: true
    }).populate('inventoryItemId', 'item_name category quantity threshold location condition status expire_date').lean();

    if (!reorder) {
      return res.status(404).json({
        success: false,
        message: 'Sent reorder not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reorder: {
          _id: reorder._id,
          item_ID: reorder.item_ID,
          item_name: reorder.item_name,
          category: reorder.category,
          quantity: reorder.quantity,
          priority: reorder.priority,
          expectedDate: reorder.expectedDate,
          supplier: reorder.supplier,
          notes: reorder.notes,
          status: reorder.status,
          sentToManagerAt: reorder.sentToManagerAt,
          createdAt: reorder.createdAt,
          inventoryItem: reorder.inventoryItemId
        },
        pdfData: reorder.pdfData, // Base64 PDF
        reportData: reorder.reportData // Additional report details
      }
    });

  } catch (error) {
    console.error('Get sent reorder details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reorder details',
      error: error.message
    });
  }
};

module.exports = {
  createReorder,
  getReorders,
  getReorderById,
  updateReorder,
  deleteReorder,
  getReorderStats,
  approveReorder,
  markDelivered,
  sendReorderToManager,
  getSentReorders,
  getSentReorderDetails
};
