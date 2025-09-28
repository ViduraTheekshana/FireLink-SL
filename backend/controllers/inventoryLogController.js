const InventoryLog = require('../models/InventoryLog');

// @desc    Get all inventory logs with filtering and pagination
// @route   GET /api/inventory-logs
// @access  Private
const getLogs = async (req, res) => {
  try {
    const {
      action,
      itemId,
      category,
      performedBy,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (action) filter.action = action;
    if (itemId) filter.itemId = itemId;
    if (category) filter.itemCategory = { $regex: category, $options: 'i' };
    if (performedBy) filter.performedBy = performedBy;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { performedByName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalLogs = await InventoryLog.countDocuments(filter);
    
    // Get logs with pagination
    const logs = await InventoryLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('itemId', 'item_name item_ID category')
      // TODO: Auth - Uncomment when auth is implemented
      // .populate('performedBy', 'name email');

    // Calculate pagination info
    const totalPages = Math.ceil(totalLogs / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalLogs,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory logs',
      error: error.message
    });
  }
};

// @desc    Get single log by ID
// @route   GET /api/inventory-logs/:id
// @access  Private
const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const log = await InventoryLog.findById(id)
      .populate('itemId', 'item_name item_ID category')
      // TODO: Auth - Uncomment when auth is implemented
      // .populate('performedBy', 'name email');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Inventory log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get log by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory log',
      error: error.message
    });
  }
};

// @desc    Create new log entry
// @route   POST /api/inventory-logs
// @access  Private
const createLog = async (req, res) => {
  try {
    const logData = req.body;
    
    const log = new InventoryLog(logData);
    const savedLog = await log.save();

    res.status(201).json({
      success: true,
      message: 'Inventory log created successfully',
      data: savedLog
    });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory log',
      error: error.message
    });
  }
};

// @desc    Update log entry
// @route   PUT /api/inventory-logs/:id
// @access  Private
const updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLog = await InventoryLog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: 'Inventory log not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory log updated successfully',
      data: updatedLog
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory log',
      error: error.message
    });
  }
};

// @desc    Delete log entry
// @route   DELETE /api/inventory-logs/:id
// @access  Private (Admin only)
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLog = await InventoryLog.findByIdAndDelete(id);
    
    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: 'Inventory log not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory log deleted successfully',
      data: deletedLog
    });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory log',
      error: error.message
    });
  }
};

// @desc    Get log statistics
// @route   GET /api/inventory-logs/stats/summary
// @access  Private
const getLogStats = async (req, res) => {
  try {
    const stats = await InventoryLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLogs = await InventoryLog.countDocuments();
    const todayLogs = await InventoryLog.countDocuments({
      timestamp: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.json({
      success: true,
      data: {
        actionBreakdown: stats,
        totalLogs,
        todayLogs
      }
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch log statistics',
      error: error.message
    });
  }
};

module.exports = {
  getLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  getLogStats
};
