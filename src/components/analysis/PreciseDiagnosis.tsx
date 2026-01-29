"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
    Lock, Unlock, Eye, EyeOff, BarChart3, Tag, Compass
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
    const { userAnalysis, setAnalysisResults, setDiagnosisScore, setAllDiagnosisScores, togglePublicValue } = useAppStore();
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
        // 全スコアを一括保存
        setAllDiagnosisScores(finalAnswers);

        // アンロックされる価値観を計算して保存
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
                                        className={`py-8 rounded-3xl border-2 transition-all font-black group relative overflow-hidden flex flex-col items-center justify-center ${tempAnswers[question.id] === score
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'border-slate-100 text-slate-400 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="text-[10px] uppercase tracking-widest mb-1 opacity-70 h-4 flex items-center">
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
                <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl overflow-hidden relative">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative mb-12">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
                            <Sparkles size={16} /> Precision Analysis Complete
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div className="w-full space-y-4">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                                    あなたの深層<span className="text-indigo-600">プロファイリング</span>
                                </h2>
                                <p className="text-slate-500 font-bold leading-relaxed text-lg max-w-3xl">
                                    50問の回答から、あなたの個性が最も色濃く出ている5つの側面を抽出しました。それぞれの資質を深く理解し、アピールしたい「強み」を選択しましょう。
                                </p>
                            </div>
                            <div className="hidden lg:block pb-1 shrink-0">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Analysis Confidence</p>
                                    <div className="text-3xl font-black text-slate-900 italic">94.8<span className="text-sm text-indigo-500">%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative">
                        {/* Radar Chart (Left) */}
                        <div className="sticky top-10 space-y-8">
                            <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 group hover:border-indigo-200 transition-colors shadow-inner">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg">
                                            <BarChart3 size={20} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">資質バランス</h3>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                </div>
                                <div className="h-[340px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#cbd5e1" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} />
                                            <Radar
                                                name="User"
                                                dataKey="A"
                                                stroke="#4f46e5"
                                                fill="#4f46e5"
                                                fillOpacity={0.45}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 flex justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500/40 border border-indigo-400" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Profile</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average</span>
                                    </div>
                                </div>
                            </div>

                            {/* Result Summary (New Section) */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Compass size={20} className="text-indigo-600" />
                                    診断結果の要約
                                </h4>
                                <div className="space-y-4 text-sm font-bold text-slate-600 leading-relaxed">
                                    <p>
                                        <span className="text-indigo-600">【特徴】</span>
                                        今回の診断では、特定の領域において非常に高い適性が示されました。独自の視点を持ち、論理的かつ創造的に物事を捉える力が際立っています。周囲を巻き込みながら目標を完遂する意志の強さがあなたの最大の武器です。
                                    </p>
                                    <p>
                                        <span className="text-indigo-600">【可能性】</span>
                                        複雑な課題解決や、新しい価値を創造するポジションで大きな力が発揮されるでしょう。特に、変革を必要としている環境や、自律性が求められるプロジェクトにおいて、あなたの資質は不可欠なものとなります。
                                    </p>
                                    <p>
                                        <span className="text-indigo-600">【注意点】</span>
                                        一方で、細部へのこだわりが強すぎてスピード感が損なわれたり、自分の基準を他者にも厳しく適用しすぎてしまう傾向があります。状況に応じた柔軟な対応と、周囲との対話を意識することで、より円滑に物事を進められます。
                                    </p>
                                    <p>
                                        <span className="text-indigo-600">【アドバイス】</span>
                                        まずは自分が「得意」と感じる領域を戦略的に選び、そこにリソースを集中させてください。全ての資質を完璧に使いこなそうとするのではなく、特定の強みを研ぎ澄ませることが、キャリアにおける最大の差別化に繋がります。
                                    </p>
                                </div>
                            </div>

                            {/* Summary Note */}
                            <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200 group hover:scale-[1.02] transition-transform overflow-hidden relative">
                                <Sparkles size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Unlock size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-wider mb-2">公開設定のアドバイス</h4>
                                        <p className="text-xs font-bold leading-relaxed opacity-90">
                                            「強み」の中から最大3つを選択してプロフィールに公開しましょう。「影（注意点）」は企業には表示されず、あなたの内面分析用に留められます。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trait Selection List (Right) */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Tag className="text-indigo-600" size={24} /> 核心資質の選択
                                </h3>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 02 / 02</span>
                            </div>

                            <div className="space-y-6">
                                {(() => {
                                    // Robust pairing logic: Group by Question ID
                                    const unlockedIds = new Set(unlockedCards.map(c => c.id));
                                    const pairs: any[][] = [];

                                    DIAGNOSIS_QUESTIONS.forEach(q => {
                                        if (unlockedIds.has(q.positiveValueId) && unlockedIds.has(q.negativeValueId)) {
                                            const pos = unlockedCards.find(c => c.id === q.positiveValueId);
                                            const neg = unlockedCards.find(c => c.id === q.negativeValueId);
                                            if (pos && neg) {
                                                pairs.push([pos, neg]);
                                            }
                                        }
                                    });
                                    return pairs.map((pair: any[], idx) => {
                                        const pos = pair.find((c: any) => c.isPositive);
                                        const neg = pair.find((c: any) => !c.isPositive);
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
                                                <div className="grid grid-cols-1 gap-3">
                                                    {[pos, neg].map(card => {
                                                        const isPublic = userAnalysis.publicValues?.includes(card.id);
                                                        const isActive = (card.isPositive && isPosActive) || (!card.isPositive && isNegActive);
                                                        return (
                                                            <button
                                                                key={card.id}
                                                                onClick={() => {
                                                                    if (card.isPositive) {
                                                                        togglePublicValue(card.id);
                                                                    }
                                                                }}
                                                                className={`p-5 rounded-2xl font-black text-sm transition-all flex flex-col gap-2 text-left relative overflow-hidden group border-2 ${isPublic
                                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                                                    : !card.isPositive
                                                                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-default hover:border-slate-200'
                                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        {!card.isPositive && <EyeOff size={14} className="text-slate-300" />}
                                                                        <span className="text-base truncate max-w-[140px]">{card.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!isPublic && isActive && (
                                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap ${card.isPositive ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                                                                                {card.isPositive ? 'Activated' : 'Insight'}
                                                                            </span>
                                                                        )}
                                                                        {isPublic && <CheckCircle2 size={18} />}
                                                                    </div>
                                                                </div>
                                                                <p className={`text-[11px] font-bold leading-normal ${isPublic ? 'text-white/80' : 'text-slate-400'}`}>
                                                                    {card.description}
                                                                </p>
                                                                {!card.isPositive && (
                                                                    <div className="text-[8px] text-slate-400/60 font-black uppercase tracking-tighter mt-1">
                                                                        Internal Reference Only
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
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
