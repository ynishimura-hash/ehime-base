'use client';

import React, { useEffect, useState } from 'react';
import { Award, Sparkles, TrendingUp, Loader2, BrainCircuit, Zap, Link as LinkIcon } from 'lucide-react';
import { analyzeCourseAffinity, AffinityResult } from '@/app/actions/elearning-ai';
import { VALUE_CARDS } from '@/lib/constants/analysisData';

interface AffinitySectionProps {
    course: {
        title: string;
        description?: string;
        category?: string;
    };
    courseId: string;
    userId: string;
    userAnalysis: any;
    userName: string;
}

export const AffinitySection = ({ course, courseId, userId, userAnalysis, userName }: AffinitySectionProps) => {
    const [result, setResult] = useState<AffinityResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const analyze = async () => {
            // Extract user traits and resolve IDs to Names
            let strengths = userAnalysis?.strengths || userAnalysis?.selectedValues || [];

            // If strengths are IDs (numbers), resolve them to names
            if (Array.isArray(strengths) && strengths.length > 0 && typeof strengths[0] === 'number') {
                strengths = strengths.map((id: number) => {
                    const card = VALUE_CARDS.find(c => c.id === id);
                    return card ? card.name : `Value #${id}`;
                });
            }

            const data = await analyzeCourseAffinity({
                userId,
                userName,
                courseId: courseId,
                courseTitle: course.title,
                courseDescription: course.description || '',
                courseCategory: course.category || '',
                userStrengths: Array.isArray(strengths) ? strengths : [],
            });

            setResult(data);
            setLoading(false);
        };

        if (userId && courseId) {
            analyze();
        }
    }, [course.title, userId, courseId]);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-center justify-center min-h-[160px]">
                <div className="flex flex-col items-center gap-2 text-blue-600/60">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-xs font-bold animate-pulse">AIがあなたの強みとの相性を分析中...</span>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 mb-8 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/20 transition-colors duration-700" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <BrainCircuit size={10} /> AI Analysis
                        </span>
                        <h3 className="font-black text-blue-900 flex items-center gap-2 text-sm">
                            あなたとの親和性
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-blue-600">Match Score</span>
                        <span className="text-2xl font-black text-blue-700">{result.score}<span className="text-sm text-blue-400">%</span></span>
                    </div>
                </div>

                <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">
                    {result.title}
                </h4>

                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium mb-4">
                    {result.reason}
                </p>

                {/* Match Details */}
                {result.matchDetails && result.matchDetails.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <h5 className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-2">
                            <Sparkles size={12} /> マッチング詳細
                        </h5>
                        {result.matchDetails.map((detail, idx) => (
                            <div key={idx} className="bg-white/60 rounded-xl p-3 border border-white/50 shadow-sm text-xs">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5 opacity-90">
                                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                        <Zap size={8} /> あなたの{detail.strength}
                                    </span>
                                    <LinkIcon size={10} className="text-slate-400/70" />
                                    <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {detail.courseFeature}
                                    </span>
                                </div>
                                <p className="text-slate-700 leading-snug pl-1 border-l-2 border-blue-200 ml-1">
                                    <span className="font-bold text-blue-600 mr-1">point:</span>
                                    {detail.explanation}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white/60 rounded-xl p-3 border border-white/50 shadow-sm flex items-start gap-3">
                    <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-700 shrink-0 mt-0.5">
                        <TrendingUp size={14} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Career Benefit</span>
                        <p className="text-xs font-bold text-slate-700 leading-snug">
                            {result.careerBenefit}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
