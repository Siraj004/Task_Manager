// src/services/AuthService.js
const API_URL = '/api/auth';

const AuthService = {
  // Perform login and return user data with token
  login: async ({ username, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

    if (!response.ok) {
      throw new Error('Login request failed');
    }
    // Expecting response JSON: { user: {...}, token: '...' }
    return await response.json();
  }
};

export default AuthService;
