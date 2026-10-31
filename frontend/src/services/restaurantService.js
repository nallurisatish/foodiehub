import api from './api';

export const restaurantService = {
  async getRestaurants(params = {}) {
    const res = await api.get('/restaurants', { params });
    return res.data;
  },

  async getRestaurantById(id) {
    const res = await api.get(`/restaurants/${id}`);
    return res.data;
  },

  async createRestaurant(data) {
    const res = await api.post('/restaurants', data);
    return res.data;
  },

  async updateRestaurant(id, data) {
    const res = await api.put(`/restaurants/${id}`, data);
    return res.data;
  },

  async deleteRestaurant(id) {
    const res = await api.delete(`/restaurants/${id}`);
    return res.data;
  },
};
