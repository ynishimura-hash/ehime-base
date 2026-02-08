
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, Building, FileText, Star, Save, MessageSquare, Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { toggleApplicationFavoriteAction, updateApplicationMemoAction } from '@/app/admin/actions';
import { useAppStore } from '@/lib/appStore';

interface Application {
    id: string;
    job_id: string;
    user_id: string;
    status: string;
    created_at: string;
    is_favorite: boolean;
    internal_memo: string;
    jobs: { title: string };
    profiles: {
        full_name: string;
        email: string;
        avatar_url: string;
        user_type: string;
        gender?: string;
        university?: string;
        faculty?: string;
        bio?: string;
        skills?: string[];
        qualifications?: string[];
        desired_conditions?: {
            salary?: string;
            location?: string[];
            industry?: string[];
            employmentType?: string[];
        };
        work_history?: { company: string; role: string; duration: string; description: string }[];
        graduation_year?: string;
    };
}

interface ApplicationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application | null;
    onUpdate: () => void; // Refresh parent data
}

export function ApplicationDetailModal({ isOpen, onClose, application, onUpdate }: ApplicationDetailModalProps) {
    const router = useRouter();
    const { currentUserId, currentCompanyId, createChat } = useAppStore();
    const [memo, setMemo] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSavingMemo, setIsSavingMemo] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);

    useEffect(() => {
        if (application) {
            setMemo(application.internal_memo || '');
            setIsFavorite(application.is_favorite || false);
        }
    }, [application]);

    if (!application) return null;

    const handleToggleFavorite = async () => {
        if (!currentUserId) return;

        const newStatus = !isFavorite;
        setIsFavorite(newStatus); // Optimistic update

        const result = await toggleApplicationFavoriteAction(application.id, currentUserId, newStatus);
        if (result.success) {
            toast.success(newStatus ? 'お気に入りに追加しました' : 'お気に入りを解除しました');
            onUpdate();
        } else {
            setIsFavorite(!newStatus); // Revert
            toast.error('お気に入りの更新に失敗しました');
        }
    };

    const handleSaveMemo = async () => {
        if (!currentUserId) return;
        setIsSavingMemo(true);

        const result = await updateApplicationMemoAction(application.id, currentUserId, memo);

        if (result.success) {
            toast.success('社内メモを保存しました');
            onUpdate();
        } else {
            toast.error('メモの保存に失敗しました');
        }
        setIsSavingMemo(false);
    };

    const handleSendMessage = async () => {
        if (!currentUserId || !currentCompanyId) return;
        setIsStartingChat(true);

        try {
            const threadId = await createChat(currentCompanyId, application.user_id);
            if (threadId) {
                router.push(`/dashboard/company/messages?threadId=${threadId}`);
                onClose();
            } else {
                toast.error('チャットの開始に失敗しました');
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            toast.error('チャットの開始に失敗しました');
        } finally {
            setIsStartingChat(false);
        }
    };

    const profile = application.profiles;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative">

                            {/* Header */}
                            <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-200 overflow-hidden shadow-sm border border-white">
                                        <img
                                            src={profile.avatar_url || getFallbackAvatarUrl(application.user_id, profile.gender)}
                                            alt={profile.full_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = getFallbackAvatarUrl(application.user_id, profile.gender);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-black text-zinc-900">{profile.full_name}</h2>
                                            <button
                                                onClick={handleToggleFavorite}
                                                className={`p-1 rounded-full transition-colors ${isFavorite ? 'text-yellow-400 bg-yellow-50' : 'text-zinc-300 hover:text-yellow-400 hover:bg-zinc-100'}`}
                                                title={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
                                            >
                                                <Star fill={isFavorite ? "currentColor" : "none"} size={20} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-bold mt-1">
                                            {profile.university ? `${profile.university} ${profile.faculty || ''}` : '最終学歴未設定'}
                                            <span className="mx-2 text-zinc-300">|</span>
                                            {profile.user_type === 'student' ? '学生' : '求職者'}
                                            {profile.graduation_year && <span className="ml-2 text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">{profile.graduation_year}卒</span>}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                                {/* Left Column: Basic Info & Profile Details */}
                                <div className="md:col-span-2 space-y-8">

                                    {/* 基本情報 */}
                                    <section>
                                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <User size={16} /> 基本情報
                                        </h3>
                                        <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                                <div>
                                                    <label className="text-xs font-bold text-zinc-400 block mb-1">メールアドレス</label>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 break-all">
                                                        <Mail size={14} className="text-blue-500 shrink-0" />
                                                        {profile.email}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-zinc-400 block mb-1">性別</label>
                                                    <div className="text-sm font-medium text-zinc-800">
                                                        {profile.gender === 'male' ? '男性' : profile.gender === 'female' ? '女性' : 'その他/未回答'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-zinc-400 block mb-1">応募求人</label>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                                                        <Building size={14} className="text-indigo-500 shrink-0" />
                                                        {application.jobs.title}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-zinc-400 block mb-1">応募日時</label>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                                                        <Calendar size={14} className="text-orange-500 shrink-0" />
                                                        {new Date(application.created_at).toLocaleString('ja-JP')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 自己PR / Bio */}
                                    <section>
                                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FileText size={16} /> 自己紹介・PR
                                        </h3>
                                        <div className="bg-white rounded-xl border border-zinc-200 p-6">
                                            {profile.bio ? (
                                                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                                            ) : (
                                                <p className="text-sm text-zinc-400 italic">自己紹介はまだ入力されていません。</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* スキル・資格 */}
                                    <section>
                                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Award size={16} /> スキル・資格
                                        </h3>
                                        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-500 mb-3">スキル</h4>
                                                {profile.skills && profile.skills.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.skills.map((skill: any, i: number) => {
                                                            const skillName = typeof skill === 'string' ? skill : skill.name;
                                                            const skillLevel = typeof skill === 'object' && skill.level ? skill.level : null;
                                                            return (
                                                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                                                                    <CheckCircle2 size={12} />
                                                                    {skillName}
                                                                    {skillLevel && <span className="opacity-60 text-[10px] ml-1">({skillLevel})</span>}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-zinc-400 italic">登録されているスキルはありません。</p>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-500 mb-3">資格</h4>
                                                {profile.qualifications && profile.qualifications.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.qualifications.map((q, i) => (
                                                            <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">
                                                                {q}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-zinc-400 italic">登録されている資格はありません。</p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* 職歴 (学生の場合は活動履歴など) */}
                                    {profile.work_history && profile.work_history.length > 0 && (
                                        <section>
                                            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Briefcase size={16} /> 職歴・活動歴
                                            </h3>
                                            <div className="space-y-4">
                                                {profile.work_history.map((work, i) => (
                                                    <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-zinc-800">{work.company}</h4>
                                                            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">{work.duration}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-blue-600 mb-3">{work.role}</p>
                                                        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{work.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                </div>

                                {/* Right Column: Internal Memo & Actions */}
                                <div className="space-y-6 sticky top-6 h-fit">
                                    <div className="bg-yellow-50/50 rounded-xl p-5 border border-yellow-100">
                                        <h3 className="text-xs font-black text-yellow-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <FileText size={14} /> 社内メモ (非公開)
                                        </h3>
                                        <textarea
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                            placeholder="面接の印象や特記事項などを入力..."
                                            className="w-full min-h-[150px] p-3 text-sm text-zinc-900 placeholder:text-zinc-400 border border-yellow-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-y mb-3"
                                        />
                                        <button
                                            onClick={handleSaveMemo}
                                            disabled={isSavingMemo}
                                            className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {isSavingMemo ? '保存中...' : 'メモを保存'}
                                        </button>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-3">
                                            アクション
                                        </h3>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isStartingChat}
                                            className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mb-2 disabled:opacity-50"
                                        >
                                            <MessageSquare size={16} />
                                            {isStartingChat ? '準備中...' : 'メッセージを送る'}
                                        </button>
                                    </div>

                                    {/* 希望条件 */}
                                    {profile.desired_conditions && (
                                        <section className="bg-white rounded-xl border border-zinc-200 p-5 mt-6">
                                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3">
                                                希望条件
                                            </h3>
                                            <div className="space-y-3">
                                                {profile.desired_conditions.location && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-zinc-400 block">希望勤務地</label>
                                                        <div className="text-xs font-medium text-zinc-700">{profile.desired_conditions.location.join(', ')}</div>
                                                    </div>
                                                )}
                                                {profile.desired_conditions.industry && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-zinc-400 block">希望業種</label>
                                                        <div className="text-xs font-medium text-zinc-700">{profile.desired_conditions.industry.join(', ')}</div>
                                                    </div>
                                                )}
                                                {profile.desired_conditions.salary && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-zinc-400 block">希望年収</label>
                                                        <div className="text-xs font-medium text-zinc-700">{profile.desired_conditions.salary}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
