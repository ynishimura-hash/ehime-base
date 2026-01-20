import React, { useState } from 'react';
import { X, Send, User, Pencil } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { EditProfileModal } from './EditProfileModal';

interface ConsultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    companyName: string;
}

export function ConsultModal({ isOpen, onClose, onConfirm, companyName }: ConsultModalProps) {
    const { userProfile } = useUserStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="bg-zinc-50 border-b border-zinc-100 p-4 flex items-center justify-between">
                        <h3 className="font-bold text-zinc-800">カジュアル面談を希望する</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-zinc-600 font-bold">
                                {companyName}の担当者と<br />チャットを開始しますか？
                            </p>
                            <p className="text-xs text-zinc-400">
                                以下のプロフィール情報が担当者に共有されます。
                            </p>
                        </div>

                        {/* Profile Preview Card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 relative group">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute top-3 right-3 p-1.5 bg-white rounded-full border border-blue-100 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                                title="プロフィールを編集"
                            >
                                <Pencil size={14} />
                            </button>

                            <div className="flex items-center gap-4">
                                <img
                                    src={userProfile.avatar}
                                    alt={userProfile.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-zinc-800 text-lg">{userProfile.name}</span>
                                        <span className="text-xs font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                                            {userProfile.age}歳
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1 font-medium">{userProfile.location}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {userProfile.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-white text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Display Bio Preview if exists */}
                                    {userProfile.bio && (
                                        <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 border-t border-blue-100/50 pt-2">
                                            {userProfile.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-eis-navy text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                            >
                                <Send size={18} />
                                カジュアル面談希望
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </>
    );
}
