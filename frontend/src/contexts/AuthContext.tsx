import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, authToken, type User } from '../services/api';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = authToken.get();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token is invalid, remove it
        authToken.remove();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authToken.remove();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 AuthContext: Attempting login for:', email);
      
      // Test if API is reachable
      console.log('🔍 AuthContext: Testing API connection...');
      
      const response = await authApi.login({ email, password });
      console.log('🔍 AuthContext: Raw login response:', response);
      console.log('🔍 AuthContext: Response.success:', response.success);
      console.log('🔍 AuthContext: Response.data:', response.data);
      
      if (response.success && response.data) {
        console.log('✅ AuthContext: Login successful, setting token and user');
        authToken.set(response.data.token);
        setUser(response.data.user);
        console.log('✅ AuthContext: User state updated:', response.data.user.name);
        toast.success('Welcome back!');
        return true;
      } else {
        console.log('❌ AuthContext: Login failed - invalid response:', response);
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: unknown) {
      console.error('❌ AuthContext: Login error:', error);
      
      // More detailed error logging
      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as { response?: { status?: number; data?: any } };
          console.error('❌ Response status:', axiosError.response?.status);
          console.error('❌ Response data:', axiosError.response?.data);
        }
        
        if ('message' in error) {
          console.error('❌ Error message:', (error as Error).message);
        }
      }
      
      toast.error('Login failed - Check console for details');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.register({ name, email, password });
      
      if (response.success && response.data) {
        authToken.set(response.data.token);
        setUser(response.data.user);
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    }
  };

  const logout = () => {
    authToken.remove();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      console.log('AuthContext: Updating profile with data:', data);
      const response = await authApi.updateProfile(data);
      console.log('AuthContext: Update response:', response);
      
      if (response.success && response.data) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
        return true;
      } else {
        console.error('AuthContext: Update failed:', response.message);
        toast.error(response.message || 'Profile update failed');
        return false;
      }
    } catch (error: unknown) {
      console.error('AuthContext: Profile update error:', error);
      toast.error('Profile update failed');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};