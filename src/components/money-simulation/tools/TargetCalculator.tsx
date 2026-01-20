import React, { useState } from 'react';
import { calculateLifePlan } from '@/lib/money-simulation/simulation';
import { LifePlanInput } from '@/lib/money-simulation/types';
import { Calculator, ArrowRight, Target } from 'lucide-react';

interface Props {
    currentInput: LifePlanInput;
}

export default function TargetCalculator({ currentInput }: Props) {
    const [targetAge, setTargetAge] = useState(65);
    const [targetAmount, setTargetAmount] = useState(20000000); // 20M JPY
    const [result, setResult] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const calculateRequiredSavings = () => {
        setIsCalculating(true);
        setTimeout(() => {
            // Binary search for monthly savings
            let low = 0;
            let high = 1000000; // Max 1M/month
            let found = false;
            let bestGuess = 0;

            // Deep clone input to avoid mutating state
            const tempInput: LifePlanInput = JSON.parse(JSON.stringify(currentInput));

            // Identify where to add this "extra savings". 
            // We'll treat it as an increase in "headOfHousehold.annualIncome" (saving from income)
            // OR strictly as "Expense reduction"? 
            // Actually, the prompt is "Required Monthly Savings".
            // In our logic, `surplus = Income - Expenses`.
            // We want to find a `delta` such that `surplus + delta` results in Target.
            // But `surplus` goes to Investment.
            // So essentially we are solving for an increase in Income (or decrease in Expense).
            // Let's call it "Additional Monthly Saving" which mathematically acts like extra Tax-free Income dedicated to investment.

            for (let i = 0; i < 20; i++) { // 20 iterations is enough precision
                const mid = (low + high) / 2;

                // Modify input: Add 'mid * 12' to annual income (simplified way to inject cash flow)
                tempInput.headOfHousehold.annualIncome = currentInput.headOfHousehold.annualIncome + (mid * 12);

                const res = calculateLifePlan(tempInput);

                // Find asset at target age
                const targetYearResults = res.find(r => r.age === targetAge);
                const achieved = targetYearResults ? targetYearResults.totalAssets : 0;

                if (achieved > targetAmount) {
                    high = mid;
                    bestGuess = mid;
                } else {
                    low = mid;
                }
            }

            setResult(Math.round(bestGuess));
            setIsCalculating(false);
        }, 100);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <h3 className="font-bold text-indigo-800 flex items-center gap-2 mb-4">
                <Target size={20} /> 目標達成シミュレーター
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1">何歳時点で？</label>
                    <input
                        type="number"
                        className="w-full p-2 rounded border border-indigo-200"
                        value={targetAge}
                        onChange={(e) => setTargetAge(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1">目標資産額 (円)</label>
                    <input
                        type="number"
                        step={1000000}
                        className="w-full p-2 rounded border border-indigo-200"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <button onClick={() => setTargetAmount(10000000)}>1,000万</button>
                        <button onClick={() => setTargetAmount(20000000)}>2,000万</button>
                        <button onClick={() => setTargetAmount(50000000)}>5,000万</button>
                        <button onClick={() => setTargetAmount(100000000)}>1億</button>
                    </div>
                </div>
            </div>

            <button
                onClick={calculateRequiredSavings}
                disabled={isCalculating}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2"
            >
                {isCalculating ? '計算中...' : '必要な毎月の積立額を計算'}
                <Calculator size={18} />
            </button>

            {result !== null && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-sm font-bold text-slate-500 mb-2">目標達成に必要な追加積立額</p>
                    <div className="text-3xl font-black text-indigo-600 flex items-center justify-center gap-2">
                        <span>月額</span>
                        {result.toLocaleString()}
                        <span className="text-lg text-slate-600">円</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        ※ 現在の収支に加えて、これだけ収入を増やすか節約する必要があります。
                    </p>
                </div>
            )}
        </div>
    );
}
