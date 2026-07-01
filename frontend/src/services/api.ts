import axios from 'axios';

// Detect if we are running in a browser on a local environment
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Get backend API URL dynamically matching the deployment environment
const API_URL = 
  (import.meta as any).env?.VITE_API_URL || 
  (import.meta as any).env?.VITE_API_URL_LOCAL || 
  (isLocalhost ? 'http://localhost:5000/api' : '/api');

// Create safe Axios connection
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto inject signed token on every outgoing transaction
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('university_academic_jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
