import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tenant';

// Configure axios instance
const tenantAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
tenantAPI.interceptors.request.use(
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

// Tenant services
const tenantService = {
  // Get all tenants
  getAllTenants: async (params = {}) => {
    try {
      const response = await tenantAPI.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get tenant by ID
  getTenantById: async (id) => {
    try {
      const response = await tenantAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new tenant
  createTenant: async (tenantData) => {
    try {
      const response = await tenantAPI.post('/', tenantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update tenant
  updateTenant: async (id, tenantData) => {
    try {
      const response = await tenantAPI.put(`/${id}`, tenantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete tenant
  deleteTenant: async (id) => {
    try {
      const response = await tenantAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload tenant document
  uploadTenantDocument: async (id, documentFile, documentType) => {
    try {
      const formData = new FormData();
      formData.append('document', documentFile);
      formData.append('documentType', documentType);
      
      const response = await tenantAPI.post(`/${id}/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get tenant payment history
  getTenantPaymentHistory: async (id) => {
    try {
      const response = await tenantAPI.get(`/${id}/payment-history`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default tenantService;