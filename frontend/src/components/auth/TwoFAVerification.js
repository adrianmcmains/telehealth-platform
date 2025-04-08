import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import twoFAService from '../../services/twofa';
import { useAuth } from '../../contexts/AuthContext';

export default function TwoFAVerification({ userId, onSuccess, onCancel }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await twoFAService.validate2FA(token);
      
      // Update auth context and navigate
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        login(response.user);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Failed to verify 2FA code:', err);
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Two-Factor Authentication
      </Typography>
      
      <Typography variant="body1" paragraph>
        Please enter the verification code from your authenticator app to continue.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Verification Code"
          variant="outlined"
          placeholder="Enter 6-digit code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 6 }}
          autoFocus
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || token.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}