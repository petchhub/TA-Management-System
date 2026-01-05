/**
 * Utility functions for formatting dates and times
 */

/**
 * Format a time string to HH:mm format
 * Handles converting full datetime strings (ISO) or time strings (HH:mm:ss, HH:mm)
 * to a simple HH:mm display format.
 * 
 * @param timeStr - The time string to format (e.g., "09:00:00", "2024-01-01T09:00:00Z", "0000-01-01T09:00:00Z")
 * @returns Formatted time string "HH:mm" or "00:00" if invalid
 */
export const formatTime = (timeStr: string): string => {
    if (!timeStr) return "00:00";

    // Handle ISO strings like "0000-01-01T09:00:00Z" or "2024-01-01T09:00:00"
    if (timeStr.includes('T')) {
        const parts = timeStr.split('T');
        if (parts.length >= 2) {
            // Take the time part: "09:00:00Z" -> "09:00"
            // We ignore timezone conversions (Date parsing) because "Class Time" 
            // is usually literal, not relative to UTC when stored with a dummy date.
            const timePart = parts[1].replace('Z', '');
            return timePart.slice(0, 5);
        }
    }

    // Handle "Time only" strings like "09:00", "09:00:00"
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        // Ensure we have at least HH:mm
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
    }

    // If simply 4 digits like "0900"
    if (/^\d{4}$/.test(timeStr)) {
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
    }

    // Fallback try to just slice 5 chars if length is sufficient
    if (timeStr.length >= 5) {
        // If "09.00"
        if (timeStr.includes('.')) {
            return timeStr.replace('.', ':').slice(0, 5);
        }
        const slice = timeStr.slice(0, 5);
        if (slice.includes(':')) return slice;
    }

    return "00:00";
};
