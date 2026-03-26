'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPretzel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorKnot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          stroke="#475569"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#475569"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(val: any, name: string) => [
            `$${Number(val).toLocaleString()}`,
            name === 'pretzel' ? 'Pretzel.io' : 'PretzelKnot',
          ]}
        />
        <Area
          type="monotone"
          dataKey="pretzel"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#colorPretzel)"
        />
        <Area
          type="monotone"
          dataKey="knot"
          stroke="#60a5fa"
          strokeWidth={2}
          fill="url(#colorKnot)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
