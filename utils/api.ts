// utils/api.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import axios from 'axios';
import { logoutUser } from './auth'; // Define yourself: clears tokens, navigates to login

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://zhancareai-back.vercel.app/api/v1';

const api = axios.create({
  baseURL,
  timeout: 10000,
  paramsSerializer: (params) => new URLSearchParams(params).toString(),
});

// Request interceptor — add access token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = await AsyncStorage.getItem('refresh_token');
        if (!refresh_token) throw new Error('No refresh token found.');

        const { data } = await axios.post(`${baseURL}/auth/refresh/`, {
          refresh_token,
        });

        const newAccessToken = data.access_token;
        await AsyncStorage.setItem('access_token', newAccessToken);

        originalRequest.headers.Authorization = `Token ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('🔐 Refresh failed. Logging out...');
        logoutUser('⏳ Ваша сессия истекла. Пожалуйста, войдите снова.');
        return Promise.reject(refreshError);
      }
    }

    // Report to Sentry
    Sentry.captureException(error, {
      extra: {
        status: error.response?.status,
        method: error.config?.method,
        url: error.config?.url,
        data: error.response?.data,
      },
    });

    return Promise.reject(error);
  }
);

export default api;
