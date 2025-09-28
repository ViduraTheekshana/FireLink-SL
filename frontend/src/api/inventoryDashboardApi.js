// API helper for inventory dashboard statistics
import axios from 'axios';

const BASE_URL = '/api/inventory';

/**
 * Fetch inventory dashboard statistics
 * @returns {Promise<Object>} Dashboard stats data
 */
export const getInventoryDashboardStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard-stats`);
    
    // Validate response structure
    if (!response.data || !response.data.success) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Dashboard API Error:', error);
    
    // Return a safe default structure to prevent crashes
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard data',
      data: {
        inventory: { totalItems: 0, lowStockCount: 0, expiredCount: 0, expiringSoonCount: 0 },
        vehicles: { totalVehicles: 0, availableVehicles: 0, inUseVehicles: 0, maintenanceVehicles: 0 },
        reorders: {},
        assignments: { totalAssignments: 0, totalAssignedQuantity: 0, vehiclesWithAssignments: 0 },
        recentLogs: [],
        trends: { itemsAddedLast7Days: [] },
        categories: []
      }
    };
  }
};