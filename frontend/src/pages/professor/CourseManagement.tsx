import { useState, useEffect } from "react";
import {
  Book,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { TADetailModal } from "./TADetailModal";
import { getAllCourses } from "../../services/courseService";

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  requiredTAs: number;
  approvedTAs: number;
  pendingApplications: number;
  totalHours: number;
  tas: {
    id: string;
    name: string;
    studentId: string;
    hoursWorked: number;
    hoursThisMonth: number;
    status: "active" | "inactive";
  }[];
}

export function CourseManagement() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const backendCourses = await getAllCourses();

        // Transform backend data to match frontend Course interface
        const transformedCourses: Course[] = backendCourses.map((course, index) => ({
          id: (index + 1).toString(),
          code: course.courseID,
          name: course.courseName,
          semester: "1/2568", // Default value - will be updated when backend provides it
          requiredTAs: 0,
          approvedTAs: 0,
          pendingApplications: 0,
          totalHours: 0,
          tas: [],
        }));

        setCourses(transformedCourses);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('ไม่สามารถโหลดข้อมูลรายวิชาได้');
        // Use fallback data if API fails
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const [selectedTA, setSelectedTA] = useState<{
    id: string;
    name: string;
    studentId: string;
    hoursWorked: number;
    hoursThisMonth: number;
    status: "active" | "inactive";
  } | null>(null);

  const getStatusColor = (
    approved: number,
    required: number
  ) => {
    if (approved === 0) return "text-red-600 bg-red-50";
    if (approved < required)
      return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusText = (
    approved: number,
    required: number
  ) => {
    if (approved === 0) return "ยังไม่มี TA";
    if (approved < required) return "TA ไม่ครบ";
    return "ครบแล้ว";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลรายวิชา...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="text-red-900 font-medium">เกิดข้อผิดพลาด</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">จัดการรายวิชา</h1>
          <p className="text-gray-600">
            จัดการ TA และติดตามชั่วโมงการทำงาน
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Book className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-gray-900 font-medium mb-2">ยังไม่มีรายวิชา</h3>
          <p className="text-gray-600 text-sm">
            คุณยังไม่มีรายวิชาที่สอนในภาคการศึกษานี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">จัดการรายวิชา</h1>
        <p className="text-gray-600">
          จัดการ TA และติดตามชั่วโมงการทำงาน
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Book className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">รายวิชาทั้งหมด</p>
              <p className="text-gray-900 text-2xl font-semibold">
                {courses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">TA ทั้งหมด</p>
              <p className="text-gray-900 text-2xl font-semibold">
                {courses.reduce(
                  (sum, course) => sum + course.approvedTAs,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                ชั่วโมงทำงานรวม
              </p>
              <p className="text-gray-900 text-2xl font-semibold">
                {courses.reduce(
                  (sum, course) => sum + course.totalHours,
                  0
                )}{" "}
                ชม.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            รายวิชาที่สอน
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900 font-medium">
                      {course.code} - {course.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        course.approvedTAs,
                        course.requiredTAs
                      )}`}
                    >
                      {getStatusText(
                        course.approvedTAs,
                        course.requiredTAs
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    ภาคการศึกษา {course.semester}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        TA: {course.approvedTAs}/{course.requiredTAs}
                      </span>
                    </div>
                    {course.pendingApplications > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          size={16}
                          className="text-yellow-600"
                        />
                        <span className="text-yellow-600">
                          รอพิจารณา {course.pendingApplications} คน
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        {course.totalHours} ชั่วโมง
                      </span>
                    </div>
                  </div>

                  {course.tas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        TA ประจำวิชา:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {course.tas.map((ta) => (
                          <button
                            key={ta.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTA(ta);
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                          >
                            {ta.name} ({ta.studentId})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <ChevronRight
                  className="text-gray-400 flex-shrink-0 ml-4"
                  size={20}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TA Detail Modal */}
      {selectedTA && (
        <TADetailModal
          ta={selectedTA}
          onClose={() => setSelectedTA(null)}
        />
      )}
    </div>
  );
}