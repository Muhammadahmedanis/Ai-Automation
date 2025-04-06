import axios from "axios";
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("Token"));
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error));
  