import axios from 'axios';
import API_CONFIG from '../config/api';
import { getAuthCookies, clearAuthCookies } from '../utils/cookies';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000, // 10 seconds
  withCredentials: true, // Important for CORS with cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token from cookies if available
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookies and add to Authorization header
    const { token } = getAuthCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common response patterns
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle specific status codes
      if (status === 401 || status === 403) {
        // Unauthorized or Forbidden - clear cookies and redirect to 404
        clearAuthCookies();
        
        // Check if we're already on a protected route
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/app/')) {
          // Redirect to 404 page for unauthorized access to protected routes
          window.location.href = '/pagenotfound';
        } else {
          // For public routes, redirect to login
          window.location.href = '/login';
        }
      } else if (status === 500) {
        // Server error
        console.error('Server error occurred');
      }
      
      // Return error with server message
      return Promise.reject({
        message: data?.message || 'An error occurred',
        status,
        data,
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      });
    }
  }
);

export default apiClient;
