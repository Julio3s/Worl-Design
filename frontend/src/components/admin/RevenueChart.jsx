import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '../../utils/formatCurrency';

export function RevenueChart({ data }) {
  const chartData = (data || []).map((point) => ({
    ...point,
    revenue: Number(point.revenue || 0),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[8px] border border-dashed border-[#E0DBD5] bg-white text-sm text-text-muted">
        Aucune donnée de chiffre d'affaires pour cette période.
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-[8px] border border-[#E0DBD5] bg-white p-3 sm:h-72 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E0DBD5" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            axisLine={{ stroke: '#E0DBD5' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            axisLine={{ stroke: '#E0DBD5' }}
            tickLine={false}
            width={72}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelStyle={{ color: '#1A1A1A', fontWeight: 600 }}
            contentStyle={{
              borderRadius: 8,
              borderColor: '#E0DBD5',
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#E94560"
            strokeWidth={3}
            dot={{ r: 3, fill: '#E94560' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
