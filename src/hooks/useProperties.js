import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '@/api';
import { toast } from '@/components/ui/use-toast';

// Hook for fetching properties
export const useProperties = (params = {}) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyService.getProperties(params),
  });
};

// Hook for fetching a single property
export const useProperty = (id) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id),
    enabled: !!id, // Only run if id is provided
  });
};

// Hook for creating a property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData) => propertyService.createProperty(propertyData),
    onSuccess: () => {
      // Invalidate properties query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Success',
        description: 'Property created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create property',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating a property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => propertyService.updateProperty(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific property query and properties list
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Success',
        description: 'Property updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update property',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting a property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => propertyService.deleteProperty(id),
    onSuccess: () => {
      // Invalidate properties query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete property',
        variant: 'destructive',
      });
    },
  });
};

// Hook for fetching property units
export const usePropertyUnits = (propertyId, params = {}) => {
  return useQuery({
    queryKey: ['propertyUnits', propertyId, params],
    queryFn: () => propertyService.getPropertyUnits(propertyId, params),
    enabled: !!propertyId, // Only run if propertyId is provided
  });
};

// Hook for fetching property statistics
export const usePropertyStats = () => {
  return useQuery({
    queryKey: ['propertyStats'],
    queryFn: () => propertyService.getPropertyStats(),
  });
};