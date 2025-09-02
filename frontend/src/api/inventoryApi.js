import axios from 'axios';

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inventory API functions
export const inventoryApi = {
  // Get all inventory items with search/filter/pagination
  getItems: async (params = {}) => {
    try {
      const response = await api.get('/api/inventory', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  // Get single inventory item by ID
  getItemById: async (id) => {
    try {
      const response = await api.get(`/api/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  // Create new inventory item
  addItem: async (itemData) => {
    try {
      const response = await api.post('/api/inventory', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  // Update existing inventory item
  updateItem: async (id, itemData) => {
    try {
      const response = await api.put(`/api/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  // Delete inventory item
  deleteItem: async (id) => {
    try {
      const response = await api.delete(`/api/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Generate inventory reports
  generateReport: async (reportType = 'summary') => {
    try {
      const response = await api.get('/api/inventory/reports', {
        params: { reportType }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Get available categories (for dropdowns)
  getCategories: async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { limit: 1000 } // Get all items to extract categories
      });
      
      // Extract unique categories from response
      const categories = [...new Set(response.data.data.map(item => item.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get available locations (for dropdowns)
  getLocations: async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { limit: 1000 } // Get all items to extract locations
      });
      
      // Extract unique locations from response
      const locations = [...new Set(response.data.data.map(item => item.location).filter(Boolean))];
      return locations.sort();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Check if item ID exists
  checkItemIdExists: async (itemId) => {
    try {
      const response = await api.get(`/api/inventory/check-id/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking item ID:', error);
      return { success: false, exists: false };
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { 
          limit: 1000,
          // Filter for items where quantity <= threshold
          // This will be handled by the backend
        }
      });
      
      // Filter low stock items on frontend for now
      const lowStockItems = response.data.data.filter(item => 
        item.quantity <= item.threshold
      );
      
      return lowStockItems;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  // Get expired items
  getExpiredItems: async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { limit: 1000 }
      });
      
      // Filter expired items on frontend
      const expiredItems = response.data.data.filter(item => {
        if (!item.expire_date) return false;
        return new Date(item.expire_date) < new Date();
      });
      
      return expiredItems;
    } catch (error) {
      console.error('Error fetching expired items:', error);
      throw error;
    }
  },

  // Get items by condition
  getItemsByCondition: async (condition) => {
    try {
      const response = await api.get('/api/inventory', {
        params: { condition, limit: 1000 }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items by condition:', error);
      throw error;
    }
  },

  // Get items by status
  getItemsByStatus: async (status) => {
    try {
      const response = await api.get('/api/inventory', {
        params: { status, limit: 1000 }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items by status:', error);
      throw error;
    }
  }
};

// Export individual functions for convenience
export const {
  getItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  generateReport,
  getCategories,
  getLocations,
  checkItemIdExists,
  getLowStockItems,
  getExpiredItems,
  getItemsByCondition,
  getItemsByStatus
} = inventoryApi;

export default inventoryApi;
