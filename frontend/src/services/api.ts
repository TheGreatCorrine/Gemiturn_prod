import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Log token info in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Request to ${config.url}:`);
        console.log(`- Authorization: Bearer ${token.substring(0, 10)}...`);
        
        try {
          // Validate token format
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.error('WARNING: Token does not have required 3 parts!');
          } else {
            const payload = JSON.parse(atob(parts[1]));
            console.log('- Token payload:', payload);
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    // 添加成功请求日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
        console.error('Request details:', {
          method: error.config.method,
          url: error.config.url,
          baseURL: error.config.baseURL,
          params: error.config.params,
          data: error.config.data,
          headers: error.config.headers
        });
        
        // 特别处理422错误
        if (error.response.status === 422) {
          console.error('422 Validation Error Details:');
          console.error('- Request Params:', error.config.params);
          console.error('- Request Data:', error.config.data);
          console.error('- Response Data:', error.response.data);
          
          // 尝试解析详细的错误信息
          try {
            if (typeof error.response.data === 'object') {
              Object.entries(error.response.data).forEach(([key, value]) => {
                console.error(`- Field ${key}:`, value);
              });
            }
          } catch (e) {
            console.error('Error parsing validation details:', e);
          }
        }
        
        // Handle token issues
        if (error.response.status === 401 || 
            (error.response.status === 422 && 
             error.response.data.message && 
             error.response.data.message.includes('token'))) {
          console.error('JWT token issue detected, try clearing localStorage and logging in again');
        }
      }
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (username: string, password: string) => 
    apiClient.post('/auth/login/', { username, password }),
  
  register: (userData: any) => 
    apiClient.post('/auth/register/', userData),
  
  getMe: () => 
    apiClient.get('/auth/me/'),
};

// 退货管理API
export const returnsAPI = {
  getReturns: (params?: any) => {
    console.log('Calling getReturns API with params:', params);
    console.log('Current baseURL:', API_URL);
    console.log('Full URL:', `${API_URL}/returns/`);
    
    // 确保URL末尾有斜杠
    return apiClient.get('/returns/', { 
      params,
      // 添加超时设置
      timeout: 10000,
      // 禁用重定向
      maxRedirects: 0
    });
  },
  
  getReturnById: (id: number) => 
    apiClient.get(`/returns/${id}/`),
  
  createReturn: (returnData: any) => 
    apiClient.post('/returns/', returnData),
  
  updateReturn: (id: number, returnData: any) => 
    apiClient.patch(`/returns/${id}/`, returnData),
  
  deleteReturn: (id: number) => 
    apiClient.delete(`/returns/${id}/`),
  
  analyzeReturn: (id: number) => 
    apiClient.post(`/returns/${id}/analyze/`),
  
  uploadImage: (id: number, formData: FormData) => 
    apiClient.post(`/returns/${id}/images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// 分析相关API
export const analyticsAPI = {
  getSummary: () => {
    console.log('Fetching dashboard summary');
    return apiClient.get('/analytics/dashboard-summary');
  },
};

// 导入相关API
export const importsAPI = {
  importReturns: (params: any) => 
    apiClient.post('/imports/returns', params),
};

// 测试API
export const testAPI = {
  createTestReturn: () => 
    apiClient.post('/test/create-return'),
};

export default {
  auth: authAPI,
  returns: returnsAPI,
  analytics: analyticsAPI,
  imports: importsAPI,
  test: testAPI,
}; 