import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Chip, 
  Avatar,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  CalendarToday, 
  AccessTime, 
  VideoCall,
  Person,
  Email,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format, isPast, isFuture } from 'date-fns';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentService } from '../../../services/api';

// Appointment status styles
const statusColors = {
  'scheduled': 'primary',
  'in-progress': 'secondary',
  'completed': 'success',
  'cancelled': 'error',
  'no-show': 'warning'
};

// Status options for updating
const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' }
];

export default function AppointmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);
  
  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointment(id);
      setAppointment(response.appointment);
      setNotes(response.appointment.notes || '');
      setStatus(response.appointment.status);
    } catch (err) {
      console.error('Failed to fetch appointment:', err);
      setError('Failed to load appointment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await appointmentService.updateAppointment(id, { notes });
      setSuccess('Notes saved successfully!');
      
      // Refresh appointment data
      fetchAppointment();
    } catch (err) {
      console.error('Failed to save notes:', err);
      setError('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await appointmentService.updateAppointment(id, { status: newStatus });
      setStatus(newStatus);
      setSuccess('Status updated successfully!');
      
      // Refresh appointment data
      fetchAppointment();
      
      // Close dialog if cancelling
      if (newStatus === 'cancelled') {
        setCancelDialogOpen(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    setCancelDialogOpen(true);
  };
  
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';
  const canEditStatus = isDoctor;
  const canJoinCall = appointment && 
    (appointment.status === 'scheduled' || appointment.status === 'in-progress') && 
    !isPast(new Date(appointment.endTime));
  const canCancel = appointment && 
    appointment.status === 'scheduled' && 
    isFuture(new Date(appointment.startTime));
  
  return (
    <ProtectedRoute>
      <Layout title="Appointment Details">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : !appointment ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            Appointment not found.
          </Alert>
        ) : (
          <>
            {success && (
              <Alert severity="success" sx={{ mb: 4 }}>
                {success}
              </Alert>
            )}
            
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h5" component="h1" gutterBottom>
                    {isPatient ? `Appointment with Dr. ${appointment.doctor.lastName}` : `Appointment with ${appointment.patient.firstName} ${appointment.patient.lastName}`}
                  </Typography>
                  
                  <Chip 
                    label={appointment.status.replace('-', ' ')} 
                    color={statusColors[appointment.status] || 'default'} 
                    size="medium"
                  />
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Appointment Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>
                        {format(new Date(appointment.startTime), 'EEEE, MMMM d, yyyy')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>
                        {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Reason for Visit
                    </Typography>
                    <Typography paragraph>
                      {appointment.reason}
                    </Typography>
                    
                    {canEditStatus && (
                      <Box sx={{ mt: 3 }}>
                        <FormControl fullWidth>
                          <InputLabel id="status-label">Update Status</InputLabel>
                          <Select
                            labelId="status-label"
                            id="status"
                            value={status}
                            label="Update Status"
                            onChange={(e) => handleUpdateStatus(e.target.value)}
                            disabled={saving}
                          >
                            {statusOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {isPatient ? (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Doctor Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              bgcolor: 'primary.main',
                              mr: 2
                            }}
                          >
                            {appointment.doctor.firstName.charAt(0)}{appointment.doctor.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography>
                              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Email fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {appointment.doctor.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Patient Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              bgcolor: 'primary.main',
                              mr: 2
                            }}
                          >
                            {appointment.patient.firstName.charAt(0)}{appointment.patient.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography>
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Email fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {appointment.patient.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </>
                    )}
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Notes
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isDoctor ? "Add clinical notes here..." : "Notes from your provider will appear here..."}
                      disabled={!isDoctor || saving}
                      sx={{ mb: 2 }}
                    />
                    
                    {isDoctor && (
                      <Button 
                        variant="outlined" 
                        onClick={handleSaveNotes}
                        disabled={saving}
                        sx={{ mb: 3 }}
                      >
                        Save Notes
                      </Button>
                    )}
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  {canCancel && (
                    <Button 
                      variant="outlined" 
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel Appointment
                    </Button>
                  )}
                  
                  {canJoinCall && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<VideoCall />}
                      onClick={() => router.push(`/appointments/${id}/video`)}
                      disabled={saving}