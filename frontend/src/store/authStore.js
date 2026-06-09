import { create } from 'zustand';

import { buildUsernameFromEmail, registerUser } from '../api/auth';
import { readJSON, removeJSON, writeJSON } from '../utils/storage';

const AUTH_STORAGE_KEY = 'world-design-auth';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const emptyState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isAdmin: false,
};

function normalizeAuthState(state) {
  const user = state.user ?? null;
  const accessToken = state.accessToken ?? null;
  const refreshToken = state.refreshToken ?? null;

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken),
    isAdmin: Boolean(user?.is_admin_user),
  };
}

function persistAuth(state) {
  writeJSON(AUTH_STORAGE_KEY, {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  });
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.detail || 'Request failed');
    error.response = response;
    error.data = data;
    throw error;
  }

  return data;
}

export const useAuthStore = create((set, get) => ({
  ...emptyState,
  loadFromStorage: () => {
    const stored = readJSON(AUTH_STORAGE_KEY, null);
    if (!stored) {
      set(emptyState);
      return;
    }

    const nextState = normalizeAuthState(stored);
    set(nextState);
  },
  setTokens: ({ user, accessToken, refreshToken }) => {
    const nextState = normalizeAuthState({
      user: user ?? get().user,
      accessToken,
      refreshToken,
    });

    set(nextState);
    persistAuth(nextState);
  },
  login: async (email, password) => {
    const data = await postJson('/auth/login/', { email, password });
    const nextState = normalizeAuthState({
      user: data.user ?? null,
      accessToken: data.access ?? null,
      refreshToken: data.refresh ?? null,
    });

    set(nextState);
    persistAuth(nextState);
    return data;
  },
  register: async ({ name, email, phone, password, password2 }) => {
    await registerUser({
      email,
      username: buildUsernameFromEmail(email),
      password,
      password2,
      phone,
      first_name: name,
    });

    return get().login(email, password);
  },
  logout: () => {
    set(emptyState);
    removeJSON(AUTH_STORAGE_KEY);
  },
}));
