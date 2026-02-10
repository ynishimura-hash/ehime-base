import React, { useState } from 'react';
import { X, Send, Pencil } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { EditProfileModal } from './EditProfileModal';
import { toast } from 'sonner';

interface ConsultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    companyName: string;
    currentUser?: any; // Optional passed user object
}

export function ConsultModal({ isOpen, onClose, onConfirm, companyName, currentUser: propUser }: ConsultModalProps) {
    const { currentUserId, users } = useAppStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Use passed user specific prop if available, otherwise try to find in store
    const storeUser = users.find(u => u.id === currentUserId);
    const currentUser = propUser || storeUser;

    if (!isOpen) return null;

    // Fallback if no user found (shouldn't happen if logged in, but safe fallback)
    const displayUser = currentUser || {
        name: 'ゲスト',
        age: 20,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
        tags: [],
        bio: '',
        desiredConditions: { location: ['未設定'] }
    };

    const location = displayUser.desiredConditions?.location?.[0] || '愛媛県';

    // Calculate Age from birthDate if available
    const calculateAge = (birthDate?: string | Date, fallback?: number) => {
        if (!birthDate) return fallback || 20;
        try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch (e) {
            return fallback || 20;
        }
    };

    const displayAge = calculateAge(displayUser.birthDate, displayUser.age);

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
                                    src={displayUser.image}
                                    alt={displayUser.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-zinc-800 text-lg">{displayUser.name}</span>
                                        <span className="text-xs font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                                            {displayAge}歳
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1 font-medium">{location}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(displayUser.tags || []).slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-[10px] bg-white text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Display Bio Preview if exists */}
                                    {displayUser.bio && (
                                        <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 border-t border-blue-100/50 pt-2">
                                            {displayUser.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    // Block Logic for Junior/High School Students
                                    if (displayUser.occupationStatus === 'student' &&
                                        (displayUser.schoolType === 'high_school' || displayUser.schoolType === 'junior_high')) {
                                        toast.error('中学生・高校生の方は現在お申し込みいただけません。');
                                        return;
                                    }
                                    onConfirm();
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-eis-navy text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-zinc-200 cursor-pointer"
                            >
                                <Send size={18} />
                                申し込む
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
