import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import PaymentForm from './PaymentForm';
import paymentService from '../../services/payment';

const PaymentDialog = ({ 
  open, 
  onClose, 
  appointmentId, 
  appointmentDetails,
  onPaymentComplete 
}) => {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState(null);
  
  // Default to doctor's last name if available
  const doctorName = appointmentDetails?.doctor?.lastName || 'the doctor';
  
  const handlePaymentSubmit = async (paymentDetails) => {
    try {
      setError('');
      setProcessing(true);
      
      // Create payment through API
      const response = await paymentService.createPayment(appointmentId, paymentDetails);
      
      // Store the payment URL for redirection
      setPaymentRedirectUrl(response.payment.paymentUrl);
      setPaymentInitiated(true);
      
      // Open the payment URL in a new window
      paymentService.processPayment(response.payment.paymentUrl);
      
    } catch (err) {
      console.error('Failed to initiate payment:', err);
      setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  const handlePaymentComplete = async () => {
    try {
      // Check the payment status
      const paymentData = await paymentService.getPaymentByAppointment(appointmentId);
      
      // Notify parent component and close dialog
      if (onPaymentComplete) {
        onPaymentComplete(paymentData.payment);
      }
      
      // Reset state
      setPaymentInitiated(false);
      setPaymentRedirectUrl(null);
      
      // Close dialog
      onClose();
      
    } catch (err) {
      console.error('Failed to check payment status:', err);
      setError('Failed to verify payment. Please check your appointment details for payment status.');
    }
  };
  
  // If payment was initiated, show different content
  if (paymentInitiated) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Complete Your Payment</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body1" paragraph>
            A payment window has been opened in a new tab. Please complete your payment there.
          </Typography>
          
          <Typography variant="body1" paragraph>
            If the payment window was blocked, please click the button below to reopen it.
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={() => paymentService.processPayment(paymentRedirectUrl)}
            sx={{ mt: 1 }}
          >
            Reopen Payment Window
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handlePaymentComplete} 
            variant="contained" 
            color="primary"
          >
            I've Completed Payment
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>Payment for Appointment</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          Please complete your payment for your appointment with Dr. {doctorName}.
        </Typography>
        
        <PaymentForm
          appointmentId={appointmentId}
          amount={75} // Default consultation fee
          onPaymentSubmit={handlePaymentSubmit}
          onCancel={onClose}
          processing={processing}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;