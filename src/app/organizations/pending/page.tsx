"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function OrganizationPendingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck size={40} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-800">審査を受け付けました</h1>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">
                        パートナー登録ありがとうございます。<br />
                        現在、運営事務局にて審査を行っております。<br />
                        審査完了まで今しばらくお待ちください。
                    </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-xs font-bold text-slate-400 text-left space-y-2">
                    <p>※ 通常1〜3営業日以内に審査結果をメールにてお知らせいたします。</p>
                    <p>※ 審査状況によっては、追加の書類提出をお願いする場合がございます。</p>
                </div>

                <div className="pt-4">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 text-blue-600 font-black hover:underline">
                        トップページに戻る
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
