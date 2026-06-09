import api from './axios';

function appendCustomerFields(formData, customer) {
  formData.append('name', customer.name);
  formData.append('email', customer.email);
  formData.append('phone', customer.phone);
  formData.append('delivery_address', customer.delivery_address);

  if (customer.note) {
    formData.append('note', customer.note);
  }
}

export async function createOrder({ customer, items, customFiles = {} }) {
  const formData = new FormData();
  appendCustomerFields(formData, customer);

  items.forEach((item, index) => {
    formData.append(`items[${index}][product_id]`, String(item.productId));
    formData.append(`items[${index}][quantity]`, String(item.quantity));

    if (item.customText) {
      formData.append(`items[${index}][custom_text]`, item.customText);
    }

    const customFile = customFiles[item.key];
    if (customFile) {
      formData.append(`items[${index}][custom_file]`, customFile);
    }
  });

  const { data } = await api.post('/orders/', formData);
  return data;
}

export function formatOrderError(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'Impossible de créer la commande.';
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  const messages = [];

  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      messages.push(`${field}: ${value.join(', ')}`);
      return;
    }

    if (typeof value === 'string') {
      messages.push(`${field}: ${value}`);
      return;
    }

    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([nestedField, nestedValue]) => {
        if (Array.isArray(nestedValue)) {
          messages.push(`${nestedField}: ${nestedValue.join(', ')}`);
        }
      });
    }
  });

  return messages.join(' ') || 'Impossible de créer la commande.';
}

export async function getMyOrders() {
  const { data } = await api.get('/orders/mine/');
  return Array.isArray(data) ? data : [];
}
