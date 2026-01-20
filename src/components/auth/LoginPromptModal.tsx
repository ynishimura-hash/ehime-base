"use client";

import { useAppStore } from "@/lib/appStore";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export function LoginPromptModal({ isOpen, onClose, message = "この機能を利用するにはログインが必要です" }: LoginPromptModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3">ログインが必要です</h3>
                    <p className="text-slate-600 font-medium mb-2">{message}</p>
                    <p className="text-sm text-slate-500">まずはアカウントを作成して、Ehime Baseの全ての機能を体験してみませんか？</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/welcome')}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        アカウントを作成する
                    </button>
                    <button
                        onClick={() => router.push('/login/seeker')}
                        className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-black hover:bg-slate-200 transition-all active:scale-95"
                    >
                        すでにアカウントをお持ちの方
                    </button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    無料で簡単に始められます
                </p>
            </div>
        </div>
    );
}
