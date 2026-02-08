"use client";

import React, { use, useState, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    MapPin,
    ChevronLeft, ArrowRight, Zap, Info,
    Share2, Heart, Lock
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';
import { ReelModal } from '@/components/reels/ReelModal';
import { ReelIcon } from '@/components/reels/ReelIcon';

import { createClient } from '@/utils/supabase/client';
import { Reel } from '@/types/shared';
import { Loader2 } from 'lucide-react';

import { fetchPublicCompanyDetailAction } from '@/app/admin/actions';
import { incrementCompanyViewAction } from '@/app/actions/companies';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const { authStatus, currentUserId, interactions, toggleInteraction, addInteraction, removeInteraction } = useAppStore();

    const [company, setCompany] = useState<any>(null);
    const [companyJobs, setCompanyJobs] = useState<any[]>([]);
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [loginModalMessage, setLoginModalMessage] = useState('');

    useEffect(() => {
        const fetchCompanyData = async () => {
            setLoading(true);

            try {
                // Increment view count (fire and forget)
                incrementCompanyViewAction(id).catch(err => console.error('View increment failed', err));

                // Use Server Action
                const result = await fetchPublicCompanyDetailAction(id);

                if (!result.success || !result.data) {
                    console.error('Error fetching company:', result.error);
                    setLoading(false);
                    return;
                }

                setCompany(result.data.company);
                setCompanyJobs(result.data.jobs);

                const media = result.data.reels || [];
                setReels(media.map((m: any) => ({
                    id: m.id,
                    url: m.public_url,
                    type: m.type === 'youtube' ? 'youtube' : 'file',
                    title: m.title || m.filename,
                    caption: m.caption,
                    description: m.caption,
                    link_url: m.link_url,
                    link_text: m.link_text,
                    likes: 0
                })));
            } catch (err) {
                console.error('Component Fetch Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [id]);

    const isLiked = interactions.some(i => i.type === 'like_company' && i.fromId === currentUserId && i.toId === id);

    const handleAction = (action: () => void, message: string) => {
        if (authStatus !== 'authenticated') {
            setLoginModalMessage(message);
            setIsLoginModalOpen(true);
            return;
        }
        action();
    };

    const toggleLike = () => {
        if (authStatus !== 'authenticated') {
            setLoginModalMessage('企業を「気になる」リストに保存するにはログインが必要です');
            setIsLoginModalOpen(true);
            return;
        }
        toggleInteraction('like_company', currentUserId, id);
        toast.success(isLiked ? '「気になる」を解除しました' : '企業を「気になる」リストに保存しました');
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('共有リンクをクリップボードにコピーしました');
        }).catch(() => {
            toast.error('リンクのコピーに失敗しました');
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-bold">情報を取得中...</p>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <h2 className="text-2xl font-bold text-zinc-800">企業が見つかりませんでした</h2>
                <p className="text-slate-400 mt-2">承認されていないか、削除された可能性があります</p>
                <Link href="/companies" className="mt-4 text-blue-500 font-bold underline">企業一覧に戻る</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white md:bg-zinc-50">
            {/* Header */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-6 py-4 md:px-12">
                <Link href="/companies" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600">
                    <ChevronLeft size={24} />
                </Link>
                <span className="text-sm font-black text-zinc-800 uppercase tracking-tighter">企業詳細</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto md:py-12 md:px-6 space-y-12">
                {/* Profile Card */}
                <section className="bg-white md:rounded-[3rem] md:shadow-2xl md:border border-zinc-50 overflow-hidden">
                    <div className="h-64 md:h-96 relative">
                        {company.cover_image_url ? (
                            <img src={company.cover_image_url} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full ${company.logo_color || 'bg-slate-300'}`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-6 right-6 flex flex-col gap-4 items-end z-20">
                            <button
                                onClick={toggleLike}
                                className={`w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-lg ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            </button>

                            {reels.length > 0 && (
                                <div className="transition-transform hover:scale-110">
                                    <ReelIcon
                                        reels={reels}
                                        fallbackImage={company.cover_image_url}
                                        onClick={() => setIsReelModalOpen(true)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-10 left-10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-4 h-4 rounded-full ${company.logo_color || 'bg-blue-500'}`} />
                                <span className="text-sm font-bold uppercase tracking-widest opacity-80">{company.industry}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tight">{company.name}</h2>
                            <div className="flex items-center gap-2 mt-4 text-zinc-300 text-sm font-bold">
                                <MapPin size={16} />
                                {company.location}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-12">
                        {/* About Section */}
                        <div className="max-w-3xl space-y-4">
                            <h3 className="text-2xl font-black text-zinc-800">愛媛の土地で、私たちが目指すこと</h3>
                            <p className="text-zinc-600 leading-relaxed font-medium">
                                {company.description}
                                {company.business_content && (
                                    <span className="block mt-4">{company.business_content}</span>
                                )}
                            </p>
                        </div>

                        {/* RJP Section */}
                        <div
                            className={`bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden transition-all ${authStatus !== 'authenticated' ? 'cursor-pointer hover:bg-orange-100' : ''}`}
                            onClick={() => {
                                if (authStatus !== 'authenticated') {
                                    handleAction(() => { }, '企業の「本音（RJP）」を閲覧するにはログインが必要です。');
                                }
                            }}
                        >
                            <div className="absolute top-0 right-0 p-8 text-orange-200/50">
                                <Info size={120} strokeWidth={3} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-2xl font-black text-orange-900 flex items-center gap-3">
                                    <Zap className="text-orange-500" />
                                    本音でお話しします（RJP）
                                </h3>

                                {authStatus === 'authenticated' ? (
                                    <>
                                        <p className="text-orange-900/80 text-lg font-bold italic leading-relaxed max-w-2xl">
                                            「{company.rjp_negatives || company.rjpNegatives || '完璧な会社はありません。真実を語ることで、より良いマッチングを目指しています。'}」
                                        </p>
                                        <p className="text-orange-700/60 text-xs font-bold uppercase tracking-widest">
                                            完璧な会社はありません。この不完全さに、あなたの力が加わることを期待しています。
                                        </p>
                                    </>
                                ) : (
                                    <div className="py-8 flex flex-col items-center justify-center space-y-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/50 relative">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
                                            <p className="text-orange-900 font-bold blur-[2px] leading-relaxed italic p-12">
                                                {company.rjp_negatives || 'Secret Truth'} {company.rjp_negatives || 'Secret Truth'}
                                            </p>
                                        </div>
                                        <div className="relative z-20 flex flex-col items-center">
                                            <div className="bg-orange-500 text-white p-3 rounded-full mb-4 shadow-lg shadow-orange-500/20">
                                                <Lock size={24} />
                                            </div>
                                            <p className="text-orange-900 font-black text-lg">会員限定公開</p>
                                            <p className="text-orange-700/70 text-sm font-bold mt-1">ログインして企業の「本音」を見る</p>
                                            <div className="mt-6 px-8 py-3 bg-orange-900 text-white rounded-full font-black text-sm shadow-xl flex items-center gap-2">
                                                内容をチェック <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* Corporate Profile Table */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                            <h3 className="text-2xl font-black text-zinc-800 mb-8 border-l-4 border-blue-600 pl-4">
                                会社概要
                            </h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">設立</dt>
                                    <dd className="text-base font-bold text-slate-800">{company.established_date || '-'}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-4">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">資本金</dt>
                                    <dd className="text-base font-bold text-slate-800">{company.capital || '-'}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-4">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">従業員数</dt>
                                    <dd className="text-base font-bold text-slate-800">{company.employee_count || '-'}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-4">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">代表者</dt>
                                    <dd className="text-base font-bold text-slate-800">{company.representative_name || company.representative || '-'}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-4 md:col-span-2">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">所在地</dt>
                                    <dd className="text-base font-bold text-slate-800">{company.location || company.address || '-'}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-4 md:col-span-2">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">福利厚生</dt>
                                    <dd className="text-base font-medium text-slate-700">{company.benefits || '-'}</dd>
                                </div>
                                <div className="pt-2 md:col-span-2">
                                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Webサイト</dt>
                                    <dd>
                                        <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                            {company.website_url || '-'} <ArrowRight size={14} />
                                        </a>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Jobs from this company */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-zinc-800 italic">掲載中のクエスト</h3>
                                <span className="text-zinc-400 font-bold text-sm tracking-widest">{companyJobs.length} Quests Available</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {companyJobs.map((job) => (
                                    <Link key={job.id} href={`/jobs/${job.id}`}>
                                        <div className="bg-zinc-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 p-6 rounded-[2rem] border border-zinc-100 transition-all flex justify-between items-center group">
                                            <div>
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{job.category}</span>
                                                <h4 className="text-lg font-bold text-zinc-800 mt-1">{job.title}</h4>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Contact (Simulated) */}
            <footer className="bg-zinc-900 py-16 px-8 text-center mt-12">
                <h4 className="text-white text-3xl font-black italic mb-8">この企業に興味がありますか？</h4>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <button
                        onClick={() => toast.success('公式SNSをフォローしました')}
                        className="bg-amber-400 text-zinc-900 px-12 py-4 rounded-full font-black hover:bg-yellow-400 transition-all"
                    >
                        公式SNSをフォローする
                    </button>
                    <button
                        onClick={() => {
                            toast.info('採用サイトへ遷移します');
                            window.open(company.website_url || 'https://eis-reach.com', '_blank');
                        }}
                        className="bg-white/10 text-white border border-white/20 px-12 py-4 rounded-full font-black hover:bg-white/20 transition-all"
                    >
                        採用HPを見る
                    </button>
                </div>
            </footer>

            <LoginPromptModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                message={loginModalMessage}
            />

            <ReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
                reels={reels}
                entityName={company.name}
                entityId={company.id}
                entityType="company"
                companyId={company.id}
            />
        </div>
    );
}
