import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Paper, 
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { 
  CreditCard, 
  Phone, 
  Payment as PaymentIcon
} from '@mui/icons-material';
import paymentService from '../../services/payment';

const PaymentForm = ({ 
  appointmentId, 
  amount = 75, 
  onPaymentSubmit, 
  onCancel, 
  processing = false, 
  error = null 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    amount: amount,
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    mobileNumber: '',
    mobileNetwork: '',
    currency: 'USD'
  });
  
  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setPaymentDetails({
      ...paymentDetails,
      paymentMethod: method
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value
    });
  };
  
  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    setPaymentDetails({
      ...paymentDetails,
      amount: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onPaymentSubmit(paymentDetails);
  };
  
  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return paymentDetails.cardNumber && 
             paymentDetails.cardExpiry && 
             paymentDetails.cardCVC &&
             paymentDetails.amount > 0;
    } else if (paymentMethod === 'mobile_money') {
      return paymentDetails.mobileNumber && 
             paymentDetails.mobileNetwork &&
             paymentDetails.amount > 0;
    }
    return false;
  };
  
  const mobileMoneyProviders = paymentService.getMobileMoneyProviders();
  
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Payment Details
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Payment Method</FormLabel>
          <RadioGroup
            name="paymentMethod"
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
            sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}
          >
            <FormControlLabel 
              value="card" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ mr: 1 }} />
                  <Typography>Credit/Debit Card</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="mobile_money" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1 }} />
                  <Typography>Mobile Money</Typography>
                </Box>
              } 
            />
          </RadioGroup>
        </FormControl>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              name="amount"
              value={paymentDetails.amount}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
          </Grid>
          
          {paymentMethod === 'card' && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  name="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  inputProps={{ maxLength: 19 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="cardExpiry"
                  value={paymentDetails.cardExpiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVC"
                  name="cardCVC"
                  value={paymentDetails.cardCVC}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </>
          )}
          
          {paymentMethod === 'mobile_money' && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <FormLabel>Mobile Money Provider</FormLabel>
                  <Select
                    name="mobileNetwork"
                    value={paymentDetails.mobileNetwork}
                    onChange={handleInputChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select a provider
                    </MenuItem>
                    {mobileMoneyProviders.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobileNumber"
                  value={paymentDetails.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. +233 XX XXX XXXX"
                  required
                />
              </Grid>
            </>
          )}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isFormValid() || processing}
            startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {processing ? 'Processing...' : `Pay $${paymentDetails.amount}`}
          </Button>
        </Box>
      </form>
      
      <Box sx={{ mt: 4 }}>
        <Card variant="outlined" sx={{ bgcolor: 'background.light' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Payment Security
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All payment information is securely processed through Eversend. 
              Your payment details are encrypted and never stored on our servers.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default PaymentForm;