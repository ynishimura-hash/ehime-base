"use client";

import React from 'react';
import { Briefcase, Sparkles, Building2, Play, GraduationCap, ChevronRight } from 'lucide-react';
import { useAppStore, Attachment } from '@/lib/appStore';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MessageItemCardProps {
    attachment: Attachment;
    isMe: boolean;
}

export default function MessageItemCard({ attachment, isMe }: MessageItemCardProps) {
    const { jobs, companies, courses } = useAppStore();

    const getCardData = () => {
        switch (attachment.type) {
            case 'job':
                const job = jobs.find(j => j.id === attachment.itemId);
                const company = companies.find(c => c.id === job?.companyId);
                return {
                    title: job?.title || attachment.name,
                    subtitle: company?.name || '求人・クエスト',
                    image: job?.cover_image_url || '/images/defaults/default_job_cover.png',
                    icon: <Briefcase size={16} />,
                    color: 'bg-orange-500',
                    href: `/jobs/${attachment.itemId}`,
                    tag: 'JOB'
                };
            case 'quest':
                const quest = jobs.find(j => j.id === attachment.itemId);
                const questCompany = companies.find(c => c.id === quest?.companyId);
                return {
                    title: quest?.title || attachment.name,
                    subtitle: questCompany?.name || '求人・クエスト',
                    image: quest?.cover_image_url || '/images/defaults/default_job_cover.png',
                    icon: <Sparkles size={16} />,
                    color: 'bg-purple-500',
                    href: `/jobs/${attachment.itemId}`,
                    tag: 'QUEST'
                };
            case 'company':
                const comp = companies.find(c => c.id === attachment.itemId);
                return {
                    title: comp?.name || attachment.name,
                    subtitle: comp?.industry || '企業情報',
                    image: comp?.cover_image_url || comp?.image || '/images/defaults/default_company_cover.png',
                    icon: <Building2 size={16} />,
                    color: 'bg-blue-500',
                    href: `/companies/${attachment.itemId}`,
                    tag: 'COMPANY'
                };
            case 'reel':
                return {
                    title: attachment.name,
                    subtitle: 'リール動画',
                    image: '/images/defaults/default_video_thumb.png', // Fallback
                    icon: <Play size={16} />,
                    color: 'bg-red-500',
                    href: `/reels?id=${attachment.itemId}`,
                    tag: 'VIDEO'
                };
            case 'course':
                const course = courses.find(c => c.id === attachment.itemId);
                return {
                    title: course?.title || attachment.name,
                    subtitle: 'Eラーニング',
                    image: course?.thumbnail_url || course?.image || '/images/defaults/default_course_thumb.png',
                    icon: <GraduationCap size={16} />,
                    color: 'bg-emerald-500',
                    href: `/courses/${attachment.itemId}`,
                    tag: 'COURSE'
                };
            default:
                return null;
        }
    };

    const data = getCardData();
    if (!data) return null;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className={`w-64 overflow-hidden rounded-2xl shadow-xl border border-white/20 bg-white/10 backdrop-blur-md mb-2 cursor-pointer group`}
        >
            <Link href={data.href} className="block">
                <div className="relative h-32 w-full overflow-hidden">
                    <img
                        src={data.image}
                        alt={data.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black text-white flex items-center gap-1 shadow-lg ${data.color}`}>
                        {data.icon}
                        <span>{data.tag}</span>
                    </div>
                </div>
                <div className="p-3 bg-white">
                    <h5 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {data.title}
                    </h5>
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-slate-400 truncate flex-1">
                            {data.subtitle}
                        </p>
                        <div className="p-1 rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
