import apiClient from './apiClient';

const financialService = {
  // Get all transactions with optional filtering
  getTransactions: async (params) => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  // Get a single transaction by ID
  getTransactionById: async (id) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  },

  // Update an existing transaction
  updateTransaction: async (id, transactionData) => {
    const response = await apiClient.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get financial reports
  getFinancialReports: async (params) => {
    const response = await apiClient.get('/financial/reports', { params });
    return response.data;
  },

  // Get income statement
  getIncomeStatement: async (params) => {
    const response = await apiClient.get('/financial/income-statement', { params });
    return response.data;
  },

  // Get balance sheet
  getBalanceSheet: async (params) => {
    const response = await apiClient.get('/financial/balance-sheet', { params });
    return response.data;
  },

  // Get cash flow statement
  getCashFlowStatement: async (params) => {
    const response = await apiClient.get('/financial/cash-flow', { params });
    return response.data;
  },

  // Get financial statistics
  getFinancialStats: async () => {
    const response = await apiClient.get('/financial/stats');
    return response.data;
  },
};

export default financialService;