import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addHours, isAfter, isBefore, addDays } from 'date-fns';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { userService, appointmentService } from '../../services/api';

export default function ScheduleAppointment() {
  const router = useRouter();
  const { doctorId } = router.query;
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [appointmentData, setAppointmentData] = useState({
    date: addDays(new Date(), 1), // Tomorrow
    startTime: null,
    endTime: null,
    reason: '',
  });

  // Fetch doctor details
  useEffect(() => {
    async function fetchDoctor() {
      if (!doctorId) return;
      
      try {
        setLoading(true);
        const response = await userService.getUser(doctorId);
        setDoctor(response.user);
      } catch (err) {
        console.error('Failed to fetch doctor:', err);
        setError('Failed to load doctor information. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDoctor();
  }, [doctorId]);

  const handleDateChange = (newDate) => {
    setAppointmentData({
      ...appointmentData,
      date: newDate,
      startTime: null, // Reset time when date changes
      endTime: null
    });
  };

  const handleStartTimeChange = (newTime) => {
    if (!newTime) {
      setAppointmentData({
        ...appointmentData,
        startTime: null,
        endTime: null
      });
      return;
    }
    
    // Set end time to start time + 30 minutes
    const endTime = addHours(newTime, 0.5);
    
    setAppointmentData({
      ...appointmentData,
      startTime: newTime,
      endTime: endTime
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!appointmentData.startTime || !appointmentData.endTime) {
      setError('Please select an appointment time');
      return;
    }
    
    if (!appointmentData.reason.trim()) {
      setError('Please provide a reason for the appointment');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setSubmitting(true);
      
      // Combine date and time
      const startDateTime = new Date(
        appointmentData.date.getFullYear(),
        appointmentData.date.getMonth(),
        appointmentData.date.getDate(),
        appointmentData.startTime.getHours(),
        appointmentData.startTime.getMinutes()
      );
      
      const endDateTime = new Date(
        appointmentData.date.getFullYear(),
        appointmentData.date.getMonth(),
        appointmentData.date.getDate(),
        appointmentData.endTime.getHours(),
        appointmentData.endTime.getMinutes()
      );
      
      // Submit appointment
      await appointmentService.createAppointment({
        doctorId: parseInt(doctorId),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reason: appointmentData.reason
      });
      
      setSuccess('Appointment scheduled successfully!');
      
      // Redirect to appointments list after a short delay
      setTimeout(() => {
        router.push('/appointments');
      }, 2000);
      
    } catch (err) {
      console.error('Failed to schedule appointment:', err);
      setError(err.response?.data?.error || 'Failed to schedule appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate available time slots (simplified for demo)
  const getAvailableTimeSlots = () => {
    const now = new Date();
    const slots = [];
    const isToday = appointmentData.date && 
      now.getDate() === appointmentData.date.getDate() &&
      now.getMonth() === appointmentData.date.getMonth() &&
      now.getFullYear() === appointmentData.date.getFullYear();
    
    // Business hours: 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const time = new Date(
          appointmentData.date?.getFullYear() || now.getFullYear(),
          appointmentData.date?.getMonth() || now.getMonth(),
          appointmentData.date?.getDate() || now.getDate(),
          hour,
          minute
        );
        
        // Skip times in the past if the date is today
        if (isToday && isBefore(time, now)) {
          continue;
        }
        
        slots.push(time);
      }
    }
    
    return slots;
  };

  return (
    <ProtectedRoute>
      <Layout title="Schedule an Appointment">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !doctor ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              {doctor && (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          bgcolor: 'primary.main',
                          mr: 2
                        }}
                      >
                        {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Telehealth Provider
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      Schedule a virtual appointment with Dr. {doctor.lastName}. 
                      Appointments are 30 minutes long.
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Available:</strong> Monday to Friday, 9 AM - 5 PM
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Choose Appointment Time
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Appointment Date"
                          value={appointmentData.date}
                          onChange={handleDateChange}
                          disablePast
                          renderInput={(params) => <TextField {...params} fullWidth required />}
                          minDate={new Date()}
                          maxDate={addDays(new Date(), 30)} // Allow booking up to 30 days in advance
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel id="time-slot-label">Time Slot</InputLabel>
                          <Select
                            labelId="time-slot-label"
                            id="time-slot"
                            value={appointmentData.startTime ? appointmentData.startTime.toString() : ''}
                            label="Time Slot"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStartTimeChange(new Date(e.target.value));
                              } else {
                                handleStartTimeChange(null);
                              }
                            }}
                            disabled={!appointmentData.date}
                          >
                            <MenuItem value="">
                              <em>Select a time</em>
                            </MenuItem>
                            {getAvailableTimeSlots().map((slot) => (
                              <MenuItem key={slot.toString()} value={slot.toString()}>
                                {format(slot, 'h:mm a')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="reason"
                          name="reason"
                          label="Reason for Visit"
                          multiline
                          rows={4}
                          value={appointmentData.reason}
                          onChange={handleChange}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={submitting}
                        >
                          {submitting ? 'Scheduling...' : 'Schedule Appointment'}
                        </Button>
                      </Grid>
                    </Grid>
                  </LocalizationProvider>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Layout>
    </ProtectedRoute>
  );
}