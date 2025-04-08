import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Grid, 
    Paper,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    FormControlLabel,
    Divider,
    Alert,
    CircularProgress,
    useTheme,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
  } from '@mui/material';
  import { 
    Send, 
    Phone, 
    Email, 
    LocationOn,
    AccessTime,
    Chat,
    ContactSupport
  } from '@mui/icons-material';
  import { useState } from 'react';
  import Layout from '../components/Layout';
  
  export default function Contact() {
    const theme = useTheme();
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      topic: 'general',
      message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Form validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // In a real application, you would send the form data to your backend API
        // await api.post('/contact', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          topic: 'general',
          message: ''
        });
      } catch (err) {
        console.error('Failed to submit form:', err);
        setError('Failed to submit your message. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Layout title="Contact Us">
        {/* Hero Section */}
        <Box 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            py: 6,
            borderRadius: { xs: 0, md: 2 },
            mb: 6
          }}
        >
          <Container maxWidth="md">
            <Typography 
              variant="h2" 
              component="h1" 
              align="center"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Get in Touch
            </Typography>
            <Typography 
              variant="h6" 
              align="center"
              sx={{ mb: 2, opacity: 0.9, maxWidth: 700, mx: 'auto' }}
            >
              Have questions about our services or need support with your account?
              Our team is here to help.
            </Typography>
          </Container>
        </Box>
  
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            {/* Contact Form */}
            <Grid item xs={12} md={7}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {success ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        color: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <Send sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Message Sent!
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Thank you for contacting us. We've received your message and will respond within 1-2 business days.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setSuccess(false)}
                      sx={{ mt: 2 }}
                    >
                      Send Another Message
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                      Send Us a Message
                    </Typography>
                    
                    {error && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                      </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            id="email"
                            name="email"
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="phone"
                            name="phone"
                            label="Phone Number (Optional)"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Topic</FormLabel>
                            <RadioGroup
                              row
                              name="topic"
                              value={formData.topic}
                              onChange={handleChange}
                            >
                              <FormControlLabel value="general" control={<Radio />} label="General Inquiry" />
                              <FormControlLabel value="technical" control={<Radio />} label="Technical Support" />
                              <FormControlLabel value="billing" control={<Radio />} label="Billing" />
                              <FormControlLabel value="feedback" control={<Radio />} label="Feedback" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            required
                            fullWidth
                            id="message"
                            name="message"
                            label="Message"
                            multiline
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                            disabled={loading}
                            sx={{ 
                              py: 1.5, 
                              px: 4,
                              fontWeight: 600,
                              borderRadius: 28
                            }}
                          >
                            {loading ? 'Sending...' : 'Send Message'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12} md={5}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    mb: 4,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    flex: 1
                  }}
                >
                  <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem disableGutters sx={{ pb: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary="(800) 123-4567"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem disableGutters sx={{ pb: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary="support@telehealthplatform.com"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem disableGutters sx={{ pb: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary="123 Healthcare Ave, Suite 300, San Francisco, CA 94105"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AccessTime color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Hours of Operation" 
                        secondary="Monday - Friday: 8am - 8pm EST
                        Saturday: 9am - 5pm EST
                        Sunday: Closed"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                  </List>
                </Paper>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    bgcolor: 'rgba(0, 99, 176, 0.05)',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                    Need Immediate Help?
                  </Typography>
                  <Typography variant="body1" paragraph>
                    For urgent technical issues or questions about your upcoming appointment, try these options:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<Chat />}
                        sx={{ py: 1.5 }}
                      >
                        Live Chat
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<ContactSupport />}
                        sx={{ py: 1.5 }}
                        href="/faq"
                      >
                        View FAQs
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    );
  }