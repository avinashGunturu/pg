import axios from 'axios';

const API_URL = 'http://localhost:3000/api/property';

// Configure axios instance
const propertyAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
propertyAPI.interceptors.request.use(
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

// Property services
const propertyService = {
  // Get all properties
  getAllProperties: async (params = {}) => {
    try {
      const response = await propertyAPI.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get property by ID
  getPropertyById: async (id) => {
    try {
      const response = await propertyAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new property
  createProperty: async (propertyData) => {
    try {
      const response = await propertyAPI.post('/', propertyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    try {
      const response = await propertyAPI.put(`/${id}`, propertyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    try {
      const response = await propertyAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload property image
  uploadPropertyImage: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await propertyAPI.post(`/${id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get property analytics
  getPropertyAnalytics: async (id) => {
    try {
      const response = await propertyAPI.get(`/${id}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default propertyService;