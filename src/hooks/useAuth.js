import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/api';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate any queries that depend on auth state
      queryClient.invalidateQueries();
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
};

// Hook for registration
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Registration successful. Please log in.',
      });
      navigate('/login');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      navigate('/login');
    },
  });
};

// Hook for password reset request
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email) => authService.requestPasswordReset(email),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password reset instructions sent to your email',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to request password reset',
        variant: 'destructive',
      });
    },
  });
};

// Hook for password reset
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (resetData) => authService.resetPassword(resetData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password reset successful. Please log in with your new password.',
      });
      navigate('/login');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset password',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => authService.updateProfile(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
};

// Hook for changing password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData) => authService.changePassword(passwordData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });
};