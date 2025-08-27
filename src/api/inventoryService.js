import apiClient from './apiClient';

const inventoryService = {
  // Get all inventory items with optional filtering
  getInventoryItems: async (filterData = {}) => {
    const response = await apiClient.post('/inventory/list', filterData);
    return response.data;
  },

  // Get a single inventory item by ID
  getInventoryItemById: async (inventoryId, ownerId) => {
    const response = await apiClient.post('/inventory/list', {
      inventoryId,
      ownerId,
      propertyId: '',
      itemName: '',
      category: '',
      status: ''
    });
    return response.data;
  },

  // Create a new inventory item
  createInventoryItem: async (itemData) => {
    const response = await apiClient.post('/inventory/create', itemData);
    return response.data;
  },

  // Update an existing inventory item
  updateInventoryItem: async (inventoryId, updateData) => {
    const response = await apiClient.put('/inventory/update', {
      inventoryId,
      updateData
    });
    return response.data;
  },

  // Delete an inventory item
  deleteInventoryItem: async (inventoryId) => {
    const response = await apiClient.post('/inventory/delete', {
      inventoryId
    });
    return response.data;
  },

  // Get inventory statistics
  getInventoryStats: async (ownerId) => {
    try {
      const response = await apiClient.post('/inventory/list', {
        ownerId,
        propertyId: '',
        itemName: '',
        category: '',
        status: ''
      });
      
      const items = response?.data?.data?.inventories || [];
      
      const stats = {
        totalItems: items.length,
        activeItems: items.filter(item => item.status === 'Active').length,
        inactiveItems: items.filter(item => item.status === 'Inactive').length,
        disposedItems: items.filter(item => item.status === 'Disposed').length,
        lowStockItems: items.filter(item => item.quantity <= 5).length,
        totalValue: items.reduce((sum, item) => sum + (item.totalValue || 0), 0)
      };
      
      return { data: stats };
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return {
        data: {
          totalItems: 0,
          activeItems: 0,
          inactiveItems: 0,
          disposedItems: 0,
          lowStockItems: 0,
          totalValue: 0
        }
      };
    }
  },
};

export default inventoryService;