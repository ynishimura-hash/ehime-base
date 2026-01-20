import React from 'react';
import { Child } from '@/lib/money-simulation/types';
import { Baby, GraduationCap, Plus, Trash2 } from 'lucide-react';
import NumberInput from '../NumberInput';

interface Props {
    childrenData: Child[];
    onChange: (c: Child[]) => void;
}

export default function FamilyForm({ childrenData, onChange }: Props) {
    const addChild = () => {
        const newChild: Child = {
            id: Math.random().toString(36).substr(2, 9),
            name: `子供 ${childrenData.length + 1}`,
            age: 0,
            educationPlan: {
                kindergarten: 'public',
                elementary: 'public',
                juniorHigh: 'public',
                highSchool: 'public',
                university: 'private_arts'
            }
        };
        onChange([...childrenData, newChild]);
    };

    const updateChild = (index: number, key: keyof Child, val: any) => {
        const updated = [...childrenData];
        updated[index] = { ...updated[index], [key]: val };
        onChange(updated);
    };

    const updatePlan = (index: number, key: keyof Child['educationPlan'], val: any) => {
        const updated = [...childrenData];
        updated[index].educationPlan = { ...updated[index].educationPlan, [key]: val };
        onChange(updated);
    };

    const removeChild = (index: number) => {
        onChange(childrenData.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Baby className="text-pink-500" /> お子様の情報
                </h3>
                <button
                    onClick={addChild}
                    className="flex items-center gap-1 text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-full hover:bg-pink-200 transition"
                >
                    <Plus size={14} /> 追加
                </button>
            </div>

            {childrenData.map((child, index) => (
                <div key={child.id} className="p-4 bg-pink-50 rounded-xl border border-pink-100 relative">
                    <button
                        onClick={() => removeChild(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-2"
                    >
                        <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700">お名前</label>
                            <input
                                className="w-full text-sm p-1 bg-white rounded border border-pink-200 text-slate-900 font-medium"
                                value={child.name}
                                onChange={(e) => updateChild(index, 'name', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700">現在の年齢</label>
                            <NumberInput
                                className="w-full text-sm p-1 bg-white rounded border border-pink-200 text-slate-900 font-medium"
                                value={child.age}
                                onChange={(val) => updateChild(index, 'age', val)}
                                unit="歳"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-1 text-xs font-bold text-slate-800">
                            <GraduationCap size={14} /> 進路プラン
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                            <select
                                value={child.educationPlan.kindergarten}
                                onChange={(e) => updatePlan(index, 'kindergarten', e.target.value)}
                                className="p-1 rounded border border-slate-200 text-slate-900 font-medium"
                            >
                                <option value="public">公立 幼稚園</option>
                                <option value="private">私立 幼稚園</option>
                            </select>
                            <select
                                value={child.educationPlan.elementary}
                                onChange={(e) => updatePlan(index, 'elementary', e.target.value)}
                                className="p-1 rounded border border-slate-200 text-slate-900 font-medium"
                            >
                                <option value="public">公立 小学校</option>
                                <option value="private">私立 小学校</option>
                            </select>
                            <select
                                value={child.educationPlan.juniorHigh}
                                onChange={(e) => updatePlan(index, 'juniorHigh', e.target.value)}
                                className="p-1 rounded border border-slate-200 text-slate-900 font-medium"
                            >
                                <option value="public">公立 中学校</option>
                                <option value="private">私立 中学校</option>
                            </select>
                            <select
                                value={child.educationPlan.highSchool}
                                onChange={(e) => updatePlan(index, 'highSchool', e.target.value)}
                                className="p-1 rounded border border-slate-200 text-slate-900 font-medium"
                            >
                                <option value="public">公立 高校</option>
                                <option value="private">私立 高校</option>
                            </select>
                            <select
                                value={child.educationPlan.university}
                                onChange={(e) => updatePlan(index, 'university', e.target.value)}
                                className="p-1 rounded border border-slate-200 text-slate-900 font-medium"
                            >
                                <option value="national_arts">国公立 (文系)</option>
                                <option value="national_science">国公立 (理系)</option>
                                <option value="private_arts">私立 (文系)</option>
                                <option value="private_science">私立 (理系)</option>
                                <option value="none">進学しない</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
