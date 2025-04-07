import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  Avatar,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { 
  Person, 
  Phone, 
  Home, 
  Email, 
  CalendarMonth, 
  MedicalServices,
  Badge
} from '@mui/icons-material';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  });
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUser(user.id);
      setProfile(response.user);
      
      // Set form data
      setFormData({
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        phoneNumber: response.user.phoneNumber || '',
        address: response.user.address || ''
      });
      
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await userService.updateUser(user.id, formData);
      
      setSuccess('Profile updated successfully!');
      
      // Refresh profile data
      fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <Layout title="My Profile">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !profile ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {/* Profile Overview */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: { xs: 2, md: 0 } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: 40
                    }}
                  >
                    {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                  </Avatar>
                  
                  <Typography variant="h5" gutterBottom>
                    {profile?.firstName} {profile?.lastName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Badge fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {profile?.role === 'patient' ? 'Patient' : profile?.role === 'doctor' ? 'Healthcare Provider' : 'Admin'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {profile?.email}
                    </Typography>
                  </Box>
                  
                  {profile?.phoneNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {profile.phoneNumber}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    Account created on {format(new Date(profile?.createdAt), 'MMMM d, yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Tabs Section */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ mb: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                >
                  <Tab label="Profile Information" />
                  {profile?.role === 'doctor' && <Tab label="Professional Details" />}
                  <Tab label="Account Settings" />
                </Tabs>
              </Paper>
              
              {/* Tab Panels */}
              <Paper sx={{ p: 3 }}>
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}
                
                {error && tabValue === 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {/* Profile Information Tab */}
                {tabValue === 0 && (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Personal Information
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="firstName"
                          name="firstName"
                          label="First Name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="lastName"
                          name="lastName"
                          label="Last Name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="phoneNumber"
                          name="phoneNumber"
                          label="Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="address"
                          name="address"
                          label="Address"
                          value={formData.address}
                          onChange={handleChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saving}
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* Professional Details Tab (Doctors only) */}
                {tabValue === 1 && profile?.role === 'doctor' && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Professional Information
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Specialties
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip label="Family Medicine" color="primary" />
                        <Chip label="Telemedicine" color="primary" />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Languages
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip label="English" />
                        <Chip label="Spanish" />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Contact admin to update professional details.
                    </Typography>
                  </Box>
                )}
                
                {/* Account Settings Tab */}
                {tabValue === (profile?.role === 'doctor' ? 2 : 1) && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Account Settings
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Email Address
                      </Typography>
                      <Typography>
                        {profile?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Your email is used for login and notifications.
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ••••••••••••
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Change Password
                      </Button>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box>
                      <Typography variant="subtitle1" gutterBottom color="error">
                        Delete Account
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Once you delete your account, there is no going back. Please be certain.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Delete Account
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Layout>
    </ProtectedRoute>
  );
}