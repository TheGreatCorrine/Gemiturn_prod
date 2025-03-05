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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (username: string, password: string) => 
    apiClient.post('/auth/login', { username, password }),
  
  register: (userData: any) => 
    apiClient.post('/auth/register', userData),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
};

// 退货管理API
export const returnsAPI = {
  getReturns: (params?: any) => 
    apiClient.get('/returns', { params }),
  
  getReturnById: (id: number) => 
    apiClient.get(`/returns/${id}`),
  
  createReturn: (returnData: any) => 
    apiClient.post('/returns', returnData),
  
  updateReturn: (id: number, returnData: any) => 
    apiClient.patch(`/returns/${id}`, returnData),
  
  deleteReturn: (id: number) => 
    apiClient.delete(`/returns/${id}`),
  
  analyzeReturn: (id: number) => 
    apiClient.post(`/returns/${id}/analyze`),
  
  uploadImage: (id: number, formData: FormData) => 
    apiClient.post(`/returns/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// 分析API
export const analyticsAPI = {
  // 获取仪表板摘要数据
  getSummary: () => {
    return apiClient.get('/analytics/dashboard-summary');
  },
  // 获取详细统计数据
  getDetailedStats: () => {
    return apiClient.get('/analytics/summary');
  },
  // 获取按类别统计
  getCategoryStats: () => {
    return apiClient.get('/analytics/categories');
  },
  // 获取按原因统计
  getReasonStats: () => {
    return apiClient.get('/analytics/reasons');
  },
  // 获取时间序列数据
  getTimeSeriesData: (days = 30) => {
    return apiClient.get(`/analytics/time-series?days=${days}`);
  }
};

// 导入API
export const importsAPI = {
  importReturns: (params: any) => 
    apiClient.post('/imports/returns', params),
  
  processReturn: (returnId: string) => 
    apiClient.post('/imports/process', { return_id: returnId }),
};

// 测试API - 用于演示
export const testAPI = {
  createTestReturn: () => {
    return apiClient.post('/test/create-return');
  }
};

export default {
  auth: authAPI,
  returns: returnsAPI,
  analytics: analyticsAPI,
  imports: importsAPI,
  test: testAPI,
}; 