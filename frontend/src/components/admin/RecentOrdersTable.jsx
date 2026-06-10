import { UserX } from 'lucide-react';

import { OrderStatusBadge } from '../OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';

function formatOrderDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecentOrdersTable({ orders }) {
  if (!orders?.length) {
    return (
      <div className="rounded-[8px] border border-dashed border-[#E0DBD5] bg-white px-6 py-10 text-center text-sm text-text-muted">
        Aucune commande récente.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#E0DBD5] bg-white">
      <table className="min-w-full text-left text-sm">
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
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-[#F1ECE6] last:border-0">
              <td className="px-4 py-3 font-medium text-text-dark">#{order.id}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {order.is_guest ? (
                    <UserX className="h-4 w-4 text-[#92400E]" aria-hidden="true" title="Commande invité" />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium text-text-dark">{order.customer_name}</p>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
