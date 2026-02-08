"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Zap, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { VALUE_CARDS } from '@/lib/constants/analysisData';

interface SkillNode {
    id: string | number;
    name: string;
    type: 'value' | 'skill' | 'recommendation';
    isUnlocked: boolean;
    x: number;
    y: number;
    // For recommendations
    courseId?: string;
    relatedValueName?: string;
    aiMessage?: string;
}

// Pseudo-random number generator for deterministic mapping
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export default function SkillPanel() {
    const {
        userAnalysis,
        courses,
        completedLessonIds,
        fetchCourses,
        userRecommendations,
        fetchUserRecommendations,
        generateRecommendations,
        resetRecommendations,
        currentUserId,
        isFetchingCourses // Added
    } = useAppStore();

    const [isResetting, setIsResetting] = React.useState(false);

    // Ensure courses and recommendations are loaded
    React.useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
        if (currentUserId) {
            fetchUserRecommendations(currentUserId);
        }
    }, [courses.length, fetchCourses, currentUserId, fetchUserRecommendations]);

    // Handle initial recommendation generation if empty
    React.useEffect(() => {
        const selectedValues = userAnalysis?.selectedValues || [];
        if (currentUserId && selectedValues.length > 0 && userRecommendations.length === 0) {
            generateRecommendations(currentUserId, selectedValues);
        }
    }, [currentUserId, userAnalysis?.selectedValues, userRecommendations.length, generateRecommendations]);

    // Timeout handling for loading state
    const [isTimeout, setIsTimeout] = React.useState(false);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isFetchingCourses) {
            setIsTimeout(false);
            timer = setTimeout(() => {
                setIsTimeout(true);
                // Force stop loading visually if it takes too long
                console.warn('SkillPanel: Loading timeout reached.');
            }, 5000); // 5 seconds timeout
        }
        return () => clearTimeout(timer);
    }, [isFetchingCourses]);

    // Derived loading state that respects timeout
    const isLoading = isFetchingCourses && !isTimeout;

    const nodes = useMemo(() => {
        const result: SkillNode[] = [];

        // 1. 解放された価値観（selectedValues）を抽出
        const selectedIds = userAnalysis.selectedValues || [];
        const unlockedValues = VALUE_CARDS.filter(c => selectedIds.includes(c.id) && c.isPositive);

        console.log('SkillPanel: selectedIds', selectedIds);
        console.log('SkillPanel: unlockedValues', unlockedValues.map(v => ({ id: v.id, name: v.name })));

        // 価値観を中央付近に配置
        unlockedValues.forEach((v, i) => {
            const angle = (i / unlockedValues.length) * Math.PI * 2;
            const radius = 15; // 中央からの距離(%)
            result.push({
                id: `v_${v.id}`,
                name: v.name,
                type: 'value',
                isUnlocked: true,
                x: 50 + Math.cos(angle) * radius,
                y: 50 + Math.sin(angle) * radius
            });
        });

        // 2. 推奨コースを配置
        const addedCourseIds = new Set<string>();

        unlockedValues.forEach((v, i) => {
            const angleBase = (i / unlockedValues.length) * Math.PI * 2;

            // DBデータがある場合はDBから、ない場合はフォールバックで生成
            const valueRecs = userRecommendations.filter(r => r.value_id === v.id);
            // 有効なコースIDを持つレコメンドのみにフィルタリング
            const validRecs = valueRecs.filter(r => courses.some(c => String(c.id) === String(r.course_id)));

            // DEBUG: Log matching issues
            console.log(`SkillPanel DEBUG [${v.name}]:`, {
                valueRecsCount: valueRecs.length,
                validRecsCount: validRecs.length,
                valueRecsCourseIds: valueRecs.map(r => r.course_id),
                coursesIds: courses.slice(0, 5).map(c => c.id),
                reasonMessages: valueRecs.map(r => r.reason_message)
            });

            if (validRecs.length > 0) {
                // 有効なレコメンドがある場合
                console.log('SkillPanel: validRecs', validRecs);
                validRecs.forEach((rec, idx) => {
                    // 重複チェック (本来APIで排除されるはずだが、念のため)
                    if (addedCourseIds.has(String(rec.course_id))) {
                        return;
                    }

                    const offset = idx === 0 ? -0.2 : 0.2;
                    const angle = angleBase + offset;
                    const radius = 35;
                    const course = courses.find(c => String(c.id) === String(rec.course_id));

                    if (course) {
                        addedCourseIds.add(String(rec.course_id));
                        result.push({
                            id: rec.id,
                            name: course.title,
                            type: 'recommendation',
                            isUnlocked: completedLessonIds.includes(rec.course_id),
                            x: 50 + Math.cos(angle) * radius,
                            y: 50 + Math.sin(angle) * radius,
                            courseId: rec.course_id,
                            relatedValueName: v.name,
                            // Use DB reason if available, otherwise generic
                            aiMessage: rec.reason_message || `あなたの「${v.name}」という価値観には、このコースがおすすめです。`
                        });
                    }
                });
            } else if (isLoading) {
                // ロード中は仮のノードを表示
                [-0.2, 0.2].forEach((offset, idx) => {
                    const angle = angleBase + offset;
                    const radius = 35;
                    result.push({
                        id: `loading_${v.id}_${idx}`,
                        name: 'Loading...',
                        type: 'recommendation',
                        isUnlocked: false,
                        x: 50 + Math.cos(angle) * radius,
                        y: 50 + Math.sin(angle) * radius,
                        courseId: '',
                        relatedValueName: v.name,
                        aiMessage: '読み込み中...'
                    });
                });
            } else {
                // FALLBACK: データがない、または無効なデータしかない場合はデモ表示
                [-0.2, 0.2].forEach((offset, idx) => {
                    const angle = angleBase + offset;
                    const radius = 35;
                    const seed = v.id * 100 + idx;
                    const courseIndex = courses.length > 0 ? Math.floor(seededRandom(seed) * courses.length) : -1;
                    const course = courseIndex >= 0 ? courses[courseIndex] : null;

                    if (course) {
                        result.push({
                            id: `fallback_${v.id}_${idx}`,
                            name: course.title,
                            type: 'recommendation',
                            isUnlocked: false,
                            x: 50 + Math.cos(angle) * radius,
                            y: 50 + Math.sin(angle) * radius,
                            courseId: course.id,
                            relatedValueName: v.name,
                            aiMessage: "（デモ用のおすすめを表示しています）"
                        });
                    }
                });
            }
        });

        return result;
    }, [userAnalysis.selectedValues, courses, completedLessonIds, userRecommendations, isFetchingCourses, isLoading]);

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

    // Zoom & Pan State
    const constraintsRef = React.useRef(null);
    const [scale, setScale] = React.useState(1);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };




    return (
        <div
            className="relative w-full h-[600px] bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl group/panel"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

            <div className="absolute top-8 left-8 z-40 pointer-events-none">
                <h3 className="text-white font-black text-xl flex items-center gap-2">
                    <Zap className="text-yellow-400" /> スキルパネル
                </h3>
                <p className="text-slate-500 text-xs font-bold">あなたの価値観とスキルの繋がり</p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 right-8 z-[100] flex flex-col gap-2">
                <div className="bg-slate-800/80 backdrop-blur rounded-full p-1 border border-slate-700 shadow-lg flex flex-col mb-4 pointer-events-auto">
                    <button onClick={handleZoomIn} className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors font-bold" title="拡大">+</button>
                    <button onClick={handleReset} className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors flex items-center justify-center border-y border-slate-700" title="リセット">
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={handleZoomOut} className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors font-bold" title="縮小">-</button>

                </div>

                <div className="flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unlocked</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential</span>
                </div>

                {/* DEV: Reset Recommendations Button */}
                <button
                    onClick={async () => {
                        if (!currentUserId || isResetting) return;
                        setIsResetting(true);
                        try {
                            console.log('SkillPanel: Resetting recommendations...');
                            await resetRecommendations(currentUserId);
                            // Wait to ensure DELETE is fully processed
                            await new Promise(resolve => setTimeout(resolve, 500));

                            const selectedValues = userAnalysis?.selectedValues || [];
                            console.log('SkillPanel: Generating new recommendations for values:', selectedValues);
                            if (selectedValues.length > 0) {
                                await generateRecommendations(currentUserId, selectedValues);
                            }
                            // Reload page to get fresh data
                            window.location.reload();
                        } finally {
                            setIsResetting(false);
                        }
                    }}
                    disabled={isResetting}
                    className="mt-4 px-3 py-2 bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50 pointer-events-auto"
                    title="レコメンドをリセットして再生成"
                >
                    {isResetting ? '再生成中...' : '🔄 AI再生成'}
                </button>
            </div>

            {/* Draggable Area */}
            <motion.div
                ref={constraintsRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                drag
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                animate={{ x: position.x, y: position.y, scale }}
                onDragEnd={(_, info) => {
                    setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
                }}
            >
                {/* SVG Layer for Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
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
                                style={{ strokeLinecap: 'round' }}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                <div className="absolute inset-0">
                    {nodes.map((node, i) => (
                        <motion.div
                            key={node.id}
                            className="absolute"
                            style={{
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: node.isUnlocked ? 20 : 10 // Base Z-Index
                            }}
                            whileHover={{ zIndex: 10000 }} // Lift the entire container including tooltip
                        >
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.2 }}
                                className="relative group cursor-pointer"
                                onClick={() => {
                                    if (node.type === 'recommendation' && node.courseId) {
                                        window.location.href = `/reskill/course/${node.courseId}`;
                                    }
                                }}
                            >
                                <div className={`
                                    relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2 transition-all
                                    ${node.type === 'recommendation'
                                        ? 'bg-slate-900/90 border-slate-700 border-dashed hover:border-indigo-500 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]'
                                        : node.isUnlocked
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] backdrop-blur-sm'
                                            : 'bg-slate-800/80 border-slate-700 opacity-50'}
                                `}>
                                    {node.type === 'recommendation' ? (
                                        <Lock className="text-slate-500 group-hover:text-indigo-400 transition-colors" size={16} />
                                    ) : node.isUnlocked ? (
                                        <Sparkles className="text-indigo-400" size={node.type === 'value' ? 24 : 18} />
                                    ) : (
                                        <Lock className="text-slate-600" size={16} />
                                    )}

                                    {/* Label */}
                                    {/* Label - Dynamic Positioning based on Y coordinate */}
                                    <div className={`
                                        absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none transition-all
                                        ${node.y < 50 ? '-top-14' : '-bottom-14'}
                                        bg-slate-950/80 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-lg z-30
                                    `}>
                                        <div className={`text-[8px] font-black uppercase tracking-widest ${node.type === 'value' ? 'text-indigo-400' : 'text-slate-500'} mb-0.5`}>
                                            {node.type}
                                        </div>
                                        <div className={`text-[10px] font-black tracking-tighter ${node.isUnlocked || node.type === 'recommendation' ? 'text-white' : 'text-slate-600'} drop-shadow-md`}>
                                            {node.name}
                                        </div>
                                    </div>

                                    {/* Recommendation Tooltip - MAX Z-INDEX [9999] */}
                                    {node.type === 'recommendation' && (
                                        <div className={`
                                            absolute left-1/2 -translate-x-1/2 w-72 md:w-80 bg-slate-900/95 text-white text-xs p-4 rounded-xl border border-indigo-500/50 shadow-[0_0_40px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[9999]
                                            ${node.y < 50 ? 'top-full mt-4' : 'bottom-full mb-4'}
                                        `}>
                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-500/20">
                                                <Sparkles size={12} className="text-indigo-400" />
                                                <span className="font-black text-indigo-400 uppercase tracking-wider text-[10px]">AI Insight</span>
                                            </div>
                                            <p className="leading-relaxed text-slate-300 font-medium">
                                                {node.aiMessage || `「${node.relatedValueName}」の資質を持つあなたへ。このコースで潜在能力を解放可能です。`}
                                            </p>
                                            {/* Pointer arrow with matching border/bg */}
                                            <div className={`
                                                absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45
                                                ${node.y < 50
                                                    ? 'top-[-6px] border-t border-l border-indigo-500/50'
                                                    : 'bottom-[-6px] border-b border-r border-indigo-500/50'}
                                            `}></div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
