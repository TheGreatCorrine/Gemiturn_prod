import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { returnsAPI, analyticsAPI, testAPI } from '../services/api';
import axios from 'axios';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

interface ReturnItem {
  id: number;
  order_id: string;
  customer_email: string;
  product_name: string;
  status: string;
  return_reason: string;
  created_at: string;
  ai_analysis?: {
    category?: string;
    recommendation?: string;
    confidence?: number;
  };
  [key: string]: any;
}

const ReturnsList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productCategory, setProductCategory] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_count: 0,
    pending_count: 0,
    processing_count: 0,
    completed_count: 0,
    avg_processing_time: 0
  });
  
  const navigate = useNavigate();
  const { status: urlStatus } = useParams<{ status?: string }>();

  useEffect(() => {
    // 检查是否有token
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage:', token.substring(0, 20) + '...');
      fetchReturns();
      fetchStats();
    } else {
      console.warn('No token found in localStorage!');
      // 重定向到登录页面
      window.location.href = '/login';
    }
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    setError('');
    
    // Add debug information
    console.log('Fetching returns with params:', {
      page: page + 1,
      limit: rowsPerPage,
      product_category: productCategory,
      return_reason: returnReason,
      status: status,
      date_range: dateRange
    });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login first.');
        setLoading(false);
        return;
      }
      
      // 构建API请求参数，包括状态过滤
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
      
      // 如果有状态参数，添加到请求中
      if (status) {
        params.status = status;
      }
      
      // 如果有搜索查询，添加到请求中
      if (productCategory || returnReason || dateRange) {
        params.search = (productCategory || '') + ' ' + (returnReason || '') + ' ' + (dateRange || '');
      }
      
      const url = `${API_URL}/returns/`;
      console.log('Fetch URL:', url);
      
      // 发送请求 - 不带任何查询参数
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', response.headers);
      
      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: response.statusText };
        }
        
        console.error('Fetch error details:', errorData);
        throw new Error(`API错误 (${response.status}): ${errorData.message || errorData.msg || response.statusText}`);
      }
      
      // 解析响应数据
      const data = await response.json();
      console.log('Fetched return list data:', data);
      console.log('Data sample:', data.length > 0 ? {
        firstItem: data[0],
        aiAnalysis: data[0].ai_analysis,
        recommendation: data[0].ai_analysis?.recommendation,
        confidence: data[0].ai_analysis?.confidence,
        category: data[0].ai_analysis?.category
      } : 'No data');
      
      // 处理数据
      if (Array.isArray(data)) {
        setReturns(data);
        setStats({
          total_count: data.length,
          pending_count: data.filter(r => r.status === 'pending').length,
          processing_count: data.filter(r => r.status === 'processing').length,
          completed_count: data.filter(r => r.status === 'completed').length,
          avg_processing_time: 0
        });
      } else {
        console.error('Unexpected response format:', data);
        setReturns([]);
        setStats({
          total_count: 0,
          pending_count: 0,
          processing_count: 0,
          completed_count: 0,
          avg_processing_time: 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching returns:', err);
      setReturns([]);
      setStats({
        total_count: 0,
        pending_count: 0,
        processing_count: 0,
        completed_count: 0,
        avg_processing_time: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for stats fetch');
        return;
      }
      
      console.log('Fetching dashboard summary');
      const response = await fetch(`${API_URL}/analytics/dashboard-summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Stats API response status:', response.status);
      console.log('Stats API response headers:', response.headers);
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => null) || { message: response.statusText };
        console.error('Stats API fetch error:', errorData);
        throw new Error(`统计API错误 (${response.status}): ${errorData.message || response.statusText}`);
      }
      
      // 解析响应数据
      const data = await response.json();
      console.log('Stats API response data:', data);
      
      if (data) {
        setStats(data);
      } else {
        console.error('Unexpected stats API response format:', data);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleProductCategoryChange = (event: SelectChangeEvent) => {
    setProductCategory(event.target.value);
  };
  
  const handleReturnReasonChange = (event: SelectChangeEvent) => {
    setReturnReason(event.target.value);
  };
  
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };
  
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    setDateRange(event.target.value);
  };
  
  const handleSearch = () => {
    console.log('Search conditions:', { productCategory, returnReason, status, dateRange });
  };
  
  const handleBatchProcess = () => {
    console.log('Batch processing');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF7E0',
          color: '#F29D12',
          text: 'Pending'
        };
      case 'processing':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
          text: 'Processing'
        };
      case 'completed':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
          text: 'Completed'
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
          text: 'Unknown'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  const handleRowClick = (id: number) => {
    navigate(`/returns/${id}`);
  };
  
  const getAIRecommendationStyle = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case '直接转售':
      case 'resell':
      case '直接再次销售':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
        };
      case '维修后销售':
      case 'repair and sell':
      case '维修后再销售':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
        };
      case '退回供应商':
      case 'return to manufacturer':
      case '退回制造商':
        return {
          bg: '#FFF3E0',
          color: '#FF9800',
        };
      case '人工审核':
      case 'manual review':
        return {
          bg: '#FFEBEE',
          color: '#F44336',
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
        };
    }
  };

  const handleDebugXHR = () => {
    setLoading(true);
    setError('');
    
    console.log('使用XMLHttpRequest发送请求...');
    
    // 获取token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token不存在');
      setLoading(false);
      return;
    }
    
    // 使用原生XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/returns/`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    // 设置超时
    xhr.timeout = 10000;
    
    // 添加事件监听器
    xhr.onload = function() {
      console.log('XHR Response Status:', xhr.status);
      console.log('XHR Response Headers:', xhr.getAllResponseHeaders());
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('XHR Response Data:', data);
          
          if (Array.isArray(data)) {
            setReturns(data);
            setLoading(false);
          } else {
            setError('返回数据格式不正确');
            setLoading(false);
          }
        } catch (e) {
          console.error('解析XHR响应失败:', e);
          setError('解析响应数据失败');
          setLoading(false);
        }
      } else {
        console.error('XHR Error Response:', xhr.responseText);
        setError(`XHR请求失败: ${xhr.status} ${xhr.statusText}`);
        setLoading(false);
      }
    };
    
    xhr.onerror = function() {
      console.error('XHR网络错误');
      setError('网络请求失败');
      setLoading(false);
    };
    
    xhr.ontimeout = function() {
      console.error('XHR请求超时');
      setError('请求超时');
      setLoading(false);
    };
    
    // 发送请求
    xhr.send();
    console.log('XHR请求已发送');
  };

  const handleDebugAltPath = () => {
    setLoading(true);
    setError('');
    
    console.log('尝试备用API路径...');
    
    // 获取token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token不存在');
      setLoading(false);
      return;
    }
    
    // 尝试几个不同的API路径格式
    // 有些API使用复数形式returns，有些用单数return
    // 有些API在末尾不使用斜杠，有些则需要斜杠
    // 有些API使用不同的版本路径，如/api/v1/returns
    
    // 定义返回类型
    interface PathTestResult {
      success: boolean;
      path: string;
      data?: any[];
      status?: number;
      error?: string;
    }
    
    // 创建一个测试函数，将依次尝试不同的路径
    const testPath = (path: string): Promise<PathTestResult> => {
      console.log(`尝试路径: ${path}`);
      
      return fetch(path, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then(response => {
        console.log(`路径 ${path} 响应状态:`, response.status);
        
        if (response.ok) {
          return response.json().then(data => {
            console.log(`路径 ${path} 响应数据:`, data);
            return { success: true, path, data } as PathTestResult;
          });
        }
        
        return { success: false, path, status: response.status } as PathTestResult;
      })
      .catch(err => {
        console.error(`路径 ${path} 错误:`, err);
        return { success: false, path, error: err.message } as PathTestResult;
      });
    };
    
    // 待测试的路径列表
    const pathsToTest = [
      `${API_URL}/returns`,          // 不带斜杠
      `${API_URL}/returns/`,         // 带斜杠
      `${API_URL}/return`,           // 单数形式
      `${API_URL}/return/`,          // 单数形式+斜杠
      `${API_URL}/returns`,          // 重复测试
      `${API_URL}/returns/`          // 重复测试
    ];
    
    // 依次测试所有路径
    Promise.all(pathsToTest.map(testPath))
      .then((results: PathTestResult[]) => {
        console.log('所有路径测试结果:', results);
        
        // 查找成功的路径
        const successResult = results.find(r => r.success);
        
        if (successResult && successResult.data) {
          console.log(`找到工作的路径: ${successResult.path}`);
          setReturns(successResult.data);
          setError('');
        } else {
          setError('所有API路径都失败');
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('路径测试失败:', err);
        setError(`路径测试失败: ${err.message}`);
        setLoading(false);
      });
  };

  const handleDeepDebug = () => {
    setLoading(true);
    setError('');
    
    console.log('执行深度调试...');
    
    // 获取token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token不存在');
      setLoading(false);
      return;
    }
    
    // 定义不同的请求头组合进行测试
    type HeaderSet = Record<string, string>;
    
    const headerSets: HeaderSet[] = [
      // 标准头
      {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // 仅认证头
      {
        'Authorization': `Bearer ${token}`
      },
      // 不同格式的认证头
      {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      },
      // 带Accept但内容类型不同
      {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      // 仅接受文本
      {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/plain'
      }
    ];
    
    // 定义调试结果类型
    interface DebugResult {
      headers: HeaderSet;
      status: number;
      statusText: string;
      responseType: string;
      response: any;
      error?: string;
    }
    
    // 对每组头进行测试
    const testHeaders = async (headers: HeaderSet): Promise<DebugResult> => {
      console.log('测试请求头:', headers);
      
      try {
        const response = await fetch(`${API_URL}/returns/`, {
          method: 'GET',
          headers
        });
        
        console.log(`请求头 ${JSON.stringify(headers)} 响应状态:`, response.status);
        
        let responseData;
        let responseType = '';
        
        try {
          // 尝试作为JSON解析
          responseData = await response.json();
          responseType = 'json';
        } catch (e) {
          // 如果解析为JSON失败，尝试获取文本
          try {
            responseData = await response.text();
            responseType = 'text';
          } catch (e2) {
            responseData = 'Unable to read response';
            responseType = 'unknown';
          }
        }
        
        return {
          headers,
          status: response.status,
          statusText: response.statusText,
          responseType,
          response: responseData
        };
      } catch (err: any) {
        return {
          headers,
          status: 0,
          statusText: 'Request Failed',
          responseType: 'error',
          response: null,
          error: err.message
        };
      }
    };
    
    // 测试所有请求头组合
    Promise.all(headerSets.map(testHeaders))
      .then(results => {
        console.log('所有请求头测试结果:', results);
        
        // 查找成功的测试（状态码2xx）
        const successResult = results.find(r => r.status >= 200 && r.status < 300);
        
        if (successResult) {
          console.log('找到有效的请求头配置:', successResult);
          
          if (successResult.responseType === 'json' && Array.isArray(successResult.response)) {
            setReturns(successResult.response);
            setError('');
          } else {
            setError(`请求成功但响应格式不是数组: ${typeof successResult.response}`);
          }
        } else {
          // 显示所有错误状态码
          const errorSummary = results
            .map(r => `${r.status} (${r.statusText})`)
            .join(', ');
          
          setError(`所有请求头组合测试失败: ${errorSummary}`);
          
          // 尝试检查最常见的错误，查看具体原因
          const error422 = results.find(r => r.status === 422);
          if (error422) {
            console.error('422错误详情:', error422);
            if (typeof error422.response === 'object' && error422.response) {
              // 检查是否有错误消息
              const errorMessages = Object.entries(error422.response)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              
              if (errorMessages) {
                setError(`验证错误: ${errorMessages}`);
              }
            }
          }
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('深度调试失败:', err);
        setError(`深度调试失败: ${err.message}`);
        setLoading(false);
      });
      
    // 额外测试: 尝试不带认证的简单请求，检查是否是认证问题
    fetch(`${API_URL}/health`)
      .then(response => {
        console.log('健康检查端点状态:', response.status);
        return response.text();
      })
      .then(data => {
        console.log('健康检查响应:', data);
      })
      .catch(err => {
        console.error('健康检查失败:', err);
      });
  };

  // 添加重新登录函数
  const handleReLogin = async () => {
    setLoading(true);
    setError('');
    
    console.log('尝试重新登录获取新令牌...');
    
    try {
      // 登录凭据
      const credentials = {
        username: 'admin',
        password: 'admin123'
      };
      
      // 发送登录请求
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('登录响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`登录失败 (${response.status}): ${response.statusText}`);
      }
      
      // 解析响应
      const data = await response.json();
      console.log('登录响应:', data);
      
      if (data.access_token) {
        // 保存新令牌到本地存储
        localStorage.setItem('token', data.access_token);
        console.log('已保存新令牌');
        
        // 解析令牌信息
        try {
          const tokenParts = data.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('新令牌负载:', payload);
            console.log('新令牌过期时间:', new Date(payload.exp * 1000).toLocaleString());
          }
        } catch (e) {
          console.error('解析令牌失败:', e);
        }
        
        // 使用新令牌重新获取数据
        fetchReturns();
      } else {
        setError('登录响应中没有令牌');
      }
    } catch (err: any) {
      console.error('登录失败:', err);
      setError(`登录失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载退货数据
  const loadReturns = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // 构建API请求参数，包括状态过滤
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
      
      // 如果有状态参数，添加到请求中
      if (status) {
        params.status = status;
      }
      
      // 如果有搜索查询，添加到请求中
      if (productCategory || returnReason || dateRange) {
        params.search = (productCategory || '') + ' ' + (returnReason || '') + ' ' + (dateRange || '');
      }
      
      const response = await returnsAPI.getReturns(params);
      setReturns(response.data.items);
      
      // 添加类型声明以修复错误
      interface ReturnItem {
        status: string;
        [key: string]: any;
      }
      
      setStats({
        total_count: response.data.total_count,
        pending_count: response.data.items.filter((r: ReturnItem) => r.status === 'pending').length,
        processing_count: response.data.items.filter((r: ReturnItem) => r.status === 'processing').length,
        completed_count: response.data.items.filter((r: ReturnItem) => r.status === 'completed').length,
        avg_processing_time: 0
      });
    } catch (err) {
      console.error('Error loading returns:', err);
      setError('Failed to load returns. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, productCategory, returnReason, dateRange, status]);
  
  // 使用useEffect在参数变化时重新加载数据
  useEffect(() => {
    loadReturns();
  }, [loadReturns]);
  
  // 修改页面标题以反映当前过滤状态
  const getPageTitle = () => {
    switch (status) {
      case 'pending':
        return 'Pending Returns';
      case 'processing':
        return 'Processing Returns';
      case 'completed':
        return 'Completed Returns';
      case 'rejected':
        return 'Rejected Returns';
      default:
        return 'All Returns';
    }
  };

  // 添加创建测试退货的处理函数
  const handleCreateTestReturn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await testAPI.createTestReturn();
      
      if (response.data && response.data.success) {
        // 显示成功消息
        alert(`Test return created successfully! ID: ${response.data.id}`);
        // 刷新数据
        loadReturns();
      } else {
        setError('Failed to create test return');
      }
    } catch (err: any) {
      console.error('Error creating test return:', err);
      setError(`Failed to create test return: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* 移除页面标题，保留调试工具面板 */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 80, 
          right: 20, 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 1,
          borderRadius: 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Debug Tools</Typography>
        <Button 
          variant="outlined" 
          color="warning" 
          onClick={handleDebugXHR} 
          size="small"
        >
          Debug API (XHR)
        </Button>
        
        <Button 
          variant="outlined" 
          color="info" 
          onClick={handleDebugAltPath} 
          size="small"
        >
          Test Alt Path
        </Button>
        
        <Button 
          variant="outlined" 
          color="success" 
          onClick={handleDeepDebug} 
          size="small"
        >
          Deep Debug
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={handleCreateTestReturn} 
          size="small"
        >
          Create Test Return
        </Button>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReLogin} 
          size="small"
        >
          Re-login for Token
        </Button>
      </Box>
      
      {/* 继续显示筛选器 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="product-category-label">Product Category</InputLabel>
            <Select
              labelId="product-category-label"
              value={productCategory}
              label="Product Category"
              onChange={(e) => setProductCategory(e.target.value)}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="electronics">Electronics</MenuItem>
              <MenuItem value="clothing">Clothing & Accessories</MenuItem>
              <MenuItem value="home">Home Goods</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="return-reason-label">Return Reason</InputLabel>
            <Select
              labelId="return-reason-label"
              value={returnReason}
              label="Return Reason"
              onChange={(e) => setReturnReason(e.target.value)}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="defective">Defective Item</MenuItem>
              <MenuItem value="not_as_described">Not As Described</MenuItem>
              <MenuItem value="wrong_item">Wrong Item Received</MenuItem>
              <MenuItem value="no_longer_needed">No Longer Needed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Search"
            size="small"
            placeholder="Order ID, Customer Email..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
        </Box>
      </Paper>
      
      {/* 退货数据表格 */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Order Info</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Return Reason</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>AI Recommendation</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {returns.length > 0 ? (
                returns.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => handleRowClick(row.id)}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 1.5
                          }}
                        >
                          Img
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                            {row.product_name} {row.product_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {row.order_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      {row.return_reason}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip 
                          label={row.ai_analysis?.recommendation || '未分析'}
                          size="small"
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: row.ai_analysis?.recommendation ? getAIRecommendationStyle(row.ai_analysis.recommendation).bg : '#f5f5f5',
                            color: row.ai_analysis?.recommendation ? getAIRecommendationStyle(row.ai_analysis.recommendation).color : '#757575',
                          }}
                        />
                        {row.ai_analysis?.confidence !== undefined && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            Confidence: {(row.ai_analysis.confidence * 100).toFixed(0)}%
                          </Typography>
                        )}
                        {row.ai_analysis?.category && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            Category: {row.ai_analysis.category}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(row.status)}
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          bgcolor: getStatusColor(row.status).bg,
                          color: getStatusColor(row.status).color,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                        ${row.original_price ? row.original_price.toFixed(2) : '0.00'}
                      </Typography>
                      {row.resale_price && row.resale_price > 0 && (
                        <Typography variant="body2" color="success.main" sx={{ fontSize: '0.75rem' }}>
                          Resale: ${row.resale_price.toFixed(2)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="text" 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          color: '#1a73e8',
                          minWidth: 'auto'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    No return items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* 分页控件 */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={stats.total_count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ReturnsList; 