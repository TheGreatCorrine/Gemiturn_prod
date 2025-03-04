import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define types
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Mock user for demo
const MOCK_USER: User = {
  id: 1,
  username: 'admin',
  email: 'admin@gemiturn.com',
  role: 'admin'
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // For demo: use mock user instead of API call
          if (process.env.NODE_ENV === 'development') {
            setUser(MOCK_USER);
          } else {
            // Set default auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Get user info
            const response = await axios.get(`${API_URL}/auth/me`);
            setUser(response.data);
          }
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      // For demo: use mock authentication instead of API call
      if (process.env.NODE_ENV === 'development' && username === 'admin' && password === 'admin123') {
        // Create mock token
        const mockToken = 'mock-jwt-token-for-development';
        
        // Save token
        localStorage.setItem('token', mockToken);
        setUser(MOCK_USER);
        return;
      }
      
      // Real API call for production
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      const { access_token, user } = response.data;
      
      // Save token and set auth header
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 