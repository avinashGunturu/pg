import apiClient from './apiClient';

const tenantService = {
  // Get all tenants with optional filtering
  getTenants: async (params) => {
    const response = await apiClient.get('/tenants', { params });
    return response.data;
  },

  // Get a single tenant by ID
  getTenantById: async (id) => {
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  },

  // Create a new tenant
  createTenant: async (tenantData) => {
    const response = await apiClient.post('/tenants', tenantData);
    return response.data;
  },

  // Update an existing tenant
  updateTenant: async (id, tenantData) => {
    const response = await apiClient.put(`/tenants/${id}`, tenantData);
    return response.data;
  },

  // Delete a tenant
  deleteTenant: async (id) => {
    const response = await apiClient.delete(`/tenants/${id}`);
    return response.data;
  },

  // Get tenant leases
  getTenantLeases: async (tenantId, params) => {
    const response = await apiClient.get(`/tenants/${tenantId}/leases`, { params });
    return response.data;
  },

  // Get tenant payments
  getTenantPayments: async (tenantId, params) => {
    const response = await apiClient.get(`/tenants/${tenantId}/payments`, { params });
    return response.data;
  },

  // Get tenant maintenance requests
  getTenantMaintenance: async (tenantId, params) => {
    const response = await apiClient.get(`/tenants/${tenantId}/maintenance`, { params });
    return response.data;
  },

  // Get tenant statistics
  getTenantStats: async () => {
    const response = await apiClient.get('/tenants/stats');
    return response.data;
  },
};

export default tenantService;