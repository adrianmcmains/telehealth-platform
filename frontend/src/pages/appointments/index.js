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
  Divider
} from '@mui/material';
import { 
  CalendarToday, 
  AccessTime, 
  VideoCall
} from '@mui/icons-material';
import { format, isPast } from 'date-fns';
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

export default function Appointments() {
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
          appt.status !== 'completed'
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

  return (
    <ProtectedRoute>
      <Layout title="My Appointments">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Link href="/doctors" passHref>
            <Button variant="contained" color="primary">
              Schedule New Appointment
            </Button>
          </Link>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Cancelled" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : filteredAppointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No appointments found
            </Typography>
            <Typography color="text.secondary" paragraph>
              {tabValue === 0 
                ? "You don't have any upcoming appointments." 
                : tabValue === 1 
                  ? "You don't have any past appointments." 
                  : "You don't have any cancelled appointments."}
            </Typography>
            {tabValue !== 0 && (
              <Link href="/doctors" passHref>
                <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                  Schedule an Appointment
                </Button>
              </Link>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} key={appointment.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="h2">
                          {user?.role === 'patient' 
                            ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` 
                            : `${appointment.patient.firstName} ${appointment.patient.lastName}`}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          {appointment.reason}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                        <Chip 
                          label={appointment.status.replace('-', ' ')} 
                          color={statusColors[appointment.status] || 'default'} 
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {format(new Date(appointment.startTime), 'EEEE, MMMM d, yyyy')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => handleViewDetails(appointment.id)}
                      >
                        View Details
                      </Button>
                      
                      {appointment.status === 'scheduled' && !isPast(new Date(appointment.endTime)) && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<VideoCall />}
                          onClick={() => handleJoinAppointment(appointment.id)}
                        >
                          Join Video Call
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Layout>
    </ProtectedRoute>
  );
}