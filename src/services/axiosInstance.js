import axios from 'axios';

// base url from  vite env named VITE_API_URL
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // This is important for handling cookies/sessions
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        // You can add auth token here if needed
        // const token = localStorage.getItem('Token');
        const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });

        if (error.response) {
            // Handle specific error cases
            switch (error.response.status) {
                case 401:
                    // Only redirect to login if it's not the leads endpoint
                    if (!error.config.url.includes('/lead/GetAllLeads')) {
                        console.error('Unauthorized access - redirecting to login');
                        localStorage.removeItem('Token');
                        window.location.href = '/login';
                    } else {
                        console.error('Unauthorized access to leads - not redirecting');
                    }
                    break;
                case 403:
                    // Handle forbidden access
                    console.error('Access forbidden');
                    break;
                case 404:
                    // Handle not found
                    console.error('Resource not found:', error.config.url);
                    break;
                default:
                    // Handle other errors
                    console.error('API Error:', error.response.data);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from server. Check if server is running at:', error.config.baseURL);
        } else {
            // Something happened in setting up the request
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;