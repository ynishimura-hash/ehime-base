import React from 'react';
import { X, MapPin, Globe, Building2, Users, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: any; // Using any for now to match page usage, ideally strictly typed
}

export function CompanyDetailModal({ isOpen, onClose, company }: CompanyDetailModalProps) {
    if (!company) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
                            >
                                <X size={20} className="text-zinc-800" />
                            </button>

                            {/* Header Image / Cover */}
                            <div className="h-32 sm:h-48 bg-slate-100 relative shrink-0">
                                {company.cover_image_url ? (
                                    <img
                                        src={company.cover_image_url}
                                        alt={company.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                        <Building2 className="text-zinc-300 w-16 h-16" />
                                    </div>
                                )}
                                {/* Logo Overlay */}
                                <div className="absolute -bottom-10 left-6 sm:left-8">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-lg p-1">
                                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden border border-zinc-100">
                                            {company.logo_url ? (
                                                <img
                                                    src={company.logo_url}
                                                    alt={company.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Building2 className="text-zinc-300 w-10 h-10" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto pt-12 pb-8 px-6 sm:px-8">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-wider rounded-md">
                                                {company.industry}
                                            </span>
                                            {company.location && (
                                                <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                                                    <MapPin size={12} />
                                                    {company.location}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black text-zinc-900 leading-tight mb-2">
                                            {company.name}
                                        </h2>
                                        {company.catchphrase && (
                                            <p className="text-blue-600 font-bold text-sm">
                                                {company.catchphrase}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="prose prose-sm prose-slate max-w-none">
                                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                            {company.description || company.introduction || '企業詳細情報はありません。'}
                                        </p>
                                    </div>

                                    {/* Company Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                                        {company.website_url && (
                                            <div className="col-span-1 sm:col-span-2">
                                                <a
                                                    href={company.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 hover:underline font-medium text-sm transition-colors"
                                                >
                                                    <Globe size={16} />
                                                    コーポレートサイトを見る
                                                </a>
                                            </div>
                                        )}

                                        {company.employee_count && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-zinc-200/50 pb-4 last:border-0 last:pb-0">
                                                <dt className="text-xs font-bold text-zinc-400 uppercase sm:col-span-1">従業員数</dt>
                                                <dd className="text-sm font-bold text-zinc-800 sm:col-span-2">
                                                    {/^\d+$/.test(String(company.employee_count)) ? `${company.employee_count}名` : company.employee_count}
                                                </dd>
                                            </div>
                                        )}

                                        {company.founding_year && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
                                                <div className="p-2 bg-white rounded-lg shadow-sm text-zinc-500">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-black text-zinc-400 uppercase">設立</span>
                                                    <span className="text-sm font-bold text-zinc-900">{company.founding_year && !isNaN(Number(company.founding_year)) ? `${company.founding_year}年` : company.founding_year}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                                >
                                    閉じる
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
