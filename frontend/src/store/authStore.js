import { create } from 'zustand';

import { buildUsernameFromEmail, registerUser } from '../api/auth';

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

function getAuthStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

function readAuthState() {
  const storage = getAuthStorage();
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(AUTH_STORAGE_KEY);
    if (!value) {
      return null;
    }
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function persistAuth(state) {
  const storage = getAuthStorage();
  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  }));
}

function clearAuthStorage() {
  const storage = getAuthStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
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
    const stored = readAuthState();
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
  logout: () => {
    const refreshToken = get().refreshToken;
    set(emptyState);
    clearAuthStorage();

    if (!refreshToken) {
      return;
    }

    void fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      keepalive: true,
    }).catch(() => {});
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
}));
