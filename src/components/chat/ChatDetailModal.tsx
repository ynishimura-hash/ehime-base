import React, { useState, useEffect } from 'react';
import { X, MapPin, User as UserIcon, Building2, ExternalLink, Activity, Pin, Ban, Mail, Check, AlertCircle, Edit2 } from 'lucide-react';
import { useAppStore, User } from '@/lib/appStore';
import { Company } from '@/lib/dummyData';

interface ChatDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    partnerName: string;
    partnerImage: string;
    partnerId: string;
    isCompany: boolean; // True if the PARTNER is a company
    partnerData?: User | Company;
}

export default function ChatDetailModal({
    isOpen,
    onClose,
    chatId,
    partnerName,
    partnerImage,
    partnerId,
    isCompany,
    partnerData
}: ChatDetailModalProps) {
    const {
        currentUserId,
        currentCompanyId,
        activeRole,
        updateChatSettings,
        getChatSettingsHelper
    } = useAppStore();

    const myselfId = activeRole === 'seeker' ? currentUserId : currentCompanyId;
    const settings = getChatSettingsHelper(myselfId, chatId);

    const [alias, setAlias] = useState('');
    const [memo, setMemo] = useState('');
    const [isEditingAlias, setIsEditingAlias] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAlias(settings?.alias || '');
            setMemo(settings?.memo || '');
        }
    }, [isOpen, settings]);

    const handleSaveAlias = () => {
        updateChatSettings(myselfId, chatId, { alias });
        setIsEditingAlias(false);
    };

    const handleSaveMemo = (val: string) => {
        setMemo(val);
        // Debounce? For now direct save is okay for MVP or save on blur. 
        // Let's save on blur or specific changes to avoid too many writes if expensive, but here it's local state fast.
        updateChatSettings(myselfId, chatId, { memo: val });
    };

    const togglePin = () => updateChatSettings(myselfId, chatId, { isPinned: !settings?.isPinned });
    const toggleBlock = () => updateChatSettings(myselfId, chatId, { isBlocked: !settings?.isBlocked });
    const toggleUnread = () => updateChatSettings(myselfId, chatId, { isUnreadManual: !settings?.isUnreadManual });
    const setPriority = (p: 'high' | 'medium' | 'low' | null) => updateChatSettings(myselfId, chatId, { priority: p });

    if (!isOpen) return null;

    const PriorityButton = ({ level, label, color }: { level: 'high' | 'medium' | 'low', label: string, color: string }) => (
        <button
            onClick={() => setPriority(settings?.priority === level ? null : level)}
            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${settings?.priority === level
                ? `bg-${color}-100 border-${color}-500 text-${color}-600`
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header / Profile Cover */}
                <div className="bg-slate-100 p-6 flex flex-col items-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
                        <X size={20} className="text-slate-600" />
                    </button>

                    {/* Priority Badge on Avatar (Bottom-Left) */}
                    <div className="relative mb-4">
                        {isCompany ? (
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-lg ${partnerImage.startsWith('bg-') ? partnerImage : 'bg-white'}`}>
                                {partnerImage.startsWith('bg-') ? (
                                    <Building2 className="text-white w-12 h-12" />
                                ) : (
                                    <img src={partnerImage} alt={partnerName} className="w-full h-full object-cover rounded-2xl" />
                                )}
                            </div>
                        ) : (
                            <img src={partnerImage} alt={partnerName} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
                        )}
                        {settings?.priority && (
                            <div className={`absolute -bottom-2 -left-2 px-2 py-1 rounded-lg border-2 border-white text-xs font-bold text-white shadow-sm flex items-center justify-center z-10
                                ${settings.priority === 'high' ? 'bg-red-500' : settings.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}
                            `}>
                                {settings.priority === 'high' ? '高' : settings.priority === 'medium' ? '中' : '低'}
                            </div>
                        )}
                    </div>

                    {/* Name & Alias */}
                    <div className="w-full text-center">
                        {isEditingAlias ? (
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <input
                                    className="text-center font-bold text-lg bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 w-2/3"
                                    value={alias}
                                    onChange={(e) => setAlias(e.target.value)}
                                    placeholder="表示名を変更"
                                    autoFocus
                                />
                                <button onClick={handleSaveAlias} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"><Check size={16} /></button>
                            </div>
                        ) : (
                            <h2
                                className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2 cursor-pointer hover:opacity-70 group"
                                onClick={() => { setAlias(settings?.alias || partnerName); setIsEditingAlias(true); }}
                                title="クリックして表示名を編集"
                            >
                                {settings?.alias || partnerName}
                                <div className="p-1.5 rounded-full bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-colors">
                                    <Edit2 size={14} />
                                </div>
                            </h2>
                        )}

                        {(settings?.alias && settings.alias !== partnerName) && (
                            <p className="text-xs text-slate-500">元: {partnerName}</p>
                        )}

                        {/* Basic Info Tags */}
                        {partnerData && (
                            <div className="flex flex-wrap gap-2 justify-center mt-3">
                                {!isCompany && (partnerData as User).age && (
                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">{(partnerData as User).age}歳</span>
                                )}
                                {!isCompany && (partnerData as User).university && (
                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">{(partnerData as User).university}</span>
                                )}
                                {isCompany && (partnerData as Company).industry && (
                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">{(partnerData as Company).industry}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="p-6 space-y-6">
                    {/* Quick Core Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={togglePin}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${settings?.isPinned ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500 ring-inset' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Pin size={20} className={settings?.isPinned ? 'fill-current' : ''} />
                            <span className="text-xs font-bold">ピン留め</span>
                        </button>
                        <button
                            onClick={toggleUnread}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${settings?.isUnreadManual ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-500 ring-inset' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Mail size={20} className={settings?.isUnreadManual ? 'fill-current' : ''} />
                            <span className="text-xs font-bold">未読にする</span>
                        </button>
                        <button
                            onClick={toggleBlock}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${settings?.isBlocked ? 'bg-red-50 text-red-600 ring-2 ring-red-500 ring-inset' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Ban size={20} />
                            <span className="text-xs font-bold">ブロック</span>
                        </button>
                    </div>

                    {/* Priority Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">優先度</label>
                        <div className="flex gap-2">
                            <PriorityButton level="high" label="高" color="red" />
                            <PriorityButton level="medium" label="中" color="orange" />
                            <PriorityButton level="low" label="低" color="blue" />
                        </div>
                    </div>

                    {/* Memo */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">メモ (100文字)</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                            maxLength={100}
                            placeholder="このユーザーに関するメモを入力..."
                            value={memo}
                            onChange={(e) => handleSaveMemo(e.target.value)}
                        />
                        <div className="text-right text-[10px] text-slate-400 mt-1">{memo.length}/100</div>
                    </div>

                    {/* Detail Link */}
                    <div className="pt-2 border-t border-slate-100">
                        {isCompany ? (
                            <a
                                href="#" // Link to Company Detail Page (needs actual implementation/route)
                                className="block w-full py-3 bg-slate-900 text-white text-center font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={16} />
                                企業情報を見る
                            </a>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <UserIcon size={16} /> プロフィール概要
                                </h4>
                                <p className="text-xs text-slate-600 line-clamp-3">{(partnerData as User)?.bio || '情報なし'}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {(partnerData as User)?.tags?.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
