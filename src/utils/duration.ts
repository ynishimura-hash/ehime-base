/**
 * Utility functions for handling duration strings (e.g. "10:30", "1:05:20")
 */

/**
 * Parses a duration string into seconds.
 * Supports formats: "HH:MM:SS" or "MM:SS"
 * Examples: "1:02:45" -> 3765, "10:30" -> 630
 */
export const parseDurationToSeconds = (durationStr: string): number => {
    if (!durationStr) return 0;

    // Normalize colons just in case
    const normalized = durationStr.replace(/：/g, ':').trim();
    const parts = normalized.split(':').map(part => parseInt(part, 10));

    // Check for NaN
    if (parts.some(isNaN)) return 0;

    if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        // Maybe just seconds or minutes? Assuming minutes if typically video duration, 
        // but let's assume it's seconds if just a number to be safe, 
        // OR return 0 if ambiguous.
        // Actually mock data seems to be strictly colon separated.
        return parts[0];
    }

    return 0;
};

/**
 * Formats seconds into a human-readable string.
 * Format: "X時間Y分" or "Y分" (Japanese friendly)
 */
export const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '0分';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    // We can ignore seconds for "Total Duration" usually, or round up?
    // Let's ceil minutes if seconds > 30? Or just floor.
    // "1時間5分" is cleaner than "1時間5分30秒" for coarse summary.

    if (hours > 0) {
        return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
};

/**
 * Calculates the total duration from an array of lessons/content items.
 * Expects items to have a `duration` string property.
 */
export const calculateTotalDuration = (items: { duration?: string }[]): string => {
    if (!items || items.length === 0) return '0分';

    const totalSeconds = items.reduce((acc, item) => {
        return acc + parseDurationToSeconds(item.duration || '');
    }, 0);

    return formatDuration(totalSeconds);
};
