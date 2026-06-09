const PAYMENT_STATUS_CONFIG = {
  SUCCESS: { bg: '#D1FAE5', text: '#065F46', label: 'Succès' },
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  FAILED: { bg: '#FEE2E2', text: '#991B1B', label: 'Échec' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', label: 'Annulé' },
};

export function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
