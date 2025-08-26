import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Hook for fetching properties
export const useProperties = (params = {}) => {
  const { ownerId } = useAuth();
  
  return useQuery({
    queryKey: ['properties', ownerId, params],
    queryFn: async () => {
      try {
        const response = await apiClient.post('/api/property/list', {
          ownerId: ownerId || '68a643b5430dd953da794950',
          propertyId: '',
          location: '',
          propertyName: '',
          propertyCategory: '',
          ...params
        });
        
        const properties = response?.data?.data?.properties || [];
        return Array.isArray(properties) ? properties : [];
      } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!ownerId, // Only run if ownerId is available
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