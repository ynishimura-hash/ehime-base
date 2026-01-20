"use client";

import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-50 p-3 bg-white/90 backdrop-blur border border-zinc-200 rounded-full shadow-lg text-zinc-500 hover:bg-zinc-100 hover:text-blue-600 transition-all active:scale-95"
            aria-label="トップに戻る"
        >
            <ChevronUp size={24} />
        </button>
    );
}
