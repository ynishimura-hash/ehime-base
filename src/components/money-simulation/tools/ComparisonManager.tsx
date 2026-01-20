import React, { useState } from 'react';
import { LifePlanInput, YearlyCashFlow } from '@/lib/money-simulation/types';
import { Copy, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    baseInput: LifePlanInput;
    baseResults: YearlyCashFlow[];
    compareInput: LifePlanInput | null;
    compareResults: YearlyCashFlow[] | null;
    onStartComparison: () => void;
    onStopComparison: () => void;
}

export default function ComparisonManager({ baseInput, baseResults, compareInput, compareResults, onStartComparison, onStopComparison }: Props) {
    if (!compareInput || !compareResults) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                <h3 className="font-bold text-slate-700 mb-2">シミュレーション比較</h3>
                <p className="text-sm text-slate-500 mb-4">
                    現在のプランを複製して、別のシナリオ（例：家を買った場合、転職した場合）と比較できます。
                </p>
                <button
                    onClick={onStartComparison}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 mx-auto"
                >
                    <Copy size={16} /> 比較プランを作成する
                </button>
            </div>
        );
    }

    // Prepare merged data for graph
    const mergedData = baseResults.map((r, i) => {
        const comp = compareResults[i];
        return {
            age: r.age,
            baseAssets: r.totalAssets,
            compAssets: comp ? comp.totalAssets : 0
        };
    });

    return (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <RefreshCw size={20} className="text-green-400" />
                    シナリオ比較モード
                </h3>
                <button
                    onClick={onStopComparison}
                    className="text-xs text-slate-400 hover:text-white border border-slate-600 px-3 py-1 rounded"
                >
                    比較を終了
                </button>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis tickFormatter={(v) => (v / 10000) + '万'} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'white' }}
                            formatter={(value: number | undefined) => value !== undefined ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value) : ''}
                            labelFormatter={(v) => `${v}歳`}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="baseAssets" name="プランA (青)" stroke="#3B82F6" strokeWidth={2} fillOpacity={0.1} fill="#3B82F6" />
                        <Area type="monotone" dataKey="compAssets" name="プランB (赤)" stroke="#F43F5E" strokeWidth={2} fillOpacity={0.1} fill="#F43F5E" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-300 mb-1">プランA (編集中)</p>
                    <p className="text-xl font-bold text-blue-400">
                        {mergedData[mergedData.length - 1].baseAssets.toLocaleString()}円
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                    <p className="text-xs text-rose-300 mb-1">プランB (比較対象)</p>
                    <p className="text-xl font-bold text-rose-400">
                        {mergedData[mergedData.length - 1].compAssets.toLocaleString()}円
                    </p>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400">
                ※ 現在、左側のフォームで編集しているのは「プランA」です。比較対象の「プランB」を編集するには、一度比較を終了して値を変更し、再度比較を作成してください。
            </p>
        </div>
    );
}
