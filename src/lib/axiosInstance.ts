import { config } from '@/config/environment';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: config.baseURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    console.log(sessionStorage.getItem('authToken'))
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         const status = error?.response?.status;
//         if (status === 401 || status === 403) {
//             sessionStorage.removeItem('authToken');
//             sessionStorage.clear();
//             setTimeout(() => {
//                 alert("Your session has expired. Please login again.");
//                 window.location.replace('/');
//             }, 300);
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
