import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async googleAuth(credential) {
    const res = await api.post('/auth/google', { credential });
    return res.data;
  },

  async getGoogleClientId() {
    const res = await api.get('/auth/google-client-id');
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async addAddress(data) {
    const res = await api.post('/auth/addresses', data);
    return res.data;
  },

  async deleteAddress(addressId) {
    const res = await api.delete(`/auth/addresses/${addressId}`);
    return res.data;
  },
};
