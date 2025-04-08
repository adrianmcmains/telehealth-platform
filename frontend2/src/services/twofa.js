import api from './api';

// Two-Factor Authentication service
const twoFAService = {
  // Enable 2FA for the current user
  enable2FA: async () => {
    const response = await api.post('/2fa/enable');
    return response.data;
  },
  
  // Verify 2FA setup
  verify2FA: async (token) => {
    const response = await api.post('/2fa/verify', { token });
    return response.data;
  },
  
  // Validate 2FA during login
  validate2FA: async (token) => {
    const response = await api.post('/2fa/validate', { token });
    return response.data;
  },
  
  // Disable 2FA for the current user
  disable2FA: async (token) => {
    const response = await api.post('/2fa/disable', { token });
    return response.data;
  },
};

export default twoFAService;