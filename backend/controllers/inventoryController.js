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
        quantityChange: savedItem.quantity, // Track the initial quantity added
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
        const searchConditions = [
          { item_name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
        
        // If search looks like a number, also search by item_ID (partial match)
        // Convert item_ID to string and use regex for partial matching
        if (!isNaN(search)) {
          searchConditions.push({
            $expr: {
              $regexMatch: {
                input: { $toString: '$item_ID' },
                regex: search,
                options: 'i'
              }
            }
          });
          console.log(`Search by ID (partial): "${search}"`);
        }
        
        console.log('Search conditions:', JSON.stringify(searchConditions, null, 2));
        andConditions.push({ $or: searchConditions });
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
        description: `Deleted inventory item: ${deletedItem.item_name} (Quantity: ${deletedItem.quantity})`,
        quantityChange: -deletedItem.quantity, // Negative to indicate removal
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

// @desc    Add quantity to inventory item (Quick Adjust)
// @route   POST /api/inventory/:id/add-quantity
// @access  Private
const addItemQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    // Validate amount
    const addAmount = parseInt(amount, 10);
    if (!addAmount || addAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 1'
      });
    }

    // Maximum limit per single operation
    const MAX_ADD_AMOUNT = 10000;
    if (addAmount > MAX_ADD_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more than ${MAX_ADD_AMOUNT} units in a single operation`
      });
    }

    // Find item
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Store previous values for logging
    const previousQuantity = item.quantity;

    // Maximum total quantity limit
    const MAX_TOTAL_QUANTITY = 999999;
    const newQuantity = item.quantity + addAmount;
    if (newQuantity > MAX_TOTAL_QUANTITY) {
      return res.status(400).json({
        success: false,
        message: `Total quantity cannot exceed ${MAX_TOTAL_QUANTITY}. Current: ${item.quantity}, Attempting to add: ${addAmount}`
      });
    }

    // Add quantity
    item.quantity = newQuantity;
    item.lastUpdated = new Date();
    await item.save();

    // Create log entry
    try {
      const log = new InventoryLog({
        action: 'STOCK_CHANGE',
        itemId: item._id,
        itemName: item.item_name,
        itemCategory: item.category,
        description: reason || `Added ${addAmount} units via Quick Adjust`,
        previousValue: { quantity: previousQuantity },
        newValue: { quantity: item.quantity },
        quantityChange: addAmount,
        performedBy: null, // TODO: Auth
        performedByName: 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
    }

    res.json({
      success: true,
      message: `Successfully added ${addAmount} units`,
      data: item
    });
  } catch (error) {
    console.error('Add quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add quantity',
      error: error.message
    });
  }
};

// @desc    Remove quantity from inventory item (Quick Adjust)
// @route   POST /api/inventory/:id/remove-quantity
// @access  Private
const removeItemQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    // Validate amount
    const removeAmount = parseInt(amount, 10);
    if (!removeAmount || removeAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 1'
      });
    }

    // Find item
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if sufficient quantity available
    if (item.quantity < removeAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${item.quantity}`
      });
    }

    // Store previous values for logging
    const previousQuantity = item.quantity;

    // Remove quantity
    item.quantity -= removeAmount;
    item.lastUpdated = new Date();
    await item.save();

    // Create log entry
    try {
      const log = new InventoryLog({
        action: 'STOCK_CHANGE',
        itemId: item._id,
        itemName: item.item_name,
        itemCategory: item.category,
        description: reason || `Removed ${removeAmount} units via Quick Adjust`,
        previousValue: { quantity: previousQuantity },
        newValue: { quantity: item.quantity },
        quantityChange: -removeAmount,
        performedBy: null, // TODO: Auth
        performedByName: 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
    }

    res.json({
      success: true,
      message: `Successfully removed ${removeAmount} units`,
      data: item
    });
  } catch (error) {
    console.error('Remove quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove quantity',
      error: error.message
    });
  }
};

// @desc    Get available inventory items for missions (Mission Records integration)
// @route   GET /api/inventory/items-for-missions
// @access  Private - Record Managers
const getItemsForMissions = async (req, res) => {
  try {
    const { search, category } = req.query;

    // Build query - only get available items
    let query = { status: 'Available' };

    // Add search filter
    if (search) {
      query.$or = [
        { item_ID: { $regex: search, $options: 'i' } },
        { item_name: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Fetch items, sorted by item_ID
    const items = await Inventory.find(query)
      .select('_id item_ID item_name category quantity condition location')
      .sort({ item_ID: 1 })
      .limit(100);

    // Format response
    const formattedItems = items.map(item => ({
      _id: item._id,
      item_ID: item.item_ID,
      itemName: item.item_name,
      category: item.category,
      quantity: item.quantity,
      condition: item.condition,
      location: item.location
    }));

    res.status(200).json({
      success: true,
      count: formattedItems.length,
      items: formattedItems
    });
  } catch (error) {
    console.error('Error fetching items for missions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items',
      error: error.message
    });
  }
};

// @desc    Get single item by item_ID for validation (Mission Records integration)
// @route   GET /api/inventory/by-item-id/:itemId
// @access  Private - Record Managers
const getItemByItemId = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Find item by item_ID (not MongoDB _id)
    const item = await Inventory.findOne({ item_ID: itemId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID ${itemId} not found`
      });
    }

    // Check if available
    if (item.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Item ${itemId} is not available (Status: ${item.status})`
      });
    }

    // Format response
    const formattedItem = {
      _id: item._id,
      item_ID: item.item_ID,
      itemName: item.item_name,
      category: item.category,
      quantity: item.quantity,
      condition: item.condition,
      location: item.location,
      status: item.status
    };

    res.status(200).json({
      success: true,
      item: formattedItem
    });
  } catch (error) {
    console.error('Error fetching item by item_ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item',
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
  checkItemIdExists,
  addItemQuantity,
  removeItemQuantity,
  getItemsForMissions,
  getItemByItemId
};
