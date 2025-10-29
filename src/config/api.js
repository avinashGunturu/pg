// API Configuration - Centralized for easy environment switching
export const API_CONFIG = {
  // Base URL - can be changed via environment variable
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://pgm-8a8h.onrender.com',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      VERIFY:'/api/auth/verify',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USER: {
      PROFILE: '/api/user/profile',
      UPDATE_PROFILE: '/api/user/profile',
    },
    PROPERTIES: {
      LIST: '/api/properties',
      CREATE: '/api/properties',
      UPDATE: '/api/properties/:id',
      DELETE: '/api/properties/:id',
    },
    TENANTS: {
      LIST: '/api/tenants',
      CREATE: '/api/tenants',
      UPDATE: '/api/tenants/:id',
      DELETE: '/api/tenants/:id',
    },
    FINANCIAL: {
      TRANSACTIONS: '/api/financial/transactions',
      REPORTS: '/api/financial/reports',
    },
    MAINTENANCE: {
      REQUESTS: '/api/maintenance/requests',
      CREATE: '/api/maintenance/requests',
      UPDATE: '/api/maintenance/requests/:id',
    },
  },
  
  // API Headers
  getHeaders: (customHeaders = {}) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders,
  }),
  
  // Build full URL
  buildUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
};

export default API_CONFIG;
