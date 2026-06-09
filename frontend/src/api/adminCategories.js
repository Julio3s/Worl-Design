import api from './axios';

function appendField(formData, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, value);
}

function buildCategoryFormData(payload) {
  const formData = new FormData();

  appendField(formData, 'name', payload.name);
  appendField(formData, 'slug', payload.slug || '');
  
  // Si un fichier image est fourni, l'ajouter
  if (payload.image && payload.image instanceof File) {
    formData.append('image', payload.image);
  } else {
    // Sinon, utiliser le public ID de Cloudinary
    appendField(formData, 'image_public_id', payload.imagePublicId || '');
  }

  return formData;
}

export async function getAdminCategories(params = {}) {
  const { data } = await api.get('/admin/categories/', { params });
  return data;
}

export async function createAdminCategory(payload) {
  const { data } = await api.post('/admin/categories/', buildCategoryFormData(payload));
  return data;
}

export async function updateAdminCategory(id, payload) {
  const { data } = await api.put(`/admin/categories/${id}/`, buildCategoryFormData(payload));
  return data;
}

export async function deleteAdminCategory(id) {
  const { data } = await api.delete(`/admin/categories/${id}/`);
  return data;
}

export function formatCategoryError(error) {
  const responseData = error?.response?.data;

  if (!responseData) {
    return error?.message || 'Une erreur est survenue.';
  }

  if (typeof responseData.detail === 'string') {
    return responseData.detail;
  }

  const messages = [];
  Object.values(responseData).forEach((value) => {
    if (Array.isArray(value)) {
      messages.push(value.join(' '));
    } else if (typeof value === 'string') {
      messages.push(value);
    }
  });

  return messages.join(' ') || 'Une erreur est survenue.';
}
