"use client";

import React, { use, useState, useEffect } from 'react';
import {
    Heart, MessageCircle,
    Zap, Info, CheckCircle2,
    ChevronLeft, Share2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import { ConsultModal } from '@/components/modals/ConsultModal';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { Reel } from '@/types/shared';
import { createClient } from '@/utils/supabase/client';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const {
        authStatus,
        currentUserId,
        addInteraction,
        removeInteraction,
        hasInteraction,
        createChat,
        toggleInteraction,
        upsertCompany
    } = useAppStore();

    const [job, setJob] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptMessage, setLoginPromptMessage] = useState('');

    // Reel State
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, companyId?: string }>({ name: '', id: '' });

    useEffect(() => {
        const fetchJobData = async () => {
            setLoading(true);

            // 1. Fetch job details with organization Info
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*, organizations(*)')
                .eq('id', id)
                .single();

            if (jobError || !jobData) {
                console.error('Error fetching job:', jobError);
                setLoading(false);
                return;
            }

            setJob(jobData);
            setCompany(jobData.organizations);

            // 2. Fetch reels (associated with this job OR this company)
            const { data: media } = await supabase
                .from('media_library')
                .select('*')
                .or(`job_id.eq.${id},organization_id.eq.${jobData.organization_id}`);

            const formattedReels = (media || []).map((m: any) => ({
                id: m.id,
                url: m.public_url,
                type: (m.type === 'youtube' ? 'youtube' : 'file') as 'youtube' | 'file',
                title: m.title || m.filename,
                caption: m.caption,
                description: m.caption,
                link_url: m.link_url,
                link_text: m.link_text,
                likes: 0
            }));

            setActiveReels(formattedReels);
            setLoading(false);
        };

        fetchJobData();
    }, [id]);

    const isLiked = hasInteraction('like_job', currentUserId, id);
    const isApplied = hasInteraction('apply', currentUserId, id);

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

    if (!job || !company) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <h2 className="text-2xl font-bold text-zinc-800">クエストが見つかりませんでした</h2>
                <Link href="/jobs" className="mt-4 text-blue-500 font-bold underline">求人一覧に戻る</Link>
            </div>
        );
    }

    const handleApply = () => {
        if (authStatus !== 'authenticated') {
            setLoginPromptMessage('クエストへの参加申請にはログインが必要です');
            setIsLoginPromptOpen(true);
            return;
        }
        if (isApplied) return;
        addInteraction({ type: 'apply', fromId: currentUserId, toId: id });
        toast.success('クエストへの参加を申請しました！\n企業からの連絡をお待ちください');
    };

    const handleConsultClick = () => {
        if (authStatus !== 'authenticated') {
            setLoginPromptMessage('カジュアル面談の申し込みにはログインが必要です');
            setIsLoginPromptOpen(true);
            return;
        }
        setIsConsultModalOpen(true);
    };

    const handleConsultConfirm = async () => {
        setIsConsultModalOpen(false);
        // Ensure company exists in store for Chat UI to resolve name
        upsertCompany(company);
        // Create chat in the unified store
        const chatId = await createChat(company.id, currentUserId, `「${job.title}」について相談がしたいです。`);
        toast.success('カジュアル面談の希望を送信しました');
        router.push(`/messages/${chatId}`);
    };

    const toggleLike = () => {
        if (authStatus !== 'authenticated') {
            setLoginPromptMessage('気になるリストへの保存にはログインが必要です');
            setIsLoginPromptOpen(true);
            return;
        }
        toggleInteraction('like_job', currentUserId, id);
        toast.success(isLiked ? '「気になる」を解除しました' : 'クエストを「気になる」リストに保存しました');
    };

    return (
        <div className="min-h-screen bg-white md:bg-zinc-50 pb-24">
            {/* Header / Nav */}
            <nav className="sticky top-0 md:top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-6 py-4 md:px-12">
                <Link href="/jobs" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-sm font-black tracking-tight text-zinc-800 uppercase">求人詳細</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto md:py-8 md:px-6 space-y-6">
                {/* Main Info Card */}
                <section className="bg-white md:rounded-[2.5rem] md:shadow-xl md:border border-zinc-100 overflow-hidden">
                    <div className="relative h-48 md:h-64 overflow-hidden">
                        {company.cover_image_url ? (
                            <img
                                src={company.cover_image_url}
                                alt={company.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <img src={company.logo_url} alt={company.name} className="w-32 h-32 object-contain opacity-50 grey-filter" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute bottom-6 left-6 text-white px-2 pr-32">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{company.industry}</span>
                            <h2 className="text-2xl md:text-3xl font-black mt-1 leading-tight">{job.title}</h2>
                        </div>

                        <div className="absolute top-6 right-6 flex flex-col gap-4 items-end text-zinc-800">
                            <button
                                onClick={() => {
                                    toggleLike();
                                }}
                                className={`w-12 h-12 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            </button>

                            {activeReels.length > 0 && (
                                <div className="transition-transform hover:scale-110">
                                    <ReelIcon
                                        reels={activeReels}
                                        fallbackImage={company.logo_url}
                                        onClick={() => {
                                            setActiveEntity({ name: job.title, id: job.id, companyId: company.id });
                                            setIsReelModalOpen(true);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 md:p-8 space-y-8">
                        {/* Job Content / Description */}
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Info className="text-blue-600" />
                                仕事内容
                            </h3>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {job.content || job.description || '仕事内容の詳細はありません。'}
                                </p>
                            </div>
                        </div>

                        {/* Recommended Points - Keeping hardcoded for now as placeholders or template features */}
                        <div className="bg-zinc-50 rounded-[2rem] p-6 border border-zinc-100">
                            <div className="flex items-center gap-2 mb-4 text-zinc-800">
                                <CheckCircle2 className="text-amber-400" />
                                <h3 className="text-lg font-black">このクエストのおすすめポイント</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold text-zinc-600">未経験からでも「愛媛のプロ」を目指せる伴走型の指導体制。</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold text-zinc-600">地元愛媛に根付いた、やりがいと確かな技術力が手に入ります。</p>
                                </li>
                            </ul>
                        </div>

                        {/* RJP Section - Login Required */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Info size={20} /></div>
                                <h3 className="text-lg font-black text-zinc-800 italic">正直な不完全さ（RJP）</h3>
                            </div>
                            {authStatus === 'authenticated' ? (
                                <p className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl text-zinc-600 text-sm leading-relaxed italic">
                                    「{company.rjp_negatives || company.rjpNegatives || '完璧な会社はありません。真実を語ることで、より良いマッチングを目指しています。'}」
                                </p>
                            ) : (
                                <div
                                    onClick={() => {
                                        setLoginPromptMessage('企業の本音トークを見るにはログインが必要です');
                                        setIsLoginPromptOpen(true);
                                    }}
                                    className="bg-orange-50/50 border-2 border-orange-200 border-dashed p-6 rounded-2xl cursor-pointer hover:bg-orange-100/50 transition-all group"
                                >
                                    <div className="text-center">
                                        <div className="text-orange-600 mb-2 font-black text-lg">🔒 ログインして本音を見る</div>
                                        <p className="text-sm text-zinc-600">Ehime Baseならではの、企業の「正直な不完全さ」を知ることができます</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Basic Info Table */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-zinc-800 border-l-4 border-slate-900 pl-4">募集要項</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                                    <span className="block text-xs text-zinc-400 font-black uppercase mb-1">給与・報酬</span>
                                    <p className="text-lg font-bold text-zinc-900">{job.salary || job.reward || '経験・能力を考慮の上決定'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border-b md:border-b-0 md:border-r border-zinc-100 pb-4 md:pb-0 md:pr-6">
                                        <span className="block text-xs text-zinc-400 font-black uppercase mb-1">勤務時間</span>
                                        <p className="text-base font-bold text-zinc-700">{job.working_hours || job.workingHours || '-'}</p>
                                    </div>
                                    <div className="pb-4 md:pb-0">
                                        <span className="block text-xs text-zinc-400 font-black uppercase mb-1">休日・休暇</span>
                                        <p className="text-base font-bold text-zinc-700">{job.holidays || '-'}</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                                    <span className="block text-xs text-zinc-400 font-black uppercase mb-1">待遇・福利厚生</span>
                                    <p className="text-sm font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap">{job.welfare || company.benefits || '-'}</p>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                                    <span className="block text-xs text-zinc-400 font-black uppercase mb-1">選考フロー</span>
                                    <p className="text-sm font-bold text-zinc-700">{job.selection_process || job.selectionProcess || '-'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                                    <div>
                                        <span className="block text-xs text-zinc-400 font-black uppercase mb-1">勤務地</span>
                                        <p className="text-sm font-bold text-zinc-700">{job.location || company.location}</p>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-zinc-400 font-black uppercase mb-1">カテゴリ</span>
                                        <p className="text-sm font-bold text-zinc-700">{job.category}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating Action Bar (Mobile Only Style or Shared) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-50">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => {
                            toggleLike();
                        }}
                        className={`hidden md:flex flex-col items-center justify-center p-2 hover:text-zinc-600 ${isLiked ? 'text-red-500' : 'text-zinc-400'}`}
                    >
                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                        <span className="text-[10px] font-black">{isLiked ? '保存済み' : '気になる'}</span>
                    </button>

                    <button
                        onClick={handleApply}
                        disabled={isApplied}
                        className={`flex-1 font-black py-4 rounded-2xl md:rounded-3xl transition-all flex items-center justify-center gap-2 shadow-xl ${isApplied ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200'}`}
                    >
                        {isApplied ? (
                            <>
                                <CheckCircle2 size={20} />
                                申し込み済み
                            </>
                        ) : (
                            <>
                                <Zap size={20} className="text-eis-yellow" />
                                クエストに参加する
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleConsultClick}
                        className="w-14 h-14 md:w-auto md:px-8 bg-eis-yellow text-zinc-900 font-black rounded-2xl md:rounded-3xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-100"
                    >
                        <MessageCircle size={24} />
                        <span className="hidden md:block">カジュアル面談を希望する</span>
                    </button>
                </div>
            </div>

            <ConsultModal
                isOpen={isConsultModalOpen}
                onClose={() => setIsConsultModalOpen(false)}
                onConfirm={handleConsultConfirm}
                companyName={company.name}
            />

            <LoginPromptModal
                isOpen={isLoginPromptOpen}
                onClose={() => setIsLoginPromptOpen(false)}
                message={loginPromptMessage}
            />

            <ReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
                reels={activeReels}
                entityName={activeEntity.name}
                entityId={activeEntity.id}
                entityType="job"
                companyId={activeEntity.companyId}
            />
        </div >
    );
}
