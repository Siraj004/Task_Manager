// src/services/AuthService.js
import api from './api';

const AuthService = {
  // Perform login and return user data with token
  login: async ({ username, password }) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // You can add more methods here as needed (register, logout, etc.)
};

export default AuthService;
