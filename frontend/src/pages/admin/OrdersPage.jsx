import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Trash2, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { deleteAdminOrder, getAdminOrders } from '../../api/adminOrders';
import { AdminPage } from '../../components/admin/AdminPage';
import { ErrorState } from '../../components/ErrorState';
import FilterDrawer from '../../components/FilterDrawer';
import { TableSkeleton } from '../../components/skeletons/TableSkeleton';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToastStore } from '../../store/toastStore';
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
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [filters, setFilters] = useState({
    statuses: [],
    dateFrom: '',
    dateTo: '',
    minAmount: '',
  });
  const showToast = useToastStore((state) => state.showToast);

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

  const handleDeleteOrder = async (order) => {
    const confirmed = window.confirm(`Supprimer la commande #${order.id} ?`);
    if (!confirmed) {
      return;
    }

    setDeletingOrderId(order.id);
    try {
      await deleteAdminOrder(order.id);
      showToast(`Commande #${order.id} supprimée.`);
      await loadOrders();
    } catch (caughtError) {
      showToast(
        caughtError?.response?.data?.detail || 'Impossible de supprimer la commande.',
        'error',
      );
    } finally {
      setDeletingOrderId(null);
    }
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
      <div className="flex items-center justify-end">
        <FilterDrawer label="Filtrer ici">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
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

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Appliquer
              </button>
              <button
                type="button"
                onClick={() => { resetFilters(); }}
                className="inline-flex items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-4 py-2.5 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
              >
                Reset
              </button>
            </div>
          </form>
        </FilterDrawer>
      </div>

      {loading ? (
        <div className="mt-6">
          <TableSkeleton rows={8} columns={9} />
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
          {/* Version Desktop - Tableau */}
          <table className="hidden md:table min-w-full text-left text-sm">
            <thead className="border-b border-[#E0DBD5] bg-[#F8F5F0] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">N°</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Livraison</th>
                <th className="px-4 py-3 font-semibold">Personnalisation</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b border-[#F1ECE6] transition hover:bg-[#F8F5F0] last:border-0"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <td className="px-4 py-3 font-semibold text-accent">#{order.id}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {order.is_guest ? (
                        <UserX className="h-4 w-4 text-[#92400E]" aria-hidden="true" title="Commande invité" />
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-text-dark">{order.customer_name}</p>
                        <p className="text-xs text-text-muted">{order.is_guest ? 'Commande invitée' : 'Compte client'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs leading-5 text-text-muted">
                    <p>{order.email || '—'}</p>
                    <p>{order.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs leading-5 text-text-muted">
                    {order.delivery_address || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs leading-5 text-text-muted">
                    {order.custom_text_summary || '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatOrderDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-price">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order)}
                      disabled={deletingOrderId === order.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FEE2E2] text-[#991B1B] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Supprimer la commande ${order.id}`}
                      title="Supprimer la commande"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Version Mobile - Cartes */}
          <div className="divide-y divide-[#F1ECE6] md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="cursor-pointer px-4 py-4 transition hover:bg-[#F8F5F0]"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-accent">#{order.id}</span>
                    {order.is_guest ? (
                      <UserX className="h-3.5 w-3.5 text-[#92400E]" aria-hidden="true" title="Commande invité" />
                    ) : null}
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-text-dark">{order.customer_name}</p>
                  <p className="text-xs text-text-muted">{order.email || '—'} • {order.phone || '—'}</p>
                  {order.delivery_address ? (
                    <p className="text-xs text-text-muted truncate">{order.delivery_address}</p>
                  ) : null}
                  {order.custom_text_summary ? (
                    <p className="text-xs text-text-muted truncate">Perso: {order.custom_text_summary}</p>
                  ) : null}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-text-muted">{formatOrderDate(order.created_at)}</span>
                    <span className="text-sm font-bold text-price">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
