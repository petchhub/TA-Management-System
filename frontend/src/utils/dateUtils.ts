export const getNextClassDate = (dayName: string, timeString: string): Date => {
    const daysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysThai = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

    let dayIndex = daysEng.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
    if (dayIndex === -1) {
        // Robust matching for Thai days (handles cases with/without "วัน" prefix and whitespace)
        // Check if DB day contains array day OR array day contains DB day
        dayIndex = daysThai.findIndex(d => {
            const cleanDBDay = dayName.trim();
            return d === cleanDBDay || d.includes(cleanDBDay) || cleanDBDay.includes(d);
        });
    }

    if (dayIndex === -1) return new Date(); // Fallback

    const now = new Date();
    const currentDayIndex = now.getDay();

    let daysUntil = dayIndex - currentDayIndex;

    // Parse time (e.g., "14:30:00" or "14:30" or ISO string)
    let hours = 0, minutes = 0;
    if (timeString.includes('T')) {
        const d = new Date(timeString);
        if (!isNaN(d.getTime())) {
            hours = d.getHours();
            minutes = d.getMinutes();
        }
    } else {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10);
        }
    }

    // Safety check
    if (isNaN(hours)) hours = 0;
    if (isNaN(minutes)) minutes = 0;

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
