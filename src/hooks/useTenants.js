import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/api';
import { toast } from '@/components/ui/use-toast';

// Hook for fetching tenants
export const useTenants = (params = {}) => {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantService.getTenants(params),
  });
};

// Hook for fetching a single tenant
export const useTenant = (id) => {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantService.getTenantById(id),
    enabled: !!id, // Only run if id is provided
  });
};

// Hook for creating a tenant
export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantData) => tenantService.createTenant(tenantData),
    onSuccess: () => {
      // Invalidate tenants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create tenant',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating a tenant
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => tenantService.updateTenant(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific tenant query and tenants list
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update tenant',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting a tenant
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => tenantService.deleteTenant(id),
    onSuccess: () => {
      // Invalidate tenants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete tenant',
        variant: 'destructive',
      });
    },
  });
};

// Hook for fetching tenant leases
export const useTenantLeases = (tenantId, params = {}) => {
  return useQuery({
    queryKey: ['tenantLeases', tenantId, params],
    queryFn: () => tenantService.getTenantLeases(tenantId, params),
    enabled: !!tenantId, // Only run if tenantId is provided
  });
};

// Hook for fetching tenant payments
export const useTenantPayments = (tenantId, params = {}) => {
  return useQuery({
    queryKey: ['tenantPayments', tenantId, params],
    queryFn: () => tenantService.getTenantPayments(tenantId, params),
    enabled: !!tenantId, // Only run if tenantId is provided
  });
};

// Hook for fetching tenant statistics
export const useTenantStats = () => {
  return useQuery({
    queryKey: ['tenantStats'],
    queryFn: () => tenantService.getTenantStats(),
  });
};