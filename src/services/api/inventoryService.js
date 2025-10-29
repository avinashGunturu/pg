import axios from 'axios';

const API_URL = 'https://pgm-8a8h.onrender.com/api/inventory';

// Configure axios instance
const inventoryAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
inventoryAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Inventory services
const inventoryService = {
  // Get all inventory items
  getAllItems: async (params = {}) => {
    try {
      const response = await inventoryAPI.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get inventory item by ID
  getItemById: async (id) => {
    try {
      const response = await inventoryAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new inventory item
  createItem: async (itemData) => {
    try {
      const response = await inventoryAPI.post('/', itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update inventory item
  updateItem: async (id, itemData) => {
    try {
      const response = await inventoryAPI.put(`/${id}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete inventory item
  deleteItem: async (id) => {
    try {
      const response = await inventoryAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload inventory item image
  uploadItemImage: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await inventoryAPI.post(`/${id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const response = await inventoryAPI.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default inventoryService;