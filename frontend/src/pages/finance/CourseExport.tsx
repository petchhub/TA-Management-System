import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
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
  year?: string;
  section: string;
  taCount?: number; // Not available from backend yet
}

interface AvailableMonth {
  monthID: number;
  monthName: string;
  year: number;
}

export function CourseExport() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [modalHourlyRate, setModalHourlyRate] = useState(100);
  const [curriculumFilter, setCurriculumFilter] = useState<string>("all");
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<AvailableMonth | null>(null);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureMonths, setSignatureMonths] = useState<AvailableMonth[]>([]);
  const [selectedSignatureMonth, setSelectedSignatureMonth] = useState<AvailableMonth | null>(null);
  const [loadingSignatureMonths, setLoadingSignatureMonths] = useState(false);

  // Export Progress State
  const [exportStatus, setExportStatus] = useState<{
    isOpen: boolean;
    status: 'processing' | 'success' | 'complete_with_failures';
    message: string;
    total: number;
    current: number;
    successCount: number;
    failCount: number;
    title: string;
  }>({
    isOpen: false,
    status: 'processing',
    message: '',
    total: 0,
    current: 0,
    successCount: 0,
    failCount: 0,
    title: '',
  });

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

  useEffect(() => {
    // Debug logging removed
  }, [courses]);

  const toggleCourse = (courseId: number) => {
    const courseToToggle = courses.find((c) => c.courseID === courseId);
    if (!courseToToggle) return;

    // Check semester constraint
    if (selectedCourses.length > 0 && !selectedCourses.includes(courseId)) {
      const firstSelectedCourse = courses.find(
        (c) => c.courseID === selectedCourses[0]
      );
      if (
        firstSelectedCourse &&
        firstSelectedCourse.semester !== courseToToggle.semester
      ) {
        alert(
          `ไม่สามารถเลือกรายวิชาต่างภาคการศึกษาได้\n(เลือกไว้: ${firstSelectedCourse.semester}, กำลังเลือก: ${courseToToggle.semester})`
        );
        return;
      }
    }

    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const filteredCourses = courses.filter((course) => {
    if (curriculumFilter === "all") return true;

    const programStr = (course.courseProgram || "").toLowerCase();

    if (curriculumFilter === "General")
      return programStr.includes("general") || programStr.includes("ปกติ") || programStr.includes("ทั่วไป");
    if (curriculumFilter === "Continuing")
      return programStr.includes("continuing") || programStr.includes("continuous") || programStr.includes("ต่อเนื่อง");
    if (curriculumFilter === "International")
      return programStr.includes("international") || programStr.includes("นานาชาติ");

    return course.courseProgram === curriculumFilter;
  });

  const toggleAll = () => {
    const visibleCourseIds = filteredCourses.map((c) => c.courseID);

    if (visibleCourseIds.length === 0) return;

    const allVisibleSelected = visibleCourseIds.every((id) =>
      selectedCourses.includes(id)
    );

    if (allVisibleSelected) {
      setSelectedCourses((prev) =>
        prev.filter((id) => !visibleCourseIds.includes(id))
      );
    } else {
      // Selecting logic considering semester constraints
      let newSelection = [...selectedCourses];
      let semesterConstraint = "";

      if (newSelection.length > 0) {
        const first = courses.find(c => c.courseID === newSelection[0]);
        if (first) semesterConstraint = first.semester;
      }

      for (const id of visibleCourseIds) {
        if (newSelection.includes(id)) continue;

        const c = courses.find(course => course.courseID === id);
        if (!c) continue;

        if (semesterConstraint === "") {
          semesterConstraint = c.semester;
          newSelection.push(id);
        } else if (c.semester === semesterConstraint) {
          newSelection.push(id);
        }
      }

      setSelectedCourses(newSelection);
    }
  };

  const openExportModal = async () => {
    if (selectedCourses.length === 0) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ไม่สามารถส่งออกได้',
        message: 'กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      return;
    }
    setShowExportModal(true);

    // Fetch available months based on the first selected course
    // Backend expects 'month' param as courseID
    try {
      setLoadingMonths(true);
      const courseID = selectedCourses[0];
      // Reuse lookup service or fetch directly
      const response = await fetch(`http://localhost:8084/TA-management/lookup/available-months?month=${courseID}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch months");
      const data: AvailableMonth[] = await response.json();
      setAvailableMonths(data);
      if (data.length > 0) {
        setSelectedMonth(data[0]);
      } else {
        setSelectedMonth(null);
      }
    } catch (err) {
      console.error("Failed to fetch available months", err);
      // Optional: alert user?
    } finally {
      setLoadingMonths(false);
    }
  };

  const closeModal = () => {
    setShowExportModal(false);
    setAvailableMonths([]);
    setSelectedMonth(null);
  };

  const removeCourseFromModal = (courseID: number) => {
    setSelectedCourses((prev) => prev.filter((id) => id !== courseID));
    if (selectedCourses.length === 1) { // If we are removing the last one
      closeModal();
    }
  };

  const confirmExport = async () => {
    if (selectedCourses.length === 0) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ไม่สามารถส่งออกได้',
        message: 'กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      closeModal();
      return;
    }

    if (modalHourlyRate <= 0) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุอัตราค่าตอบแทนต่อชั่วโมง',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      return;
    }

    if (!selectedMonth) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาเลือกเดือนที่ต้องการส่งออก',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      return;
    }

    // Start batch export
    setExportStatus({
      isOpen: true,
      status: 'processing',
      title: 'กำลังส่งออกรายงานการเบิกจ่าย',
      message: `กำลังส่งออกรายงาน ${selectedCourses.length} รายวิชา...`,
      total: selectedCourses.length,
      current: 0,
      successCount: 0,
      failCount: 0,
    });

    closeModal();

    let successCount = 0;
    let failCount = 0;

    // Export payment report for each selected course
    for (const courseID of selectedCourses) {
      setExportStatus(prev => ({
        ...prev,
        current: prev.current + 1,
        message: `กำลังส่งออกรายวิชารหัส ${courseID} (${prev.current + 1}/${selectedCourses.length})`
      }));

      try {
        const response = await fetch("http://localhost:8084/TA-management/ta_duty/export-payment-report", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseID,
            hourlyRate: modalHourlyRate,
            month: selectedMonth?.monthID,
            year: selectedMonth?.year,
          }),
        });

        if (!response.ok) {
          throw new Error(`Export failed for course ${courseID}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Payment_Report_${courseID}_${selectedMonth?.year}_${selectedMonth?.monthID}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        successCount++;
        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error exporting course ${courseID}:`, error);
        failCount++;
      }
    }

    setExportStatus(prev => ({
      ...prev,
      status: failCount === 0 ? 'success' : 'complete_with_failures',
      message: failCount === 0
        ? `ส่งออกรายงานการเบิกจ่ายสำเร็จครบทั้ง ${successCount} รายวิชา`
        : `ส่งออกสำเร็จ ${successCount} รายวิชา และไม่สำเร็จ ${failCount} รายวิชา`,
      successCount,
      failCount,
    }));
  };

  const openSignatureModal = async () => {
    if (selectedCourses.length === 0) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ไม่สามารถส่งออกได้',
        message: 'กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      return;
    }
    setShowSignatureModal(true);

    // Fetch available months based on the first selected course
    try {
      setLoadingSignatureMonths(true);
      const courseID = selectedCourses[0];
      const response = await fetch(`http://localhost:8084/TA-management/lookup/available-months?month=${courseID}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch months");
      const data: AvailableMonth[] = await response.json();
      setSignatureMonths(data);
      if (data.length > 0) {
        setSelectedSignatureMonth(data[0]);
      } else {
        setSelectedSignatureMonth(null);
      }
    } catch (err) {
      console.error("Failed to fetch available months", err);
    } finally {
      setLoadingSignatureMonths(false);
    }
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setSignatureMonths([]);
    setSelectedSignatureMonth(null);
  };

  const confirmSignatureExport = async () => {
    if (selectedCourses.length === 0) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ไม่สามารถส่งออกได้',
        message: 'กรุณาเลือกรายวิชาอย่างน้อย 1 รายการ',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      closeSignatureModal();
      return;
    }

    if (!selectedSignatureMonth) {
      setExportStatus({
        isOpen: true,
        status: 'complete_with_failures',
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาเลือกเดือนที่ต้องการส่งออก',
        total: 0,
        current: 0,
        successCount: 0,
        failCount: 0,
      });
      return;
    }

    // Start batch export
    setExportStatus({
      isOpen: true,
      status: 'processing',
      title: 'กำลังส่งออกใบลงชื่อ',
      message: `กำลังส่งออกใบลงชื่อ ${selectedCourses.length} รายวิชา...`,
      total: selectedCourses.length,
      current: 0,
      successCount: 0,
      failCount: 0,
    });

    closeSignatureModal();

    let successCount = 0;
    let failCount = 0;

    // Export signature sheet for each selected course
    for (const courseID of selectedCourses) {
      setExportStatus(prev => ({
        ...prev,
        current: prev.current + 1,
        message: `กำลังส่งออกรายวิชารหัส ${courseID} (${prev.current + 1}/${selectedCourses.length})`
      }));

      try {
        const response = await fetch("http://localhost:8084/TA-management/ta_duty/export-signature-sheet", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseID,
            month: selectedSignatureMonth?.monthID,
            year: selectedSignatureMonth?.year,
          }),
        });

        if (!response.ok) {
          throw new Error(`Export failed for course ${courseID}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Signature_Sheet_${courseID}_${selectedSignatureMonth?.year}_${selectedSignatureMonth?.monthID}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        successCount++;
        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error exporting signature sheet for course ${courseID}:`, error);
        failCount++;
      }
    }

    setExportStatus(prev => ({
      ...prev,
      status: failCount === 0 ? 'success' : 'complete_with_failures',
      message: failCount === 0
        ? `ส่งออกใบลงชื่อสำเร็จครบทั้ง ${successCount} รายวิชา`
        : `ส่งออกสำเร็จ ${successCount} รายวิชา และไม่สำเร็จ ${failCount} รายวิชา`,
      successCount,
      failCount,
    }));
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
              ส่งออกรายงานการเบิกจ่าย
            </button>
            <button
              onClick={openSignatureModal}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileSpreadsheet size={18} />
              ส่งออกใบลงชื่อ
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
              // Handle different program values (Thai/English) with robust matching
              const programStr = (course.courseProgram || "").toLowerCase();
              const isGeneral = programStr.includes("general") || programStr.includes("ปกติ") || programStr.includes("ทั่วไป");
              const isContinuing = programStr.includes("continuing") || programStr.includes("continuous") || programStr.includes("ต่อเนื่อง");
              // Default to International if not General or Continuing

              return (
                <div
                  key={course.courseID}
                  onClick={() => toggleCourse(course.courseID)}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-[#fff1ec]" : ""
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isSelected ? (
                        <CheckSquare size={20} className="text-[#E35205]" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-[#E35205]">
                            {course.courseCode}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            Sec {course.section}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${isGeneral
                              ? "bg-blue-50 text-blue-700"
                              : isContinuing
                                ? "bg-purple-50 text-purple-700"
                                : "bg-green-50 text-green-700"
                              }`}
                          >
                            {isGeneral
                              ? "หลักสูตรปกติ"
                              : isContinuing
                                ? "หลักสูตรต่อเนื่อง"
                                : "หลักสูตรนานาชาติ"}
                          </span>

                          <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-100">
                            {course.semester}{course.year ?? ""}
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
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          จำนวน TA
                        </p>
                        <p className="font-semibold bg-gray-100 px-3 py-1 rounded text-gray-700">
                          {course.taCount ?? "0"} คน
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
          รวมถึงข้อมูลชื่อผู้ช่วยสอน, ชั่วโมงการทำงาน และวันที่ทำงาน
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="modalHourlyRate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
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
                <div>
                  <label
                    htmlFor="monthSelect"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ระบุเดือน
                  </label>
                  {loadingMonths ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      กำลังโหลด...
                    </div>
                  ) : (
                    <select
                      id="monthSelect"
                      value={selectedMonth ? JSON.stringify(selectedMonth) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) setSelectedMonth(JSON.parse(val));
                        else setSelectedMonth(null);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#E35205] focus:border-[#E35205]"
                    >
                      <option value="">-- เลือกเดือน --</option>
                      {availableMonths.map((m) => (
                        <option key={`${m.year}-${m.monthID}`} value={JSON.stringify(m)}>
                          {m.monthName} {m.year}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Selected Courses List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  รายวิชาที่เลือก ({selectedCourses.length})
                </h4>
                {selectedCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    ไม่มีรายวิชาที่เลือก
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCourses.map((courseID) => {
                      const course = courses.find((c) => c.courseID === courseID);
                      if (!course) return null;

                      const isGeneral = course.courseProgram === "General" || course.courseProgram === "หลักสูตรปกติ";
                      const isContinuing = course.courseProgram === "Continuing" || course.courseProgram === "หลักสูตรต่อเนื่อง";
                      const isInternational = course.courseProgram === "International" || course.courseProgram === "หลักสูตรนานาชาติ";

                      return (
                        <div
                          key={courseID}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-gray-900">
                                {course.courseCode}
                              </p>
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">
                                Sec {course.section}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isGeneral
                                  ? "bg-blue-50 text-blue-700"
                                  : isContinuing
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-green-50 text-green-700"
                                  }`}
                              >
                                {isGeneral
                                  ? "ปกติ"
                                  : isContinuing
                                    ? "ต่อเนื่อง"
                                    : "นานาชาติ"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {course.courseName}
                            </p>
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
                disabled={selectedCourses.length === 0 || modalHourlyRate <= 0 || !selectedMonth}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ส่งออก ({selectedCourses.length} รายวิชา)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Sheet Export Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">ยืนยันการส่งออกใบลงชื่อ</h3>
              <button
                onClick={closeSignatureModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Month Selector */}
              <div className="mb-6">
                <label
                  htmlFor="signatureMonthSelect"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ระบุเดือน
                </label>
                {loadingSignatureMonths ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    กำลังโหลด...
                  </div>
                ) : (
                  <select
                    id="signatureMonthSelect"
                    value={selectedSignatureMonth ? JSON.stringify(selectedSignatureMonth) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setSelectedSignatureMonth(JSON.parse(val));
                      else setSelectedSignatureMonth(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#E35205] focus:border-[#E35205]"
                  >
                    <option value="">-- เลือกเดือน --</option>
                    {signatureMonths.map((m) => (
                      <option key={`${m.year}-${m.monthID}`} value={JSON.stringify(m)}>
                        {m.monthName} {m.year}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Courses List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  รายวิชาที่เลือก ({selectedCourses.length})
                </h4>
                {selectedCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    ไม่มีรายวิชาที่เลือก
                  </p>
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
                              <p className="font-medium text-sm text-gray-900">
                                {course.courseCode}
                              </p>
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">
                                Sec {course.section}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${course.courseProgram === "General"
                                  ? "bg-blue-50 text-blue-700"
                                  : course.courseProgram === "Continuing"
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-green-50 text-green-700"
                                  }`}
                              >
                                {course.courseProgram === "General"
                                  ? "ปกติ"
                                  : course.courseProgram === "Continuing"
                                    ? "ต่อเนื่อง"
                                    : "นานาชาติ"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {course.courseName}
                            </p>
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
                onClick={closeSignatureModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmSignatureExport}
                disabled={selectedCourses.length === 0 || !selectedSignatureMonth}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ส่งออก ({selectedCourses.length} รายวิชา)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Progress / Status Popup */}
      <AlertDialog
        open={exportStatus.isOpen}
        onOpenChange={(open) => {
          if (exportStatus.status !== 'processing') {
            setExportStatus(prev => ({ ...prev, isOpen: open }));
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {exportStatus.status === 'processing' && (
                <Loader2 className="animate-spin text-orange-500" size={24} />
              )}
              {exportStatus.status === 'success' && (
                <CheckCircle2 className="text-green-500" size={24} />
              )}
              {exportStatus.status === 'complete_with_failures' && (
                <AlertCircle className="text-red-500" size={24} />
              )}
              {exportStatus.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4">
              <div className="space-y-4">
                <p className="text-gray-600">{exportStatus.message}</p>

                {exportStatus.status === 'processing' && (
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${(exportStatus.current / exportStatus.total) * 100}%` }}
                    />
                  </div>
                )}

                {(exportStatus.status === 'success' || (exportStatus.status === 'complete_with_failures' && exportStatus.total > 0)) && (
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                      <p className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">สำเร็จ</p>
                      <p className="text-2xl font-bold text-green-700">{exportStatus.successCount}</p>
                    </div>
                    <div className={`p-3 rounded-lg border text-center ${exportStatus.failCount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${exportStatus.failCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>ไม่สำเร็จ</p>
                      <p className={`text-2xl font-bold ${exportStatus.failCount > 0 ? 'text-red-700' : 'text-gray-400'}`}>{exportStatus.failCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {exportStatus.status !== 'processing' && (
              <AlertDialogAction
                onClick={() => setExportStatus(prev => ({ ...prev, isOpen: false }))}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                ตกลง
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
