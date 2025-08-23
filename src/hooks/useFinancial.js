import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/api';
import { toast } from '@/components/ui/use-toast';

// Hook for fetching transactions
export const useTransactions = (params = {}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => financialService.getTransactions(params),
  });
};

// Hook for fetching a single transaction
export const useTransaction = (id) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => financialService.getTransactionById(id),
    enabled: !!id, // Only run if id is provided
  });
};

// Hook for creating a transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData) => financialService.createTransaction(transactionData),
    onSuccess: () => {
      // Invalidate transactions query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialStats'] });
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transaction',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating a transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => financialService.updateTransaction(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific transaction query and transactions list
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialStats'] });
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update transaction',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting a transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => financialService.deleteTransaction(id),
    onSuccess: () => {
      // Invalidate transactions query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialStats'] });
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
  });
};

// Hook for fetching financial reports
export const useFinancialReports = (params = {}) => {
  return useQuery({
    queryKey: ['financialReports', params],
    queryFn: () => financialService.getFinancialReports(params),
  });
};

// Hook for fetching income statement
export const useIncomeStatement = (params = {}) => {
  return useQuery({
    queryKey: ['incomeStatement', params],
    queryFn: () => financialService.getIncomeStatement(params),
  });
};

// Hook for fetching balance sheet
export const useBalanceSheet = (params = {}) => {
  return useQuery({
    queryKey: ['balanceSheet', params],
    queryFn: () => financialService.getBalanceSheet(params),
  });
};

// Hook for fetching cash flow statement
export const useCashFlowStatement = (params = {}) => {
  return useQuery({
    queryKey: ['cashFlowStatement', params],
    queryFn: () => financialService.getCashFlowStatement(params),
  });
};

// Hook for fetching financial statistics
export const useFinancialStats = () => {
  return useQuery({
    queryKey: ['financialStats'],
    queryFn: () => financialService.getFinancialStats(),
  });
};