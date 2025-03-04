import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

// Mock data
const mockReturns = [
  {
    id: 1,
    order_id: 'RET-20240303-001',
    product_id: 'SW-200',
    product_name: 'Smart Watch',
    return_reason: 'Functionality not as expected',
    status: 'processing',
    created_at: '2024-03-03T10:30:00Z',
    original_price: 1299,
    ai_recommendation: 'Resell',
    ai_confidence: 0.92,
    resale_price: 1039
  },
  {
    id: 2,
    order_id: 'RET-20240303-002',
    product_id: 'AE-100',
    product_name: 'Bluetooth Earphones',
    return_reason: 'Pairing issues',
    status: 'pending',
    created_at: '2024-03-03T11:45:00Z',
    original_price: 499,
    ai_recommendation: 'Repair and sell',
    ai_confidence: 0.87,
    resale_price: 349
  },
  {
    id: 3,
    order_id: 'RET-20240303-003',
    product_id: 'KB-750',
    product_name: 'Mechanical Keyboard',
    return_reason: 'Keys not responsive',
    status: 'completed',
    created_at: '2024-03-03T09:15:00Z',
    original_price: 899,
    ai_recommendation: 'Return to manufacturer',
    ai_confidence: 0.95,
    resale_price: 0
  }
];

const ReturnsList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productCategory, setProductCategory] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  
  const navigate = useNavigate();

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
    // Implement search logic
    console.log('Search conditions:', { productCategory, returnReason, status, dateRange });
  };
  
  const handleBatchProcess = () => {
    // Implement batch processing logic
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
    switch (recommendation) {
      case 'Resell':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
        };
      case 'Repair and sell':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
        };
      case 'Return to manufacturer':
        return {
          bg: '#FFF3E0',
          color: '#FF9800',
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
        };
    }
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Total Return Orders
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                1,082
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                5.2%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Return Amount
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                ¥245,320
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#F44336',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                7.8%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Value Recovery Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                87.3%
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                2.1%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Average Processing Time
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                1.8 days
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowDownwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                12%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Returns */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          mb: 3
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, mb: 2 }}>
            Recent Returns
          </Typography>
          
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="product-category-label">Product Category</InputLabel>
                <Select
                  labelId="product-category-label"
                  value={productCategory}
                  label="Product Category"
                  onChange={handleProductCategoryChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing & Accessories</MenuItem>
                  <MenuItem value="home">Home Goods</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="return-reason-label">Return Reason</InputLabel>
                <Select
                  labelId="return-reason-label"
                  value={returnReason}
                  label="Return Reason"
                  onChange={handleReturnReasonChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="quality">Quality Issues</MenuItem>
                  <MenuItem value="function">Functionality Issues</MenuItem>
                  <MenuItem value="damage">Shipping Damage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={handleStatusChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-label">Date Range</InputLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  label="Date Range"
                  onChange={handleDateRangeChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={1}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleSearch}
                sx={{ 
                  height: '100%',
                  backgroundColor: '#1a73e8',
                  fontSize: '0.875rem'
                }}
              >
                Search
              </Button>
            </Grid>
            
            <Grid item xs={6} md={1}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleBatchProcess}
                sx={{ 
                  height: '100%',
                  borderColor: '#1a73e8',
                  color: '#1a73e8',
                  fontSize: '0.875rem'
                }}
              >
                Batch Process
              </Button>
            </Grid>
          </Grid>
          
          {/* Table */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Order Info</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Return Reason</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>AI Recommendation</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockReturns.map((row) => (
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
                      <Chip 
                        label={row.return_reason} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem', 
                          bgcolor: row.return_reason === 'Functionality not as expected' ? '#FFEBEE' : 
                                  row.return_reason === 'Pairing issues' ? '#FFF8E1' : '#E0F2F1',
                          color: row.return_reason === 'Functionality not as expected' ? '#E53935' : 
                                row.return_reason === 'Pairing issues' ? '#FF8F00' : '#00897B',
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Chip 
                        label={`${row.ai_recommendation} (${Math.round(row.ai_confidence * 100)}%)`} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem', 
                          bgcolor: getAIRecommendationStyle(row.ai_recommendation).bg,
                          color: getAIRecommendationStyle(row.ai_recommendation).color,
                        }} 
                      />
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
                        ¥{row.original_price}
                      </Typography>
                      {row.resale_price > 0 && (
                        <Typography variant="body2" color="success.main" sx={{ fontSize: '0.75rem' }}>
                          Est. Recovery: ¥{row.resale_price}
                        </Typography>
                      )}
                      {row.resale_price === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Est. Recovery: ¥0
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row.id);
                        }}
                        sx={{ 
                          fontSize: '0.75rem',
                          borderColor: '#1a73e8',
                          color: '#1a73e8',
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Showing 1-4 / 127 return orders
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5, 
                  mr: 1,
                  borderColor: '#e0e0e0',
                  color: '#5f6368'
                }}
              >
                1
              </Button>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5, 
                  mr: 1,
                  color: '#5f6368'
                }}
              >
                2
              </Button>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5, 
                  mr: 1,
                  color: '#5f6368'
                }}
              >
                3
              </Button>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5,
                  color: '#5f6368'
                }}
              >
                →
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReturnsList; 