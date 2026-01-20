
"use client";

import React from 'react';
import { SimulationInput } from '@/lib/money-simulation/calculations';
import { Calculator, Calendar, PiggyBank, TrendingUp, DollarSign } from 'lucide-react';

interface Props {
    input: SimulationInput;
    onChange: (input: SimulationInput) => void;
}

export default function SimulationForm({ input, onChange }: Props) {
    const handleChange = (key: keyof SimulationInput, value: number) => {
        onChange({ ...input, [key]: value });
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 space-y-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                    <Calculator size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">シミュレーション条件</h2>
            </div>

            <div className="space-y-6">
                {/* Current Age */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            <span>現在の年齢</span>
                        </div>
                        <span className="text-blue-600 text-lg">{input.currentAge}歳</span>
                    </div>
                    <input
                        type="range"
                        min={18}
                        max={input.retirementAge - 1}
                        value={input.currentAge}
                        onChange={(e) => handleChange('currentAge', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Retirement Age */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-500" />
                            <span>引退年齢</span>
                        </div>
                        <span className="text-purple-600 text-lg">{input.retirementAge}歳</span>
                    </div>
                    <input
                        type="range"
                        min={input.currentAge + 1}
                        max={80}
                        value={input.retirementAge}
                        onChange={(e) => handleChange('retirementAge', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>

                {/* Monthly Contribution */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                            <PiggyBank size={16} className="text-emerald-500" />
                            <span>毎月の積立額</span>
                        </div>
                        <span className="text-emerald-600 text-lg">{(input.monthlyContribution / 10000).toFixed(1)}万円</span>
                    </div>
                    <input
                        type="range"
                        min={1000}
                        max={300000}
                        step={1000}
                        value={input.monthlyContribution}
                        onChange={(e) => handleChange('monthlyContribution', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>1,000円</span>
                        <span>30万円</span>
                    </div>
                </div>

                {/* Initial Savings */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-orange-500" />
                            <span>初期貯蓄額</span>
                        </div>
                        <span className="text-orange-600 text-lg">{(input.initialSavings / 10000).toFixed(0)}万円</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={20000000}
                        step={10000}
                        value={input.initialSavings}
                        onChange={(e) => handleChange('initialSavings', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>


                {/* Investment Rate */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-pink-500" />
                            <span>想定年利回り</span>
                        </div>
                        <span className="text-pink-600 text-lg">{input.investmentRate}%</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={15}
                        step={0.1}
                        value={input.investmentRate}
                        onChange={(e) => handleChange('investmentRate', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <p className="text-xs text-slate-400">※ 一般的なインデックス投資の平均リターンは4〜7%と言われています</p>
                </div>
            </div>
        </div>
    );
}
