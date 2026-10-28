// A single Axios instance used by every page to talk to the backend.
// The API base URL lives ONLY in this file.

import axios from 'axios';

// Change this if your backend runs on a different port.
// (You can also set VITE_API_URL in a client/.env file.)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Before every request: attach the JWT token saved at login (if any)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if a logged-in user's token is rejected
// (expired, or the account no longer exists in the database), log them out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);

/**
 * Turns any Axios error into a friendly message for toasts.
 */
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.request) {
    return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  }
  return 'Something went wrong. Please try again.';
}

export default api;
