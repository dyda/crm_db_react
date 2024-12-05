// src/utils/axiosInstance.js
import axios from 'axios';

// Create an instance of axios
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Set the base URL for the API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add an interceptor for adding authorization headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Assume token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
