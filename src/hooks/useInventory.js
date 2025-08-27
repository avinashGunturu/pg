import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '@/api/inventoryService';
import { toast } from 'sonner';

// Hook for fetching inventory items
export const useInventoryItems = (filterData = {}) => {
  return useQuery({
    queryKey: ['inventory', filterData],
    queryFn: () => inventoryService.getInventoryItems(filterData),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching a single inventory item
export const useInventoryItem = (inventoryId, ownerId) => {
  return useQuery({
    queryKey: ['inventoryItem', inventoryId, ownerId],
    queryFn: () => inventoryService.getInventoryItemById(inventoryId, ownerId),
    enabled: !!(inventoryId && ownerId), // Only run if both IDs are provided
  });
};

// Hook for creating an inventory item
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemData) => inventoryService.createInventoryItem(itemData),
    onSuccess: (data) => {
      // Invalidate inventory query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      return data;
    },
    onError: (error) => {
      console.error('Create inventory error:', error);
      throw error;
    },
  });
};

// Hook for updating an inventory item
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, updateData }) => inventoryService.updateInventoryItem(inventoryId, updateData),
    onSuccess: (data, variables) => {
      // Invalidate specific inventory item query and inventory list
      queryClient.invalidateQueries({ queryKey: ['inventoryItem', variables.inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      return data;
    },
    onError: (error) => {
      console.error('Update inventory error:', error);
      throw error;
    },
  });
};

// Hook for deleting an inventory item
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryId) => inventoryService.deleteInventoryItem(inventoryId),
    onSuccess: () => {
      // Invalidate inventory query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete inventory error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete inventory item';
      toast.error(errorMessage);
      throw error;
    },
  });
};

// Hook for fetching inventory statistics
export const useInventoryStats = (ownerId) => {
  return useQuery({
    queryKey: ['inventoryStats', ownerId],
    queryFn: () => inventoryService.getInventoryStats(ownerId),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};