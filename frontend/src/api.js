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
        // Check which user is logged in by checking localStorage
        const user = localStorage.getItem('user');
        const recruiter = localStorage.getItem('recruiter');

        let token = null;

        // If user exists (student logged in), use student token
        if (user) {
            token = localStorage.getItem('token');
        }
        // Otherwise, if recruiter exists, use recruiter token
        else if (recruiter) {
            token = localStorage.getItem('recruiterToken');
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
