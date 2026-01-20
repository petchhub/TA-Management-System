export const getNextClassDate = (dayName: string, timeString: string): Date => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = days.findIndex(d => d.toLowerCase() === dayName.toLowerCase());

    if (dayIndex === -1) return new Date(); // Fallback

    const now = new Date();
    const currentDayIndex = now.getDay();

    let daysUntil = dayIndex - currentDayIndex;

    // Parse time (e.g., "14:30:00" or "14:30")
    const [hours, minutes] = timeString.split(':').map(Number);

    // If it's today, check if the time has passed
    if (daysUntil === 0) {
        const classTime = new Date(now);
        classTime.setHours(hours, minutes, 0, 0);
        if (classTime < now) {
            daysUntil = 7; // Next week
        }
    } else if (daysUntil < 0) {
        daysUntil += 7;
    }

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntil);
    nextDate.setHours(hours, minutes, 0, 0);

    return nextDate;
};

export const formatTimeRange = (start: string, end: string): string => {
    const format = (t: string) => t.split(':').slice(0, 2).join(':');
    return `${format(start)} - ${format(end)}`;
};
