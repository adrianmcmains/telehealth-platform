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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CalendarToday, 
  AccessTime, 
  VideoCall,
  Person,
  Email,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  CheckCircle,
  Info,
  Notes,
  MedicalServices
} from '@mui/icons-material';
import { format, isPast, isFuture, isToday, differenceInMinutes } from 'date-fns';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentService } from '../../../services/api';
import paymentService from '../../../services/payment';

// Appointment status styles
const statusColors = {
  'scheduled': 'primary',
  'in-progress': 'secondary',
  'completed': 'success',
  'cancelled': 'error',
  'no-show': 'warning'
};

// Status options for updating
const statusOptions = {
  'scheduled': 'Scheduled',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'no-show': 'No Show'
};

export default function AppointmentDetail() {
  const theme = useTheme();
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(75); // Default consultation fee
  const [processingPayment, setProcessingPayment] = useState(false);
  
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

  const handlePayment = () => {
    setPaymentDialogOpen(true);
  };
  
  const makePayment = async () => {
    try {
      setProcessingPayment(true);
      setError('');
      
      // Create payment
      const response = await paymentService.createPayment(appointment.id, paymentAmount);
      
      // Process payment with external provider
      paymentService.processPayment(response.payment.paymentUrl);
      
      // Close dialog
      setPaymentDialogOpen(false);
      setSuccess('Payment initiated. You will be redirected to the payment gateway.');
      
    } catch (err) {
      console.error('Failed to initiate payment:', err);
      setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Helper functions
  const formatAppointmentDate = (date) => {
    if (isToday(new Date(date))) {
      return 'Today';
    }
    return format(new Date(date), 'EEEE, MMMM d, yyyy');
  };

  const calculateTimeRemaining = () => {
    if (!appointment) return null;
    
    const now = new Date();
    const start = new Date(appointment.startTime);
    
    if (isPast(start)) return null;
    
    const minutesRemaining = differenceInMinutes(start, now);
    
    if (minutesRemaining < 60) {
      return `${minutesRemaining} minutes`;
    } else if (minutesRemaining < 1440) { // Less than a day
      const hours = Math.floor(minutesRemaining / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutesRemaining / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
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
  const canPayNow = isPatient && 
    appointment && 
    !appointment.isPaid && 
    appointment.status === 'scheduled';
  
  // Calculate time remaining
  const timeRemaining = calculateTimeRemaining();

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
            
            {/* Main appointment card */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    mb: 4,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {/* Appointment status header */}
                  <Box sx={{ 
                    bgcolor: statusColors[appointment.status]?.main || theme.palette.primary.main,
                    color: 'white',
                    p: 3
                  }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        <Avatar sx={{ 
                          bgcolor: 'white', 
                          color: statusColors[appointment.status]?.main || theme.palette.primary.main,
                          width: 56,
                          height: 56
                        }}>
                          {appointment.status === 'scheduled' ? <CalendarToday /> : 
                           appointment.status === 'in-progress' ? <VideoCall /> :
                           appointment.status === 'completed' ? <CheckCircle /> :
                           appointment.status === 'cancelled' ? <CancelIcon /> :
                           <Info />}
                        </Avatar>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h5" component="h1" fontWeight={600}>
                          {statusOptions[appointment.status]}
                        </Typography>
                        <Typography variant="subtitle1">
                          {timeRemaining ? `Starting in ${timeRemaining}` : 
                           appointment.status === 'completed' ? 'Appointment completed' : 
                           appointment.status === 'cancelled' ? 'Appointment cancelled' :
                           appointment.status === 'in-progress' ? 'Appointment in progress' :
                           'Appointment time passed'}
                        </Typography>
                      </Grid>
                      
                      {/* Payment status badge */}
                      <Grid item>
                        <Chip 
                          label={appointment.isPaid ? 'Paid' : 'Unpaid'}
                          color={appointment.isPaid ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Appointment Details
                        </Typography>
                        
                        <List>
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <CalendarToday fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={formatAppointmentDate(appointment.startTime)}
                              secondary="Appointment Date"
                            />
                          </ListItem>
                          
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <AccessTime fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${format(new Date(appointment.startTime), 'h:mm a')} - ${format(new Date(appointment.endTime), 'h:mm a')}`}
                              secondary="Appointment Time"
                            />
                          </ListItem>
                          
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <MedicalServices fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Telehealth Video Visit" 
                              secondary="Visit Type"
                            />
                          </ListItem>
                        </List>
                        
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Reason for Visit
                          </Typography>
                          <Typography paragraph>
                            {appointment.reason}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {isPatient ? 'Provider Information' : 'Patient Information'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar 
                            sx={{ 
                              width: 60, 
                              height: 60, 
                              bgcolor: theme.palette.primary.main,
                              mr: 2
                            }}
                          >
                            {isPatient 
                              ? `${appointment.doctor.firstName.charAt(0)}${appointment.doctor.lastName.charAt(0)}`
                              : `${appointment.patient.firstName.charAt(0)}${appointment.patient.lastName.charAt(0)}`
                            }
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {isPatient 
                                ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                : `${appointment.patient.firstName} ${appointment.patient.lastName}`
                              }
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Email fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {isPatient ? appointment.doctor.email : appointment.patient.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {isDoctor && (
                          <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              Provider Notes
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add clinical notes here..."
                              disabled={!isDoctor || saving}
                              sx={{ mb: 2 }}
                            />
                            
                            <Button 
                              variant="outlined" 
                              color="primary"
                              onClick={handleSaveNotes}
                              disabled={saving}
                              startIcon={<Notes />}
                            >
                              Save Notes
                            </Button>
                          </Box>
                        )}
                        
                        {!isDoctor && appointment.notes && (
                          <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              Provider Notes
                            </Typography>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                bgcolor: 'rgba(0, 99, 176, 0.04)',
                                borderRadius: 2
                              }}
                            >
                              <Typography variant="body2">
                                {appointment.notes}
                              </Typography>
                            </Paper>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                {/* Actions card */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    mb: 4,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Appointment Actions
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {canJoinCall && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          size="large"
                          startIcon={<VideoCall />}
                          onClick={() => router.push(`/appointments/${id}/video`)}
                          sx={{ py: 1.5 }}
                        >
                          Join Video Call
                        </Button>
                      )}
                      
                      {canPayNow && (
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          size="large"
                          startIcon={<PaymentIcon />}
                          onClick={handlePayment}
                          sx={{ py: 1.5 }}
                        >
                          Pay Now
                        </Button>
                      )}
                      
                      {canCancel && (
                        <Button 
                          variant="outlined" 
                          color="error"
                          fullWidth
                          size="large"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          sx={{ py: 1.5 }}
                        >
                          Cancel Appointment
                        </Button>
                      )}
                      
                      {canEditStatus && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Update Status:
                          </Typography>
                          <Grid container spacing={1}>
                            {Object.entries(statusOptions).map(([value, label]) => (
                              <Grid item xs={6} key={value}>
                                <Button
                                  variant={status === value ? "contained" : "outlined"}
                                  color={statusColors[value] || "primary"}
                                  fullWidth
                                  size="small"
                                  onClick={() => handleUpdateStatus(value)}
                                  disabled={saving || status === value}
                                  sx={{ mb: 1 }}
                                >
                                  {label}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
                
                {/* Help card */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Need Help?
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      If you need to reschedule or have technical issues during your appointment, please contact our support team.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Contact Support
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Cancel Dialog */}
            <Dialog 
              open={cancelDialogOpen} 
              onClose={() => setCancelDialogOpen(false)}
              PaperProps={{
                sx: { borderRadius: 3 }
              }}
            >
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
                <Button 
                  onClick={() => handleUpdateStatus('cancelled')} 
                  color="error" 
                  variant="contained"
                  disabled={saving}
                >
                  Yes, Cancel Appointment
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Payment Dialog */}
            <Dialog 
              open={paymentDialogOpen} 
              onClose={() => setPaymentDialogOpen(false)}
              PaperProps={{
                sx: { borderRadius: 3 }
              }}
            >
              <DialogTitle>Payment for Appointment</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ mb: 3 }}>
                  Please confirm the payment amount for your appointment with Dr. {appointment?.doctor?.lastName}.
                </DialogContentText>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Consultation Fee"
                      type="number"
                      fullWidth
                      InputProps={{ 
                        startAdornment: '$' 
                      }}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                      disabled={processingPayment}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      You will be redirected to our secure payment gateway to complete the payment.
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPaymentDialogOpen(false)} disabled={processingPayment}>
                  Cancel
                </Button>
                <Button 
                  onClick={makePayment} 
                  color="primary" 
                  variant="contained"
                  disabled={processingPayment || paymentAmount <= 0}
                  startIcon={processingPayment ? <CircularProgress size={20} /> : <PaymentIcon />}
                >
                  {processingPayment ? 'Processing...' : 'Pay Now'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Layout>
    </ProtectedRoute>
  );
}