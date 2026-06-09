const STATUS_CONFIG = {
  DELIVERED: { bg: '#D1FAE5', text: '#065F46', label: 'Livré' },
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  PROCESSING: { bg: '#FEF3C7', text: '#92400E', label: 'En cours' },
  CONFIRMED: { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmée' },
  SHIPPED: { bg: '#DBEAFE', text: '#1E40AF', label: 'Expédiée' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', label: 'Annulée' },
};

export function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
