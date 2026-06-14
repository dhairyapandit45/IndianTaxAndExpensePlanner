import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const safeApiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : (rawApiUrl ? `${rawApiUrl}/api` : '/api');

const api = axios.create({
  baseURL: safeApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
