import axios from 'axios';

const API_URL = 'http://localhost:3000/api/transaction';

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
  // Get all transactions
  getAllTransactions: async (params = {}) => {
    try {
      const response = await transactionAPI.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await transactionAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await transactionAPI.post('/', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const response = await transactionAPI.put(`/${id}`, transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      const response = await transactionAPI.delete(`/${id}`);
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