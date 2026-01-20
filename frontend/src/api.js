import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5000', // Backend server URL
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// You can add interceptors here later for authentication, error handling, etc.
// Example:
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
