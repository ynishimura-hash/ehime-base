'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Target, MapPin, Building2, Banknote, Save } from 'lucide-react';

export default function ProfileEditConditionsPage() {
    const { users, currentUserId, updateUser } = useAppStore();
    const router = useRouter();

    const currentUser = users.find(u => u.id === currentUserId);

    // Initial State
    const [salary, setSalary] = useState(currentUser?.desiredConditions?.salary || '');
    // Simple strings/arrays for now
    const [locations, setLocations] = useState<string[]>(currentUser?.desiredConditions?.location || []);
    const [industries, setIndustries] = useState<string[]>(currentUser?.desiredConditions?.industry || []);

    useEffect(() => {
        if (currentUser) {
            setSalary(currentUser.desiredConditions?.salary || '');
            setLocations(currentUser.desiredConditions?.location || []);
            setIndustries(currentUser.desiredConditions?.industry || []);
        }
    }, [currentUser]);

    if (!currentUser) return null;

    const handleSave = () => {
        updateUser(currentUserId, {
            desiredConditions: {
                ...currentUser.desiredConditions,
                salary,
                location: locations,
                industry: industries
            }
        });
        router.push('/mypage/profile-checklist');
    };

    const toggleLocation = (loc: string) => {
        if (locations.includes(loc)) {
            setLocations(locations.filter(l => l !== loc));
        } else {
            setLocations([...locations, loc]);
        }
    };

    const toggleIndustry = (ind: string) => {
        if (industries.includes(ind)) {
            setIndustries(industries.filter(i => i !== ind));
        } else {
            setIndustries([...industries, ind]);
        }
    };

    const PREF_REGIONS = ['中予', '東予', '南予'];
    const INDUSTRIES_LIST = ['IT・通信', 'メーカー', '商社', 'サービス', '金融', '公務員'];
    const SALARY_RANGES = ['300万円〜', '400万円〜', '500万円〜', '600万円〜', 'こだわらない'];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-slate-800">希望条件</span>
                <button onClick={handleSave} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                    <Save size={20} />
                </button>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">

                {/* Location */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                            <MapPin size={20} />
                        </div>
                        <h2 className="font-black text-lg">希望勤務地 (愛媛県内)</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {PREF_REGIONS.map(loc => (
                            <button
                                key={loc}
                                onClick={() => toggleLocation(loc)}
                                className={`py-3 rounded-xl font-bold text-sm transition-all border-2 relative overflow-hidden ${locations.includes(loc)
                                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                {loc}
                                {locations.includes(loc) && (
                                    <div className="absolute top-1 right-1 text-orange-500">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Industry */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                            <Building2 size={20} />
                        </div>
                        <h2 className="font-black text-lg">希望業種</h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {INDUSTRIES_LIST.map(ind => (
                            <button
                                key={ind}
                                onClick={() => toggleIndustry(ind)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all border-2 ${industries.includes(ind)
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                {ind}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Salary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                            <Banknote size={20} />
                        </div>
                        <h2 className="font-black text-lg">希望年収</h2>
                    </div>

                    <div className="space-y-2">
                        {SALARY_RANGES.map(range => (
                            <button
                                key={range}
                                onClick={() => setSalary(range)}
                                className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm transition-all border-2 flex items-center justify-between ${salary === range
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                {range}
                                {salary === range && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleSave} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
                    保存して戻る
                </button>
            </div>
        </div>
    );
}
