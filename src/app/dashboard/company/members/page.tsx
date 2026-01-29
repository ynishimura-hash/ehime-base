
"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { User, Mail, Link as LinkIcon, Plus, Copy, Check } from 'lucide-react';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';

interface Member {
    id: string; // organization_member id
    role: string;
    joined_at: string;
    profiles: {
        full_name: string;
        email: string;
        avatar_url: string;
        gender?: string;
    };
}

interface Invitation {
    id: string;
    token: string;
    role: string;
    expires_at: string;
    created_at: string;
    is_used: boolean;
}

export default function CompanyMembersPage() {
    const { currentCompanyId } = useAppStore();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteUrl, setInviteUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (currentCompanyId) {
            fetchMembers();
            fetchInvitations();
        }
    }, [currentCompanyId]);

    const fetchMembers = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                id, role, joined_at,
                profiles (full_name, email, avatar_url, gender)
            `)
            .eq('organization_id', currentCompanyId)
            .order('joined_at', { ascending: true });

        if (error) console.error(error);
        else setMembers(data as any || []);
        setIsLoading(false);
    };

    const fetchInvitations = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('organization_invitations')
            .select('*')
            .eq('organization_id', currentCompanyId)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString()) // Only valid ones
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setInvitations(data || []);
    };

    const generateInvite = async () => {
        setIsGenerating(true);
        const supabase = createClient();

        // 1. Generate Token (Simple for MVP)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        // 2. Insert
        const { data, error } = await supabase
            .from('organization_invitations')
            .insert([{
                organization_id: currentCompanyId,
                token: token,
                role: 'member',
                expires_at: expiresAt.toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error(error);
            toast.error('招待リンクの発行に失敗しました');
        } else {
            const link = `${window.location.origin}/invite/${token}`;
            setInviteUrl(link);
            fetchInvitations();
            toast.success('招待リンクを発行しました');
        }
        setIsGenerating(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('リンクをコピーしました');
    };

    if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Loading Members...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">メンバー管理</h2>
                    <p className="text-slate-500 text-sm mt-1">チームメンバーを招待して、採用活動を分担しましょう</p>
                </div>
                <button
                    onClick={generateInvite}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
                >
                    <Plus size={18} />
                    {isGenerating ? '発行中...' : 'メンバーを招待'}
                </button>
            </div>

            {/* Invite Link Area (Visible when generated) */}
            {inviteUrl && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                        <Check size={20} /> 招待リンクを発行しました
                    </h3>
                    <p className="text-xs text-green-700/80 mb-4 font-bold">このリンクを招待したい相手に共有してください（有効期限: 7日間）</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={inviteUrl}
                            className="flex-1 bg-white border border-green-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 focus:outline-none"
                        />
                        <button
                            onClick={() => copyToClipboard(inviteUrl)}
                            className="bg-green-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2"
                        >
                            <Copy size={18} /> コピー
                        </button>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-slate-400" /> 現在のメンバー
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {members.map(member => (
                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                    <img
                                        src={member.profiles.avatar_url || getFallbackAvatarUrl(member.id, member.profiles.gender)}
                                        alt={member.profiles.full_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.getAttribute('data-error-tried')) {
                                                target.setAttribute('data-error-tried', 'true');
                                                target.src = getFallbackAvatarUrl(member.id, member.profiles.gender);
                                            } else {
                                                target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.profiles.full_name || 'U') + '&background=random';
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{member.profiles.full_name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{member.profiles.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${member.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {member.role === 'admin' ? '管理者' : 'メンバー'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Invitations */}
            {invitations.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Mail className="text-slate-400" /> 保留中の招待
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {invitations.map(invite => (
                            <div key={invite.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 mb-1">招待リンク</p>
                                    <p className="text-xs text-slate-400 font-mono">.../invite/{invite.token.substring(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 mb-1">有効期限</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(invite.expires_at).toLocaleDateString()} まで
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
