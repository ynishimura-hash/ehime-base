import React from 'react';
import { YearlyCashFlow } from '@/lib/money-simulation/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface Props {
    data: YearlyCashFlow[];
}

const formatYAxis = (tick: number) => {
    return (tick / 10000) + '万';
};

export default function CashFlowGraph({ data }: Props) {
    return (
        <div className="h-80 w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-500 mb-4 text-center">年間収支の推移</h4>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="age" tick={{ fontSize: 10 }} name="年齢" />
                    <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10 }} />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value) : ''}
                        labelFormatter={(v) => `${v}歳`}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />

                    {/* Expenses Stack */}
                    <Bar dataKey="basicLiving" name="生活費" stackId="expense" fill="#34D399" />
                    <Bar dataKey="housing" name="住居費" stackId="expense" fill="#F97316" />
                    <Bar dataKey="education" name="教育費" stackId="expense" fill="#EC4899" />
                    <Bar dataKey="events" name="一時支出" stackId="expense" fill="#A855F7" />

                    {/* Income Line */}
                    <Line type="monotone" dataKey="totalIncome" name="手取り収入" stroke="#3B82F6" strokeWidth={3} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
