"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Video, Trash2, CheckCircle } from 'lucide-react';

export default function JobPostForm() {
    const [step, setStep] = useState(1);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">求人をクエストとして公開する</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">あなたの会社の「歪み」を愛してくれる冒険者を探しましょう。</p>
            </div>

            {/* ステップナビゲーション */}
            <div className="flex gap-4 mb-10">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-700'
                            }`}
                    />
                ))}
            </div>

            <form className="space-y-8">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">求人タイトル（クエスト名）</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="例：歴史ある老舗のデジタルトランスフォーメーションを担う"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">求人カテゴリ</label>
                            <select className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none">
                                <option>中途採用</option>
                                <option>新卒採用</option>
                                <option>体験JOB（お試しワーク）</option>
                                <option>インターンシップ</option>
                                <option>アルバイト</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="p-6 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/50">
                            <h3 className="font-bold text-orange-800 dark:text-orange-400 mb-2 underline declaration-orange-500">RJP：現実的な仕事の事前提示</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                あえて「自社の不完全な部分」を伝えてください。それが最高の誠実さになり、相性抜群の人が集まるための魔法になります。
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">私たちの「歪み」（都合の悪い真実）</label>
                            <textarea
                                className="w-full p-4 h-32 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="例：正直、残業は月20時間ほどあります。また、古い慣習が残っており、システム化されていない部分も多いです。"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">それをどう魅力に変えてほしいか</label>
                            <textarea
                                className="w-full p-4 h-32 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="例：そのカオスな状況を楽しめる方に、自由な発想で改革をリードしてほしいです。"
                            />
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl p-12 text-center group hover:border-orange-500 transition-colors cursor-pointer">
                            <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Video className="text-zinc-500 group-hover:text-orange-500" />
                            </div>
                            <p className="font-medium text-lg">リール用ショート動画をアップロード</p>
                            <p className="text-zinc-500 mt-2 text-sm">またはファイルをドラッグ＆ドロップ</p>
                        </div>
                    </motion.div>
                )}

                <div className="flex justify-between pt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="px-8 py-3 rounded-xl font-medium text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            戻る
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => step < 3 ? setStep(step + 1) : alert('公開申請しました！')}
                        className="ml-auto px-10 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
                    >
                        {step === 3 ? 'クエストを公開する' : '次へ進む'}
                    </button>
                </div>
            </form>
        </div>
    );
}
