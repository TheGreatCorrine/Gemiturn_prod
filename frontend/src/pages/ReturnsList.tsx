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
  image_urls?: string[];
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
        throw new Error(`API error (${response.status}): ${errorData.message || errorData.msg || response.statusText}`);
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
        console.error('Incorrect return data format:', data);
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
        throw new Error(`Statistics API error (${response.status}): ${errorData.message || response.statusText}`);
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
      case 'resell':
      case 'direct resale':
      case 'direct resell':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
        };
      case 'repair and sell':
      case 'repair then sell':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
        };
      case 'return to manufacturer':
      case 'return to supplier':
        return {
          bg: '#FFF3E0',
          color: '#FF9800',
        };
      case 'manual review':
      case 'human review':
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
    
    console.log('Using XMLHttpRequest to send request...');
    
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token does not exist');
      setLoading(false);
      return;
    }
    
    // Use native XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/returns/`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    // Set timeout
    xhr.timeout = 10000;
    
    // Add event listener
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
            setError('Incorrect return data format');
            setLoading(false);
          }
        } catch (e) {
          console.error('解析XHR响应失败:', e);
          setError('解析响应数据失败');
          setLoading(false);
        }
      } else {
        console.error('XHR Error Response:', xhr.responseText);
        setError(`XHR request failed: ${xhr.status} ${xhr.statusText}`);
        setLoading(false);
      }
    };
    
    xhr.onerror = function() {
      console.error('XHR request failed');
      setLoading(false);
      setError('Network request failed');
    };
    
    xhr.ontimeout = function() {
      console.error('XHR request timed out');
      setError('Request timed out');
    };
    
    // Send request
    xhr.send();
    console.log('XHR request sent');
  };

  const handleDebugAltPath = () => {
    setLoading(true);
    setError('');
    
    console.log('Trying alternative API paths...');
    
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token does not exist');
      setLoading(false);
      return;
    }
    
    // Try different API path formats
    // Some APIs use plural form returns, some use singular return
    // Some APIs do not use a slash at the end, some require a slash
    // Some APIs use different version paths, such as /api/v1/returns
    
    // Define return type
    interface PathTestResult {
      success: boolean;
      path: string;
      data?: any[];
      status?: number;
      error?: string;
    }
    
    // Create a test function that will try different paths
    const testPath = (path: string): Promise<PathTestResult> => {
      console.log(`Trying path: ${path}`);
      
      return fetch(path, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then(response => {
        console.log(`Path ${path} response status:`, response.status);
        
        if (response.ok) {
          return response.json().then(data => {
            console.log(`Path ${path} response data:`, data);
            return { success: true, path, data } as PathTestResult;
          });
        }
        
        return { success: false, path, status: response.status } as PathTestResult;
      })
      .catch(err => {
        console.error(`Path ${path} error:`, err);
        return { success: false, path, error: err.message } as PathTestResult;
      });
    };
    
    // List of paths to test
    const pathsToTest = [
      `${API_URL}/returns`,          // without slash
      `${API_URL}/returns/`,         // with slash
      `${API_URL}/return`,           // singular form
      `${API_URL}/return/`,          // singular form + slash
      `${API_URL}/returns`,          // repeat test
      `${API_URL}/returns/`          // repeat test
    ];
    
    // Test all paths sequentially
    Promise.all(pathsToTest.map(testPath))
      .then((results: PathTestResult[]) => {
        console.log('All path test results:', results);
        
        // Find successful path
        const successResult = results.find(r => r.success);
        
        if (successResult && successResult.data) {
          console.log(`Found working path: ${successResult.path}`);
          setReturns(successResult.data);
          setError('');
        } else {
          setError('All API paths failed');
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Path test failed:', err);
        setError(`Path test failed: ${err.message}`);
        setLoading(false);
      });
  };

  const handleDeepDebug = () => {
    setLoading(true);
    setError('');
    
    console.log('Executing deep debugging...');
    
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token does not exist');
      setLoading(false);
      return;
    }
    
    // Define different request header combinations for testing
    type HeaderSet = Record<string, string>;
    
    const headerSets: HeaderSet[] = [
      // Standard headers
      {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Only authentication headers
      {
        'Authorization': `Bearer ${token}`
      },
      // Different authentication header formats
      {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      },
      // Accept but different content type
      {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      // Accept only text
      {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/plain'
      }
    ];
    
    // Define debugging result type
    interface DebugResult {
      headers: HeaderSet;
      status: number;
      statusText: string;
      responseType: string;
      response: any;
      error?: string;
    }
    
    // Test each set of headers
    const testHeaders = async (headers: HeaderSet): Promise<DebugResult> => {
      console.log('Testing request headers:', headers);
      
      try {
        const response = await fetch(`${API_URL}/returns/`, {
          method: 'GET',
          headers
        });
        
        console.log(`Request headers ${JSON.stringify(headers)} response status:`, response.status);
        
        let responseData;
        let responseType = '';
        
        try {
          // Try to parse as JSON
          responseData = await response.json();
          responseType = 'json';
        } catch (e) {
          // If parsing as JSON fails, try to get text
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
    
    // Test all request header combinations
    Promise.all(headerSets.map(testHeaders))
      .then(results => {
        console.log('All request header test results:', results);
        
        // Find successful test (status code 2xx)
        const successResult = results.find(r => r.status >= 200 && r.status < 300);
        
        if (successResult) {
          console.log('Found valid request header configuration:', successResult);
          
          if (successResult.responseType === 'json' && Array.isArray(successResult.response)) {
            setReturns(successResult.response);
            setError('');
          } else {
            setError(`Request successful but response format is not an array: ${typeof successResult.response}`);
          }
        } else {
          // Collect error information from all tests
          const errorSummary = results
            .map(r => `${r.status} (${r.statusText})`)
            .join(', ');
          
          setError(`All request header combinations failed: ${errorSummary}`);
          
          // Try to check the most common errors to see specific reasons
          if (results.some(r => r.status === 401)) {
            console.error('401 error details:', results.find(r => r.status === 401));
            if (typeof results.find(r => r.status === 401)?.response === 'object' && results.find(r => r.status === 401)?.response) {
              // Check if there are error messages
              const errorMessages = Object.entries(results.find(r => r.status === 401)?.response)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              
              if (errorMessages) {
                setError(`Authentication error: ${errorMessages}`);
              }
            }
          }
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Deep debugging failed:', err);
        setError(`Deep debugging failed: ${err.message}`);
        setLoading(false);
      });
      
    // Additional test: Try a simple request without authentication to check if it's an authentication issue
    fetch(`${API_URL}/health`)
      .then(response => {
        console.log('Health check endpoint status:', response.status);
        return response.text();
      })
      .then(data => {
        console.log('Health check response:', data);
      })
      .catch(err => {
        console.error('Health check failed:', err);
      });
  };

  // Add re-login function
  const handleReLogin = async () => {
    setLoading(true);
    setError('');
    
    console.log('Attempting to re-login for new token...');
    
    try {
      // Login credentials
      const credentials = {
        username: 'admin',
        password: 'admin123'
      };
      
      // Send login request
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Login failed (${response.status}): ${response.statusText}`);
      }
      
      // Parse response
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.access_token) {
        // Save new token to local storage
        localStorage.setItem('token', data.access_token);
        console.log('New token saved');
        
        // Parse token information
        try {
          const tokenParts = data.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('New token payload:', payload);
            console.log('New token expiration time:', new Date(payload.exp * 1000).toLocaleString());
          }
        } catch (e) {
          console.error('Token parsing failed:', e);
        }
        
        // Use new token to re-fetch data
        fetchReturns();
      } else {
        setError('Login response did not contain a token');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load return data
  const loadReturns = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build API request parameters, including status filtering
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
      
      // If there is a status parameter, add it to the request
      if (status) {
        params.status = status;
      }
      
      // If there is a search query, add it to the request
      if (productCategory || returnReason || dateRange) {
        params.search = (productCategory || '') + ' ' + (returnReason || '') + ' ' + (dateRange || '');
      }
      
      const response = await returnsAPI.getReturns(params);
      setReturns(response.data.items);
      
      // Add type declaration to fix error
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
  
  // Use useEffect to reload data when parameters change
  useEffect(() => {
    loadReturns();
  }, [loadReturns]);
  
  // Modify page title to reflect current filtering state
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

  // Add function to handle creating a test return
  const handleCreateTestReturn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await testAPI.createTestReturn();
      
      if (response.data && response.data.success) {
        // Show success message
        alert(`Test return created successfully! ID: ${response.data.id}`);
        // Refresh data
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
      {/* Temporarily hide debug tools panel
      <Box sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: 1,
        borderRadius: 1,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
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
        */}
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
      
      {/* Return data table */}
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
                            mr: 1.5,
                            overflow: 'hidden'
                          }}
                        >
                          {row.image_urls && row.image_urls.length > 0 ? (
                            <Box
                              component="img"
                              src={row.image_urls[0]}
                              alt="Product"
                              sx={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            'No Img'
                          )}
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
                          label={row.ai_analysis?.recommendation || 'Not Analyzed'}
                          size="small"
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: row.ai_analysis?.recommendation ? getAIRecommendationStyle(row.ai_analysis.recommendation).bg : '#f5f5f5',
                            color: row.ai_analysis?.recommendation ? getAIRecommendationStyle(row.ai_analysis.recommendation).color : '#757575',
                            maxWidth: '100%',
                            height: 'auto',
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              padding: '4px 8px',
                            }
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
                          maxWidth: '100%',
                          height: 'auto',
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            padding: '4px 8px',
                          }
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
        
        {/* Pagination control */}
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