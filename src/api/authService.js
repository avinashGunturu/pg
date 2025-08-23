import apiClient from './apiClient';

const authService = {
  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (resetData) => {
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    
    // Update stored user data
    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  },
};

export default authService;