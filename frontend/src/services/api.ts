import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 不发送凭据
  withCredentials: false
});

// 标记是否正在刷新令牌
let isRefreshing = false;
// 等待令牌刷新的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 将请求添加到队列
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// 执行队列中的请求
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

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
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是401错误且不是刷新令牌的请求，尝试刷新令牌
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        originalRequest.url !== '/auth/refresh/' &&
        !isRefreshing) {
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // 获取刷新令牌
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // 如果没有刷新令牌，清除登录状态并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // 使用刷新令牌获取新的访问令牌
        const response = await axios.post(`${API_URL}/auth/refresh/`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        const { access_token } = response.data;
        
        // 保存新的访问令牌
        localStorage.setItem('token', access_token);
        
        // 更新请求头
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // 执行队列中的请求
        onRefreshed(access_token);
        
        // 重新发送原始请求
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // 刷新令牌失败，清除登录状态并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // 如果正在刷新令牌，将请求添加到队列
    if (error.response?.status === 401 && isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }
    
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
      }
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (username: string, password: string) => 
    apiClient.post('/auth/login', { username, password }),
  
  register: (userData: any) => 
    apiClient.post('/auth/register', userData),
  
  getMe: () => 
    apiClient.get('/auth/me'),
    
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }),
};

// 退货管理API
export const returnsAPI = {
  getReturns: (params: any) => {
    // 构建查询字符串
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    
    return apiClient.get(`/returns${queryString ? `?${queryString}` : ''}`);
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
  
  analyzeAllReturns: () => 
    apiClient.post('/returns/analyze-all'),
  
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