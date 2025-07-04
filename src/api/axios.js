import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("Token"));
  const token1 = token?.token || token 
  if (token1) {
    config.headers.Authorization = `Bearer ${token1}`;
  }
  return config;
  }, (error) => Promise.reject(error));
  
// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
  if (error.response && error.response.status === 401) {
    // Clear token from localStorage
    localStorage.removeItem("Token");
    // Redirect to login page
    window.location.href = '/login'; // Adjust the path to your login route
  }
  return Promise.reject(error);
  }
);