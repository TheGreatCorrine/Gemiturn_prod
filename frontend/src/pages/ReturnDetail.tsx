import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';

// Mock data
const mockReturn = {
  id: 1,
  order_id: 'ORD-12345',
  product_id: 'PROD-789',
  product_name: 'Smart Watch',
  product_category: 'Electronics',
  return_reason: 'Product Damage',
  customer_description: 'The watch I received has scratches on the screen, and the buttons are not responsive.',
  image_urls: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  ai_category: 'Physical Damage',
  ai_reason: 'Damage during shipping',
  ai_recommendation: 'Discount Resale',
  ai_confidence: 0.85,
  status: 'pending',
  original_price: 1299.00,
  resale_price: null,
  created_at: '2023-11-15T10:30:00Z',
  updated_at: '2023-11-15T10:30:00Z',
  processed_at: null
};

const ReturnDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState(mockReturn.status);
  const [resalePrice, setResalePrice] = useState<number | null>(mockReturn.resale_price);
  const [notes, setNotes] = useState('');

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleResalePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResalePrice(parseFloat(event.target.value));
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleSave = () => {
    // This would call an API to save changes
    console.log('Saving changes:', { status, resalePrice, notes });
    alert('Changes saved');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not processed';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Return Details #{id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/returns')}>
          Back to List
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Order Number
                </Typography>
                <Typography variant="body1">
                  {mockReturn.order_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Product ID
                </Typography>
                <Typography variant="body1">
                  {mockReturn.product_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Product Name
                </Typography>
                <Typography variant="body1">
                  {mockReturn.product_name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Product Category
                </Typography>
                <Typography variant="body1">
                  {mockReturn.product_category}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Original Price
                </Typography>
                <Typography variant="body1">
                  ¥{mockReturn.original_price.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={getStatusText(mockReturn.status)} 
                  color={getStatusColor(mockReturn.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(mockReturn.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Processed At
                </Typography>
                <Typography variant="body1">
                  {formatDate(mockReturn.processed_at)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Return Reason
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer Provided Reason
            </Typography>
            <Typography variant="body1" paragraph>
              {mockReturn.return_reason}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer Description
            </Typography>
            <Typography variant="body1" paragraph>
              {mockReturn.customer_description}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Images
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {mockReturn.image_urls.map((url, index) => (
                <Box 
                  key={index}
                  component="img"
                  src="https://via.placeholder.com/150"
                  alt={`Return Image ${index + 1}`}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    objectFit: 'cover',
                    border: '1px solid #eee',
                    borderRadius: 1
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* AI Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="AI Analysis" 
              subheader={`Confidence: ${(mockReturn.ai_confidence * 100).toFixed(0)}%`}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {mockReturn.ai_category}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1">
                    {mockReturn.ai_reason}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Recommendation
                  </Typography>
                  <Typography variant="body1">
                    {mockReturn.ai_recommendation}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Process Return
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Resale Price"
                  type="number"
                  value={resalePrice || ''}
                  onChange={handleResalePriceChange}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Processing Notes"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={handleNotesChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReturnDetail; 