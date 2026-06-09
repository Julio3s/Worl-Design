import axios from 'axios';

import { useAuthStore } from '../store/authStore';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL,
});

let refreshPromise = null;

async function refreshTokens() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${baseURL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || 'Token refresh failed');
        }

        return {
          access: data.access,
          refresh: data.refresh || refreshToken,
        };
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function logoutAndRedirect() {
  useAuthStore.getState().logout();

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const statusCode = error.response?.status;
    const requestUrl = String(originalRequest.url || '');

    if (statusCode !== 401 || originalRequest._retry || requestUrl.includes('/auth/refresh/')) {
      return Promise.reject(error);
    }

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      logoutAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tokens = await refreshTokens();
      useAuthStore.getState().setTokens({
        user: useAuthStore.getState().user,
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
      });
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      logoutAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
