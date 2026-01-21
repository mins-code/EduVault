import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5000', // Backend server URL
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 second timeout (increased for PDF extraction)
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
