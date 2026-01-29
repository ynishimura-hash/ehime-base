import React, { useState } from 'react';
import Link from 'next/link';
import { Company } from '@/types/shared';
import { getYouTubeEmbedUrl } from '@/lib/videoUtils';

interface CompanyCarouselItemProps {
    company: Company;
}

export const CompanyCarouselItem: React.FC<CompanyCarouselItemProps> = ({ company: c }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Determine if we have a reel to play
    const reel = c.reels && c.reels.length > 0 ? c.reels[0] : null;

    React.useEffect(() => {
        if (!videoRef.current || !reel || reel.type !== 'file') return;

        if (isHovered) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.log("Auto-play was prevented:", error);
                });
            }
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset to start
        }
    }, [isHovered, reel]);

    return (
        <Link
            href={`/companies/${c.id}`}
            className="flex-shrink-0 w-64 opacity-90 hover:opacity-100 transition-all transform hover:scale-105 group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 group-hover:border-blue-400 group-hover:shadow-2xl transition-all bg-slate-100">
                {/* Base Cover Image */}
                <div className="w-full h-full bg-slate-200">
                    <img
                        src={c.cover_image_url || c.image || '/images/defaults/default_job_cover.png'}
                        alt={c.name}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered && reel ? 'opacity-0' : 'opacity-100'}`}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-indigo-500');
                        }}
                    />
                </div>

                {/* Hover Video Overlay */}
                {reel && (
                    <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        {reel.type === 'file' ? (
                            <video
                                ref={videoRef}
                                src={`${reel.url}#t=0.01`}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <div className="w-full h-full relative overflow-hidden">
                                {isHovered && getYouTubeEmbedUrl(reel.url) && (
                                    <iframe
                                        src={`${getYouTubeEmbedUrl(reel.url)}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${getYouTubeEmbedUrl(reel.url)?.split('/').pop()}`}
                                        className="w-[300%] h-[300%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ pointerEvents: 'none' }}
                                        allow="autoplay; encrypted-media"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Logo Overlay - Keep visible even on hover? Yes, branding. */}
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full border-2 border-white bg-white overflow-hidden shadow-lg z-20">
                    {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${c.logoColor || 'bg-slate-400'} flex items-center justify-center text-[10px] text-white font-black`}>
                            {c.name.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
