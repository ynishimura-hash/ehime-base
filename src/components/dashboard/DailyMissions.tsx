import React from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

interface Mission {
    id: string;
    label: string;
    isCompleted: boolean;
    link?: string;
}

interface DailyMissionsProps {
    missions: Mission[];
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({ missions }) => {
    const completedCount = missions.filter(m => m.isCompleted).length;
    const progress = Math.round((completedCount / missions.length) * 100);

    return (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Target size={18} className="text-blue-500" />
                    本日のミッション
                </h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {completedCount}/{missions.length} 達成
                </span>
            </div>

            <div className="space-y-3">
                {missions.map(mission => (
                    <div key={mission.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`transition-colors ${mission.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                                {mission.isCompleted ? <CheckCircle2 size={20} fill="currentColor" className="text-white bg-emerald-500 rounded-full" /> : <Circle size={20} />}
                            </div>
                            <span className={`text-xs font-bold ${mission.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {mission.label}
                            </span>
                        </div>
                        {mission.link && !mission.isCompleted && (
                            <Link href={mission.link} className="text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-shrink-0">
                                挑戦
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
