import { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  CheckCircle,
  User,
  Clock,
  Download
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProfessorCourses, getApplicationsForCourse, Course, Application } from "../../services/courseService";
import { getTADutyRoadmap, markDutyAsDone, DutyChecklistItem } from "../../services/taDutyService";
import { formatTime } from "../../utils/formatUtils";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { Toast, ToastType } from "../../components/Toast";

interface TADutyData {
  ta: Application;
  duties: DutyChecklistItem[];
}

export function TAWorkHours() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"courses" | "duties">("courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseTAs, setCourseTAs] = useState<Map<number, Application[]>>(new Map()); // Map courseID to TAs
  const [taDutiesList, setTaDutiesList] = useState<TADutyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    studentID: number;
    studentName?: string;
    date: string;
  } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to check if we can navigate to previous month
  const canGoPrevMonth = (): boolean => {
    if (!selectedCourse?.semesterStart) return true;
    const semesterStart = new Date(selectedCourse.semesterStart);
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    return prevMonth >= new Date(semesterStart.getFullYear(), semesterStart.getMonth(), 1);
  };

  // Helper function to check if we can navigate to next month
  const canGoNextMonth = (): boolean => {
    if (!selectedCourse?.semesterEnd) return true;
    const semesterEnd = new Date(selectedCourse.semesterEnd);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    return nextMonth <= new Date(semesterEnd.getFullYear(), semesterEnd.getMonth(), 1);
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth()) {
      setToast({ message: "ช่วงเวลาที่เลือกอยู่นอกช่วงภาคการศึกษา", type: 'error' });
      return;
    }
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth()) {
      setToast({ message: "ช่วงเวลาที่เลือกอยู่นอกช่วงภาคการศึกษา", type: 'error' });
      return;
    }
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Fetch Courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const result = await getProfessorCourses(parseInt(user.id));
        setCourses(result);

        // Fetch TAs for each course
        const taMap = new Map<number, Application[]>();
        await Promise.all(
          result.map(async (course) => {
            try {
              const applications = await getApplicationsForCourse(course.courseID);
              const approvedTAs = applications.filter(app => app.statusCode === "APPROVED");
              taMap.set(course.courseID, approvedTAs);
            } catch (error) {
              console.error(`Failed to fetch TAs for course ${course.courseID}:`, error);
              taMap.set(course.courseID, []);
            }
          })
        );
        setCourseTAs(taMap);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (viewMode === "courses") {
      fetchCourses();
    }
  }, [user?.id, viewMode]);

  // Fetch TAs and Duties when a course is selected
  useEffect(() => {
    const fetchTADuties = async () => {
      if (!selectedCourse) return;
      setLoading(true);
      try {
        console.log("fetch duties");
        // 1. Get TAs (Applications)
        // using courseID from the selected course. 
        // Note: getApplicationsForCourse usually expects specific ID, let's assume courseID works.
        const applications = await getApplicationsForCourse(selectedCourse.courseID);

        // Filter only APPROVED TAs
        const approvedTAs = applications.filter(app => app.statusCode === "APPROVED");

        // 2. For each TA, get their duty roadmap
        const dutiesData = await Promise.all(
          approvedTAs.map(async (ta) => {
            // studentID is needed. Application has 'studentID'.
            const duties = await getTADutyRoadmap(selectedCourse.courseID, ta.studentID);
            return {
              ta,
              duties: duties || [] // Ensure duties is array
            };
          })
        );

        setTaDutiesList(dutiesData);
      } catch (error) {
        console.error("Failed to fetch TA duties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (viewMode === "duties" && selectedCourse) {
      fetchTADuties();
    }
  }, [viewMode, selectedCourse]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setViewMode("duties");

    // Set current month to either now (if within semester) or semester start
    const now = new Date();
    if (course.semesterStart && course.semesterEnd) {
      const start = new Date(course.semesterStart);
      const end = new Date(course.semesterEnd);

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const semesterStartMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      const semesterEndMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      if (currentMonthStart < semesterStartMonth) {
        setCurrentMonth(semesterStartMonth);
      } else if (currentMonthStart > semesterEndMonth) {
        setCurrentMonth(semesterEndMonth);
      } else {
        setCurrentMonth(currentMonthStart);
      }
    } else {
      setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setViewMode("courses");
    setTaDutiesList([]);
  };

  const handleMarkDone = (studentID: number, date: string, studentName?: string) => {
    // Find the TA data to get student name
    const taData = taDutiesList.find(item => item.ta.studentID === studentID);

    setConfirmModal({
      isOpen: true,
      studentID,
      studentName: taData?.ta.studentName || studentName,
      date
    });
  };

  const handleConfirmMarkDone = async () => {
    if (!selectedCourse || !confirmModal) return;

    const { studentID, date } = confirmModal;

    try {
      await markDutyAsDone(selectedCourse.courseID, studentID, date);

      // Update local state
      setTaDutiesList(prevList =>
        prevList.map(item => {
          if (item.ta.studentID === studentID) {
            return {
              ...item,
              duties: item.duties.map(duty =>
                duty.date === date ? { ...duty, isChecked: true, status: "Done" } : duty
              )
            };
          }
          return item;
        })
      );

      setToast({ message: 'บันทึกการเช็คชื่อสำเร็จ!', type: 'success' });
    } catch (error) {
      console.error('Failed to mark duty as done:', error);
      setToast({ message: 'ไม่สามารถบันทึกการเช็คชื่อได้ กรุณาลองใหม่อีกครั้ง', type: 'error' });
    }
  };

  const handleExportAttendance = async () => {
    if (!selectedCourse) return;

    setIsExporting(true);
    try {
      const response = await fetch("http://localhost:8084/TA-management/ta_duty/export-signature-sheet", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseID: selectedCourse.courseID,
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear(),
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const monthName = currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ใบเซ็นชื่อTA_${selectedCourse.courseCode}_${monthName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToast({ message: 'ส่งออกใบเซ็นชื่อสำเร็จ!', type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      setToast({ message: 'เกิดข้อผิดพลาดในการส่งออก', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // -- RENDER: Course List --
  if (viewMode === "courses") {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            เลือกรายวิชาเพื่อตรวจสอบชั่วโมงการทำงาน
          </h1>
          <p className="text-gray-600">
            เลือกรายวิชาที่ต้องการตรวจสอบบันทึกการปฏิบัติงานของ TA
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">กำลังโหลดรายวิชา...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">ไม่พบรายวิชาที่สอน</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.courseID}
                  onClick={() => handleCourseSelect(course)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#E35205] cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-[#E35205] transition-colors">
                      <BookOpen size={24} className="text-[#E35205] group-hover:text-white transition-colors" />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {course.courseProgram}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {course.courseCode} {course.courseName}
                  </h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock size={16} className="text-[#E35205]" />
                      <span className="font-medium text-gray-900">
                        {course.classday} {formatTime(course.classStart)} - {formatTime(course.classEnd)}
                      </span>
                    </p>
                  </div>

                  {/* TA Information */}
                  {courseTAs.get(course.courseID) && courseTAs.get(course.courseID)!.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <User size={14} />
                        TA ประจำวิชา:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {courseTAs.get(course.courseID)!.map((ta) => (
                          <div
                            key={ta.studentID}
                            className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm"
                          >
                            <span className="font-medium">
                              {ta.studentNameTH || ta.studentName || 'N/A'}
                            </span>
                            <span className="text-orange-600 ml-1">
                              ({ta.studentID})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    {/* Additional info can go here if needed, removed redundant day */}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }



  // -- RENDER: Duties View --

  // Pivot data for Matrix View
  // 1. Get all unique dates
  const allDatesSet = new Set<string>();
  taDutiesList.forEach(item => {
    item.duties.forEach(duty => allDatesSet.add(duty.date));
  });
  const sortedDates = Array.from(allDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Filter dates by Selected Month
  const filteredDates = sortedDates.filter(dateStr => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });

  return (
    <div className="p-8">
      <button
        onClick={handleBackToCourses}
        className="flex items-center gap-2 text-gray-600 hover:text-[#E35205] mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        กลับไปหน้ารายวิชา
      </button>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCourse?.courseCode} - {selectedCourse?.courseName}
            </h1>
          </div>
          <p className="text-gray-600">
            ตรวจสอบชั่วโมงงาน TA (Student ID)
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Month Selector */}
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-orange-50 text-gray-600 hover:text-[#E35205] rounded transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-gray-800 min-w-[150px] text-center">
              {currentMonth.toLocaleDateString("th-TH", { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-orange-50 text-gray-600 hover:text-[#E35205] rounded transition-colors"
            >
              <ChevronLeft size={20} className="rotate-180" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportAttendance}
            disabled={isExporting || taDutiesList.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            {isExporting ? 'กำลังส่งออก...' : 'ส่งออกใบเซ็นชื่อ'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">กำลังโหลดข้อมูลการทำงาน...</p>
        </div>
      ) : taDutiesList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">ไม่พบ TA ที่ผ่านการอนุมัติในรายวิชานี้ หรือยังไม่มีข้อมูลการทำงาน</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#E35205] text-white font-bold border-b border-orange-600">
              <tr>
                <th className="px-6 py-4 sticky left-0 bg-[#E35205] z-10 border-r border-orange-400 min-w-[200px]">
                  วันที่
                </th>
                {taDutiesList.map((data) => (
                  <th key={data.ta.studentID} className="px-6 py-4 text-center min-w-[150px] border-r border-orange-400 last:border-r-0">
                    <div className="flex flex-col items-center gap-1">
                      {/* TA Name (Thai preferred, fallback to English) */}
                      <span className="text-sm font-bold">
                        {data.ta.studentNameTH || data.ta.studentName || 'N/A'}
                      </span>
                      {/* Student ID */}
                      <span className="text-sm font-normal opacity-90">
                        {data.ta.studentID}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {filteredDates.length === 0 ? (
                <tr>
                  <td colSpan={taDutiesList.length + 1} className="px-6 py-12 text-center text-gray-500">
                    ไม่มีข้อมูลในเดือนนี้
                  </td>
                </tr>
              ) : (
                filteredDates.map((dateString) => (
                  <tr key={dateString} className="hover:bg-orange-50 transition-colors">
                    {/* Date Column */}
                    <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">
                      {new Date(dateString).toLocaleDateString("th-TH", {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short' // Short month to save space
                      })}
                    </td>

                    {/* Duty Cells for each TA */}
                    {taDutiesList.map((data) => {
                      const duty = data.duties.find(d => d.date === dateString);
                      return (
                        <td key={`${data.ta.studentID}-${dateString}`} className="px-6 py-4 text-center border-r border-gray-100 last:border-r-0">
                          {duty ? (
                            <div className="flex justify-center">
                              {duty.isChecked ? (
                                <div className="text-green-600">
                                  <CheckCircle size={20} />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMarkDone(data.ta.studentID, duty.date)}
                                  className="w-6 h-6 rounded border-2 border-gray-300 hover:border-[#E35205] hover:bg-orange-50 flex items-center justify-center transition-all group"
                                  title="Check"
                                >
                                  {/* Empty checkbox style, check on hover */}
                                  <div className="w-3 h-3 rounded-sm bg-[#E35205] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmMarkDone}
          studentID={confirmModal.studentID}
          studentName={confirmModal.studentName}
          date={confirmModal.date}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}