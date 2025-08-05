const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Store tokens in memory (in production, use a secure storage solution)
let authTokens = {
  access: null,
  refresh: null
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (authTokens.access) {
      config.headers.Authorization = `Bearer ${authTokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: authTokens.refresh
        });
        
        // Update tokens
        authTokens = {
          access: response.data.access,
          refresh: response.data.refresh || authTokens.refresh
        };
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${authTokens.access}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject
        authTokens = { access: null, refresh: null };
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to set authentication tokens
const setAuthTokens = (tokens) => {
  authTokens = { ...tokens };
};

// Function to clear authentication tokens
const clearAuthTokens = () => {
  authTokens = { access: null, refresh: null };
};

// Function to check if user is authenticated
const isAuthenticated = () => {
  return !!authTokens.access;
};

module.exports = {
  apiClient,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated
};
