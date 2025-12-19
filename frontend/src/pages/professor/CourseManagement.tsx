import { useState } from "react";
import {
  Book,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { TADetailModal } from "./TADetailModal";

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
  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const courses: Course[] = [
    {
      id: "1",
      code: "01076104",
      name: "Programming Fundamental",
      semester: "1/2568",
      requiredTAs: 3,
      approvedTAs: 2,
      pendingApplications: 2,
      totalHours: 120,
      tas: [
        {
          id: "1",
          name: "ประเสริฐ ขยัน",
          studentId: "6512345680",
          hoursWorked: 45,
          hoursThisMonth: 12,
          status: "active",
        },
        {
          id: "2",
          name: "วิชัย ดีมาก",
          studentId: "6512345681",
          hoursWorked: 38,
          hoursThisMonth: 10,
          status: "active",
        },
      ],
    },
    {
      id: "2",
      code: "01076109",
      name: "Object-Oriented Data Structures",
      semester: "1/2568",
      requiredTAs: 2,
      approvedTAs: 2,
      pendingApplications: 1,
      totalHours: 80,
      tas: [
        {
          id: "3",
          name: "มาลี สวยงาม",
          studentId: "6512345682",
          hoursWorked: 52,
          hoursThisMonth: 16,
          status: "active",
        },
        {
          id: "4",
          name: "สมหญิง รักเรียน",
          studentId: "6512345679",
          hoursWorked: 28,
          hoursThisMonth: 8,
          status: "active",
        },
      ],
    },
    {
      id: "3",
      code: "01076564",
      name: "Design and Analysis of Algorithms",
      semester: "1/2568",
      requiredTAs: 2,
      approvedTAs: 0,
      pendingApplications: 1,
      totalHours: 0,
      tas: [],
    },
    {
      id: "4",
      code: "01076589",
      name: "Advanced Database Systems",
      semester: "1/2568",
      requiredTAs: 2,
      approvedTAs: 2,
      pendingApplications: 0,
      totalHours: 96,
      tas: [
        {
          id: "5",
          name: "ประเสริฐ ขยัน",
          studentId: "6512345680",
          hoursWorked: 48,
          hoursThisMonth: 14,
          status: "active",
        },
        {
          id: "6",
          name: "มาลี สวยงาม",
          studentId: "6512345682",
          hoursWorked: 48,
          hoursThisMonth: 14,
          status: "active",
        },
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">จัดการรายวิชา</h1>
        <p className="text-gray-600">
          รายวิชาที่รับผิดชอบและจำนวน TA
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-lg">
              <Book size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                รายวิชาทั้งหมด
              </p>
              <p className="text-gray-900">
                {courses.length} วิชา
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                TA ที่อนุมัติแล้ว
              </p>
              <p className="text-gray-900">
                {courses.reduce(
                  (sum, c) => sum + c.approvedTAs,
                  0,
                )}{" "}
                คน
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                วิชาที่ขาด TA
              </p>
              <p className="text-gray-900">
                {
                  courses.filter(
                    (c) => c.approvedTAs < c.requiredTAs,
                  ).length
                }{" "}
                วิชา
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                ชั่วโมงรวมทั้งหมด
              </p>
              <p className="text-gray-900">
                {courses.reduce(
                  (sum, c) => sum + c.totalHours,
                  0,
                )}{" "}
                ชม.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-4">
        {courses.map((course) => {
          const isComplete =
            course.approvedTAs >= course.requiredTAs;
          const needsAttention =
            course.approvedTAs === 0 ||
            course.approvedTAs < course.requiredTAs;

          return (
            <div
              key={course.id}
              className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${needsAttention
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-200"
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">
                      {course.code} - {course.name}
                    </h3>
                    {needsAttention && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        <AlertCircle size={12} />
                        ขาด TA
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    ภาคการศึกษา {course.semester}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">
                    TA ที่ต้องการ
                  </p>
                  <p className="text-gray-900">
                    {course.requiredTAs} คน
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 ${isComplete ? "bg-green-50" : "bg-yellow-50"}`}
                >
                  <p className="text-xs text-gray-600 mb-1">
                    TA ที่อนุมัติแล้ว
                  </p>
                  <p
                    className={
                      isComplete
                        ? "text-green-900"
                        : "text-yellow-900"
                    }
                  >
                    {course.approvedTAs} / {course.requiredTAs}{" "}
                    คน
                  </p>
                </div>

                <div className="bg-[var(--color-primary-50)] rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">
                    กำลังสมัคร (รอพิจารณา)
                  </p>
                  <p className="text-[var(--color-primary-900)]">
                    {course.pendingApplications} คน
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">
                    ชั่วโมงรวม
                  </p>
                  <p className="text-purple-900">
                    {course.totalHours} ชม.
                  </p>
                </div>
              </div>

              {course.tas.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    TA ประจำวิชา:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {course.tas.map((ta) => (
                      <div
                        key={ta.id}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                      >
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-600)] flex items-center justify-center text-white text-xs">
                          {ta.name.charAt(0)}
                        </div>
                        <span className="text-gray-900">
                          {ta.name}
                        </span>
                        <span className="text-gray-500">
                          ({ta.hoursThisMonth} ชม./เดือน)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedCourse(course)}
                className="flex items-center gap-2 text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] text-sm"
              >
                ดูรายละเอียดชั่วโมงงานของแต่ละคน
                <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {selectedCourse && (
        <TADetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}