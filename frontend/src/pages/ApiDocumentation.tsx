import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `api-tab-${index}`,
    'aria-controls': `api-tabpanel-${index}`,
  };
}

const ApiDocumentation: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Documentation
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This documentation provides information about the Gemiturn API endpoints, request parameters, and response formats.
      </Typography>

      <Paper sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="API documentation tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: '#f8f9fa',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 48,
            }
          }}
        >
          <Tab label="Authentication" {...a11yProps(0)} />
          <Tab label="Returns" {...a11yProps(1)} />
          <Tab label="Analytics" {...a11yProps(2)} />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>
            Authentication API
          </Typography>
          <Typography variant="body2" paragraph>
            The Authentication API allows users to authenticate and manage their sessions.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Login
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label="POST" color="primary" size="small" sx={{ mr: 1, fontWeight: 500 }} />
              <Typography variant="body2" component="span" color="text.secondary">
                /api/auth/login
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Authenticates a user and returns a JWT token.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Request Body
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>username</TableCell>
                    <TableCell>string</TableCell>
                    <TableCell>User's username</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>password</TableCell>
                    <TableCell>string</TableCell>
                    <TableCell>User's password</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" gutterBottom>
              Response
            </Typography>
            <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, mb: 3 }}>
              <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}`}
              </pre>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Logout
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label="POST" color="primary" size="small" sx={{ mr: 1, fontWeight: 500 }} />
              <Typography variant="body2" component="span" color="text.secondary">
                /api/auth/logout
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Invalidates the current user's token.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Headers
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Authorization</TableCell>
                    <TableCell>Bearer {'{token}'}</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" gutterBottom>
              Response
            </Typography>
            <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
{`{
  "message": "Successfully logged out"
}`}
              </pre>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>
            Returns API
          </Typography>
          <Typography variant="body2" paragraph>
            The Returns API allows you to manage product returns, including creating, updating, and retrieving return information.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              List Returns
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label="GET" color="success" size="small" sx={{ mr: 1, fontWeight: 500 }} />
              <Typography variant="body2" component="span" color="text.secondary">
                /api/returns
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Retrieves a list of returns with pagination and filtering options.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Query Parameters
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>page</TableCell>
                    <TableCell>integer</TableCell>
                    <TableCell>Page number (default: 1)</TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>limit</TableCell>
                    <TableCell>integer</TableCell>
                    <TableCell>Items per page (default: 10)</TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>status</TableCell>
                    <TableCell>string</TableCell>
                    <TableCell>Filter by status (pending, processing, completed, problem)</TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            Analytics API
          </Typography>
          <Typography variant="body2" paragraph>
            The Analytics API provides access to aggregated data and insights about returns.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Get Summary Statistics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label="GET" color="success" size="small" sx={{ mr: 1, fontWeight: 500 }} />
              <Typography variant="body2" component="span" color="text.secondary">
                /api/analytics/summary
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Retrieves summary statistics for returns, including total count, amount, recovery rate, and average processing time.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Headers
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Authorization</TableCell>
                    <TableCell>Bearer {'{token}'}</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" gutterBottom>
              Response
            </Typography>
            <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
{`{
  "total_returns": 1082,
  "return_amount": 125750.42,
  "recovery_rate": 0.78,
  "avg_processing_time": 3.5
}`}
              </pre>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Need more help?
        </Typography>
        <Typography variant="body2">
          For additional support or to report issues with the API, please contact our developer support team at{' '}
          <Link href="mailto:api-support@gemiturn.com" color="primary">
            api-support@gemiturn.com
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ApiDocumentation; 