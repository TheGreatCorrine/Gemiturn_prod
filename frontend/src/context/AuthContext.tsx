import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api';

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
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('Token found in localStorage:', token);
          
          // 尝试解析令牌
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload:', payload);
              console.log('Token subject (sub):', payload.sub);
              console.log('Token type:', typeof payload.sub);
              
              // 检查令牌是否即将过期（如果过期时间小于5分钟）
              const currentTime = Math.floor(Date.now() / 1000);
              if (payload.exp && payload.exp - currentTime < 300) {
                console.log('Token is about to expire, attempting to refresh');
                
                // 尝试刷新令牌
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                  try {
                    const response = await authAPI.refreshToken(refreshToken);
                    const { access_token } = response.data;
                    
                    // 保存新的访问令牌
                    localStorage.setItem('token', access_token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    console.log('Token refreshed successfully');
                  } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    // 刷新失败，清除登录状态
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    delete axios.defaults.headers.common['Authorization'];
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                  }
                }
              }
            } else {
              console.error('Invalid token format - not enough segments');
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
          
          // 设置默认认证头
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Set Authorization header:', axios.defaults.headers.common['Authorization']);
          
          // 在开发环境下使用模拟用户
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: using mock user');
            setUser(MOCK_USER);
            setIsAuthenticated(true);
          } else {
            // 在生产环境下获取用户信息
            try {
              const response = await authAPI.getMe();
              setUser(response.data);
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Failed to get user info:', error);
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              delete axios.defaults.headers.common['Authorization'];
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string, isMockLogin = false, mockData = null) => {
    setIsLoading(true);
    
    try {
      let userData;
      
      if (isMockLogin && mockData) {
        console.log("使用模拟登录数据");
        // 使用提供的模拟数据
        userData = {
          token: mockData.access_token,
          refreshToken: mockData.refresh_token,
          user: {
            id: 1,
            username: mockData.username,
            email: 'admin@example.com',
            role: 'admin'
          }
        };
      } else {
        console.log("调用真实API登录");
        // 正常API登录流程
        const response = await authAPI.login(username, password);
        
        if (!response.data || !response.data.access_token) {
          throw new Error('Invalid login response');
        }
        
        userData = {
          token: response.data.access_token,
          refreshToken: response.data.refresh_token,
          user: {
            id: 1,
            username: response.data.username || username,
            email: response.data.email || `${username}@example.com`,
            role: response.data.role || 'user'
          }
        };
      }
      
      // 保存令牌到本地存储
      localStorage.setItem('token', userData.token);
      localStorage.setItem('refresh_token', userData.refreshToken);
      
      // 更新状态
      setUser(userData.user);
      setIsAuthenticated(true);
      
      console.log("登录成功，认证状态已更新");
      
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };
  
  const value = {
    user,
    isAuthenticated,
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