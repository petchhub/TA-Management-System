import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  BookOpen,
  User,
  Clock,
  Calendar,
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../student/CourseCard";

export default function PublicHomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

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
  const semesters = ["ทั้งหมด", "1/2568", "2/2568", "3/2568"];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Use the new public endpoint
        const response = await fetch("http://localhost:8084/TA-management/public/course/jobpost");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();

        // Map backend data to frontend Course interface
        const mappedCourses = data.data.map((item: any) => ({
          id: item.jobPostID,
          code: item.courseCode || item.courseName.split(" ")[0], // Fallback if code not separate
          name: item.courseName,
          department: "คณะวิศวกรรมศาสตร์", // Not in API yet, use default
          program: item.courseProgram || "หลักสูตรปกติ(ไทย)",
          days: item.classday || "ไม่ระบุ",
          instructor: item.professorName || "ไม่ระบุ",
          semester: item.semester || "2/2568",
          positions: item.taAllocation || 1,
          hoursPerWeek: item.workHour || 0,
          requirements: item.task || "ไม่ระบุรายละเอียด",
          description: `ช่วยสอนวิชา ${item.courseName}`, // Generate description
          location: item.location || "ไม่ระบุ",
          deadline: "2025-12-31", // Default deadline
          status: (item.status === "OPEN" ? "open" : "closed") as "open" | "closed",
          startTime: item.classStart || "-",
          endTime: item.classEnd || "-",
          sec: "1" // Default sec
        }));

        setAvailableCourses(mappedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("ไม่สามารถโหลดข้อมูลรายวิชาได้");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.code
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      course.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      course.instructor
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesProgram =
      filterProgram === "all" ||
      course.program === filterProgram;
    const matchesDay =
      filterDay === "all" || course.days.includes(filterDay);
    const matchesSemester =
      filterSemester === "all" ||
      course.semester === filterSemester;

    return (
      matchesSearch &&
      matchesProgram &&
      matchesDay &&
      matchesSemester
    );
  });

  const openPositions = availableCourses.filter(
    (c) => c.status === "open",
  ).length;
  const totalPositions = availableCourses.reduce(
    (sum, c) => sum + c.positions,
    0,
  );

  const redirectToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mock Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-orange-600 font-bold text-xl">TA Management</h1>
          <p className="text-gray-600 text-sm mt-1">สำหรับผู้ใช้ทั่วไป</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={redirectToLogin}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                // Valid Active Page - No Redirect
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-orange-600 bg-orange-50 transition-colors"
              >
                <BookOpen size={20} />
                <span>ค้นหาตำแหน่ง</span>
              </button>
            </li>
            <li>
              <button
                onClick={redirectToLogin}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Clock size={20} />
                <span>ลงเวลาทำงาน</span>
              </button>
            </li>
            <li>
              <button
                onClick={redirectToLogin}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={20} />
                <span>โปรไฟล์</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={redirectToLogin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings size={20} />
            <span>ตั้งค่า</span>
          </button>
          <button
            onClick={redirectToLogin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2">
            <LogOut size={20} />
            <span>เข้าสู่ระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-gray-900 mb-2">ค้นหาตำแหน่ง TA</h1>
              <p className="text-gray-600">
                สำรวจและสมัครตำแหน่งผู้ช่วยสอนที่เปิดรับ
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-[var(--color-primary-50)] rounded-lg">
                    <BookOpen className="w-6 h-6 text-[var(--color-primary-600)]" />
                  </div>
                  <span className="text-gray-600">
                    วิชาที่เปิดรับ
                  </span>
                </div>
                <p className="text-gray-900">{openPositions} วิชา</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-gray-600">ตำแหน่งว่าง</span>
                </div>
                <p className="text-gray-900">
                  {totalPositions} ตำแหน่ง
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-gray-600">ภาคการศึกษา</span>
                </div>
                <p className="text-gray-900">2/2568</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-gray-600">อัปเดตล่าสุด</span>
                </div>
                <p className="text-gray-900">วันนี้</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหารหัสวิชา, ชื่อวิชา, หรืออาจารย์..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent appearance-none bg-white"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent appearance-none bg-white"
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

                {/* Semester Filter */}
                <div>
                  <select
                    value={filterSemester}
                    onChange={(e) =>
                      setFilterSemester(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">ทุกภาคการศึกษา</option>
                    {semesters.slice(1).map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  แสดง {filteredCourses.length} จาก{" "}
                  {availableCourses.length} วิชา
                </p>
              </div>
            </div>

            {/* Course Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onApply={redirectToLogin}
                />
              ))}
            </div>

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">ไม่พบรายวิชา</h3>
                <p className="text-gray-600">
                  ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
