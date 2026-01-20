"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import { User, Mail, Shield, Trash2, Plus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function MemberManagementPage() {
    const { users, currentCompanyId, createInvitation } = useAppStore();
    const [inviteLink, setInviteLink] = useState<string | null>(null);

    // Mock: Get members of current company (In reality, filter by organization_members table)
    // For now, listing some mock users as "members"
    const members = users.slice(0, 3); // Mock content

    const handleCreateInvite = () => {
        const token = createInvitation(currentCompanyId);
        // In prod: domain would be dynamic or env var
        const link = `${window.location.origin}/organizations/join?token=${token}`;
        setInviteLink(link);
        toast.success('招待リンクを生成しました');
    };

    const copyToClipboard = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        toast.success('リンクをコピーしました');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-800">メンバー管理</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">所属メンバー</h2>
                        <p className="text-xs text-slate-400 font-bold">チームメンバーの権限管理や削除が行えます</p>
                    </div>
                    <button
                        onClick={handleCreateInvite}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        招待リンクを発行
                    </button>
                </div>

                {inviteLink && (
                    <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs font-bold text-blue-600 mb-2">以下のリンクを招待したいメンバーに共有してください（24時間有効）</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={inviteLink}
                                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-600 font-mono"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="bg-white text-blue-600 border border-blue-200 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{member.name}</div>
                                    <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                        <Mail size={12} />
                                        user@example.com
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Shield size={12} />
                                    管理者
                                </span>
                                <button className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
