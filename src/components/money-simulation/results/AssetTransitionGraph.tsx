import React from 'react';
import { YearlyCashFlow } from '@/lib/money-simulation/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    data: YearlyCashFlow[];
    isLogScale?: boolean;
    maxDisplayAge?: number;
}

const formatYAxis = (tick: number) => {
    if (tick === 0) return '0';
    if (tick >= 10000) return (tick / 10000) + '万';
    return String(tick);
};

export default function AssetTransitionGraph({ data, isLogScale = false, maxDisplayAge = 100 }: Props) {
    // Filter data based on maxDisplayAge
    // Filter data based on maxDisplayAge and sanitize for Log Scale (Recharts crashes on 0 with log)
    const displayData = data
        .filter(d => d.age <= maxDisplayAge)
        .map(d => isLogScale ? {
            ...d,
            totalAssets: Math.max(d.totalAssets, 1),
            totalAssetsSavingsOnly: d.totalAssetsSavingsOnly ? Math.max(d.totalAssetsSavingsOnly, 1) : 1
        } : d);

    return (
        <div className="h-80 w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-500 mb-4 text-center">
                資産の推移 (運用 vs 現金)
                {isLogScale && <span className="ml-2 text-xs text-slate-400 font-normal">※対数表示</span>}
            </h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748B" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="age"
                        tick={{ fontSize: 11, fill: '#334155' }} // Darker text
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatYAxis}
                        tick={{ fontSize: 11, fill: '#334155' }}
                        scale={isLogScale ? 'log' : 'auto'}
                        domain={isLogScale ? ['dataMin', 'auto'] : [0, 'auto']}
                        allowDataOverflow
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value) : ''}
                        labelFormatter={(v) => `${v}歳`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                    <Area type="monotone" dataKey="totalAssets" name="資産運用した場合" stroke="#8b5cf6" fill="url(#colorTotal)" strokeWidth={2} />
                    <Area type="monotone" dataKey="totalAssetsSavingsOnly" name="現金のみの場合" stroke="#64748B" fill="url(#colorSavings)" strokeDasharray="3 3" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
