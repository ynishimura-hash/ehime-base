"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
    Lock, Unlock, Eye, EyeOff, BarChart3, Tag
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { useAppStore } from '@/lib/appStore';
import { DIAGNOSIS_QUESTIONS, VALUE_CARDS } from '@/lib/constants/analysisData';
import { ValueCard } from '@/lib/types/analysis';
import { calculateSelectedValues, calculateCategoryRadarData } from '@/lib/analysisUtils';
import { toast } from 'sonner';

export default function PreciseDiagnosis() {
    const { userAnalysis, setAnalysisResults, setDiagnosisScore, togglePublicValue } = useAppStore();
    const [currentStep, setCurrentStep] = useState(0); // 0: Start, 1: Quiz, 2: Result
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [tempAnswers, setTempAnswers] = useState<Record<number, number>>(userAnalysis.diagnosisScores || {});

    const handleAnswer = (score: number) => {
        const questionId = DIAGNOSIS_QUESTIONS[currentQuestionIndex].id;
        const newAnswers = { ...tempAnswers, [questionId]: score };
        setTempAnswers(newAnswers);

        if (currentQuestionIndex < DIAGNOSIS_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            completeDiagnosis(newAnswers);
        }
    };

    const completeDiagnosis = (finalAnswers: Record<number, number>) => {
        // 全スコアを保存
        Object.entries(finalAnswers).forEach(([id, score]) => {
            setDiagnosisScore(Number(id), score);
        });

        // アンロックされる価値観を計算
        const selectedValues = calculateSelectedValues(finalAnswers);
        setAnalysisResults({ selectedValues });

        setCurrentStep(2);
        toast.success('50問の精密診断が完了しました！');
    };

    const radarData = useMemo(() => {
        return calculateCategoryRadarData(tempAnswers);
    }, [tempAnswers]);

    const unlockedCards = useMemo(() => {
        const ids = userAnalysis.selectedValues || [];
        // idsの並び順（ペア単位）を維持してカードオブジェクトを取得
        return ids.map(id => VALUE_CARDS.find(card => card.id === id)).filter(Boolean) as ValueCard[];
    }, [userAnalysis.selectedValues]);

    if (currentStep === 0) {
        return (
            <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl text-center">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <BarChart3 size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">
                    50問の精密診断で<br />あなたの「深層資質」を解明
                </h2>
                <p className="text-slate-500 font-bold text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    100の価値観キーワードから、あなたの本当の強みと、裏側にある課題を浮き彫りにします。所要時間は約5〜10分です。
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={() => setCurrentStep(1)}
                        className="group bg-indigo-600 text-white font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-95 shadow-2xl shadow-indigo-900/20"
                    >
                        精密診断を開始する <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    {userAnalysis.selectedValues && (
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="bg-white text-indigo-600 border border-indigo-100 font-black px-10 py-5 rounded-[2rem] hover:bg-indigo-50 transition-all"
                        >
                            前回の結果を見る
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (currentStep === 1) {
        const question = DIAGNOSIS_QUESTIONS[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / DIAGNOSIS_QUESTIONS.length) * 100;
        const categoryLabels = {
            'A': '思考・創造',
            'B': '行動・情熱',
            'C': '誠実・完遂',
            'D': '対人・共感',
            'E': '安定・慎重'
        };

        return (
            <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-xl min-h-[600px] flex flex-col justify-between">
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                                Category: {categoryLabels[question.category]}
                            </span>
                            <div className="text-sm font-black text-slate-400">Question {currentQuestionIndex + 1} / {DIAGNOSIS_QUESTIONS.length}</div>
                        </div>
                        <div className="flex-1 max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-indigo-600"
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
                            className="space-y-12 py-10"
                        >
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                                {question.text}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map((score) => (
                                    <button
                                        key={score}
                                        onClick={() => handleAnswer(score)}
                                        className={`py-8 rounded-3xl border-2 transition-all font-black group relative overflow-hidden ${tempAnswers[question.id] === score
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'border-slate-100 text-slate-400 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="text-[10px] uppercase tracking-widest mb-1 opacity-70">
                                            {score === 1 ? '全く違う' : score === 5 ? 'まさにその通り' : score === 3 ? 'どちらでもない' : ''}
                                        </div>
                                        <div className="text-3xl">{score}</div>
                                        {tempAnswers[question.id] === score && (
                                            <div className="absolute top-2 right-2 text-indigo-600">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex items-center justify-between mt-10">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors disabled:opacity-30"
                    >
                        <ArrowLeft size={18} /> 前へ
                    </button>
                    <div className="text-slate-300 font-black">
                        {Math.floor(progress)}% Complete
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 2) {
        return (
            <div className="space-y-10">
                {/* Result Visuals */}
                <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl overflow-hidden">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-100">
                            <Sparkles size={16} /> Precision Analysis Complete
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">あなたの深層プロファイリング</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Radar Chart */}
                        <div className="h-[400px] w-full bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-indigo-600 text-white p-2 rounded-xl">
                                    <BarChart3 size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">資質バランス</h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                                        <Radar
                                            name="User"
                                            dataKey="A"
                                            stroke="#4f46e5"
                                            fill="#4f46e5"
                                            fillOpacity={0.5}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Sparkles size={24} className="text-indigo-600" /> あなたを象徴する5つの核心資質
                            </h3>
                            <p className="text-slate-500 font-bold leading-relaxed text-sm">
                                50問の回答から、あなたの個性が最も色濃く出ている5つの側面を抽出しました。<br />
                                それぞれの資質には「光（強み）」と「影（注意点）」があります。自分らしいと思うキーワードを合計5つ選びましょう。
                            </p>

                            <div className="space-y-6">
                                {(() => {
                                    const pairs = [];
                                    for (let i = 0; i < unlockedCards.length; i += 2) {
                                        pairs.push(unlockedCards.slice(i, i + 2));
                                    }
                                    return pairs.map((pair, idx) => {
                                        const pos = pair.find(c => c.isPositive);
                                        const neg = pair.find(c => !c.isPositive);
                                        if (!pos || !neg) return null;

                                        // どちらの要素がより強く出ているか
                                        const questionId = DIAGNOSIS_QUESTIONS.find(q => q.positiveValueId === pos.id)?.id;
                                        const score = userAnalysis.diagnosisScores?.[questionId || 0] || 3;
                                        const isPosActive = score >= 4;
                                        const isNegActive = score <= 2;

                                        return (
                                            <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Quality Aspect 0{idx + 1}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase">Answer Score</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <div key={s} className={`w-2 h-1 rounded-full ${s === score ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[pos, neg].map(card => {
                                                        const isPublic = userAnalysis.publicValues?.includes(card.id);
                                                        const isActive = (card.isPositive && isPosActive) || (!card.isPositive && isNegActive);
                                                        return (
                                                            <button
                                                                key={card.id}
                                                                onClick={() => togglePublicValue(card.id)}
                                                                className={`p-4 rounded-2xl font-black text-sm transition-all flex flex-col gap-2 text-left relative overflow-hidden group border-2 ${isPublic
                                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span>{card.name}</span>
                                                                    {isActive && !isPublic && (
                                                                        <span className="bg-amber-100 text-amber-600 text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase">Activated</span>
                                                                    )}
                                                                    {isPublic && <CheckCircle2 size={16} />}
                                                                </div>
                                                                <p className={`text-[10px] font-bold leading-tight line-clamp-2 ${isPublic ? 'text-white/70' : 'text-slate-400'}`}>
                                                                    {card.description}
                                                                </p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                                <Unlock size={20} className="text-indigo-500 mt-1 shrink-0" />
                                <p className="text-indigo-700 text-sm font-bold">
                                    <strong>公開設定について:</strong> 選んだ5つのコアバリューのみが企業に公開されます。その他の詳細はあなただけのものです。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advice Carousel (Simplified) */}
                <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden relative">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                        {radarData.map((d, i) => (
                            <div key={i} className="space-y-3">
                                <div className="text-indigo-400 font-black text-xs uppercase tracking-widest">{d.subject} の傾向</div>
                                <h4 className="text-xl font-black">{d.A > 70 ? '強みが極まっています' : d.A < 40 ? '伸び代が大きい領域です' : 'バランスが取れています'}</h4>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed">
                                    {d.A > 70 ? 'この領域の資質を最大限活かせる環境を求めてみましょう。' : '少し意識するだけで、新しい可能性が開けるかもしれません。'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            setCurrentStep(1);
                            setCurrentQuestionIndex(0);
                        }}
                        className="text-slate-400 font-black hover:text-slate-900 transition-colors"
                    >
                        もう一度診断し直す
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
