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

export const formatTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';

    // Handle ISO strings like "0000-01-01T09:00:00Z" or "2024-01-01T09:00:00"
    if (timeStr.includes('T')) {
        const parts = timeStr.split('T');
        if (parts.length >= 2) {
            const timePart = parts[1].replace('Z', '');
            return timePart.slice(0, 5);
        }
    }

    // Handle "Time only" strings like "09:00", "09:00:00"
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
    }

    // Handle 4 digits like "0900"
    if (/^\d{4}$/.test(timeStr)) {
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
    }

    return timeStr;
};

export const formatTimeRange = (start: string | undefined, end: string | undefined): string => {
    if (!start || !end) return '';
    return `${formatTime(start)} - ${formatTime(end)}`;
};

export const getThaiDay = (dayEn: string): string => {
    const mapping: { [key: string]: string } = {
        'Monday': 'วันจันทร์',
        'Tuesday': 'วันอังคาร',
        'Wednesday': 'วันพุธ',
        'Thursday': 'วันพฤหัสบดี',
        'Friday': 'วันศุกร์',
        'Saturday': 'วันเสาร์',
        'Sunday': 'วันอาทิตย์'
    };
    return mapping[dayEn] || dayEn;
};

export const formatDay = (day: string | undefined): string => {
    if (!day) return '-';
    // If it's already Thai or doesn't match English, getThaiDay returns original
    return getThaiDay(day);
};
