"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Target, Users, Lightbulb,
    ArrowRight, ArrowLeft, Trophy, BarChart3,
    CheckCircle2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/appStore';

interface Question {
    id: number;
    text: string;
    category: 'executing' | 'influencing' | 'relationship' | 'strategic';
}

const QUESTIONS: Question[] = [
    { id: 1, text: "計画を立てるよりも、まずは行動に移すことが得意だ", category: 'executing' },
    { id: 2, text: "他人の感情や考えていることに敏感に気づく方だ", category: 'relationship' },
    { id: 3, text: "周囲の人を説得して、自分の考えに賛同してもらうのが好きだ", category: 'influencing' },
    { id: 4, text: "複雑な問題の背後にあるパターンや法則を見つけるのが得意だ", category: 'strategic' },
    { id: 5, text: "一度決めたことは、最後までやり遂げないと気が済まない", category: 'executing' },
    { id: 6, text: "初対面の人ともすぐに打ち解け、信頼関係を築ける", category: 'relationship' },
    { id: 7, text: "チームを導き、目標達成に向けて鼓舞することにやりがいを感じる", category: 'influencing' },
    { id: 8, text: "将来起こりうるリスクや可能性を常に先読みして動いている", category: 'strategic' },
    { id: 9, text: "効率的な方法を常に探し、無駄を省くことに喜びを感じる", category: 'executing' },
    { id: 10, text: "困っている人がいると、自分のことのように寄り添いサポートしたいと思う", category: 'relationship' },
    { id: 11, text: "プレゼンテーションやスピーチで、自分の意見を伝えることが得意だ", category: 'influencing' },
    { id: 12, text: "新しいアイデアやコンセプトを考えることが、何よりも楽しい", category: 'strategic' },
];

const CATEGORY_NAMES = {
    executing: { label: '実行力', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    influencing: { label: '影響力', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    relationship: { label: '人間関係構築力', icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
    strategic: { label: '戦略的思考', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
};

export default function StrengthsDiscovery() {
    const { setAnalysisResults } = useAppStore();
    const [currentStep, setCurrentStep] = useState(0); // 0: Start, 1: Quiz, 2: Result
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [results, setResults] = useState<Record<string, number> | null>(null);

    const handleAnswer = (score: number) => {
        const newAnswers = { ...answers, [QUESTIONS[currentQuestionIndex].id]: score };
        setAnswers(newAnswers);

        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            calculateResults(newAnswers);
            setCurrentStep(2);
        }
    };

    const calculateResults = (finalAnswers: Record<number, number>) => {
        const scores: Record<string, number> = {
            executing: 0,
            influencing: 0,
            relationship: 0,
            strategic: 0
        };

        const counts: Record<string, number> = {
            executing: 0,
            influencing: 0,
            relationship: 0,
            strategic: 0
        };

        QUESTIONS.forEach(q => {
            if (finalAnswers[q.id]) {
                scores[q.category] += finalAnswers[q.id];
                counts[q.category] += 5; // Max score per question is 5
            }
        });

        const normalizedScores: Record<string, number> = {};
        Object.keys(scores).forEach(cat => {
            normalizedScores[cat] = Math.round((scores[cat] / counts[cat]) * 100);
        });

        setResults(normalizedScores);
    };

    if (currentStep === 0) {
        return (
            <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                    <Sparkles size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">
                    あなたの「隠れた強み」を<br />今すぐ発見しましょう
                </h2>
                <p className="text-slate-500 font-bold text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    12問の質問に答えるだけで、あなたの強み（実行力・影響力・人間関係・戦略性）を可視化します。自分自身の魅力を再発見しましょう。
                </p>
                <button
                    onClick={() => setCurrentStep(1)}
                    className="group bg-slate-900 text-white font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 mx-auto hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20"
                >
                    診断を開始する <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        );
    }

    if (currentStep === 1) {
        const question = QUESTIONS[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

        return (
            <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-xl min-h-[500px] flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} / {QUESTIONS.length}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full mx-6 overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-10"
                        >
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                                {question.text}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                {[1, 2, 3, 4, 5].map((score) => (
                                    <button
                                        key={score}
                                        onClick={() => handleAnswer(score)}
                                        className="py-6 rounded-3xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all font-black text-slate-500 hover:text-blue-600 group"
                                    >
                                        <div className="text-xs uppercase tracking-widest mb-1 opacity-50 group-hover:opacity-100">
                                            {score === 1 ? '全く違う' : score === 5 ? 'まさにその通り' : ''}
                                        </div>
                                        <div className="text-2xl">{score}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {currentQuestionIndex > 0 && (
                    <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        className="mt-10 self-start flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={18} /> 前の質問に戻る
                    </button>
                )}
            </div>
        );
    }

    if (currentStep === 2 && results) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl overflow-hidden relative">
                    <div className="absolute right-[-10%] top-[-10%] text-blue-50 -rotate-12">
                        <Trophy size={400} />
                    </div>

                    <div className="relative z-10 text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-blue-100">
                            <CheckCircle2 size={16} /> 診断完了
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">あなたの強み分析結果</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {Object.entries(CATEGORY_NAMES).map(([key, info]) => (
                            <div key={key} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`${info.bg} ${info.color} p-4 rounded-2xl`}>
                                        <info.icon size={28} />
                                    </div>
                                    <span className={`text-2xl font-black ${info.color}`}>{results[key]}%</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{info.label}</h3>
                                <div className="h-2 bg-white rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${info.bg.replace('bg-', 'bg-').split('-')[0] === 'bg' ? info.color.replace('text-', 'bg-') : 'bg-blue-600'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${results[key]}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <Lightbulb className="text-amber-400" />
                            </div>
                            <h3 className="text-xl font-black">アドバイス</h3>
                        </div>
                        <p className="text-slate-400 font-bold leading-relaxed">
                            {results.executing > 70 ? 'あなたは圧倒的な行動力の持ち主です。目標を明確にすることで、さらに大きな成果を出せるでしょう。' :
                                results.strategic > 70 ? 'あなたは分析力と先見の明に優れています。プロジェクトの初期段階や改善提案で力を発揮します。' :
                                    'あなたのバランスの取れた強みは、あらゆるチームでの潤滑油となります。まずは自分が最もワクワクすることから始めてみましょう。'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => {
                            setCurrentStep(0);
                            setCurrentQuestionIndex(0);
                            setAnswers({});
                        }}
                        className="bg-white border border-slate-200 text-slate-900 font-black py-5 rounded-3xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        もう一度診断する
                    </button>
                    <button
                        onClick={() => {
                            setAnalysisResults({ strengths: results });
                            toast.success('結果をプロフィールに保存しました');
                        }}
                        className="md:col-span-2 bg-blue-600 text-white font-black py-5 rounded-3xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                        結果をプロフィールに反映する <CheckCircle2 size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
