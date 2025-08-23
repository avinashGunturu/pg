import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthCookies, setAuthCookies, clearAuthCookies } from '../utils/cookies';
import apiClient from '../services/apiClient';
import API_CONFIG from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state from cookies on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const { token: cookieToken, ownerId: cookieOwnerId } = getAuthCookies();
        
        if (cookieToken && cookieOwnerId) {
          setToken(cookieToken);
          setOwnerId(cookieOwnerId);
          setIsAuthenticated(true);
          
          // Set user data if available (you might want to fetch user details here)
          setUser({
            id: cookieOwnerId,
            // Add other user properties as needed
          });
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        clearAuthCookies();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (loginData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, loginData);
      const result = response.data;

      if (result.code !== 0) {
        throw new Error(result.message || 'Login failed. Please try again.');
      }

      // Extract token and ownerId from response
      const { token: authToken, ownerId: authOwnerId, user: userData } = result.data;
      
      // Store in cookies
      setAuthCookies(authToken, authOwnerId);
      
      // Update state
      setToken(authToken);
      setOwnerId(authOwnerId);
      setUser(userData);
      setIsAuthenticated(true);
      
      return result;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      const result = response.data;

      if (result.code !== 0) {
        throw new Error(result.message || 'Registration failed. Please try again.');
      }

      // For registration, you might want to handle differently
      // Usually registration doesn't automatically log in the user
      return result;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear cookies
    clearAuthCookies();
    
    // Clear state
    setToken(null);
    setOwnerId(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      const result = response.data;

      if (result.code !== 0) {
        throw new Error(result.message || 'Failed to process request. Please try again.');
      }

      return result;
    } catch (err) {
      setError(err.message || 'Failed to process request. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (resetToken, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
        token: resetToken,
        password,
      });
      const result = response.data;

      if (result.code !== 0) {
        throw new Error(result.message || 'Failed to reset password. Please try again.');
      }

      return result;
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, userData);
      const result = response.data;

      if (result.code !== 0) {
        throw new Error(result.message || 'Failed to update profile. Please try again.');
      }

      setUser(result.data);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const checkAuth = () => {
    return isAuthenticated && token && ownerId;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ownerId,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};