import api from './axios';

export async function initiatePayment(orderId, paymentToken) {
  const payload = { order_id: orderId };

  if (paymentToken) {
    payload.payment_token = paymentToken;
  }

  const { data } = await api.post('/payments/initiate/', payload);
  return data;
}

export function formatPaymentError(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Impossible d'initier le paiement.";
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  return "Impossible d'initier le paiement.";
}
