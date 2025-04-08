import api from './api';

// Payment service for handling payments
const paymentService = {
  // Create a payment for an appointment
  createPayment: async (appointmentId, amount) => {
    const response = await api.post('/payments', {
      appointmentId,
      amount,
    });
    return response.data;
  },
  
  // Get payment details
  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  
  // Refund a payment (admin and doctor only)
  refundPayment: async (id) => {
    const response = await api.post(`/payments/${id}/refund`);
    return response.data;
  },
  
  // Process payment with external provider
  processPayment: (paymentUrl) => {
    // Open payment URL in a new window
    window.open(paymentUrl, '_blank');
  },
  
  // Handle payment success
  handlePaymentSuccess: async (appointmentId) => {
    // This function can be used to refresh appointment details
    // or redirect the user after successful payment
    return true;
  },
};

export default paymentService;