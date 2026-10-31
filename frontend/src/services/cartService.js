import api from './api';

export const cartService = {
  async getCart() {
    const res = await api.get('/cart');
    return res.data;
  },

  async addItem(data) {
    const res = await api.post('/cart/items', data);
    return res.data;
  },

  async updateQuantity(itemId, quantity) {
    const res = await api.patch(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async clearCart() {
    const res = await api.delete('/cart');
    return res.data;
  },
};
