'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Timer, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
    q: string;
    c: string;
    w1: string;
    w2: string;
}

const CAFE_QUESTIONS: Question[] = [
    { q: "お客様が来るの尊敬語は？", c: "お見えになる", w1: "参られる", w2: "来られる" },
    { q: "資料を見るの謙譲語は？", c: "拝見する", w1: "ご覧になる", w2: "見させていただく" },
    { q: "言うの尊敬語は？", c: "おっしゃる", w1: "申される", w2: "言われる" },
    { q: "知っているの謙譲語は？", c: "存じている", w1: "ご存知だ", w2: "知っておる" },
    { q: "座るの尊敬語は？", c: "お掛けになる", w1: "座られる", w2: "着席される" },
    { q: "会社に行くの謙譲語は？", c: "伺う", w1: "参る", w2: "行かれる" },
    { q: "見るの尊敬語は？", c: "ご覧になる", w1: "拝見する", w2: "見られる" },
    { q: "聞くの謙譲語は？", c: "伺う", w1: "お聞きになる", w2: "聞かれる" },
    { q: "食べるの尊敬語は？", c: "召し上がる", w1: "いただく", w2: "食べられる" },
    { q: "するの謙譲語は？", c: "いたす", w1: "なさる", w2: "される" },
];

const STUDY_QUESTIONS: Question[] = [
    { q: "愛媛県の県庁所在地は？", c: "松山市", w1: "今治市", w2: "西条市" },
    { q: "「坊つちやん」を書いた作家は？", c: "夏目漱石", w1: "正岡子規", w2: "森鴎外" },
    { q: "日本最古の温泉と言われるのは？", c: "道後温泉", w1: "有馬温泉", w2: "別府温泉" },
    { q: "愛媛県で生産量日本一を誇るのは？", c: "真珠", w1: "レモン", w2: "ブドウ" },
    { q: "今治市が生産量日本一なのは？", c: "タオル", w1: "紙", w2: "造船" },
];

export default function QuizPart() {
    const { currentActionType, modifyStats, advanceWeek, addExperience, setGameMode, setActionType } = useGameStore();
    const [step, setStep] = useState<'intro' | 'play' | 'result'>('intro');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
    const [currentOptions, setCurrentOptions] = useState<string[]>([]);

    const prepareQuestion = React.useCallback((q: Question) => {
        const opts = [q.c, q.w1, q.w2].sort(() => Math.random() - 0.5);
        setCurrentOptions(opts);
        setTimeLeft(15);
    }, []);

    const startQuiz = () => {
        const questionSet = currentActionType === 'study' ? STUDY_QUESTIONS : CAFE_QUESTIONS;
        const shuffled = [...questionSet].sort(() => Math.random() - 0.5).slice(0, 5);
        setSelectedQuestions(shuffled);
        prepareQuestion(shuffled[0]);
        setStep('play');
    };

    const handleAnswer = React.useCallback((ans: string) => {
        const isCorrect = ans === selectedQuestions[currentIdx].c;
        if (isCorrect) {
            setScore(prev => prev + 1);
            toast.success('正解！', { duration: 1000 });
        } else {
            toast.error('不正解...', { duration: 1000 });
        }

        if (currentIdx < 4) {
            setCurrentIdx(prev => prev + 1);
            prepareQuestion(selectedQuestions[currentIdx + 1]);
        } else {
            setStep('result');
        }
    }, [selectedQuestions, currentIdx, prepareQuestion]);

    useEffect(() => {
        if (step === 'play') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleAnswer(''); // Timeout
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, currentIdx, handleAnswer]);

    const handleFinish = () => {
        if (currentActionType === 'study') {
            const know = score * 3 + 2;
            modifyStats({ knowledge: score, stamina: -15, stress: 5 });
        } else {
            const pay = score * 1200 + 1000;
            modifyStats({ money: pay, stress: -10, stamina: -20 });
        }
        addExperience(score * 20 + 10);
        advanceWeek();
        setActionType(null);
        setGameMode('strategy');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
                {step === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8"
                    >
                        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                            <Trophy size={40} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-white">{currentActionType === 'study' ? '読書する' : 'カフェのアルバイト'}</h2>
                            <p className="text-slate-400 font-bold">
                                {currentActionType === 'study'
                                    ? '愛媛に関する知識を深めましょう！全5問です。'
                                    : '正しい敬語を選んで、お客様を丁寧に応対しましょう！全5問です。'}
                            </p>
                        </div>
                        <button
                            onClick={startQuiz}
                            className={`w-full ${currentActionType === 'study' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'} text-white font-black py-5 rounded-3xl transition-all`}
                        >
                            {currentActionType === 'study' ? '読書開始' : 'アルバイト開始'}
                        </button>
                    </motion.div>
                )}

                {step === 'play' && (
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="max-w-2xl w-full space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="bg-white/10 px-6 py-2 rounded-full text-white font-black">
                                Question {currentIdx + 1} / 5
                            </div>
                            <div className="flex items-center gap-2 bg-red-500/20 px-6 py-2 rounded-full text-red-500 font-black border border-red-500/20">
                                <Timer size={20} />
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
                            <h3 className="text-2xl font-black text-white text-center leading-relaxed">
                                {selectedQuestions[currentIdx].q}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {currentOptions.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(opt)}
                                    className="bg-slate-800 hover:bg-blue-600 p-6 rounded-[2rem] text-white font-black text-xl transition-all border border-white/5 hover:border-blue-400 active:scale-95"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 p-12 rounded-[4rem] border border-white/10 text-center max-w-lg w-full space-y-10"
                    >
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white italic">RESULT</h2>
                            <div className="text-8xl font-black text-blue-500">{score} <span className="text-2xl text-slate-500">/ 5</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    {currentActionType === 'study' ? '知識' : '報酬'}
                                </div>
                                <div className={`text-2xl font-black ${currentActionType === 'study' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                    {currentActionType === 'study' ? `+${score * 3 + 2}` : `+${score * 1200 + 1000}円`}
                                </div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">経験値</div>
                                <div className="text-2xl font-black text-blue-400">+{score * 20 + 10} EXP</div>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-blue-600/20"
                        >
                            戦略画面へ戻る
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
