import { OrderStatusBadge } from '../OrderStatusBadge';

const FLOW = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const FLOW_LABELS = {
  PENDING: 'Commande reçue',
  CONFIRMED: 'Commande confirmée',
  SHIPPED: 'Commande expédiée',
  DELIVERED: 'Commande livrée',
  CANCELLED: 'Commande annulée',
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStepDate(step, order) {
  if (step === 'PENDING') {
    return order.created_at;
  }

  if (order.status === step) {
    return order.updated_at;
  }

  const currentIndex = FLOW.indexOf(order.status);
  const stepIndex = FLOW.indexOf(step);
  if (currentIndex >= 0 && stepIndex >= 0 && currentIndex > stepIndex) {
    return order.updated_at;
  }

  return null;
}

function isStepReached(step, order) {
  if (order.status === 'CANCELLED') {
    return step === 'PENDING';
  }

  const currentIndex = FLOW.indexOf(order.status);
  const stepIndex = FLOW.indexOf(step);
  return currentIndex >= 0 && stepIndex >= 0 && currentIndex >= stepIndex;
}

export function OrderStatusTimeline({ order }) {
  const steps = order.status === 'CANCELLED'
    ? ['PENDING', 'CANCELLED']
    : FLOW;

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const reached = isStepReached(step, order) || step === order.status;
        const isCurrent = step === order.status;

        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={[
                  'grid h-8 w-8 place-items-center rounded-full border text-xs font-bold',
                  reached ? 'border-accent bg-accent text-white' : 'border-[#E0DBD5] bg-white text-text-muted',
                ].join(' ')}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span className="mt-1 h-full min-h-8 w-px bg-[#E0DBD5]" />
              ) : null}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-text-dark">{FLOW_LABELS[step]}</p>
                {isCurrent ? <OrderStatusBadge status={step} /> : null}
              </div>
              <p className="mt-1 text-sm text-text-muted">{formatDate(getStepDate(step, order))}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
