import { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';

import { getAdminCustomers } from '../../api/adminCustomers';
import { AdminPage } from '../../components/admin/AdminPage';
import { ErrorState } from '../../components/ErrorState';
import { TableSkeleton } from '../../components/skeletons/TableSkeleton';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomersPage() {
  usePageTitle('Admin clients');

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      setLoading(true);
      setError('');

      try {
        const data = await getAdminCustomers();
        if (!isMounted) {
          return;
        }
        setCustomers(data);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }
        setError(
          caughtError?.response?.data?.detail
            || caughtError?.message
            || 'Impossible de charger les clients.',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminPage
      title="Clients"
      description="Clients enregistrés et invités regroupés par historique de commandes."
    >
      {loading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : error ? (
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      ) : customers.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-[#E0DBD5] bg-white px-6 py-10 text-center text-sm text-text-muted">
          Aucun client pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[#E0DBD5] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#E0DBD5] bg-[#F8F5F0] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Nom</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Téléphone</th>
                <th className="px-4 py-3 font-semibold">Commandes</th>
                <th className="px-4 py-3 font-semibold">Total dépensé</th>
                <th className="px-4 py-3 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-[#F1ECE6] last:border-0">
                  <td className="px-4 py-3 font-medium text-text-dark">{customer.name}</td>
                  <td className="px-4 py-3 text-text-muted">{customer.email || '—'}</td>
                  <td className="px-4 py-3 text-text-muted">{customer.phone || '—'}</td>
                  <td className="px-4 py-3 text-text-dark">{customer.orders_count}</td>
                  <td className="px-4 py-3 font-semibold text-gold">{formatCurrency(customer.total_spent)}</td>
                  <td className="px-4 py-3">
                    {customer.type === 'guest' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                        <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                        Invité
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#065F46]">
                        Compte
                      </span>
                    )}
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
