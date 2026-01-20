"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, ChevronRight, Save } from 'lucide-react';

export default function ProfileEditPage() {
    const { users, currentUserId, updateUser } = useAppStore();

    const currentUser = users.find(u => u.id === currentUserId);
    const router = useRouter();

    const [form, setForm] = useState({
        name: currentUser?.name || '',
        university: currentUser?.university || '',
        bio: currentUser?.bio || '',
        faculty: currentUser?.faculty || '',
        graduationYear: currentUser?.graduationYear || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (!currentUser) return;
        updateUser(currentUserId, form);
        router.back();
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-slate-800">プロフィール編集</span>
                <button onClick={handleSave} className="w-10 h-10 bg-eis-blue/10 text-eis-blue rounded-full flex items-center justify-center font-bold">
                    <Save size={20} />
                </button>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">
                {/* Image Upload */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={currentUser.image}
                            alt={currentUser.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center border-2 border-white">
                            <Camera size={14} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">お名前</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">大学名</label>
                        <input
                            type="text"
                            name="university"
                            value={form.university}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">学部</label>
                            <input
                                type="text"
                                name="faculty"
                                value={form.faculty}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">卒業予定</label>
                            <input
                                type="text"
                                name="graduationYear"
                                value={form.graduationYear}
                                onChange={handleChange}
                                placeholder="2027年"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">自己紹介</label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
                        変更を保存する
                    </button>
                </div>
            </div>
        </div>
    );
}
