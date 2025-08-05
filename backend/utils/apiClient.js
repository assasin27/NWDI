const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Storage for tokens - uses localStorage in browser, in-memory in Node.js
let storage;

if (typeof window !== 'undefined' && window.localStorage) {
  // Browser environment
  storage = {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => window.localStorage.removeItem(key),
    clear: () => {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
    }
  };
} else {
  // Node.js environment
  let tokenStore = {
    access_token: null,
    refresh_token: null
  };
  
  storage = {
    getItem: (key) => tokenStore[key],
    setItem: (key, value) => { tokenStore[key] = value; },
    removeItem: (key) => { delete tokenStore[key]; },
    clear: () => { tokenStore = { access_token: null, refresh_token: null }; }
  };
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        const refreshToken = storage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Update tokens in storage
        const { access, refresh } = response.data;
        storage.setItem('access_token', access);
        if (refresh) {
          storage.setItem('refresh_token', refresh);
        }
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject
        storage.clear();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to set authentication tokens
const setAuthTokens = ({ access, refresh }) => {
  if (access) {
    storage.setItem('access_token', access);
  }
  if (refresh) {
    storage.setItem('refresh_token', refresh);
  }
};

// Function to clear authentication tokens
const clearAuthTokens = () => {
  storage.clear();
};

// Function to check if user is authenticated
const isAuthenticated = () => {
  return !!storage.getItem('access_token');
};

// Function to get current tokens (for testing)
const getAuthTokens = () => ({
  access: storage.getItem('access_token'),
  refresh: storage.getItem('refresh_token')
});

module.exports = {
  apiClient,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated,
  getAuthTokens // Exposed for testing
};
