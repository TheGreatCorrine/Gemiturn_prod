import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Link,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';

const Help: React.FC = () => {
  // FAQ items for the Gemiturn system
  const faqItems = [
    {
      question: "How do I process a return?",
      answer: "To process a return, navigate to the Returns page, select the return item, and change its status to 'Processing'. Once you have completed the necessary actions, update the status to 'Completed' or 'Rejected' as appropriate."
    },
    {
      question: "What do the different return statuses mean?",
      answer: "The system uses four main statuses: 'Pending' (newly received returns), 'Processing' (returns currently being handled), 'Completed' (successfully processed returns), and 'Rejected' (returns that were declined)."
    },
    {
      question: "How can I filter returns by status?",
      answer: "You can filter returns by status in two ways: either click on the status links in the sidebar (Pending, Processing, Completed, Rejected) or use the status dropdown filter on the Returns page."
    },
    {
      question: "How does the AI analysis work?",
      answer: "The AI system analyzes return images and descriptions to categorize returns, detect potential issues, and recommend actions. You can view the AI analysis results in the return details page."
    },
    {
      question: "Can I export return data?",
      answer: "Yes, you can export return data from the Analytics page. Look for the export buttons at the top of each data view to download reports in CSV format."
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
        Help Center
      </Typography>
      
      {/* Welcome section with support contact */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2, 
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Welcome to the Gemiturn Help Center
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This guide provides answers to frequently asked questions and helps you get the most out of the Gemiturn return management system.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<EmailIcon />} 
          sx={{ mt: 1 }}
          href="mailto:support@gemiturn.com"
        >
          Contact Support
        </Button>
      </Paper>
      
      {/* FAQ section */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Frequently Asked Questions
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        {faqItems.map((item, index) => (
          <Accordion 
            key={index} 
            sx={{
              mb: 1,
              boxShadow: 'none',
              '&:before': { display: 'none' },
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '4px !important',
              overflow: 'hidden'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.01)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.03)' } 
              }}
            >
              <Typography variant="subtitle1" fontWeight={500}>
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2, pb: 2 }}>
              <Typography variant="body1">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Additional resources section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Additional Resources
        </Typography>
        <Typography variant="body1" paragraph>
          For more detailed information, please refer to these resources:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
          <Link href="/api-docs" underline="hover">API Documentation</Link>
          <Link href="#" underline="hover">User Guide (PDF)</Link>
          <Link href="#" underline="hover">Video Tutorials</Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Help;
export {}; 