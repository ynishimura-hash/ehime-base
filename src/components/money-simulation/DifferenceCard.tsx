
"use client";

import React from 'react';
import { formatCurrency, calculateDailyDifference } from '@/lib/money-simulation/calculations';
import { Coins, Coffee, Plane, Home } from 'lucide-react';

interface Props {
    investedTotal: number;
    bankTotal: number;
}

export default function DifferenceCard({ investedTotal, bankTotal }: Props) {
    const difference = investedTotal - bankTotal;
    const dailyDiff = calculateDailyDifference(investedTotal, bankTotal);

    // Daily lifestyle examples based on amount
    const getLifestyleText = (daily: number) => {
        if (daily < 500) return { icon: Coffee, text: "コンビニスイーツを毎日追加できます" };
        if (daily < 1500) return { icon: Coffee, text: "毎日おしゃれなカフェでランチができます" };
        if (daily < 5000) return { icon: Coins, text: "趣味や習い事に自由にお金を使えます" };
        if (daily < 10000) return { icon: Plane, text: "毎月のように近場の旅行を楽しめます" };
        return { icon: Home, text: "生活水準を劇的に向上させられます" };
    };

    const lifestyle = getLifestyleText(dailyDiff);
    const Icon = lifestyle.icon;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Assets Difference */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <p className="text-blue-100 font-bold mb-2">運用した場合の資産差額</p>
                    <div className="text-3xl md:text-4xl font-black mb-1">
                        +{formatCurrency(difference)}
                    </div>
                    <p className="text-sm text-blue-200">
                        預金のみの場合: {formatCurrency(bankTotal)}
                    </p>
                </div>
            </div>

            {/* Daily Difference */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1 text-sm">老後の生活費として使うと...</p>
                        <p className="text-slate-800 font-black text-2xl md:text-3xl mb-1">
                            毎日 +{dailyDiff.toLocaleString()}円
                        </p>

                    </div>
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl group-hover:rotate-12 transition-transform">
                        <Icon size={28} />
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-slate-600 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        {lifestyle.text}
                    </p>
                </div>
            </div>
        </div>
    );
}
