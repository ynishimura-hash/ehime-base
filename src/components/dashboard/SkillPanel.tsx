"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { VALUE_CARDS } from '@/lib/constants/analysisData';

interface SkillNode {
    id: string | number;
    name: string;
    type: 'value' | 'skill';
    isUnlocked: boolean;
    x: number;
    y: number;
}

export default function SkillPanel() {
    const { userAnalysis, courses, completedLessonIds } = useAppStore();

    const nodes = useMemo(() => {
        const result: SkillNode[] = [];

        // 1. 解放された価値観（selectedValues）を抽出
        const selectedIds = userAnalysis.selectedValues || [];
        const unlockedValues = VALUE_CARDS.filter(c => selectedIds.includes(c.id));

        // 価値観を中央付近に配置
        unlockedValues.forEach((v, i) => {
            const angle = (i / unlockedValues.length) * Math.PI * 2;
            const radius = 25; // 中央からの距離(%)
            result.push({
                id: `v_${v.id}`,
                name: v.name,
                type: 'value',
                isUnlocked: true,
                x: 50 + Math.cos(angle) * radius,
                y: 50 + Math.sin(angle) * radius
            });
        });

        // 2. スキル（e-ラーニング）を外周に配置
        const displayCourses = courses.slice(0, 6); // 最大6つ表示
        displayCourses.forEach((c, i) => {
            const angle = (i / displayCourses.length) * Math.PI * 2 + 0.5;
            const radius = 40; // 外周
            const isCompleted = completedLessonIds.includes(c.id);
            result.push({
                id: `c_${c.id}`,
                name: c.title,
                type: 'skill',
                isUnlocked: isCompleted,
                x: 50 + Math.cos(angle) * radius,
                y: 50 + Math.sin(angle) * radius
            });
        });

        return result;
    }, [userAnalysis.selectedValues, courses, completedLessonIds]);

    // 簡易的なコネクション生成（近いもの同士を結ぶ）
    const connections = useMemo(() => {
        const pairs: [number, number][] = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.sqrt(Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2));
                if (dist < 35) {
                    pairs.push([i, j]);
                }
            }
        }
        return pairs;
    }, [nodes]);

    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

            <div className="absolute top-8 left-8 z-10">
                <h3 className="text-white font-black text-xl flex items-center gap-2">
                    <Zap className="text-yellow-400" /> スキルパネル
                </h3>
                <p className="text-slate-500 text-xs font-bold">あなたの価値観とスキルの繋がり</p>
            </div>

            {/* SVG Layer for Connections */}
            <svg className="absolute inset-0 w-full h-full">
                {connections.map(([fromIdx, toIdx], i) => {
                    const from = nodes[fromIdx];
                    const to = nodes[toIdx];
                    const isLineUnlocked = from.isUnlocked && to.isUnlocked;

                    return (
                        <motion.line
                            key={i}
                            x1={`${from.x}%`}
                            y1={`${from.y}%`}
                            x2={`${to.x}%`}
                            y2={`${to.y}%`}
                            stroke={isLineUnlocked ? '#4f46e5' : '#1e293b'}
                            strokeWidth={isLineUnlocked ? 2 : 1}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.05 }}
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            <div className="absolute inset-0">
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1, zIndex: 20 }}
                        className="absolute cursor-pointer"
                        style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className={`
                            relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2 transition-all
                            ${node.isUnlocked
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                                : 'bg-slate-800/50 border-slate-700 opacity-50'}
                        `}>
                            {node.isUnlocked ? (
                                <Sparkles className="text-indigo-400" size={node.type === 'value' ? 24 : 18} />
                            ) : (
                                <Lock className="text-slate-600" size={16} />
                            )}

                            {/* Label */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                <div className={`text-[8px] font-black uppercase tracking-widest ${node.type === 'value' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    {node.type}
                                </div>
                                <div className={`text-[10px] font-black tracking-tighter ${node.isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                    {node.name}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential</span>
                </div>
            </div>
        </div>
    );
}
