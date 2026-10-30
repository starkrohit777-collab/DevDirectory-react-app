import apiClient, { getErrorMessage } from './api.js';

export const authService = {
  async register(formData) {
    try {
      const res = await apiClient.post('/auth/register', formData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async login(email, password) {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async getCurrentUser() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data.user;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  async getUsers() {
    try {
      const res = await apiClient.get('/auth/users');
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },
};

export default authService;
