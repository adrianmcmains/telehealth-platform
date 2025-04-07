import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Divider,
  CheckCircle
} from '@mui/material';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import paymentService from '../../../services/payment';
import { appointmentService } from '../../../services/api';

export default function PaymentSuccess() {
  const router = useRouter();
  const { id, reference, status, payment_id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Get the appointment details
        const appointmentResponse = await appointmentService.getAppointment(id);
        setAppointment(appointmentResponse.appointment);
        
        // Check payment status
        const paymentResponse = await paymentService.getPaymentByAppointment(id);
        setPaymentStatus(paymentResponse.payment.status);
        
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('We could not verify your payment. Please contact support if your payment was completed.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [id]);
  
  const handleGoToAppointment = () => {
    router.push(`/appointments/${id}`);
  };
  
  const handleGoToAppointments = () => {
    router.push('/appointments');
  };
  
  return (
    <ProtectedRoute>
      <Layout title="Payment Status">
        <Container maxWidth="md">
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">
                  Verifying your payment...
                </Typography>
              </Box>
            ) : error ? (
              <Box>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Button 
                  variant="contained" 
                  onClick={handleGoToAppointment}
                  sx={{ mt: 2 }}
                >
                  View Appointment
                </Button>
              </Box>
            ) : (
              <Box>
                {paymentStatus === 'completed' || status === 'completed' ? (
                  <>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        bgcolor: 'success.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                      Payment Successful
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                      Your payment for the appointment has been successfully processed.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        bgcolor: 'warning.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <CircularProgress sx={{ color: 'warning.main' }} />
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'warning.main' }}>
                      Payment Processing
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                      Your payment is being processed. This may take a few moments.
                    </Typography>
                  </>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Appointment Details
                  </Typography>
                  {appointment && (
                    <Typography variant="body1" paragraph>
                      Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      <br />
                      {new Date(appointment.startTime).toLocaleDateString()} at {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleGoToAppointments}
                  >
                    All Appointments
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleGoToAppointment}
                  >
                    View Appointment
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
}