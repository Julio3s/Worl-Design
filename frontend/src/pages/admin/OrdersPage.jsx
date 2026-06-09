import { useCallback, useEffect, useState } from 'react';
import { Filter, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getAdminOrders } from '../../api/adminOrders';
import { AdminPage } from '../../components/admin/AdminPage';
import { ErrorState } from '../../components/ErrorState';
import { TableSkeleton } from '../../components/skeletons/TableSkeleton';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

function formatOrderDate(value) {
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

export default function OrdersPage() {
  usePageTitle('Admin commandes');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    statuses: [],
    dateFrom: '',
    dateTo: '',
    minAmount: '',
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {};
    if (filters.statuses.length > 0) {
      params.status = filters.statuses.join(',');
    }
    if (filters.dateFrom) {
      params.date_from = filters.dateFrom;
    }
    if (filters.dateTo) {
      params.date_to = filters.dateTo;
    }
    if (filters.minAmount) {
      params.min_amount = filters.minAmount;
    }

    try {
      const data = await getAdminOrders(params);
      setOrders(Array.isArray(data.results) ? data.results : []);
    } catch (caughtError) {
      setError(
        caughtError?.response?.data?.detail
          || caughtError?.message
          || 'Impossible de charger les commandes.',
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleStatus = (status) => {
    setFilters((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((item) => item !== status)
        : [...current.statuses, status],
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    loadOrders();
  };

  const resetFilters = () => {
    setFilters({
      statuses: [],
      dateFrom: '',
      dateTo: '',
      minAmount: '',
    });
  };

  return (
    <AdminPage
      title="Commandes"
      description="Suivez les commandes clients et invitées, filtrez par statut et par période."
    >
      <form
        onSubmit={handleFilterSubmit}
        className="space-y-4 rounded-[8px] border border-[#E0DBD5] bg-white p-4"
      >
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = filters.statuses.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleStatus(option.value)}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-accent text-white'
                    : 'border border-[#E0DBD5] bg-white text-text-dark hover:border-accent hover:text-accent',
                ].join(' ')}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
            <span>Date début</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
              className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
            <span>Date fin</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
              className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
            <span>Montant minimum</span>
            <input
              type="number"
              min="0"
              value={filters.minAmount}
              onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))}
              className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
              placeholder="0"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filtrer
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-4 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="mt-6">
          <TableSkeleton rows={8} columns={5} />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={loadOrders} />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-[8px] border border-dashed border-[#E0DBD5] bg-white px-6 py-10 text-center text-sm text-text-muted">
          Aucune commande trouvée pour ces filtres.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[8px] border border-[#E0DBD5] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#E0DBD5] bg-[#F8F5F0] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">N°</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#F1ECE6] last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="font-semibold text-accent hover:underline">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {order.is_guest ? (
                        <UserX className="h-4 w-4 text-[#92400E]" aria-hidden="true" title="Commande invité" />
                      ) : null}
                      <span className="text-text-dark">{order.customer_name}</span>
                      {order.is_guest ? (
                        <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#92400E]">
                          Invité
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatOrderDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-gold">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
