import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  Divider
} from '@mui/material';
import { authAPI } from '../services/api';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call the register API
      const response = await authAPI.register({
        username,
        email,
        password
      });
      
      console.log('Registration successful:', response.data);
      setSuccess('Registration successful! You can now login with your credentials.');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.message || 
                      'Registration failed. This username or email may already be taken.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          marginTop: 8, 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          backgroundColor: 'white' 
        }}
      >
        <Typography component="h1" variant="h5">
          Create an Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              py: 1, 
              fontSize: '0.875rem',
              backgroundColor: '#1a73e8',
              '&:hover': {
                backgroundColor: '#0d47a1'
              }
            }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#1a73e8' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup; 