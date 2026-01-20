'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { SCENARIOS } from '@/lib/gameScenarios';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function NovelPart() {
    const { currentScenarioId, scenarioIndex, setScenarioIndex, playerName, playerGender, updateStats, setPlayerGender, setGameMode } = useGameStore();
    const [lastBg, setLastBg] = useState<string | null>(null);

    const scenario = currentScenarioId ? SCENARIOS[currentScenarioId] : null;
    const step = scenario ? scenario[scenarioIndex] : null;

    useEffect(() => {
        if (step?.bg) {
            setLastBg(step.bg);
        }
    }, [step?.bg]);

    if (!scenario || !step) return null;

    const handleNext = () => {
        if (step.choices) return; // Wait for choice

        if (scenarioIndex < scenario.length - 1) {
            setScenarioIndex(scenarioIndex + 1);
            const nextStep = scenario[scenarioIndex + 1];
            if (nextStep.onEnter) {
                nextStep.onEnter!({ updateStats, setPlayerGender, setGameMode });
            }
        }
    };

    const handleChoice = (choice: any) => {
        if (choice.action) {
            choice.action({ updateStats, setPlayerGender, setGameMode });
        }
        if (choice.targetIndex !== undefined) {
            setScenarioIndex(choice.targetIndex);
        } else if (scenarioIndex < scenario.length - 1) {
            setScenarioIndex(scenarioIndex + 1);
            const nextStep = scenario[scenarioIndex + 1];
            if (nextStep.onEnter) {
                nextStep.onEnter!({ updateStats, setPlayerGender, setGameMode });
            }
        }
    };

    // Auto-replace placeholders like {name}
    const processedText = step.text.replace('{name}', playerName);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 overflow-hidden select-none cursor-pointer" onClick={handleNext}>
            {/* Background Layer */}
            <AnimatePresence mode="wait">
                {lastBg && (
                    <motion.div
                        key={lastBg}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-0"
                    >
                        <Image
                            src={lastBg}
                            alt="background"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Vignette & Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Characters Layer */}
            <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex items-end justify-center pointer-events-none px-4 md:px-20 lg:px-40">
                <AnimatePresence>
                    {step.chara?.map((c, i) => (
                        <motion.div
                            key={`${c.name}-${c.image}`}
                            initial={{ opacity: 0, y: 30, x: c.side === 'left' ? -100 : c.side === 'right' ? 100 : 0 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                x: c.side === 'left' ? -50 : c.side === 'right' ? 50 : 0,
                                scale: 1
                            }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                            className="relative w-full max-w-[500px] lg:max-w-[700px] h-[85%] lg:h-[95%] flex items-end drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <Image
                                src={`/game/chara/${c.name}/${c.image}`}
                                alt={c.name}
                                fill
                                className="object-contain object-bottom"
                                priority
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* UI Layer */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-8 lg:p-12">
                {/* Choices (Centered) */}
                <AnimatePresence>
                    {step.choices && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 space-y-4 max-w-2xl mx-auto w-full relative z-30"
                        >
                            {step.choices.map((choice, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleChoice(choice);
                                    }}
                                    className="w-full bg-blue-600/90 hover:bg-blue-500 backdrop-blur-2xl text-white font-black py-4 md:py-6 px-8 rounded-3xl text-lg md:text-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 transition-all active:scale-95 flex items-center justify-between group"
                                >
                                    <span className="flex-1 text-center">{choice.text}</span>
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform opacity-50" />
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Message Box */}
                {!step.choices && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto w-full bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
                    >
                        {/* Speaker Name Tag */}
                        {step.speaker && (
                            <div className="absolute top-0 left-8 md:left-12 -translate-y-1/2 bg-blue-600 px-6 md:px-10 py-2 rounded-full text-white font-black text-xs md:text-sm tracking-[0.2em] shadow-2xl skew-x-[-12deg]">
                                <span className="inline-block skew-x-[12deg]">{step.speaker}</span>
                            </div>
                        )}

                        {/* Text Container */}
                        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-100 leading-[1.8] tracking-tight min-h-[4.5em] px-2">
                            {processedText}
                        </div>

                        {/* Next Arrow Indicator */}
                        <div className="absolute bottom-6 right-8 md:right-12">
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <ArrowRight size={28} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Spacer to keep it off the very edge on mobile */}
                <div className="h-4 md:h-8" />
            </div>
        </div>
    );
}
