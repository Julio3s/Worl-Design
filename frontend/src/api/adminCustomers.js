import api from './axios';

export async function getAdminCustomers() {
  const { data } = await api.get('/admin/customers/');
  return Array.isArray(data) ? data : [];
}
