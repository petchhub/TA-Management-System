import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LayoutList, Calendar as CalendarIcon } from "lucide-react";
import { formatTime } from "../../utils/formatUtils";
import { useAuth } from "../../context/AuthContext";
import { getStudentApplications, getAllCourses, Course } from "../../services/courseService";
import ManagedCourseCard from "./ManagedCourseCard";

interface Holiday {
    id: number;
    date: string;
    name: string;
    type: string; // 'official' | 'special'
}

type CourseColor = {
    bg: string;
    text: string;
    border: string;
};

const COURSE_COLORS: CourseColor[] = [
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
];

export default function ManagedCourses() {
    const { user } = useAuth();
    const [managedCourses, setManagedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>(() => {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        return view === 'list' ? 'list' : 'calendar';
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    // Memoize course colors to ensure they stay consistent for same courseID
    const getCourseColor = (courseId: number | string): CourseColor => {
        // Simple hash to pick a color
        const idStr = courseId.toString();
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) {
            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % COURSE_COLORS.length;
        return COURSE_COLORS[index];
    };

    const fetchHolidays = async () => {
        try {
            const [year, month] = selectedMonth.split('-').map(Number);
            const response = await fetch(`http://localhost:8084/TA-management/lookup/holiday?month=${month}&year=${year}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch holidays');
            const data = await response.json();
            setHolidays(data || []);
        } catch (error) {
            console.error('Error fetching holidays:', error);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, [selectedMonth]);

    const handlePrevMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1 - 1, 1);
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1 + 1, 1);
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const getDaysInMonth = (yearMonth: string) => {
        const [year, month] = yearMonth.split('-').map(Number);
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (yearMonth: string) => {
        const [year, month] = yearMonth.split('-').map(Number);
        return new Date(year, month - 1, 1).getDay();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(selectedMonth);
        const firstDay = getFirstDayOfMonth(selectedMonth);
        const days = [];

        // Day mapping: Database stores Thai names (e.g., "วันจันทร์")
        // Date.getDay() returns 0=Sunday, 1=Monday...
        const dayMap: Record<number, string> = {
            1: "วันอาทิตย์",
            2: "วันจันทร์",
            3: "วันอังคาร",
            4: "วันพุธ",
            5: "วันพฤหัสบดี",
            6: "วันศุกร์",
            7: "วันเสาร์"
        };


        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 bg-gray-50/50"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedMonth);
            date.setDate(day);
            const dayOfWeek = date.getDay() + 1; // User changed map to 1-based (1=Sunday)
            const dayName = dayMap[dayOfWeek];
            const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === date.toDateString();

            // Find holiday
            const holiday = holidays.find(h => h.date.startsWith(dateStr));

            // Find courses that have class on this day
            // Backend returns Thai day names, so we match against dayMap (which is now Thai)
            // match robustly: trim whitespace and check inclusively
            const todaysClasses = managedCourses.filter(c => {
                // 1. Day Check
                if (!c.classday) return false;
                const dbDay = c.classday.trim();
                const matchesDay = dbDay === dayName || dbDay.includes(dayName) || dayName.includes(dbDay);
                if (!matchesDay) return false;

                // 2. Date Range Check
                // If dates are missing, show by default (fallback)
                if (!c.semesterStart || !c.semesterEnd) return true;

                const start = new Date(c.semesterStart);
                const end = new Date(c.semesterEnd);
                // Reset times to avoid timezone issues affecting inclusive boundary check
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return date >= start && date <= end;
            });

            days.push(
                <div key={day} className={`min-h-[120px] p-2 border border-gray-100 transition-colors relative 
                    ${holiday ? (holiday.type === 'official' ? 'bg-red-50 hover:bg-red-100' : 'bg-yellow-50 hover:bg-yellow-100') : 'bg-white hover:bg-gray-50'}
                    ${isToday ? 'ring-2 ring-orange-500 ring-inset' : ''}
                `}>
                    <div className="flex justify-between items-start mb-2">
                        <div className={`text-sm font-medium ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                            {day}
                        </div>
                    </div>

                    {holiday ? (
                        <div className="flex-1 flex items-center justify-center p-1 w-full">
                            <div className={`text-center text-sm px-2 py-1.5 rounded-md font-medium w-full ${holiday.type === 'official' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {holiday.name}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {todaysClasses.map((course, idx) => {
                                const color = getCourseColor(course.courseID);
                                return (
                                    <div key={`${day}-${course.courseID}-${idx}`} className={`px-2 py-1.5 rounded-md border ${color.bg} ${color.border}`}>
                                        <div className={`font-semibold truncate mb-0.5 text-sm ${color.text}`}>
                                            {course.courseName}
                                        </div>
                                        <div className={`truncate text-xs ${color.text} opacity-90`}>
                                            {formatTime(course.classStart)} - {formatTime(course.classEnd)} | {course.location}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const studentId = parseInt(user.id);

                // Fetch applications and ALL courses to ensure we find the match
                const [apps, courses] = await Promise.all([
                    getStudentApplications(studentId),
                    getAllCourses()
                ]);

                console.log("Student Apps:", apps);
                console.log("All Courses:", courses);

                // Filter for approved applications only (case-insensitive)
                const approvedApps = apps.filter(app => app.statusCode?.toUpperCase() === "APPROVED");
                console.log("Approved Apps:", approvedApps);

                // Map approved applications to full course details
                const approvedCourses = approvedApps
                    .map(app => {
                        // Find matching course logic:
                        // 1. Match by jobPostID (preferred if available)
                        // 2. Match by courseID (fallback, handle string/number types)
                        const course = courses.find(c =>
                            c.jobPostID === app.courseID ||
                            c.courseID === app.courseID ||
                            c.courseID.toString() === app.courseID.toString()
                        );

                        if (course) {
                            // Use location from application if available (backend explicitly joins this now)
                            // otherwise fallback to course location
                            return { ...course, location: app.location || course.location };
                        }
                        return undefined;
                    })
                    .filter((c): c is Course => c !== undefined);

                // Remove duplicates if any
                const uniqueCourses = Array.from(new Map(approvedCourses.map(c => [c.courseID, c])).values());

                console.log("Final Managed Courses:", uniqueCourses);
                setManagedCourses(uniqueCourses);
            } catch (err) {
                console.error("Failed to fetch managed courses:", err);
                setError("ไม่สามารถโหลดข้อมูลรายวิชาที่ดูแลได้");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">ตารางปฏิบัติงาน</h1>
                    <p className="text-gray-600">
                        ตรวจสอบตารางสอนและรายวิชาที่คุณดูแล
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <CalendarIcon size={16} />
                        ปฏิทิน
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <LayoutList size={16} />
                        รายวิชา
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    {error}
                </div>
            ) : managedCourses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรายวิชาที่ดูแล</h3>
                    <p className="text-gray-500">
                        คุณยังไม่มีรายวิชาที่ได้รับการอนุมัติให้เป็นผู้ช่วยสอนในขณะนี้
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managedCourses.map((course) => (
                        <ManagedCourseCard key={course.courseID} course={course} />
                    ))}
                </div>
            ) : (
                // Calendar View
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900">
                            {new Date(selectedMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-gray-200">
                            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
                                <div key={day} className={`py-3 text-center text-sm font-semibold ${i === 0 || i === 6 ? 'text-orange-600 bg-orange-50' : 'text-gray-600 bg-gray-50'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 bg-gray-200 gap-px">
                            {renderCalendar()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
