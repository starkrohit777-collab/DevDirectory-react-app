import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically inject JWT / Auth Bearer token into headers if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('devdirectory_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Extract human-readable error messages from responses
export const getErrorMessage = (err) => {
  if (err.response?.data?.error) {
    return err.response.data.error;
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err.message) {
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export default apiClient;
