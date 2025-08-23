import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/api';
import { toast } from '@/components/ui/use-toast';

// Hook for fetching employees
export const useEmployees = (params = {}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getEmployees(params),
  });
};

// Hook for fetching a single employee
export const useEmployee = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployeeById(id),
    enabled: !!id, // Only run if id is provided
  });
};

// Hook for creating an employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeData) => employeeService.createEmployee(employeeData),
    onSuccess: () => {
      // Invalidate employees query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create employee',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating an employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => employeeService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific employee query and employees list
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update employee',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting an employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      // Invalidate employees query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete employee',
        variant: 'destructive',
      });
    },
  });
};

// Hook for fetching employee assignments
export const useEmployeeAssignments = (employeeId, params = {}) => {
  return useQuery({
    queryKey: ['employeeAssignments', employeeId, params],
    queryFn: () => employeeService.getEmployeeAssignments(employeeId, params),
    enabled: !!employeeId, // Only run if employeeId is provided
  });
};

// Hook for fetching employee performance
export const useEmployeePerformance = (employeeId, params = {}) => {
  return useQuery({
    queryKey: ['employeePerformance', employeeId, params],
    queryFn: () => employeeService.getEmployeePerformance(employeeId, params),
    enabled: !!employeeId, // Only run if employeeId is provided
  });
};

// Hook for fetching employee statistics
export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employeeStats'],
    queryFn: () => employeeService.getEmployeeStats(),
  });
};