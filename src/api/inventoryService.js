import apiClient from './apiClient';

const inventoryService = {
  // Get all inventory items with optional filtering
  getInventoryItems: async (params) => {
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  },

  // Get a single inventory item by ID
  getInventoryItemById: async (id) => {
    const response = await apiClient.get(`/inventory/${id}`);
    return response.data;
  },

  // Create a new inventory item
  createInventoryItem: async (itemData) => {
    const response = await apiClient.post('/inventory', itemData);
    return response.data;
  },

  // Update an existing inventory item
  updateInventoryItem: async (id, itemData) => {
    const response = await apiClient.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  // Delete an inventory item
  deleteInventoryItem: async (id) => {
    const response = await apiClient.delete(`/inventory/${id}`);
    return response.data;
  },

  // Get inventory item history
  getInventoryItemHistory: async (itemId, params) => {
    const response = await apiClient.get(`/inventory/${itemId}/history`, { params });
    return response.data;
  },

  // Update inventory item stock
  updateInventoryStock: async (itemId, stockData) => {
    const response = await apiClient.patch(`/inventory/${itemId}/stock`, stockData);
    return response.data;
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    const response = await apiClient.get('/inventory/stats');
    return response.data;
  },
};

export default inventoryService;