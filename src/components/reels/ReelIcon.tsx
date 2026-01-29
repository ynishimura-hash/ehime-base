import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Reel } from '@/types/shared';
import { getYouTubeThumbnail, getYouTubeEmbedUrl } from '@/lib/videoUtils';

interface ReelIconProps {
    reels: Reel[];
    onClick: () => void;
    fallbackImage?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const ReelIcon: React.FC<ReelIconProps> = ({ reels, onClick, fallbackImage, size = 'xl', className = 'mr-2' }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!reels || reels.length === 0) return null;

    const firstReel = reels[0];

    // Size mappings
    const sizeClasses = {
        sm: 'w-10 h-10 p-[2px]',
        md: 'w-16 h-16 p-[3px]',
        lg: 'w-24 h-24 p-[4px]',
        xl: 'w-32 h-32 p-[5px]'
    };

    return (
        <div
            role="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative group cursor-pointer ${className}`}
        >
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 animate-pulse-slow active:scale-95 transition-transform shadow-2xl`}>
                <div className="w-full h-full rounded-full bg-white border-2 border-transparent flex items-center justify-center relative overflow-hidden bg-black">
                    {/* Hover Preview Video */}
                    <div className="w-full h-full relative">
                        {firstReel.type === 'file' ? (
                            <video
                                src={`${firstReel.url}${!isHovered ? '#t=0.01' : ''}`}
                                className="w-full h-full object-cover scale-110"
                                autoPlay={isHovered}
                                muted
                                loop={isHovered}
                                playsInline
                            />
                        ) : (
                            <>
                                {isHovered && getYouTubeEmbedUrl(firstReel.url) ? (
                                    <iframe
                                        src={`${getYouTubeEmbedUrl(firstReel.url)}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${getYouTubeEmbedUrl(firstReel.url)?.split('/').pop()}`}
                                        className="w-[100%] h-[180%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none scale-110"
                                        style={{ pointerEvents: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                ) : (
                                    <img
                                        src={firstReel.thumbnail || getYouTubeThumbnail(firstReel.url) || fallbackImage || ''}
                                        alt="Reel"
                                        className={`w-full h-full object-cover scale-110 ${!firstReel.thumbnail && !getYouTubeThumbnail(firstReel.url) && fallbackImage ? 'opacity-60' : ''}`}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (fallbackImage && !target.getAttribute('data-error-tried')) {
                                                target.setAttribute('data-error-tried', 'true');
                                                target.src = fallbackImage;
                                            } else {
                                                target.style.display = 'none';
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all pointer-events-none ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                            <Play size={size === 'sm' ? 12 : size === 'md' ? 24 : 48} className="text-white fill-white ml-2 drop-shadow-xl" />
                        </div>
                    </div>
                </div>
            </div>
            {size !== 'sm' && (
                <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-zinc-900/90 backdrop-blur-sm text-white text-[8px] px-2 py-[1px] rounded-full font-black border border-white/20 tracking-widest shadow-lg z-20">
                    REEL
                </div>
            )}
        </div>
    );
};
