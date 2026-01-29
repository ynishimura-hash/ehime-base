'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Wand2, Save } from 'lucide-react';
import { ContentItem, QuizData } from '@/data/mock_elearning_data';

interface ContentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: ContentItem) => void;
    initialData?: ContentItem | null;
}

export default function ContentFormModal({
    isOpen,
    onClose,
    onSave,
    initialData
}: ContentFormModalProps) {
    // Basic Info
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [materialUrl, setMaterialUrl] = useState('');
    const [category, setCategory] = useState('未分類');
    const [duration, setDuration] = useState('10:00');

    // Quiz Info
    const [hasQuiz, setHasQuiz] = useState(false);
    const [quizData, setQuizData] = useState<QuizData>({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Reset state when opening/changing initialData
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setUrl(initialData?.url || '');
            setMaterialUrl(initialData?.material_url || '');
            setCategory(initialData?.category || '未分類');
            setDuration(initialData?.duration || '10:00');

            if (initialData?.quiz) {
                setHasQuiz(true);
                setQuizData(initialData.quiz);
            } else {
                setHasQuiz(false);
                setQuizData({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    explanation: ''
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleGenerateQuiz = async () => {
        if (!title) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (!res.ok) throw new Error('Generation failed');
            const generated = await res.json();
            setQuizData(generated);
            setHasQuiz(true);
        } catch (error) {
            alert('クイズ生成に失敗しました。Gemini APIキーを確認してください。');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = () => {
        if (!title) return;
        const newItem: ContentItem = {
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            title,
            url,
            category,
            type: 'video',
            duration: duration,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            quiz: hasQuiz ? quizData : undefined,
            material_url: materialUrl || undefined
        };
        onSave(newItem);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-black text-slate-900">{initialData ? 'コンテンツ編集' : '新規コンテンツ作成'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <FileText size={16} /> 基本情報
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 block mb-1">タイトル</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={title} onChange={e => setTitle(e.target.value)} placeholder="例: Webマーケティング基礎" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 block mb-1">動画URL (YouTube)</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 block mb-1">資料URL (Optional)</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={materialUrl} onChange={e => setMaterialUrl(e.target.value)} placeholder="https://docs.google.com/..." />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 block mb-1">コース (カテゴリ)</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={category} onChange={e => setCategory(e.target.value)} placeholder="例: マーケティング" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 block mb-1">再生時間 (Ex: 10:25)</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={duration} onChange={e => setDuration(e.target.value)} placeholder="10:00" />
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Quiz Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <CheckCircle2 size={16} /> 小テスト設定
                            </h3>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={isGenerating || !title}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isGenerating ? 'bg-slate-100 text-slate-400' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                            >
                                <Wand2 size={14} className={isGenerating ? "animate-spin" : ""} />
                                {isGenerating ? 'AI生成中...' : '動画内容からAI自動生成'}
                            </button>
                        </div>

                        {!hasQuiz && !isGenerating ? (
                            <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300">
                                <p className="text-slate-500 font-bold text-sm mb-2">小テストはまだ設定されていません</p>
                                <p className="text-xs text-slate-400">「AI自動生成」ボタンを押すと、タイトルや動画情報から自動で問題を生成します。</p>
                                <button
                                    onClick={() => setHasQuiz(true)}
                                    className="mt-4 px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-300"
                                >
                                    手動で作成
                                </button>
                            </div>
                        ) : (
                            <div className={`space-y-4 transition-opacity ${isGenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setHasQuiz(false)}
                                        className="text-xs text-red-500 font-bold hover:underline"
                                    >
                                        小テストを削除
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">問題文</label>
                                    <textarea className="w-full h-20 bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={quizData.question} onChange={e => setQuizData({ ...quizData, question: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {quizData.options.map((opt, idx) => (
                                        <div key={idx}>
                                            <label className="text-xs font-bold text-slate-500 block mb-1">選択肢 {idx + 1}</label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded-lg px-3 py-2 font-bold outline-none focus:border-blue-500 ${opt === quizData.correctAnswer ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-700'}`}
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...quizData.options];
                                                    newOpts[idx] = e.target.value;
                                                    setQuizData({ ...quizData, options: newOpts });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">正解の選択肢 (上記と完全一致させてください)</label>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500"
                                        value={quizData.correctAnswer}
                                        onChange={e => setQuizData({ ...quizData, correctAnswer: e.target.value })}
                                    >
                                        <option value="">正解を選択...</option>
                                        {quizData.options.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">解説</label>
                                    <textarea className="w-full h-20 bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" value={quizData.explanation} onChange={e => setQuizData({ ...quizData, explanation: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button onClick={handleSubmit} className="w-full md:w-auto px-8 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                        <Save size={18} /> {initialData ? '更新する' : '保存する'}
                    </button>
                </div>
            </div>
        </div>
    );
}
