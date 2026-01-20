"use client";

import React, { useEffect, useState, useRef } from 'react';
import { X, Heart, Share2, ArrowRight } from 'lucide-react';
import { Reel } from '@/lib/dummyData';
import Link from 'next/link';

interface ReelModalProps {
    reels: Reel[];
    initialReelIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    entityName: string; // Company Name or Job Title
    entityId: string;
    entityType: 'company' | 'job';
    companyId?: string; // For navigation
}

export const ReelModal: React.FC<ReelModalProps> = ({
    reels,
    initialReelIndex = 0,
    isOpen,
    onClose,
    entityName,
    entityId,
    entityType,
    companyId
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialReelIndex);
    const [isLiked, setIsLiked] = useState(false);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    useEffect(() => {
        setCurrentIndex(initialReelIndex);
    }, [initialReelIndex]);

    // Keyboard Navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                handleNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                handlePrev();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, reels]);

    if (!isOpen || !reels || reels.length === 0) return null;

    const currentReel = reels[currentIndex];

    const handleNext = () => {
        if (currentIndex < reels.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartY.current === null) return;
        const diff = touchStartY.current - e.changedTouches[0].clientY;

        if (Math.abs(diff) > 50) { // Threshold
            if (diff > 0) { // Swipe Up
                handleNext();
            } else { // Swipe Down
                handlePrev();
            }
        }
        touchStartY.current = null;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
                <X size={24} />
            </button>

            {/* Main Container */}
            <div
                className="relative w-full h-full md:max-w-md md:max-h-[80vh] md:rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Video Player */}
                <div className="w-full h-full flex items-center justify-center bg-black relative">
                    {currentReel.type === 'file' ? (
                        <video
                            src={currentReel.url}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            playsInline
                        />
                    ) : (
                        <iframe
                            src={`${currentReel.url}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentReel.url.split('embed/')[1]}`} // simplistic playlist hack for loop
                            className="w-full h-full pointer-events-none" // Disable interaction to keep swipe working? might break volume control
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ pointerEvents: 'auto' }} // Re-enable for YouTube controls if needed, but might interfere with swipe
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
                </div>

                {/* Right Side Actions */}
                <div className="absolute bottom-20 right-4 flex flex-col gap-6 items-center z-10">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-3 rounded-full bg-black/40 backdrop-blur-sm transition-transform group-active:scale-95 ${isLiked ? 'text-red-500' : 'text-white'}`}>
                            <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">
                            {currentReel.likes + (isLiked ? 1 : 0)}
                        </span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform group-active:scale-95">
                            <Share2 size={24} />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                    </button>
                </div>

                {/* Bottom Info Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-10 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg drop-shadow-md line-clamp-1">{entityName}</h3>
                        <Link
                            href={entityType === 'company' ? `/companies/${entityId}` : `/jobs/${entityId}`}
                            className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-1"
                        >
                            詳細へ <ArrowRight size={12} />
                        </Link>
                    </div>

                    <p className="text-sm font-medium mb-1 drop-shadow-md line-clamp-2">
                        {currentReel.title}
                    </p>
                    {currentReel.description && (
                        <p className="text-xs text-slate-200 drop-shadow-md line-clamp-2 opacity-90">
                            {currentReel.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
