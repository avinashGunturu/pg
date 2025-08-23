import apiClient from './apiClient';

const employeeService = {
  // Get all employees with optional filtering
  getEmployees: async (params) => {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  // Get a single employee by ID
  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  // Create a new employee
  createEmployee: async (employeeData) => {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },

  // Update an existing employee
  updateEmployee: async (id, employeeData) => {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete an employee
  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },

  // Get employee assignments
  getEmployeeAssignments: async (employeeId, params) => {
    const response = await apiClient.get(`/employees/${employeeId}/assignments`, { params });
    return response.data;
  },

  // Get employee performance metrics
  getEmployeePerformance: async (employeeId, params) => {
    const response = await apiClient.get(`/employees/${employeeId}/performance`, { params });
    return response.data;
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await apiClient.get('/employees/stats');
    return response.data;
  },
};

export default employeeService;