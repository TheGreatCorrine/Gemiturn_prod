import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

// Define return reason categories
const RETURN_CATEGORIES = {
  reasons: [
    { value: 'quality_issues', label: 'quality issues', desc: 'product damaged, function failure, manufacturing defect' },
    { value: 'size_mismatch', label: 'size mismatch', desc: 'too big/small, inaccurate size' },
    { value: 'appearance', label: 'appearance difference', desc: 'color difference, style not matching description' },
    { value: 'performance', label: 'performance not met', desc: 'function not meeting expectations, performance lower than advertised' },
    { value: 'wrong_item', label: 'received wrong item', desc: 'completely different product' },
    { value: 'logistics', label: 'logistics problem', desc: 'damage during transportation, damaged packaging' },
    { value: 'changed_mind', label: 'customer changed mind', desc: 'no longer need, found alternative' },
    { value: 'missing_parts', label: 'missing parts', desc: 'missing component' },
    { value: 'allergic', label: 'allergic/adverse reaction', desc: 'allergic to material, uncomfortable after use' },
    { value: 'late_delivery', label: 'late delivery', desc: 'significantly exceed expected delivery time' }
  ],
  processing: [
    { value: 'direct_resale', label: 'direct resale', desc: 'new, unopened product, can be resold directly' },
    { value: 'discounted', label: 'discounted resale', desc: 'slight flaw but functional, check and resell at reduced price' },
    { value: 'return_supplier', label: 'return to supplier', desc: 'serious quality problem or batch defect, return to manufacturer' },
    { value: 'repair_resale', label: 'repair and resell', desc: 'product with minor issues that can be repaired' },
    { value: 'parts_recycle', label: 'parts recycling', desc: 'product with usable components that cannot be repaired' },
    { value: 'charity', label: 'charity donation', desc: 'functional but not suitable for resale' },
    { value: 'disposal', label: 'environmental processing', desc: 'product unusable and not recyclable' },
    { value: 'cross_platform', label: 'cross platform direct sale', desc: 'good product can be sold directly on our market' },
    { value: 'bundle', label: 'bundle sale', desc: 'combine multiple returned goods into a set for sale' },
    { value: 'display', label: 'convert to sample/display', desc: 'lightly flawed product can be used as a display sample' }
  ]
};

const CreateReturn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    order_id: `ORD-${Date.now()}`, // Use timestamp to generate unique order ID
    product_id: '',
    product_name: '',
    product_category: '',
    return_reason: '',
    customer_description: '',
    original_price: '',
    images: [] as File[]
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create FormData object
      const formDataObj = new FormData();
      formData.images.forEach((image) => {
        formDataObj.append('images', image);
      });
      formDataObj.append('description', formData.customer_description);
      
      // Use API_URL constant instead of hardcoded URL
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      // Send AI analysis request
      console.log('Starting AI analysis request...');
      console.log('Token:', token);
      const analysisResponse = await fetch(`${API_URL}/gemini/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });
      
      console.log('AI analysis response status:', analysisResponse.status);
      let aiAnalysisResult = null;
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        console.log('AI analysis result:', analysisData);
        aiAnalysisResult = {
          category: analysisData.category || 'Uncategorized',
          reason: analysisData.reason || 'Not analyzed',
          recommendation: analysisData.recommendation || 'Manual review',
          confidence: analysisData.confidence || 0.0
        };
        setAiAnalysis(aiAnalysisResult);
      } else {
        const errorText = await analysisResponse.text();
        console.warn('AI analysis failed:', {
          status: analysisResponse.status,
          statusText: analysisResponse.statusText,
          error: errorText
        });
        aiAnalysisResult = {
          category: 'Uncategorized',
          reason: 'Not analyzed',
          recommendation: 'Manual review',
          confidence: 0.0
        };
      }
      
      // Create return order
      console.log('Starting to create return order, AI analysis result:', aiAnalysisResult);
      
      const response = await fetch(`${API_URL}/returns/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          order_id: formData.order_id,
          product_id: formData.product_id,
          product_name: formData.product_name,
          product_category: formData.product_category,
          return_reason: formData.return_reason,
          customer_description: formData.customer_description,
          original_price: parseFloat(formData.original_price),
          ai_analysis: aiAnalysisResult
        })
      });
      
      console.log('Return order response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create return order: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Return order created successfully:', result);
      
      setSuccess(true);
      
      // Redirect to details page after 3 seconds
      setTimeout(() => {
        navigate(`/returns/${result.id}`);
      }, 3000);
      
    } catch (err) {
      console.error('Error creating return order:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating return order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Create Return Order
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/returns')}>
          Back to List
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Return order created successfully! Redirecting to details page...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Order ID"
                    name="order_id"
                    value={formData.order_id}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Product ID"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Product Name"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Product Category"
                    name="product_category"
                    value={formData.product_category}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Original Price"
                    name="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Return Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Return Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Return Reason</InputLabel>
                    <Select
                      name="return_reason"
                      value={formData.return_reason}
                      label="Return Reason"
                      onChange={(e) => handleInputChange(e as any)}
                    >
                      {RETURN_CATEGORIES.reasons.map(reason => (
                        <MenuItem key={reason.value} value={reason.value}>
                          {reason.label} - {reason.desc}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Detailed Description"
                    name="customer_description"
                    value={formData.customer_description}
                    onChange={handleInputChange}
                    placeholder="Please describe the return reason and product issues in detail..."
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Images
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Select Images
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Supports JPG, PNG formats, up to 5 images
                </Typography>

                {formData.images.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    {formData.images.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={URL.createObjectURL(image)}
                        alt={`Uploaded image ${index + 1}`}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #eee'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Analysis Results
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1">
                        {aiAnalysis.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Reason
                      </Typography>
                      <Typography variant="body1">
                        {aiAnalysis.reason}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Recommended Action
                      </Typography>
                      <Typography variant="body1">
                        {aiAnalysis.recommendation}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/returns')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Submitting...' : 'Create Return Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateReturn; 