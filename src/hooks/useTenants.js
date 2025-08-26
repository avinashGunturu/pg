import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Hook for fetching tenants
export const useTenants = (propertyId = null, params = {}) => {
  const { ownerId } = useAuth();
  
  return useQuery({
    queryKey: ['tenants', ownerId, propertyId, params],
    queryFn: async () => {
      try {
        const filterData = {
          name: '',
          mobile: '',
          email: '',
          tenantId: '',
          ownerId: ownerId || '68a643b5430dd953da794950',
          propertyId: propertyId || '',
          state: '',
          city: '',
          maritalStatus: '',
          ...params
        };
        
        const response = await apiClient.post('/api/tenant/list', filterData);
        
        let tenants = response?.data?.data?.tenants || response?.data?.tenants || [];
        
        if (Array.isArray(tenants)) {
          // Map API response to the format expected by the UI
          const mappedTenants = tenants.map(tenant => ({
            id: tenant._id,
            _id: tenant._id,
            firstName: tenant.personalInfo?.firstName || '',
            lastName: tenant.personalInfo?.lastName || '',
            name: `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim(),
            email: tenant.contactInfo?.email || 'N/A',
            phone: tenant.contactInfo?.mobileNumber || 'N/A',
            propertyId: tenant.propertyId,
            propertyName: tenant.propertyName || 'No Property Assigned',
            roomNumber: tenant.roomDetails?.roomNumber || 'N/A',
            status: tenant.status || 'PENDING',
            rawData: tenant
          }));
          
          return mappedTenants;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching tenants:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!ownerId, // Only run if ownerId is available
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