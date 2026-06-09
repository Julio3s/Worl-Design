const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error('Registration failed');
    error.response = response;
    error.data = data;
    throw error;
  }

  return data;
}

export function formatAuthError(error) {
  const data = error?.data || error?.response?.data;

  if (!data) {
    return error?.message || 'Une erreur est survenue.';
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  const messages = [];

  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      messages.push(value.join(' '));
      return;
    }

    if (typeof value === 'string') {
      messages.push(value);
    }
  });

  return messages.join(' ') || 'Une erreur est survenue.';
}

export function buildUsernameFromEmail(email) {
  const localPart = String(email || '').split('@')[0] || 'user';
  const sanitized = localPart.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
  return sanitized || 'user';
}
