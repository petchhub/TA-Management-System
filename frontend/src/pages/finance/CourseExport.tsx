import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
} from "lucide-react";
import { getAllCoursesForFinance } from "../../services/courseService";

interface Course {
  courseID: number;
  courseCode: string;
  courseName: string;
  courseProgram: string;
  workHour: number;
  classStart: string;
  classEnd: string;
  classday: string;
  professorName: string;
  semester: string;
  section: string;
  taCount?: number; // Not available from backend yet
}

export function CourseExport() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number>(150);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllCoursesForFinance();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("ไม่สามารถโหลดข้อมูลรายวิชาได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleCourse = (courseId: number) => {
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
      setSelectedCourses(courses.map((c) => c.courseID));
    }
  };

  const handleExport = async () => {
    if (selectedCourses.length === 0) {
      alert("กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ");
      return;
    }

    if (hourlyRate <= 0) {
      alert("กรุณาระบุอัตราค่าตอบแทนต่อชั่วโมง");
      return;
    }

    // Export payment report for each selected course
    for (const courseID of selectedCourses) {
      try {
        const url = `http://localhost:8084/TA-management/ta_duty/export-payment-report?courseID=${courseID}&hourlyRate=${hourlyRate}`;

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = `Payment_Report_${courseID}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error exporting course ${courseID}:`, error);
      }
    }

    alert(`กำลังส่งออกรายงาน ${selectedCourses.length} รายวิชา`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E35205] mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">
                เลือกแล้ว {selectedCourses.length} รายวิชา
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">
                อัตราค่าตอบแทน (บาท/ชม.):
              </label>
              <input
                id="hourlyRate"
                type="number"
                min="0"
                step="10"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-[#E35205] focus:border-[#E35205]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              ส่งออกรายงาน
            </button>
          </div>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 bg-slate-50 px-6 py-3">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm hover:text-[#E35205]"
          >
            {selectedCourses.length === courses.length ? (
              <CheckSquare
                size={18}
                className="text-[#E35205]"
              />
            ) : (
              <Square size={18} />
            )}
            <span>เลือกทั้งหมด</span>
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              ไม่พบข้อมูลรายวิชา
            </div>
          ) : courses.map((course) => {
            const isSelected = selectedCourses.includes(
              course.courseID,
            );
            return (
              <div
                key={course.courseID}
                onClick={() => toggleCourse(course.courseID)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-[#fff1ec]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isSelected ? (
                      <CheckSquare
                        size={20}
                        className="text-[#E35205]"
                      />
                    ) : (
                      <Square
                        size={20}
                        className="text-gray-400"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {course.courseCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        {course.courseName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">จำนวน TA</p>
                      <p className="font-medium">
                        {course.taCount ?? "N/A"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">
                        ชั่วโมงต่อครั้ง
                      </p>
                      <p className="font-medium">
                        {course.workHour} ชม.
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
      <div className="mt-6 bg-[#fff1ec] border border-[#ffdbcf] rounded-lg p-4">
        <p className="text-sm text-[#9c3803]">
          <strong>หมายเหตุ:</strong>{" "}
          ไฟล์ที่ส่งออกจะอยู่ในรูปแบบพร้อมใช้งานสำหรับจัดทำเอกสารเบิกจ่ายค่าตอบแทน
          รวมถึงข้อมูลชื่อผู้ช่วยสอน, ชั่วโมงการทำงาน,
          วันที่ทำงาน, และสถานะการตรวจสอบ
        </p>
      </div>
    </div>
  );
}