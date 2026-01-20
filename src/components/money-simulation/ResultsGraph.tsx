
"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { YearlyResult, formatCurrency } from '@/lib/money-simulation/calculations';

interface Props {
    data: YearlyResult[];
}

export default function ResultsGraph({ data }: Props) {
    // Determine max value for Y-axis domain to make it look nice
    const maxVal = Math.max(...data.map(d => d.invested));

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-700 mb-4">資産推移シミュレーション</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="age"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            unit="歳"
                        />
                        <YAxis
                            tickFormatter={(value) => (value / 10000) + '万'}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={50}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [formatCurrency(value), '']}
                            labelFormatter={(label) => `${label}歳時点`}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area
                            type="monotone"
                            dataKey="bank"
                            name="預金のみ(0.001%)"
                            stroke="#64748b"
                            fillOpacity={1}
                            fill="url(#colorBank)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="invested"
                            name="投資運用"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorInvested)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
