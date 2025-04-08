import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider
} from '@mui/material';
import twoFAService from '../../services/twofa';
import { useAuth } from '../../contexts/AuthContext';

export default function TwoFASetup() {
  const { user, setUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  
  const steps = ['Generate Secret', 'Scan QR Code', 'Verify Code'];
  
  const handleGenerateSecret = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await twoFAService.enable2FA();
      
      setSecret(response.secret);
      setQrCode(response.qrCodeUrl);
      setActiveStep(1);
    } catch (err) {
      console.error('Failed to enable 2FA:', err);
      setError(err.response?.data?.error || 'Failed to generate 2FA secret. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await twoFAService.verify2FA(token);
      
      // Update local user data
      setUser({
        ...user,
        twoFactorEnabled: true,
      });
      
      // Update token
      localStorage.setItem('token', response.token);
      
      setSuccess('Two-factor authentication enabled successfully!');
      setActiveStep(2);
    } catch (err) {
      console.error('Failed to verify 2FA:', err);
      setError(err.response?.data?.error || 'Failed to verify 2FA code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Set Up Two-Factor Authentication
      </Typography>
      
      <Typography variant="body1" paragraph>
        Two-factor authentication adds an extra layer of security to your account.
        Once enabled, you'll need to enter a code from your authenticator app when logging in.
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
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
      
      {activeStep === 0 && (
        <Box>
          <Typography variant="body1" paragraph>
            To get started, click the button below to generate your 2FA secret.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateSecret}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Secret'}
          </Button>
        </Box>
      )}
      
      {activeStep === 1 && (
        <Box>
          <Typography variant="body1" paragraph>
            1. Download an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
          </Typography>
          
          <Typography variant="body1" paragraph>
            2. Scan the QR code below with your authenticator app.
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              {qrCode && (
                <Box
                  component="img"
                  src={qrCode}
                  alt="QR Code"
                  sx={{ width: '100%', height: 'auto' }}
                />
              )}
            </CardContent>
          </Card>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" paragraph>
            3. If you can't scan the QR code, enter this secret key manually:
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            value={secret}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="body1" paragraph>
            4. Enter the verification code from your authenticator app:
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter 6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            disabled={loading || token.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Code'}
          </Button>
        </Box>
      )}
      
      {activeStep === 2 && (
        <Box>
          <Typography variant="body1" paragraph>
            Two-factor authentication has been successfully enabled for your account.
          </Typography>
          
          <Typography variant="body1" paragraph>
            From now on, you'll need to enter a verification code from your authenticator app when logging in.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            Important: Store your recovery codes in a safe place. If you lose access to your authenticator app, you'll need these codes to log in.
          </Alert>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Return to Profile
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}