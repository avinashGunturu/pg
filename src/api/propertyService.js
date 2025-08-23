import apiClient from '../services/apiClient';

const propertyService = {
  // Get all properties with optional filtering
  getProperties: async (params) => {
    const response = await apiClient.get('/properties', { params });
    return response.data;
  },

  // Get a single property by ID
  getPropertyById: async (id) => {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },
  
  // Get property by ID and owner ID
  getPropertyByIdAndOwner: async (ownerId, id) => {
    const response = await apiClient.post('/api/property/list', { ownerId, id });
    return response.data;
  },

  // Create a new property
  createProperty: async (propertyData) => {
    const response = await apiClient.post('/api/property/create', propertyData);
    return response.data;
  },

  // Update an existing property
  updateProperty: async (id, propertyData) => {
    const response = await apiClient.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  
  // Update property with specific API endpoint
  updatePropertyById: async (propertyId, updateData) => {
    const response = await apiClient.put('/property/update', { propertyId, updateData });
    return response.data;
  },

  // Delete a property
  deleteProperty: async (id) => {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  },

  // Get property units
  getPropertyUnits: async (propertyId, params) => {
    const response = await apiClient.get(`/properties/${propertyId}/units`, { params });
    return response.data;
  },

  // Get property maintenance requests
  getPropertyMaintenance: async (propertyId, params) => {
    const response = await apiClient.get(`/properties/${propertyId}/maintenance`, { params });
    return response.data;
  },

  // Get property statistics
  getPropertyStats: async () => {
    const response = await apiClient.get('/properties/stats');
    return response.data;
  },
};

export default propertyService;