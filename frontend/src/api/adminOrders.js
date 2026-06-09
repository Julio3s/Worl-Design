import api from './axios';

export async function getAdminOrders(params = {}) {
  const { data } = await api.get('/admin/orders/', { params });
  return data;
}

export async function getAdminOrder(id) {
  const { data } = await api.get(`/admin/orders/${id}/`);
  return data;
}

export async function updateAdminOrderStatus(id, statusValue) {
  const { data } = await api.patch(`/admin/orders/${id}/`, { status: statusValue });
  return data;
}

export function formatAdminOrderError(error) {
  const responseData = error?.response?.data;

  if (!responseData) {
    return error?.message || 'Une erreur est survenue.';
  }

  if (typeof responseData.detail === 'string') {
    return responseData.detail;
  }

  if (responseData.status) {
    return Array.isArray(responseData.status)
      ? responseData.status.join(' ')
      : String(responseData.status);
  }

  return 'Une erreur est survenue.';
}
