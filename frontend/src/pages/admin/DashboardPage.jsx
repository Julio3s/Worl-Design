import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { getAdminStats } from '../../api/admin';
import { AdminPage } from '../../components/admin/AdminPage';
import { KpiCard } from '../../components/admin/KpiCard';
import { PeriodSelector } from '../../components/admin/PeriodSelector';
import { RecentOrdersTable } from '../../components/admin/RecentOrdersTable';
import { RevenueChart } from '../../components/admin/RevenueChart';
import { ErrorState } from '../../components/ErrorState';
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatCurrency } from '../../utils/formatCurrency';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function DashboardPage() {
  usePageTitle('Admin dashboard');

  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = useCallback(async (selectedPeriod, silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await getAdminStats(selectedPeriod);
      setStats(data);
    } catch (caughtError) {
      setError(
        caughtError?.response?.data?.detail
          || caughtError?.message
          || 'Impossible de charger les statistiques.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats(period);
  }, [loadStats, period]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadStats(period, true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadStats, period]);

  const kpis = stats?.kpis;

  return (
    <AdminPage
      title="Tableau de bord"
      description="Vue d'ensemble du chiffre d'affaires, des commandes et des clients."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PeriodSelector value={period} onChange={setPeriod} />
        <button
          type="button"
          onClick={() => loadStats(period, true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-full border border-[#E0DBD5] bg-white px-4 py-2 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={() => loadStats(period)} />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard title="CA total période" value={formatCurrency(kpis?.total_revenue)} highlight />
            <KpiCard title="Nombre de commandes" value={kpis?.orders_count ?? 0} />
            <KpiCard title="Nombre de clients" value={kpis?.customers_count ?? 0} />
            <KpiCard title="Panier moyen" value={formatCurrency(kpis?.average_basket)} highlight />
            <KpiCard title="Commandes en attente" value={kpis?.pending_orders ?? 0} pending />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-primary">Chiffre d'affaires</h2>
              <RevenueChart data={stats?.revenue_chart} />
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-primary">### Trafic visiteurs</h2>
              <div className="rounded-lg border border-[#E0DBD5] bg-white p-6">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#F8F5F0] p-4">
                      <p className="text-sm font-medium text-text-muted">Visiteurs</p>
                      <p className="mt-2 text-2xl font-bold text-primary">—</p>
                      <p className="mt-1 text-xs text-text-muted">Connecter Google Analytics 4</p>
                    </div>
                    <div className="rounded-lg bg-[#F8F5F0] p-4">
                      <p className="text-sm font-medium text-text-muted">Pages vues</p>
                      <p className="mt-2 text-2xl font-bold text-primary">—</p>
                      <p className="mt-1 text-xs text-text-muted">Connecter Google Analytics 4</p>
                    </div>
                    <div className="rounded-lg bg-[#F8F5F0] p-4">
                      <p className="text-sm font-medium text-text-muted">Provenance</p>
                      <p className="mt-2 text-sm font-semibold text-primary">Facebook • Google • TikTok</p>
                      <p className="mt-1 text-xs text-text-muted">Connecter Google Analytics 4</p>
                    </div>
                    <div className="rounded-lg bg-[#F8F5F0] p-4">
                      <p className="text-sm font-medium text-text-muted">Taux de conversion</p>
                      <p className="mt-2 text-2xl font-bold text-primary">—</p>
                      <p className="mt-1 text-xs text-text-muted">Connecter Google Analytics 4</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#E94560]/20 bg-[#E94560]/5 p-4">
                    <p className="text-sm font-semibold text-[#E94560]">📊 Configuration Google Analytics 4</p>
                    <p className="mt-2 text-xs text-text-muted">Pour activer le suivi du trafic, consultez la documentation <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">Google Analytics 4</a></p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-primary">10 dernières commandes</h2>
            <RecentOrdersTable orders={stats?.recent_orders} />
          </section>
        </div>
      )}
    </AdminPage>
  );
}
