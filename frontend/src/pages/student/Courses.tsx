import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  BookOpen,
  User,
  Clock,
  Calendar,
} from "lucide-react";
import CourseCard from "./CourseCard";
import ApplicationModal from "./ApplicationModal";
import { getOpenPositions, Course } from "../../services/positionService";
import { getAllCoursesByStudentId, Course as ServiceCourse } from "../../services/courseService";
import { useAuth } from "../../context/AuthContext";
import console from "console";

export default function Courses() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [applicationModal, setApplicationModal] = useState<{
    isOpen: boolean;
    courseId: number | null;
  }>({ isOpen: false, courseId: null });

  // Backend integration state
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch positions from backend on mount
  useEffect(() => {
    async function fetchPositions() {
      try {
        setLoading(true);
        setError(null);

        let positions: Course[] = [];

        if (user && user.role === 'STUDENT') {
          // For logged-in students, use the student-specific endpoint
          const studentId = parseInt(user.id);
          const courses = await getAllCoursesByStudentId(studentId);

          // Map ServiceCourse to Course (frontend interface)
          positions = courses.map((c: ServiceCourse) => ({
            id: c.jobPostID, // Assuming jobPostID matches id in frontend Course
            code: c.courseCode,
            name: c.courseName,
            department: 'คณะวิศวกรรมศาสตร์', // Default
            program: c.courseProgram, // Default or infer
            sec: '', // Default
            days: c.classday,
            instructor: c.professorName,
            semester: c.semester,
            positions: c.taAllocation,
            hoursPerWeek: c.workHour,
            requirements: c.task,
            description: c.task,
            location: c.location,
            deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Default 30 days
            startTime: c.classStart,
            endTime: c.classEnd,
            status: c.status
          }));
        } else {
          // For guests or non-students, use the general open positions endpoint
          positions = await getOpenPositions();
        }

        setAvailableCourses(positions);
        console.log("Fetched positions:", positions);
      } catch (err) {
        console.error('Failed to fetch positions:', err);
        setError('ไม่สามารถโหลดข้อมูลตำแหน่งได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
  }, [user]);


  const programs = [
    "ทั้งหมด",
    "หลักสูตรอินเตอร์",
    "หลักสูตรต่อเนื่อง",
    "หลักสูตรปกติ(ไทย)",
  ];
  const days = [
    "ทั้งหมด",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
    "อาทิตย์",
  ];

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course?.code
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      course?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      course?.instructor
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesProgram =
      filterProgram === "all" ||
      course?.program === filterProgram;
    const matchesDay =
      filterDay === "all" || course?.days.includes(filterDay);

    return (
      matchesSearch &&
      matchesProgram &&
      matchesDay
    );
  });

  const openPositions = availableCourses.filter(
    (c) => c.status === "OPEN",
  ).length;
  const totalPositions = availableCourses.reduce(
    (sum, c) => sum + c.positions,
    0,
  );

  const handleApply = (courseId: number) => {
    setApplicationModal({ isOpen: true, courseId });
  };

  const handleCloseModal = () => {
    setApplicationModal({ isOpen: false, courseId: null });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ค้นหาตำแหน่ง TA</h1>
        <p className="text-gray-600">
          สำรวจและสมัครตำแหน่งผู้ช่วยสอนที่เปิดรับ
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              วิชาที่เปิดรับ
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{openPositions} <span className="text-sm font-normal text-gray-500">วิชา</span></p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">ตำแหน่งว่าง</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalPositions} <span className="text-sm font-normal text-gray-500">ตำแหน่ง</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">ภาคการศึกษา</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">2/2568</p>
        </div>

        <div className="bg-orange-500 rounded-xl p-6 shadow-md text-white hover:shadow-lg transition-shadow">
          <div className="mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-orange-100 text-sm mb-1">
            อัปเดตล่าสุด
          </p>
          <p className="text-white font-semibold">วันนี้</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสวิชา, ชื่อวิชา, หรืออาจารย์..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Program Filter */}
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={filterProgram}
                onChange={(e) =>
                  setFilterProgram(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">ทุกหลักสูตร</option>
                {programs.slice(1).map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day Filter */}
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">ทุกวัน</option>
                {days.slice(1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-600">
            แสดง {filteredCourses.length} จาก{" "}
            {availableCourses.length} วิชา
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-200 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {/* Course Listings */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">ไม่พบรายวิชา</h3>
          <p className="text-gray-600">
            ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง
          </p>
        </div>
      )}

      {/* Application Modal */}
      <ApplicationModal
        isOpen={applicationModal.isOpen}
        courseId={applicationModal.courseId}
        course={availableCourses.find(
          (c) => c.id === applicationModal.courseId,
        )}
        onClose={handleCloseModal}
      />
    </div>
  );
}