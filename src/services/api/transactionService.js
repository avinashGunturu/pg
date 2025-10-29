import axios from 'axios';

const API_URL = 'https://pgm-8a8h.onrender.com/api/transaction';

// Configure axios instance
const transactionAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
transactionAPI.interceptors.request.use(
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

// Transaction services
const transactionService = {
  // Get list of transactions with filters
  getTransactions: async (filters = {}) => {
    try {
      const response = await transactionAPI.post('/list', filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await transactionAPI.post('/list', { transactionId: id });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await transactionAPI.post('/create', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update transaction
  updateTransaction: async (transactionId, updateData) => {
    try {
      const response = await transactionAPI.put('/update', {
        transactionId,
        updateData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete transaction
  deleteTransaction: async (transactionId) => {
    try {
      const response = await transactionAPI.post('/delete', {
        transactionId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all transactions (backward compatibility)
  getAllTransactions: async (params = {}) => {
    try {
      const response = await transactionAPI.post('/list', params);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get financial reports
  getFinancialReports: async (params = {}) => {
    try {
      const response = await transactionAPI.get('/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get revenue trends
  getRevenueTrends: async (period = 'monthly') => {
    try {
      const response = await transactionAPI.get('/trends/revenue', { params: { period } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get expense breakdown
  getExpenseBreakdown: async (period = 'monthly') => {
    try {
      const response = await transactionAPI.get('/breakdown/expenses', { params: { period } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default transactionService;