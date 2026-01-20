"use client";

import React, { useEffect, useState, useRef } from 'react';
import { X, Heart, Share2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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

    // Video Control State
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

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
        // Reset video state
        setIsPlaying(true);
        setProgress(0);
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

    // Navigation Handlers
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

    // Video Control Handler
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            if (total > 0) {
                setProgress((current / total) * 100);
                setDuration(total);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekValue = parseFloat(e.target.value);
        const seekTime = (seekValue / 100) * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
            setProgress(seekValue);
        }
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
                {/* Navigation Buttons (Desktop - Inside Card) */}
                {currentIndex > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 hidden md:block"
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}

                {currentIndex < reels.length - 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 hidden md:block"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
                {/* Video Player */}
                <div
                    className="w-full h-full flex items-center justify-center bg-black relative cursor-pointer"
                    onClick={currentReel.type === 'file' ? togglePlay : undefined}
                >
                    {currentReel.type === 'file' ? (
                        <>
                            <video
                                ref={videoRef}
                                src={currentReel.url}
                                className="w-full h-full object-contain bg-black"
                                autoPlay
                                loop
                                playsInline
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            />
                            {/* Play/Pause Icon Overlay */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                        <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-1" />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <iframe
                            src={`${currentReel.url}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentReel.url.split('embed/')[1]}`}
                            className="w-full h-full pointer-events-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ pointerEvents: 'auto' }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
                </div>

                {/* Right Side Actions */}
                <div className="absolute bottom-20 right-4 flex flex-col gap-6 items-center z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-3 rounded-full bg-black/40 backdrop-blur-sm transition-transform group-active:scale-95 ${isLiked ? 'text-red-500' : 'text-white'}`}>
                            <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">
                            {currentReel.likes + (isLiked ? 1 : 0)}
                        </span>
                    </button>

                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform group-active:scale-95">
                            <Share2 size={24} />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                    </button>
                </div>

                {/* Bottom Info Area */}
                <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe">
                    <div className="px-4 pb-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg drop-shadow-md line-clamp-1">{entityName}</h3>
                            <Link
                                href={entityType === 'company' ? `/companies/${entityId}` : `/jobs/${entityId}`}
                                onClick={(e) => e.stopPropagation()}
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

                    {/* Progress Bar (Only for File Videos) */}
                    {currentReel.type === 'file' && (
                        <div className="w-full h-1 bg-white/30 relative group" onClick={(e) => e.stopPropagation()}>
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-white transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress || 0}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer group-hover:h-2 transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
