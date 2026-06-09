import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getMyOrders } from '../api/orders';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { OrderListSkeleton } from '../components/skeletons/OrderListSkeleton';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCurrency } from '../utils/formatCurrency';

function formatOrderDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function MyOrdersPage() {
  usePageTitle('Mes commandes');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const data = await getMyOrders();
        if (!isMounted) {
          return;
        }
        setOrders(data);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }
        setError(caughtError?.response?.data?.detail || caughtError?.message || 'Impossible de charger vos commandes.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Compte"
          title="Mes commandes"
          description="Retrouvez l’historique de vos achats et le statut de chaque commande."
        />

        {loading ? (
          <div className="mt-8">
            <OrderListSkeleton count={4} />
          </div>
        ) : error ? (
          <div className="mt-8">
            <ErrorState description={error} onRetry={() => window.location.reload()} />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Package}
              title="Vous n'avez pas encore de commandes"
              description="Passez votre première commande depuis le catalogue."
              action={
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Voir les produits
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-dark">
                      Commande #{order.id}
                    </p>
                    <p className="text-sm text-text-muted">{formatOrderDate(order.created_at)}</p>
                    <p className="text-lg font-bold text-gold">{formatCurrency(order.total_amount)}</p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-sm text-text-muted">
                      {order.items?.length || 0} article(s)
                    </p>
                  </div>
                </div>

                {order.items?.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-[#F1ECE6] pt-4">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted"
                      >
                        <span className="text-text-dark">
                          {item.product_name} x {item.quantity}
                        </span>
                        <span>{formatCurrency(item.subtotal ?? Number(item.unit_price) * Number(item.quantity))}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
