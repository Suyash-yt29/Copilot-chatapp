import axios from 'axios';
import { useAuthStore } from '../context/authStore';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiService = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[API Request] 📤', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    console.log('[API Response] 📥', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('[API Error] ❌', error.response?.status, error.response?.statusText);
    console.error('[API Error] URL:', error.config?.url);
    console.error('[API Error] Data:', error.response?.data);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          '/api/auth/refresh',
          { refreshToken }
        );

        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return apiService(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
