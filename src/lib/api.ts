import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  
  // If token exists, add it to the headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 responses
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);