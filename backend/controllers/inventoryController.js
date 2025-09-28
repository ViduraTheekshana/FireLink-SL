const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
const createItem = async (req, res) => {
  try {
    //13.Extract validated data from request
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

    // 14. Check if item_ID already exists
    const existingItem = await Inventory.findOne({ item_ID });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item ID already exists'
      });
    }

    // 15.Validate threshold minimum value only
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

    // 16. Create new MongoDB document
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

    // 17. Save to database (MongoDB) // MongoDB auto generates: _id, createdAt, updatedAt, lastUpdated
    const savedItem = await inventoryItem.save();

    // 18. Create log entry for item creation (automatic)
    try {
      const log = new InventoryLog({
        action: 'CREATE',                                                     // Log type
        itemId: savedItem._id,                                  // ObjectId from MongoDB
        itemName: savedItem.item_name,                              // For easy searching
        itemCategory: savedItem.category,                   // For filtering
        description: `Created new inventory item: ${savedItem.item_name}`,
        // TODO: Auth - Uncomment when auth is implemented
        // performedBy: req.user?._id || null,                                       // User who added it
        // performedByName: req.user?.name || 'System User',              // User name
        performedBy: null, // Temporary - will be replaced with actual user ID
        performedByName: 'System User', // Temporary - will be replaced with actual user name
        timestamp: new Date()     // Exact time of creation
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    // 19. Return success response with created item data -->in frontend, inventoryApi.js receives this response
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: savedItem   //19.1 Returns the complete saved item with MongoDB _id --- now database record is created successfully for inventories and inventoryLogs collections
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
const getItems = async (req, res) => {//get all inventory items
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
    } = req.query;//extract query parameters from request

    // Build filter object
    const filter = {};
    const andConditions = [];
    
    //add search filter with special keywords
    if (search) {
      if (search.toLowerCase() === 'lowstock') {
        // Special keyword for low stock items
        andConditions.push({
          $expr: { $lte: ['$quantity', '$threshold'] }
        });
      } else if (search.toLowerCase() === 'expiring') {
        // Special keyword for items expiring soon (within 120 days)
        andConditions.push({
          expire_date: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
          }
        });
      } else {
        // Regular text search
        andConditions.push({
          $or: [
            { item_name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
          ]
        });
      }
    }
    
    //add specific filters
    if (category) filter.category = category;
    if (condition) {
      if (condition === 'Expired') {
        // For expired condition, include items with condition 'Expired' OR past expire_date
        andConditions.push({
          $or: [
            { condition: 'Expired' },
            { expire_date: { $lt: new Date() } }
          ]
        });
      } else if (condition === 'Low Stock') {
        // For low stock condition, include items where quantity <= threshold
        andConditions.push({
          $expr: { $lte: ['$quantity', '$threshold'] }
        });
      } else {
        filter.condition = condition;
      }
    }
    
    // Combine all conditions with $and if there are multiple
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }
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
    const totalPages = Math.ceil(totalItems / parseInt(limit));//total number of pages
    const hasNextPage = page < totalPages;//is there a next page
    const hasPrevPage = page > 1;//is there a previous page

    // send response back to frontend with items and pagination info -->in frontend, inventoryApi.js receives this response
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
//update 8: This function is called when editing an existing item to fetch its current data
const getItemById = async (req, res) => {//fetch single inventory item by its MongoDB _id
  try {
    const { id } = req.params;
    
    const item = await Inventory.findById(id);//update 9: Fetch item from database using Mongoose model 
    
    if (!item) { //update 10: If item not found, return 404 error
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({ //update 11: If found, return item data to frontend -->in frontend, inventoryApi.js receives this response
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
//update 16:update item controller function called by route when editing an existing item and submitting the form
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;        // Get item ID from URL parameters
    const updateData = req.body;  // Get updated data from request body

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

    //update 16: Find item by ID and update with new data (when this runs the inventry.js model execute the update with validations)
    const updatedItem = await Inventory.findByIdAndUpdate(
      id, // Item ID to update
      updateData, // Data to update
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    //update 17 Create log entry for item update
    try {
      const log = new InventoryLog({ 
        action: 'UPDATE',
        itemId: updatedItem._id,
        itemName: updatedItem.item_name,
        itemCategory: updatedItem.category,
        description: `Updated inventory item: ${updatedItem.item_name}`,
        // TODO: Auth - Uncomment when auth is implemented
        // performedBy: req.user?._id || null,
        // performedByName: req.user?.name || 'System User',
        performedBy: null, // Temporary - will be replaced with actual user ID
        performedByName: 'System User', // Temporary - will be replaced with actual user name
        timestamp: new Date()
      });
      await log.save(); // Save log entry to database

    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    //update 18; Return success response with updated item data -->in frontend, inventoryApi.js receives this response
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem // Return the updated item data
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
