import api from './api';

export const paymentService = {
  async verifyPayment(data) {
    const res = await api.post('/payments/razorpay/verify', data);
    return res.data;
  },

  async getPaymentStatus(orderId) {
    const res = await api.get(`/payments/${orderId}/status`);
    return res.data;
  },
};
