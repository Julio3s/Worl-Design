import api from './axios';

function appendField(formData, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? 'true' : 'false');
    return;
  }

  formData.append(key, value);
}

function buildProductFormData(payload) {
  const formData = new FormData();

  appendField(formData, 'name', payload.name);
  appendField(formData, 'description', payload.description);
  appendField(formData, 'price', payload.price);
  appendField(formData, 'stock', payload.stock);
  appendField(formData, 'category', payload.category || '');
  appendField(formData, 'is_active', payload.is_active);
  appendField(formData, 'is_featured', payload.is_featured);
  appendField(formData, 'is_customizable', payload.is_customizable);
  appendField(formData, 'customization_hint', payload.customization_hint || '');
  appendField(formData, 'has_models', payload.has_models);

  if (payload.modelsData) {
    formData.append('models_data', payload.modelsData);
  }

  if (payload.imageFile) {
    formData.append('image', payload.imageFile);
  }

  // Ajouter les métadonnées des images (existantes + nouvelles) en JSON
  if (payload.imagesData && payload.imagesData.length > 0) {
    formData.append('images_data', JSON.stringify(payload.imagesData));
  }

  // Ajouter les fichiers des nouvelles images et vidéos séparément
  // Chaque entrée : { index, file?, videoUrl?, mediaType }
  if (payload.newImageFiles && payload.newImageFiles.length > 0) {
    payload.newImageFiles.forEach(({ index, file, videoUrl, mediaType }) => {
      formData.append(`images_new_type_${index}`, mediaType || (videoUrl ? 'video' : 'image'));

      if (mediaType === 'video' && videoUrl && !file) {
        formData.append(`images_new_${index}`, videoUrl);
      } else if (file) {
        formData.append(`images_new_${index}`, file);
      }
    });
  }

  return formData;
}

export async function getAdminProducts(params = {}) {
  const { data } = await api.get('/admin/products/', { params });
  return data;
}

export async function createAdminProduct(payload) {
  const { data } = await api.post('/admin/products/', buildProductFormData(payload));
  return data;
}

export async function updateAdminProduct(id, payload) {
  const { data } = await api.patch(`/admin/products/${id}/`, buildProductFormData(payload));
  return data;
}

export async function deactivateAdminProduct(id) {
  const { data } = await api.delete(`/admin/products/${id}/`);
  return data;
}

export async function deleteAdminProduct(id) {
  const { data } = await api.delete(`/admin/products/${id}/hard-delete/`);
  return data;
}

export function formatProductError(error) {
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
