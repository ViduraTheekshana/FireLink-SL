const Inventory = require('../models/Inventory');
const InventoryVehicle = require('../models/inventoryVehicle');
const InventoryVehicleItems = require('../models/inventoryVehicleItems');
const InventoryReorder = require('../models/inventoryReorder');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get inventory dashboard statistics
// @route   GET /api/inventory/dashboard-stats
// @access  Public (will be Private when auth is enabled)
const getInventoryDashboardStats = async (req, res) => {
  try {
    // Get all stats in parallel for performance
    const [
      inventoryStats,
      vehicleStats,
      reorderStats,
      assignmentStats,
      recentLogs,
      trends,
      categories
    ] = await Promise.all([
      // Inventory statistics
      Promise.all([
        Inventory.countDocuments(),
        Inventory.findLowStock(),
        Inventory.findExpired(),
        Inventory.countDocuments({ 
          expire_date: { 
            $gte: new Date(), 
            $lte: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) 
          } 
        })
      ]),
      
      // Vehicle statistics
      Promise.all([
        InventoryVehicle.countDocuments(),
        InventoryVehicle.countDocuments({ status: 'Available' }),
        InventoryVehicle.countDocuments({ status: 'In Use' }),
        InventoryVehicle.countDocuments({ status: 'Maintenance' })
      ]),
      
      // Reorder statistics
      InventoryReorder.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Assignment statistics
      Promise.all([
        InventoryVehicleItems.countDocuments(),
        InventoryVehicleItems.aggregate([
          { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]),
        InventoryVehicleItems.distinct('vehicle_ID')
      ]),
      
      // Recent logs
      InventoryLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select('action itemName description timestamp')
        .lean(),
      
      // 7-day trends
      generateTrendData(),
      
      // Category distribution
      Inventory.aggregate([
        {
          $group: {
            _id: '$category',
            items: { $sum: 1 },
            quantity: { $sum: '$quantity' }
          }
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Process the results
    const [totalItems, lowStockItems, expiredItems, expiringSoonCount] = inventoryStats;
    const [totalVehicles, availableVehicles, inUseVehicles, maintenanceVehicles] = vehicleStats;
    const [totalAssignments, totalAssignedData, vehiclesWithAssignments] = assignmentStats;

    // Format reorder stats
    const reordersObj = {};
    reorderStats.forEach(stat => {
      reordersObj[stat._id] = stat.count;
    });

    // Format assignment total
    const totalAssignedQuantity = totalAssignedData[0]?.total || 0;

    const response = {
      success: true,
      data: {
        inventory: {
          totalItems,
          lowStockCount: lowStockItems.length,
          expiredCount: expiredItems.length,
          expiringSoonCount
        },
        vehicles: {
          totalVehicles,
          availableVehicles,
          inUseVehicles,
          maintenanceVehicles
        },
        reorders: reordersObj,
        assignments: {
          totalAssignments,
          totalAssignedQuantity,
          vehiclesWithAssignments: vehiclesWithAssignments.length
        },
        recentLogs: recentLogs || [],
        trends: {
          itemsAddedLast7Days: trends.itemsAdded,
          itemsRemovedLast7Days: trends.itemsRemoved
        },
        categories: categories.map(cat => ({
          category: cat._id,
          items: cat.items,
          quantity: cat.quantity
        }))
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Helper function to generate detailed 7-day trend data for both added and removed items
const generateTrendData = async () => {
  try {
    const itemsAdded = [];
    const itemsRemoved = [];
    
    // Generate data for the last 7 days including today - matching frontend logic
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log(`Server time: ${now.toISOString()} | Today normalized: ${today.toISOString().split('T')[0]}`);
    
    for (let i = 6; i >= 0; i--) {
      // Calculate the target date (today - i days) - same logic as frontend
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      // Create day boundaries - start and end of the target date
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
      
      // Format date as YYYY-MM-DD in local timezone - same logic as frontend
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log(`Checking date ${dateStr} (${targetDate.toLocaleDateString()}) - Day range: ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);
      
      // Get items added (NEW inventory records created)
      const itemsAddedToday = await Inventory.countDocuments({
        createdAt: {
          $gte: dayStart,
          $lt: dayEnd
        }
      });
      
      // Get QUANTITY added (from STOCK_CHANGE logs with positive quantityChange)
      const quantityAddedAgg = await InventoryLog.aggregate([
        {
          $match: {
            timestamp: {
              $gte: dayStart,
              $lt: dayEnd
            },
            action: 'STOCK_CHANGE',
            quantityChange: { $gt: 0 } // Only positive changes (additions)
          }
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantityChange' }
          }
        }
      ]);
      
      // Get items removed (DELETE actions from logs)
      const itemsRemovedToday = await InventoryLog.countDocuments({
        timestamp: {
          $gte: dayStart,
          $lt: dayEnd
        },
        action: { $in: ['DELETE', 'REMOVE', 'DELETED'] }
      });
      
      // Get QUANTITY removed (from STOCK_CHANGE logs with negative quantityChange AND DELETE actions)
      const quantityRemovedAgg = await InventoryLog.aggregate([
        {
          $match: {
            timestamp: {
              $gte: dayStart,
              $lt: dayEnd
            },
            $or: [
              { action: 'STOCK_CHANGE', quantityChange: { $lt: 0 } }, // Quantity reductions
              { action: 'DELETE', quantityChange: { $lt: 0 } } // Item deletions with quantity
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantityChange' }
          }
        }
      ]);
      
      const dayQuantityAdded = quantityAddedAgg[0]?.totalQuantity || 0;
      const dayQuantityRemoved = Math.abs(quantityRemovedAgg[0]?.totalQuantity || 0); // Make it positive for display
      
      console.log(`${dateStr}: Added ${itemsAddedToday} items (${dayQuantityAdded} qty), Removed ${itemsRemovedToday} items (${dayQuantityRemoved} qty)`);
      
      itemsAdded.push({
        date: dateStr,
        count: itemsAddedToday,
        quantity: dayQuantityAdded,
        dayName: targetDate.toLocaleDateString('en-US', { weekday: 'short' })
      });
      
      itemsRemoved.push({
        date: dateStr,
        count: itemsRemovedToday,
        quantity: dayQuantityRemoved,
        dayName: targetDate.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    console.log('Final trend data being returned:');
    console.log('Items Added:', itemsAdded.map(d => `${d.date}: ${d.count} items`));
    console.log('Items Removed:', itemsRemoved.map(d => `${d.date}: ${d.count} items`));
    
    return {
      itemsAdded,
      itemsRemoved
    };
  } catch (error) {
    console.error('Trend data error:', error);
    // Return safe default data for the last 7 days including today
    const defaultData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // i=0 gives 6 days ago, i=6 gives today
      return {
        date: date.toISOString().split('T')[0],
        count: 0,
        quantity: 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
    
    return {
      itemsAdded: defaultData,
      itemsRemoved: defaultData
    };
  }
};

module.exports = {
  getInventoryDashboardStats
};