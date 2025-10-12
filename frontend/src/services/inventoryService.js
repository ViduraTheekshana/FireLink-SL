import api from "./api";

export const inventoryService = {
  // Get all available inventory items for missions
  getItemsForMissions: async (params = {}) => {
    try {
      const response = await api.get("/inventory/items-for-missions", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }
  },

  // Get single item by item_ID for validation
  getItemByItemId: async (itemId) => {
    try {
      const response = await api.get(`/inventory/by-item-id/${itemId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching item by ID:", error);
      throw error;
    }
  },
};
