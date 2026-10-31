import api from './api';

export const orderService = {
  async createOrder(data) {
    const res = await api.post('/orders', data);
    return res.data;
  },

  async getMyOrders() {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },

  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id, reason) {
    const res = await api.patch(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  async updateRiderLocation(id, data) {
    const res = await api.patch(`/orders/${id}/rider-location`, data);
    return res.data;
  },
};
