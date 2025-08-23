import axios from 'axios';

const API_URL = 'http://localhost:3000/api/employee';

// Configure axios instance
const employeeAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
employeeAPI.interceptors.request.use(
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

// Employee services
const employeeService = {
  // Get all employees
  getAllEmployees: async (params = {}) => {
    try {
      const response = await employeeAPI.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await employeeAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await employeeAPI.post('/', employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await employeeAPI.put(`/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await employeeAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload employee profile picture
  uploadEmployeeProfilePicture: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);
      
      const response = await employeeAPI.post(`/${id}/upload-profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get employee performance metrics
  getEmployeePerformance: async (id) => {
    try {
      const response = await employeeAPI.get(`/${id}/performance`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default employeeService;