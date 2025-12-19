import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import WorkHourCard, { WorkHour } from "./WorkHourCard";
import CorrectionModal from "./CorrectionModal";

export default function WorkHours() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">(
    "list",
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(2025, 11, 1),
  ); // December 2025
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [correctionModal, setCorrectionModal] = useState<{
    isOpen: boolean;
    workHourId: number | null;
  }>({ isOpen: false, workHourId: null });

  const workHours: WorkHour[] = [
    {
      id: 1,
      date: "2025-12-01",
      course: "01076101 - Introduction to Programming",
      hours: 3,
      status: "approved",
      task: "ตรวจการบ้าน และตอบคำถามนักศึกษา",
      approvedBy: "ผศ.ดร. สมชาย ใจดี",
    },
    {
      id: 2,
      date: "2025-11-28",
      course: "01076102 - Data Structures",
      hours: 4,
      status: "pending",
      task: "เตรียมเอกสารประกอบการสอน",
      approvedBy: null,
    },
    {
      id: 3,
      date: "2025-11-25",
      course: "01076103 - Introduction to Programming",
      hours: 3,
      status: "approved",
      task: "จัดเตรียมห้องปฏิบัติการ",
      approvedBy: "ผศ.ดร. สมชาย ใจดี",
    },
    {
      id: 4,
      date: "2025-11-22",
      course: "01076104 - Data Structures",
      hours: 5,
      status: "approved",
      task: "สอนเสริมและตอบคำถามนักศึกษา",
      approvedBy: "ผศ.ดร. วิชัย รักษ์ศิลป์",
    },
    {
      id: 5,
      date: "2025-11-20",
      course: "01076105 - Introduction to Programming",
      hours: 3,
      status: "pending",
      task: "ตรวจข้อสอบกลางภาค",
      approvedBy: null,
    },
    {
      id: 6,
      date: "2025-11-18",
      course: "01076112 - Data Structures",
      hours: 4,
      status: "approved",
      task: "ตรวจการบ้าน",
      approvedBy: "ผศ.ดร. วิชัย รักษ์ศิลป์",
    },
  ];

  const filteredWorkHours = workHours.filter(
    (wh) =>
      filterStatus === "all" || wh.status === filterStatus,
  );

  const handleRequestCorrection = (id: number) => {
    setCorrectionModal({ isOpen: true, workHourId: id });
  };

  const handleCloseModal = () => {
    setCorrectionModal({ isOpen: false, workHourId: null });
  };

  const approvedCount = workHours.filter(
    (wh) => wh.status === "approved",
  ).length;
  const pendingCount = workHours.filter(
    (wh) => wh.status === "pending",
  ).length;
  const totalHours = workHours.reduce(
    (sum, wh) => sum + wh.hours,
    0,
  );
  const approvedHours = workHours
    .filter((wh) => wh.status === "approved")
    .reduce((sum, wh) => sum + wh.hours, 0);

  // Calendar logic
  const getWorkDaysInMonth = () => {
    const workDays = new Map<number, WorkHour[]>();
    workHours
      .filter((wh) => {
        const date = new Date(wh.date);
        return (
          date.getMonth() === selectedMonth.getMonth() &&
          date.getFullYear() === selectedMonth.getFullYear()
        );
      })
      .forEach((wh) => {
        const day = new Date(wh.date).getDate();
        if (!workDays.has(day)) {
          workDays.set(day, []);
        }
        workDays.get(day)!.push(wh);
      });
    return workDays;
  };

  const getDaysInMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const changeMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">ชั่วโมงการทำงาน</h1>
        <p className="text-gray-600">
          บันทึกและติดตามชั่วโมงงาน
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[var(--color-primary-50)] rounded-lg">
              <Clock className="w-6 h-6 text-[var(--color-primary-600)]" />
            </div>
            <span className="text-gray-600">รวมทั้งหมด</span>
          </div>
          <p className="text-gray-900 mb-1">
            {workHours.length} รายการ
          </p>
          <p className="text-[var(--color-primary-600)]">
            {totalHours} ชั่วโมง
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-gray-600">ตรวจแล้ว</span>
          </div>
          <p className="text-gray-900 mb-1">
            {approvedCount} รายการ
          </p>
          <p className="text-green-600">
            {approvedHours} ชั่วโมง
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-gray-600">รอตรวจ</span>
          </div>
          <p className="text-gray-900 mb-1">
            {pendingCount} รายการ
          </p>
          <p className="text-yellow-600">
            {totalHours - approvedHours} ชั่วโมง
          </p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl p-6 shadow-sm text-white">
          <div className="mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-[var(--color-primary-100)] mb-1">
            ค่าเฉลี่ย/รายการ
          </p>
          <p className="text-white">
            {(totalHours / workHours.length).toFixed(1)} ชั่วโมง
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "list"
                  ? "bg-[var(--color-primary-600)] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                รายการ
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "calendar"
                  ? "bg-[var(--color-primary-600)] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                ปฏิทิน
              </button>
            </div>

            {/* Filter */}
            {viewMode === "list" && (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as any)
                  }
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="approved">ตรวจสอบแล้ว</option>
                  <option value="pending">รอการตรวจสอบ</option>
                </select>
              </div>
            )}
          </div>

          {viewMode === "list" && (
            <p className="text-gray-600">
              แสดง {filteredWorkHours.length} จาก{" "}
              {workHours.length} รายการ
            </p>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-gray-900">
              {selectedMonth.toLocaleDateString("th-TH", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => changeMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {[
              "อาทิตย์",
              "จันทร์",
              "อังคาร",
              "พุธ",
              "พฤหัสบดี",
              "ศุกร์",
              "เสาร์",
            ].map((day) => (
              <div
                key={day}
                className="text-center py-3 text-gray-600"
              >
                {day}
              </div>
            ))}

            {(() => {
              const { daysInMonth, startingDayOfWeek } =
                getDaysInMonth();
              const workDays = getWorkDaysInMonth();
              const cells = [];

              // Empty cells before first day
              for (let i = 0; i < startingDayOfWeek; i++) {
                cells.push(
                  <div
                    key={`empty-${i}`}
                    className="aspect-square"
                  />,
                );
              }

              // Days of month
              for (let day = 1; day <= daysInMonth; day++) {
                const dayWorkHours = workDays.get(day) || [];
                const hasWork = dayWorkHours.length > 0;
                const totalDayHours = dayWorkHours.reduce(
                  (sum, wh) => sum + wh.hours,
                  0,
                );

                cells.push(
                  <div
                    key={day}
                    className={`aspect-square p-2 rounded-lg border-2 transition-colors ${hasWork
                      ? "bg-[var(--color-primary-50)] border-[var(--color-primary-200)] hover:bg-[var(--color-primary-100)]"
                      : "bg-gray-50 border-gray-100"
                      }`}
                  >
                    <div className="text-gray-900 mb-1">
                      {day}
                    </div>
                    {hasWork && (
                      <div className="text-[var(--color-primary-600)] mt-1">
                        {totalDayHours} ชม.
                      </div>
                    )}
                  </div>,
                );
              }

              return cells;
            })()}
          </div>

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--color-primary-600)] rounded" />
              <span className="text-gray-600">
                วันที่ปฏิบัติงาน
              </span>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkHours.map((workHour) => (
            <WorkHourCard
              key={workHour.id}
              workHour={workHour}
              onRequestCorrection={handleRequestCorrection}
            />
          ))}
        </div>
      )}

      {/* Correction Modal */}
      <CorrectionModal
        isOpen={correctionModal.isOpen}
        workHourId={correctionModal.workHourId}
        onClose={handleCloseModal}
      />
    </div>
  );
}