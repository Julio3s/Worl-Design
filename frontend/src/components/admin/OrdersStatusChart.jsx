import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = {
  DELIVERED: '#065F46',
  PENDING: '#92400E',
  PROCESSING: '#92400E',
  CANCELLED: '#991B1B',
  SHIPPED: '#1E40AF',
  CONFIRMED: '#1E40AF',
};

const STATUS_LABELS = {
  DELIVERED: 'Livré',
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  CANCELLED: 'Annulé',
  SHIPPED: 'Expédié',
  CONFIRMED: 'Confirmée',
};

export function OrdersStatusChart({ data }) {
  const chartData = (data || []).map((entry) => ({
    name: STATUS_LABELS[entry.status] || entry.status,
    status: entry.status,
    value: Number(entry.count || 0),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[8px] border border-dashed border-[#E0DBD5] bg-white text-sm text-text-muted">
        Aucune commande pour cette période.
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-[8px] border border-[#E0DBD5] bg-white p-3 sm:h-72 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6B6B6B'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: '#E0DBD5',
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-text-muted">
        {chartData.map((entry) => (
          <li key={entry.status} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.status] || '#6B6B6B' }}
            />
            {entry.name} ({entry.value})
          </li>
        ))}
      </ul>
    </div>
  );
}
