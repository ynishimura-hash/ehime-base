import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Reel } from '@/lib/dummyData';

interface ReelIconProps {
    reels: Reel[];
    onClick: () => void;
    fallbackImage?: string;
}

export const ReelIcon: React.FC<ReelIconProps> = ({ reels, onClick, fallbackImage }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!reels || reels.length === 0) return null;

    const firstReel = reels[0];

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group mr-2"
        >
            <div className="w-32 h-32 rounded-full p-[5px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 animate-pulse-slow active:scale-95 transition-transform shadow-2xl">
                <div className="w-full h-full rounded-full bg-white border-2 border-transparent flex items-center justify-center relative overflow-hidden bg-black">
                    {/* Hover Preview Video */}
                    <div className="w-full h-full relative">
                        {firstReel.type === 'file' ? (
                            <video
                                src={`${firstReel.url}${!isHovered ? '#t=0.01' : ''}`}
                                className="w-full h-full object-cover"
                                autoPlay={isHovered}
                                muted
                                loop={isHovered}
                                playsInline
                            />
                        ) : firstReel.thumbnail ? (
                            <img src={firstReel.thumbnail} alt="Reel" className="w-full h-full object-cover" />
                        ) : fallbackImage ? (
                            <img src={fallbackImage} alt="Reel Fallback" className="w-full h-full object-cover opacity-60" />
                        ) : (
                            <div className="w-full h-full bg-slate-800" />
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all pointer-events-none ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                            <Play size={48} className="text-white fill-white ml-2 drop-shadow-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-1 -right-2 bg-black text-white text-[12px] px-3 py-1 rounded-sm font-black border border-white/20 tracking-tighter shadow-xl">
                REEL
            </div>
        </button>
    );
};
