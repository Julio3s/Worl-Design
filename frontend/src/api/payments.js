import api from './axios';

export async function initiatePayment(orderId) {
  const { data } = await api.post('/payments/initiate/', { order_id: orderId });
  return data;
}

export function formatPaymentError(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'Impossible d’initier le paiement.';
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  return 'Impossible d’initier le paiement.';
}
