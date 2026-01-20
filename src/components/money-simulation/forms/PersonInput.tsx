import React from 'react';
import { Person } from '@/lib/money-simulation/types';
import { User, Briefcase } from 'lucide-react';
import MoneyInput from '../MoneyInput';
import NumberInput from '../NumberInput';

interface Props {
    title: string;
    person: Person;
    onChange: (p: Person) => void;
    colorClass: string;
}

export default function PersonInput({ title, person, onChange, colorClass }: Props) {
    const handleChange = (key: keyof Person, val: any) => {
        onChange({ ...person, [key]: val });
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorClass} space-y-4`}>
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700">
                <User size={20} /> {title}
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">現在の年齢</label>
                    <NumberInput
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                        value={person.currentAge}
                        onChange={(val) => handleChange('currentAge', val)}
                        unit="歳"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">引退年齢</label>
                    <NumberInput
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                        value={person.targetRetirementAge}
                        onChange={(val) => handleChange('targetRetirementAge', val)}
                        unit="歳"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">働き方 (年金計算用)</label>
                <select
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                    value={person.employmentType}
                    onChange={(e) => handleChange('employmentType', e.target.value)}
                >
                    <option value="employee">会社員 (厚生年金)</option>
                    <option value="self_employed">自営業 (国民年金)</option>
                    <option value="none">扶養 / なし</option>
                </select>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">昨年の年収 (額面)</label>
                    <MoneyInput
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                        value={person.annualIncome}
                        onChange={(val) => handleChange('annualIncome', val)}
                    />
                </div>
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">年間ボーナス (手取り)</label>
                    <MoneyInput
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                        value={person.annualBonus}
                        onChange={(val) => handleChange('annualBonus', val)}
                    />
                </div>
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">退職金 (見込み)</label>
                    <MoneyInput
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                        value={person.retirementAllowance}
                        onChange={(val) => handleChange('retirementAllowance', val)}
                    />
                </div>
            </div>
        </div>
    );
}
