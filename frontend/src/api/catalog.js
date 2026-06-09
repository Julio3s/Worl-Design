import api from './axios';

export async function getCategories() {
  const { data } = await api.get('/products/categories/');
  return Array.isArray(data) ? data : [];
}

export async function getFeaturedProducts() {
  const { data } = await api.get('/products/featured/');
  return Array.isArray(data) ? data : [];
}

export async function getProducts(params = {}) {
  const { data } = await api.get('/products/', { params });
  return data;
}

export async function getProductBySlug(slug) {
  const { data } = await api.get(`/products/${slug}/`);
  return data;
}
