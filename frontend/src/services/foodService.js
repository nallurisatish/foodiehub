import api from './api';

export const foodService = {
  async getFoods(params = {}) {
    const res = await api.get('/food', { params });
    return res.data;
  },

  async getFoodById(id) {
    const res = await api.get(`/food/${id}`);
    return res.data;
  },

  async createFood(data) {
    const res = await api.post('/food', data);
    return res.data;
  },

  async updateFood(id, data) {
    const res = await api.put(`/food/${id}`, data);
    return res.data;
  },

  async deleteFood(id) {
    const res = await api.delete(`/food/${id}`);
    return res.data;
  },
};
