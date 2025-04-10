// frontend/src/pages/appointments/index.js
import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Tabs, 
  Tab, 
  Chip, 
  CircularProgress, 
  Alert,
  Divider,
  useTheme,
  Paper,
  Avatar
} from '@mui/material';
import { 
  AccessTime, 
  VideoCall,
  Add as AddIcon,
  // Removed unused imports: CalendarToday, ArrowForward
} from '@mui/icons-material';
import { format, isPast, isToday, isTomorrow, isAfter } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService } from '../../services/api';

// Appointment status styles
const statusColors = {
  'scheduled': 'primary',
  'in-progress': 'secondary',
  'completed': 'success',
  'cancelled': 'error',
  'no-show': 'warning'
};

// Human-readable status labels
const statusLabels = {
  'scheduled': 'Scheduled',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'no-show': 'No Show'
};

// Format date in a human-friendly way
const formatAppointmentDate = (date) => {
  const appointmentDate = new Date(date);
  
  if (isToday(appointmentDate)) {
    return 'Today';
  } else if (isTomorrow(appointmentDate)) {
    return 'Tomorrow';
  } else {
    return format(appointmentDate, 'EEEE, MMMM d');
  }
};

export default function Appointments() {
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getUserAppointments();
      setAppointments(response.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleJoinAppointment = (id) => {
    router.push(`/appointments/${id}/video`);
  };

  const handleViewDetails = (id) => {
    router.push(`/appointments/${id}`);
  };

  // Filter appointments based on tab
  const filterAppointments = () => {
    switch (tabValue) {
      case 0: // Upcoming
        return appointments.filter(appt => 
          !isPast(new Date(appt.endTime)) && 
          appt.status !== 'cancelled' && 
          appt.status !== 'completed' &&
          appt.status !== 'no-show'
        );
      case 1: // Past
        return appointments.filter(appt => 
          isPast(new Date(appt.endTime)) || 
          appt.status === 'completed' ||
          appt.status === 'no-show'
        );
      case 2: // Cancelled
        return appointments.filter(appt => appt.status === 'cancelled');
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments();
  
  // Group appointments by date
  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};
    
    appointments.forEach(appointment => {
      const dateKey = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    
    // Sort appointments within each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
    });
    
    return grouped;
  };
  
  const groupedAppointments = groupAppointmentsByDate(filteredAppointments);
  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  return (
    <ProtectedRoute>
      <Layout title="My Appointments">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" component="h2" color="text.secondary" fontWeight={500}>
              Manage your appointments
            </Typography>
          </Box>
          <Link href="/doctors" passHref legacyBehavior>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3
              }}
            >
              Schedule New Visit
            </Button>
          </Link>
        </Box>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600
              }
            }}
          >
            <Tab label="Upcoming" />
            <Tab label="Past" />
            <Tab label="Cancelled" />
          </Tabs>
          
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            ) : filteredAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box 
                  component="img"
                  src="/empty-calendar.svg"
                  alt="No appointments"
                  sx={{ width: 120, height: 120, opacity: 0.6, mb: 3 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No appointments found
                </Typography>
                <Typography color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                  {tabValue === 0 
                    ? "You don't have any upcoming appointments." 
                    : tabValue === 1 
                      ? "You don't have any past appointments." 
                      : "You don't have any cancelled appointments."}
                </Typography>
                {tabValue !== 0 && (
                  <Link href="/doctors" passHref legacyBehavior>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddIcon />}
                    >
                      Schedule an Appointment
                    </Button>
                  </Link>
                )}
              </Box>
            ) : (
              <Box>
                {sortedDates.map(dateKey => (
                  <Box key={dateKey} sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        color: isAfter(new Date(dateKey), new Date()) ? theme.palette.primary.main : theme.palette.text.secondary
                      }}
                    >
                      {formatAppointmentDate(dateKey)}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {groupedAppointments[dateKey].map((appointment) => (
                        <Grid item xs={12} key={appointment.id}>
                          <Card 
                            sx={{ 
                              borderRadius: 2,
                              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
                                    <Avatar
                                      sx={{ 
                                        bgcolor: theme.palette.primary.main,
                                        width: 50,
                                        height: 50,
                                        mr: 2
                                      }}
                                    >
                                      {user?.role === 'patient' 
                                        ? `${appointment.doctor.firstName.charAt(0)}${appointment.doctor.lastName.charAt(0)}` 
                                        : `${appointment.patient.firstName.charAt(0)}${appointment.patient.lastName.charAt(0)}`}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {user?.role === 'patient' 
                                          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` 
                                          : `${appointment.patient.firstName} ${appointment.patient.lastName}`}
                                      </Typography>
                                      <Chip 
                                        label={statusLabels[appointment.status]} 
                                        color={statusColors[appointment.status] || 'default'} 
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                      />
                                    </Box>
                                  </Box>
                                  
                                  <Divider sx={{ my: 2, display: { md: 'none' } }} />
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    {appointment.reason}
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    height: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'flex-start', md: 'flex-end' },
                                    borderLeft: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
                                    pl: { xs: 0, md: 2 }
                                  }}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                        <AccessTime fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    
                                    <Box sx={{ 
                                      display: 'flex', 
                                      gap: 1, 
                                      mt: 2,
                                      width: { xs: '100%', md: 'auto' }
                                    }}>
                                      <Button 
                                        variant="outlined" 
                                        onClick={() => handleViewDetails(appointment.id)}
                                        size="small"
                                        sx={{ 
                                          borderRadius: 1.5,
                                          flex: { xs: 1, md: 'unset' }
                                        }}
                                      >
                                        Details
                                      </Button>
                                      
                                      {appointment.status === 'scheduled' && !isPast(new Date(appointment.endTime)) && (
                                        <Button 
                                          variant="contained" 
                                          color="primary"
                                          startIcon={<VideoCall />}
                                          onClick={() => handleJoinAppointment(appointment.id)}
                                          size="small"
                                          sx={{ 
                                            borderRadius: 1.5,
                                            flex: { xs: 1, md: 'unset' }
                                          }}
                                        >
                                          Join
                                        </Button>
                                      )}
                                    </Box>
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* Help Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="body1" paragraph>
            If you need to change or cancel an appointment, please do so at least 24 hours in advance.
            For any issues or questions, please contact us at support@drndaara.com.
          </Typography>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}