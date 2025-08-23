import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/api';
import { toast } from '@/components/ui/use-toast';

// Hook for fetching inventory items
export const useInventoryItems = (params = {}) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.getInventoryItems(params),
  });
};

// Hook for fetching a single inventory item
export const useInventoryItem = (id) => {
  return useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: () => inventoryService.getInventoryItemById(id),
    enabled: !!id, // Only run if id is provided
  });
};

// Hook for creating an inventory item
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemData) => inventoryService.createInventoryItem(itemData),
    onSuccess: () => {
      // Invalidate inventory query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create inventory item',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating an inventory item
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => inventoryService.updateInventoryItem(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific inventory item query and inventory list
      queryClient.invalidateQueries({ queryKey: ['inventoryItem', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update inventory item',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting an inventory item
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => inventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      // Invalidate inventory query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete inventory item',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating inventory stock
export const useUpdateInventoryStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stockData }) => inventoryService.updateInventoryStock(id, stockData),
    onSuccess: (_, variables) => {
      // Invalidate specific inventory item query and inventory list
      queryClient.invalidateQueries({ queryKey: ['inventoryItem', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory stock updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update inventory stock',
        variant: 'destructive',
      });
    },
  });
};

// Hook for fetching inventory item history
export const useInventoryItemHistory = (itemId, params = {}) => {
  return useQuery({
    queryKey: ['inventoryItemHistory', itemId, params],
    queryFn: () => inventoryService.getInventoryItemHistory(itemId, params),
    enabled: !!itemId, // Only run if itemId is provided
  });
};

// Hook for fetching inventory statistics
export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => inventoryService.getInventoryStats(),
  });
};