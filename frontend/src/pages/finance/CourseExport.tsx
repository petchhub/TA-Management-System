import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  taCount: number;
  totalHours: number;
}

export function CourseExport() {
  const [selectedCourses, setSelectedCourses] = useState<
    string[]
  >([]);

  const courses: Course[] = [
    {
      id: "1",
      code: "01076103",
      name: "Programming Fundamentals",
      taCount: 4,
      totalHours: 36,
    },
    {
      id: "2",
      code: "01076109",
      name: "Data Structures",
      taCount: 6,
      totalHours: 54,
    },
    {
      id: "3",
      code: "01076564",
      name: "Algorithms",
      taCount: 5,
      totalHours: 40,
    },
    {
      id: "4",
      code: "01076263",
      name: "Database Systems",
      taCount: 2,
      totalHours: 16,
    },
    {
      id: "5",
      code: "01076112",
      name: "Digital System Fundamentals",
      taCount: 1,
      totalHours: 9,
    },
    {
      id: "6",
      code: "01076011",
      name: "Operating Systems",
      taCount: 4,
      totalHours: 32,
    },
    {
      id: "7",
      code: "01076035",
      name: "Software Development Process in Practice",
      taCount: 3,
      totalHours: 27,
    },
    {
      id: "8",
      code: "01076116",
      name: "Computer Networks",
      taCount: 3,
      totalHours: 24,
    },
  ];

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const toggleAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map((c) => c.id));
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    const selectedCoursesData = courses.filter((c) =>
      selectedCourses.includes(c.id),
    );

    if (selectedCoursesData.length === 0) {
      alert("กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ");
      return;
    }

    // Mock export functionality
    console.log(
      `Exporting ${selectedCoursesData.length} courses as ${format}`,
    );
    alert(
      `กำลังส่งออกข้อมูล ${selectedCoursesData.length} รายวิชาในรูปแบบ ${format.toUpperCase()}`,
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl mb-2">ส่งออกข้อมูลรายวิชา</h2>
        <p className="text-gray-600">
          เลือกรายวิชาและส่งออกข้อมูลชั่วโมงการทำงานสำหรับเบิกจ่ายค่าตอบแทน
        </p>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              เลือกแล้ว {selectedCourses.length} รายวิชา
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors"
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 bg-slate-50 px-6 py-3">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm hover:text-[var(--color-primary-600)]"
          >
            {selectedCourses.length === courses.length ? (
              <CheckSquare
                size={18}
                className="text-[var(--color-primary-600)]"
              />
            ) : (
              <Square size={18} />
            )}
            <span>เลือกทั้งหมด</span>
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.map((course) => {
            const isSelected = selectedCourses.includes(
              course.id,
            );
            return (
              <div
                key={course.id}
                onClick={() => toggleCourse(course.id)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-[var(--color-primary-50)]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isSelected ? (
                      <CheckSquare
                        size={20}
                        className="text-[var(--color-primary-600)]"
                      />
                    ) : (
                      <Square
                        size={20}
                        className="text-gray-400"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {course.code}
                      </p>
                      <p className="text-sm text-gray-600">
                        {course.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">จำนวน TA</p>
                      <p className="font-medium">
                        {course.taCount} คน
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">
                        ชั่วโมงรวม
                      </p>
                      <p className="font-medium">
                        {course.totalHours} ชม.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Info */}
      <div className="mt-6 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg p-4">
        <p className="text-sm text-[var(--color-primary-800)]">
          <strong>หมายเหตุ:</strong>{" "}
          ไฟล์ที่ส่งออกจะอยู่ในรูปแบบพร้อมใช้งานสำหรับจัดทำเอกสารเบิกจ่ายค่าตอบแทน
          รวมถึงข้อมูลชื่อผู้ช่วยสอน, ชั่วโมงการทำงาน,
          วันที่ทำงาน, และสถานะการตรวจสอบ
        </p>
      </div>
    </div>
  );
}