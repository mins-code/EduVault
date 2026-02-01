import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5001', // Backend server URL
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 second timeout (increased for PDF extraction)
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Try to get recruiter token first (since the dashboard uses this)
        let token = localStorage.getItem('recruiterToken');

        // If no recruiter token, try student token
        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
