import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  X,
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [modalHourlyRate, setModalHourlyRate] = useState(100);
  const [curriculumFilter, setCurriculumFilter] = useState<string>("all");

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

  const filteredCourses = courses.filter((course) => {
    if (curriculumFilter === "all") return true;
    return course.courseProgram === curriculumFilter;
  });

  const toggleAll = () => {
    const visibleCourseIds = filteredCourses.map((c) => c.courseID);
    const allVisibleSelected = visibleCourseIds.every((id) =>
      selectedCourses.includes(id),
    );

    if (allVisibleSelected) {
      setSelectedCourses((prev) =>
        prev.filter((id) => !visibleCourseIds.includes(id)),
      );
    } else {
      setSelectedCourses((prev) =>
        Array.from(new Set([...prev, ...visibleCourseIds])),
      );
    }
  };

  const openExportModal = () => {
    if (selectedCourses.length === 0) {
      alert("กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ");
      return;
    }
    setShowExportModal(true);
  };

  const closeModal = () => {
    setShowExportModal(false);
  };

  const removeCourseFromModal = (courseID: number) => {
    setSelectedCourses((prev) => prev.filter((id) => id !== courseID));
  };

  const confirmExport = async () => {
    if (selectedCourses.length === 0) {
      alert("กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ");
      closeModal();
      return;
    }

    if (modalHourlyRate <= 0) {
      alert("กรุณาระบุอัตราค่าตอบแทนต่อชั่วโมง");
      return;
    }

    // Export payment report for each selected course
    for (const courseID of selectedCourses) {
      try {
        const url = `http://localhost:8084/TA-management/ta_duty/export-payment-report?courseID=${courseID}&hourlyRate=${modalHourlyRate}`;

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
    closeModal();
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

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCurriculumFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${curriculumFilter === "all"
            ? "bg-[#E35205] text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setCurriculumFilter("General")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${curriculumFilter === "General"
            ? "bg-[#E35205] text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
        >
          หลักสูตรปกติ
        </button>
        <button
          onClick={() => setCurriculumFilter("Continuing")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${curriculumFilter === "Continuing"
            ? "bg-[#E35205] text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
        >
          หลักสูตรต่อเนื่อง
        </button>
        <button
          onClick={() => setCurriculumFilter("International")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${curriculumFilter === "International"
            ? "bg-[#E35205] text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
        >
          หลักสูตรนานาชาติ
        </button>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              เลือกแล้ว {selectedCourses.length} รายวิชา จากทั้งหมด{" "}
              {filteredCourses.length} รายวิชา
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openExportModal}
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
            {filteredCourses.length > 0 &&
              filteredCourses.every((c) => selectedCourses.includes(c.courseID)) ? (
              <CheckSquare size={18} className="text-[#E35205]" />
            ) : (
              <Square size={18} />
            )}
            <span>เลือกทั้งหมด ({filteredCourses.length})</span>
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCourses.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              ไม่พบข้อมูลรายวิชา
            </div>
          ) : (
            filteredCourses.map((course) => {
              const isSelected = selectedCourses.includes(course.courseID);
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-[#E35205]">
                            {course.courseCode}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            Section {course.section}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${course.courseProgram === "General"
                            ? "bg-blue-50 text-blue-700"
                            : course.courseProgram === "Continuing"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-green-50 text-green-700"
                            }`}>
                            {course.courseProgram === "General"
                              ? "หลักสูตรปกติ"
                              : course.courseProgram === "Continuing"
                                ? "หลักสูตรต่อเนื่อง"
                                : "หลักสูตรนานาชาติ"}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 mb-1">
                          {course.courseName}
                        </p>
                        <p className="text-sm text-gray-500">
                          อาจารย์ผู้สอน: {course.professorName}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-8 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">จำนวน TA</p>
                        <p className="font-semibold bg-gray-100 px-3 py-1 rounded text-gray-700">
                          {course.taCount ?? "N/A"} คน
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">ยืนยันการส่งออกรายงาน</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Hourly Rate Input */}
              <div className="mb-6">
                <label htmlFor="modalHourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  อัตราค่าตอบแทน (บาท/ชั่วโมง)
                </label>
                <input
                  id="modalHourlyRate"
                  type="number"
                  min="0"
                  step="10"
                  value={modalHourlyRate}
                  onChange={(e) => setModalHourlyRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#E35205] focus:border-[#E35205]"
                  placeholder="กรอกอัตราค่าตอบแทน"
                />
              </div>

              {/* Selected Courses List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  รายวิชาที่เลือก ({selectedCourses.length})
                </h4>
                {selectedCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ไม่มีรายวิชาที่เลือก</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCourses.map((courseID) => {
                      const course = courses.find((c) => c.courseID === courseID);
                      if (!course) return null;
                      return (
                        <div
                          key={courseID}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-gray-900">{course.courseCode}</p>
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">
                                Sec {course.section}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${course.courseProgram === "General"
                                ? "bg-blue-50 text-blue-700"
                                : course.courseProgram === "Continuing"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-green-50 text-green-700"
                                }`}>
                                {course.courseProgram === "General"
                                  ? "ปกติ"
                                  : course.courseProgram === "Continuing"
                                    ? "ต่อเนื่อง"
                                    : "นานาชาติ"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">{course.courseName}</p>
                          </div>
                          <button
                            onClick={() => removeCourseFromModal(courseID)}
                            className="ml-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="ลบรายวิชานี้"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmExport}
                disabled={selectedCourses.length === 0 || modalHourlyRate <= 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ส่งออก ({selectedCourses.length} รายวิชา)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}