export const getYouTubeID = (url: string): string | null => {
    if (!url) return null;

    // Handle embed URLs
    if (url.includes('embed/')) {
        const match = url.match(/embed\/([^?&#]+)/);
        return match ? match[1] : null;
    }

    // Handle shorts URLs
    if (url.includes('shorts/')) {
        const match = url.match(/shorts\/([^?&#]+)/);
        return match ? match[1] : null;
    }

    // Handle watch URLs
    if (url.includes('watch?v=')) {
        const match = url.match(/[?&]v=([^?&#]+)/);
        return match ? match[1] : null;
    }

    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?&#]+)/);
        return match ? match[1] : null;
    }

    // Handle v/ URLs
    if (url.includes('/v/')) {
        const match = url.match(/\/v\/([^?&#]+)/);
        return match ? match[1] : null;
    }

    return null;
};

export const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = getYouTubeID(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
};

export const getYouTubeThumbnail = (url: string): string | null => {
    const videoId = getYouTubeID(url);
    if (!videoId) return null;
    // maxresdefault is high quality, but might not exist for some shorts.
    // hqdefault is safer, or we can try maxres and fallback.
    // For simplicity, let's use hqdefault which is almost always there, or 0.jpg
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
