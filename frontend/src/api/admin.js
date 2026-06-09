import api from './axios';

export async function getAdminStats(period = 'week') {
  const { data } = await api.get('/admin/stats/', { params: { period } });
  return data;
}
