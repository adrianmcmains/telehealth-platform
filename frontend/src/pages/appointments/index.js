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
  CalendarToday, 
  AccessTime, 
  VideoCall,
  Add as AddIcon,
  ArrowForward
} from '@mui/icons-material';
import { format, isPast, isToday, isTomorrow, isAfter, addDays } from 'date-fns';
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
    const now = new Date();
    
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