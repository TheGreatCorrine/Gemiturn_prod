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
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error details:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // More specific error handling
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.message || 
                      'Authentication failed. Please check your credentials.';
      } else if (err.message && err.message.includes('token')) {
        errorMessage = 'Authentication token error. Please contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary login function (for demo only)
  const handleDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    // Simulate a form submission to trigger the actual login
    setTimeout(() => {
      document.getElementById('login-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
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
          Login to Gemiturn
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" id="login-form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
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
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 2 }}>
              Don't have an account?{' '}
              <Link component={RouterLink} to="/signup" sx={{ color: '#1a73e8' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2, color: '#5f6368', fontSize: '0.75rem' }}>or</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDemoLogin}
            sx={{ 
              py: 1, 
              fontSize: '0.875rem',
              borderColor: '#dadce0',
              color: '#1a73e8',
              '&:hover': {
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.04)'
              }
            }}
          >
            Use Demo Account
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Demo account: admin / admin123
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 