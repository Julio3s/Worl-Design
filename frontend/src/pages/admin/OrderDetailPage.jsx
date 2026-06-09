import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import {
  formatAdminOrderError,
  getAdminOrder,
  updateAdminOrderStatus,
} from '../../api/adminOrders';
import { AdminPage } from '../../components/admin/AdminPage';
import { OrderStatusTimeline } from '../../components/admin/OrderStatusTimeline';
import { PaymentStatusBadge } from '../../components/admin/PaymentStatusBadge';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductImage } from '../../utils/media';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-dark sm:max-w-[70%] sm:text-right">{value || '—'}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const showToast = useToastStore((state) => state.showToast);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  usePageTitle(order ? `Commande #${order.id}` : 'Détail commande');

  const loadOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminOrder(id);
      setOrder(data);
      setNextStatus(data.status);
    } catch (caughtError) {
      setError(
        caughtError?.response?.data?.detail
          || caughtError?.message
          || 'Impossible de charger la commande.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!order || !nextStatus || nextStatus === order.status) {
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateAdminOrderStatus(order.id, nextStatus);
      setOrder(updated);
      setNextStatus(updated.status);
      showToast('Statut de commande mis à jour.');
    } catch (caughtError) {
      showToast(formatAdminOrderError(caughtError), 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminPage title="Détail commande">
        <LoadingState label="Chargement de la commande..." />
      </AdminPage>
    );
  }

  if (error || !order) {
    return (
      <AdminPage title="Détail commande">
        <ErrorState description={error || 'Commande introuvable.'} onRetry={loadOrder} />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title={`Commande #${order.id}`}
      description="Consultez les informations client, les articles et le paiement."
    >
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux commandes
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-primary">Informations client</h2>
              {order.is_guest ? (
                <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                  Commande invité
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <InfoRow label="Nom" value={order.customer_name} />
              <InfoRow label="Email" value={order.email} />
              <InfoRow label="Téléphone" value={order.phone} />
              <InfoRow label="Adresse" value={order.delivery_address} />
              {order.note ? <InfoRow label="Note" value={order.note} /> : null}
            </div>
          </section>

          <section className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
            <h2 className="font-display text-xl font-bold text-primary">Articles commandés</h2>
            <ul className="mt-4 space-y-4">
              {order.items?.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-[#F1ECE6] pb-4 last:border-0 last:pb-0">
                  <img
                    src={item.product_image_url || getProductImage(item)}
                    alt={item.product_name || 'Produit'}
                    className="h-16 w-16 rounded-[8px] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-dark">{item.product_name}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {item.quantity} x {formatCurrency(item.unit_price)}
                    </p>
                    {item.custom_text ? (
                      <p className="mt-2 text-sm text-text-muted">
                        Personnalisation : {item.custom_text}
                      </p>
                    ) : null}
                    {item.custom_file_url ? (
                      <a
                        href={item.custom_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                      >
                        Voir le fichier
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                  <p className="font-semibold text-text-dark">{formatCurrency(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-[#E0DBD5] pt-4">
              <span className="text-sm font-medium text-text-muted">Total commande</span>
              <span className="text-xl font-bold text-gold">{formatCurrency(order.total_amount)}</span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-primary">Paiement</h2>
              {order.payment ? <PaymentStatusBadge status={order.payment.status} /> : null}
            </div>

            {order.payment ? (
              <div className="mt-4 space-y-3">
                <InfoRow label="Méthode" value={order.payment.method || 'CinetPay'} />
                <InfoRow label="Statut" value={order.payment.status} />
                <InfoRow label="Référence CinetPay" value={order.payment.cinetpay_transaction_id} />
                <InfoRow label="Montant" value={formatCurrency(order.payment.amount)} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-muted">Aucun paiement enregistré pour cette commande.</p>
            )}
          </section>

          <section className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-primary">Statut</h2>
              <OrderStatusBadge status={order.status} />
            </div>

            <form onSubmit={handleStatusUpdate} className="mt-4 space-y-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                <span>Changer le statut</span>
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value)}
                  className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 outline-none transition focus:border-accent"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={updating || nextStatus === order.status}
                className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? 'Mise à jour...' : 'Confirmer'}
              </button>
            </form>
          </section>

          <section className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
            <h2 className="font-display text-xl font-bold text-primary">Timeline</h2>
            <div className="mt-4">
              <OrderStatusTimeline order={order} />
            </div>
          </section>
        </div>
      </div>
    </AdminPage>
  );
}
