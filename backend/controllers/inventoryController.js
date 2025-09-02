const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
const createItem = async (req, res) => {
  try {
    const {
      item_ID,
      item_name,
      category,
      quantity,
      condition,
      location,
      status,
      threshold,
      expire_date
    } = req.body;

    // Check if item_ID already exists
    const existingItem = await Inventory.findOne({ item_ID });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item ID already exists'
      });
    }

    // Validate threshold minimum value only
    if (threshold !== undefined) {
      if (threshold < 1) {
        return res.status(400).json({
          success: false,
          message: 'Threshold must be at least 1'
        });
      }
      // REMOVED: Allow threshold to be higher than quantity
      // This enables setting low stock alerts even when current stock is below threshold
    }

    const inventoryItem = new Inventory({
      item_ID,
      item_name,
      category,
      quantity,
      condition,
      location,
      status,
      threshold,
      expire_date
    });

    const savedItem = await inventoryItem.save();

    // Create log entry for item creation
    try {
      const log = new InventoryLog({
        action: 'CREATE',
        itemId: savedItem._id,
        itemName: savedItem.item_name,
        itemCategory: savedItem.category,
        description: `Created new inventory item: ${savedItem.item_name}`,
        performedBy: req.user?._id || null,
        performedByName: req.user?.name || 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

// @desc    Get all inventory items with search/filter
// @route   GET /api/inventory
// @access  Private
const getItems = async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      status,
      location,
      page = 1,
      limit = 10,
      sortBy = 'lastUpdated',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalItems = await Inventory.countDocuments(filter);
    
    // Get items with pagination
    const items = await Inventory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items',
      error: error.message
    });
  }
};

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Inventory.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if item_ID is being updated and if it already exists
    if (updateData.item_ID) {
      const existingItem = await Inventory.findOne({ 
        item_ID: updateData.item_ID,
        _id: { $ne: id }
      });
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Item ID already exists'
        });
      }
    }

    // Validate threshold minimum value only
    if (updateData.threshold !== undefined) {
      if (updateData.threshold < 1) {
        return res.status(400).json({
          success: false,
          message: 'Threshold must be at least 1'
        });
      }
      // REMOVED: Allow threshold to be higher than quantity
      // This enables setting low stock alerts even when current stock is below threshold
    }

    // Add lastUpdated timestamp
    updateData.lastUpdated = new Date();

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Create log entry for item update
    try {
      const log = new InventoryLog({
        action: 'UPDATE',
        itemId: updatedItem._id,
        itemName: updatedItem.item_name,
        itemCategory: updatedItem.category,
        description: `Updated inventory item: ${updatedItem.item_name}`,
        performedBy: req.user?._id || null,
        performedByName: req.user?.name || 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin only)
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await Inventory.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Create log entry for item deletion
    try {
      const log = new InventoryLog({
        action: 'DELETE',
        itemId: deletedItem._id,
        itemName: deletedItem.item_name,
        itemCategory: deletedItem.category,
        description: `Deleted inventory item: ${deletedItem.item_name}`,
        performedBy: req.user?._id || null,
        performedByName: req.user?.name || 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: deletedItem
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

// @desc    Check if item ID exists
// @route   GET /api/inventory/check-id/:itemId
// @access  Private
const checkItemIdExists = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const existingItem = await Inventory.findOne({ item_ID: parseInt(itemId) });
    
    res.json({
      success: true,
      exists: !!existingItem,
      message: existingItem ? 'Item ID already exists' : 'Item ID is available'
    });
  } catch (error) {
    console.error('Check item ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check item ID',
      error: error.message
    });
  }
};

// @desc    Generate inventory reports
// @route   GET /api/inventory/reports
// @access  Private
const generateReport = async (req, res) => {
  try {
    const { reportType = 'summary' } = req.query;

    let reportData = {};

    switch (reportType) {
      case 'summary':
        // Summary report
        const totalItems = await Inventory.countDocuments();
        const lowStockItems = await Inventory.findLowStock();
        const expiredItems = await Inventory.findExpired();
        const availableItems = await Inventory.countDocuments({ status: 'Available' });
        const inUseItems = await Inventory.countDocuments({ status: 'In Use' });
        const maintenanceItems = await Inventory.countDocuments({ status: 'Maintenance' });

        reportData = {
          totalItems,
          lowStockItems: lowStockItems.length,
          expiredItems: expiredItems.length,
          availableItems,
          inUseItems,
          maintenanceItems,
          lowStockItemsList: lowStockItems,
          expiredItemsList: expiredItems
        };
        break;

      case 'category':
        // Category-wise report
        const categoryReport = await Inventory.aggregate([
          {
            $group: {
              _id: '$category',
              totalItems: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              avgQuantity: { $avg: '$quantity' }
            }
          },
          { $sort: { totalItems: -1 } }
        ]);
        reportData = { categoryReport };
        break;

      case 'condition':
        // Condition-wise report
        const conditionReport = await Inventory.aggregate([
          {
            $group: {
              _id: '$condition',
              totalItems: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' }
            }
          }
        ]);
        reportData = { conditionReport };
        break;

      case 'location':
        // Location-wise report
        const locationReport = await Inventory.aggregate([
          {
            $group: {
              _id: '$location',
              totalItems: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' }
            }
          },
          { $sort: { totalItems: -1 } }
        ]);
        reportData = { locationReport };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Use: summary, category, condition, or location'
        });
    }

    res.json({
      success: true,
      message: `${reportType} report generated successfully`,
      data: reportData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  generateReport,
  checkItemIdExists
};
