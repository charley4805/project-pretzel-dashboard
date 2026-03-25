import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', users: 4000, active: 2400 },
  { name: 'Tue', users: 4200, active: 2600 },
  { name: 'Wed', users: 4600, active: 3000 },
  { name: 'Thu', users: 4800, active: 3200 },
  { name: 'Fri', users: 5100, active: 3400 },
  { name: 'Sat', users: 5300, active: 2900 },
  { name: 'Sun', users: 5600, active: 3100 },
];

export function GrowthChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
          itemStyle={{ color: '#e2e8f0' }}
        />
        <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
        <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
