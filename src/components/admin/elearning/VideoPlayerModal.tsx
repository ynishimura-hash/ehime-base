'use client';

import React from 'react';
import { X, FileText } from 'lucide-react';
import { getYoutubeId } from '@/utils/youtube';

interface ContentItem {
    url?: string;
    videoUrl?: string; // For LessonItem compatibility fallback
}

interface VideoPlayerModalProps {
    content: ContentItem | null;
    onClose: () => void;
}

export default function VideoPlayerModal({ content, onClose }: VideoPlayerModalProps) {
    if (!content) return null;

    // Support both url (ContentItem) and videoUrl (LessonItem)
    const videoUrl = content.url || content.videoUrl;
    const youtubeId = getYoutubeId(videoUrl);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-black w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-md"
                >
                    <X size={20} />
                </button>
                {youtubeId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white flex-col gap-4">
                        <FileText size={64} className="text-slate-600" />
                        <p className="font-bold text-lg">動画URLがありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}
