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
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
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
          itemsAddedLast7Days: trends
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

// Helper function to generate 7-day trend data
const generateTrendData = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = await Inventory.countDocuments({
        createdAt: {
          $gte: new Date(dateStr),
          $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      trends.push({
        date: dateStr,
        count: count
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Trend data error:', error);
    // Return safe default data
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: 0
      };
    });
  }
};

module.exports = {
  getInventoryDashboardStats
};