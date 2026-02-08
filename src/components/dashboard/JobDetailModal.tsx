
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, MapPin, Banknote, Clock, Calendar, Briefcase, FileText } from 'lucide-react';

interface Job {
    title: string;
    organization_id: string;
    type?: string;
    content?: string;
    salary?: string;
    working_hours?: string;
    holidays?: string;
    location?: string;
    welfare?: string;
    selection_process?: string;
}

interface JobDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: Job | null;
}

export function JobDetailModal({ isOpen, onClose, job }: JobDetailModalProps) {
    if (!job) return null;

    const isQuest = job.type === 'quest' || job.type === 'internship'; // Assuming type distinguishing quest/intern vs job

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative">

                            {/* Header */}
                            <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50 shrink-0">
                                <div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${isQuest ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {isQuest ? 'クエスト' : '求人'}
                                    </span>
                                    <h2 className="text-xl font-black text-zinc-900 leading-tight">{job.title}</h2>
                                </div>
                                <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors shrink-0 ml-4">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* 募集要項 */}
                                <div>
                                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText size={16} /> 募集内容
                                    </h3>
                                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                                        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                            {job.content || '詳細情報はありません'}
                                        </p>
                                    </div>
                                </div>

                                {/* 詳細条件 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {job.location && (
                                        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin size={14} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500">勤務地</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800">{job.location}</p>
                                        </div>
                                    )}
                                    {job.salary && (
                                        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Banknote size={14} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500">給与・報酬</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800">{job.salary}</p>
                                        </div>
                                    )}
                                    {job.working_hours && (
                                        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock size={14} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500">勤務時間</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800">{job.working_hours}</p>
                                        </div>
                                    )}
                                    {job.holidays && (
                                        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar size={14} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500">休日・休暇</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800">{job.holidays}</p>
                                        </div>
                                    )}
                                    {job.welfare && (
                                        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 md:col-span-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Building size={14} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500">福利厚生・待遇</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800 whitespace-pre-wrap">{job.welfare}</p>
                                        </div>
                                    )}
                                    {job.selection_process && (
                                        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 md:col-span-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Briefcase size={14} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500">選考プロセス</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800 whitespace-pre-wrap">{job.selection_process}</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
