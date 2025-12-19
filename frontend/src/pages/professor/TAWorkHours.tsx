import { useState } from "react";
import {
  Download,
  Check,
  Calendar,
  BookOpen,
} from "lucide-react";

interface WorkHour {
  id: string;
  taName: string;
  studentId: string;
  course: string;
  date: string;
  hours: number;
  status: "pending" | "checked" | "absent";
}

export function TAWorkHours() {
  const [selectedMonth, setSelectedMonth] = useState("2025-11");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [workHours, setWorkHours] = useState<WorkHour[]>([
    {
      id: "1",
      taName: "ประเสริฐ ขยัน",
      studentId: "66012345",
      course: "CS101",
      date: "2025-11-01",
      hours: 3,
      status: "checked",
    },
    {
      id: "2",
      taName: "มาลี สวยงาม",
      studentId: "66012346",
      course: "CS102",
      date: "2025-11-01",
      hours: 4,
      status: "checked",
    },
    {
      id: "3",
      taName: "ประเสริฐ ขยัน",
      studentId: "66012347",
      course: "CS101",
      date: "2025-11-08",
      hours: 3,
      status: "pending",
    },
    {
      id: "4",
      taName: "มาลี สวยงาม",
      studentId: "66012348",
      course: "CS102",
      date: "2025-11-08",
      hours: 4,
      status: "pending",
    },
    {
      id: "5",
      taName: "ประเสริฐ ขยัน",
      studentId: "66012349",
      course: "CS101",
      date: "2025-11-15",
      hours: 3,
      status: "pending",
    },
    {
      id: "6",
      taName: "มาลี สวยงาม",
      studentId: "66012351",
      course: "CS102",
      date: "2025-11-15",
      hours: 4,
      status: "pending",
    },
    {
      id: "7",
      taName: "ประเสริฐ ขยัน",
      studentId: "66012340",
      course: "CS301",
      date: "2025-11-15",
      hours: 5,
      status: "pending",
    },
    {
      id: "8",
      taName: "มาลี สวยงาม",
      studentId: "66012352",
      course: "CS301",
      date: "2025-11-22",
      hours: 4,
      status: "pending",
    },
  ]);

  // Get unique courses for filter
  const courses = Array.from(
    new Set(workHours.map((wh) => wh.course)),
  ).sort();

  // Get unique dates for filter
  const dates = Array.from(
    new Set(workHours.map((wh) => wh.date)),
  ).sort();

  const toggleStatus = (id: string) => {
    setWorkHours(
      workHours.map((wh) =>
        wh.id === id
          ? {
            ...wh,
            status:
              wh.status === "checked"
                ? "pending"
                : ("checked" as const),
          }
          : wh,
      ),
    );
  };

  // Filter work hours based on selected course and date
  const filteredWorkHours = workHours.filter((wh) => {
    const matchesCourse =
      selectedCourse === "all" || wh.course === selectedCourse;
    const matchesDate =
      selectedDate === "all" || wh.date === selectedDate;
    return matchesCourse && matchesDate;
  });

  const totalHours = filteredWorkHours
    .filter((wh) => wh.status === "checked")
    .reduce((sum, wh) => sum + wh.hours, 0);

  const pendingHours = filteredWorkHours
    .filter((wh) => wh.status === "pending")
    .reduce((sum, wh) => sum + wh.hours, 0);

  // Group by TA
  const tasSummary = filteredWorkHours.reduce(
    (acc, wh) => {
      if (!acc[wh.taName]) {
        acc[wh.taName] = {
          name: wh.taName,
          studentId: wh.studentId,
          totalHours: 0,
          checkedHours: 0,
        };
      }
      acc[wh.taName].totalHours += wh.hours;
      if (wh.status === "checked") {
        acc[wh.taName].checkedHours += wh.hours;
      }
      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        studentId: string;
        totalHours: number;
        checkedHours: number;
      }
    >,
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          ชั่วโมงการทำงาน TA
        </h1>
        <p className="text-gray-600">
          จัดการและเช็คชั่วโมงการทำงานของผู้ช่วยสอน
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              เลือกรายวิชา
            </label>
            <div className="relative">
              <BookOpen
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedCourse}
                onChange={(e) =>
                  setSelectedCourse(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-white"
              >
                <option value="all">ทุกวิชา</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              เลือกวันที่
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-white"
              >
                <option value="all">ทุกวัน</option>
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              เลือกเดือน
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-white"
              >
                <option value="2025-11">พฤศจิกายน 2025</option>
                <option value="2025-10">ตุลาคม 2025</option>
                <option value="2025-09">กันยายน 2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCourse !== "all" ||
          selectedDate !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">
                  กรองข้อมูล:
                </span>
                {selectedCourse !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
                    วิชา: {selectedCourse}
                    <button
                      onClick={() => setSelectedCourse("all")}
                      className="hover:bg-[var(--color-primary-200)] rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDate !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    วันที่:{" "}
                    {new Date(selectedDate).toLocaleDateString(
                      "th-TH",
                      { day: "numeric", month: "short" },
                    )}
                    <button
                      onClick={() => setSelectedDate("all")}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCourse("all");
                    setSelectedDate("all");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Check size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                ชั่วโมงที่เช็คแล้ว
              </p>
              <p className="text-gray-900">
                {totalHours} ชั่วโมง
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">รอการเช็ค</p>
              <p className="text-gray-900">
                {pendingHours} ชั่วโมง
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-lg">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                รายการทั้งหมด
              </p>
              <p className="text-gray-900">
                {filteredWorkHours.length} รายการ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Download size={18} />
          Export PDF (แผ่นเซ็นชื่อ)
        </button>
      </div>

      {/* TA Summary */}
      {Object.keys(tasSummary).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-gray-900">
              สรุปชั่วโมงงานรายบุคคล
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-gray-600">
                    ชื่อ TA
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    รหัสนิสิต
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    ชั่วโมงที่เช็คแล้ว
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    ชั่วโมงรวม
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(tasSummary).map((ta) => (
                  <tr
                    key={ta.studentId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-900">
                      {ta.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {ta.studentId}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {ta.checkedHours} ชม.
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {ta.totalHours} ชม.
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(ta.checkedHours / ta.totalHours) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Work Hours Detail */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">
              รายละเอียดชั่วโมงงาน
            </h2>
            {selectedDate !== "all" && (
              <p className="text-sm text-gray-600 mt-1">
                กรองตามวันที่:{" "}
                {new Date(selectedDate).toLocaleDateString(
                  "th-TH",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            )}
          </div>
          {filteredWorkHours.length > 0 && (
            <span className="text-sm text-gray-600">
              แสดง {filteredWorkHours.length} รายการ
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          {filteredWorkHours.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">
                ไม่พบข้อมูล
              </h3>
              <p className="text-gray-600">
                ไม่มีข้อมูลชั่วโมงการทำงานตามเงื่อนไขที่เลือก
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-gray-600">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    ชื่อ TA
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    รหัสนิสิต
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    รายวิชา
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    ชั่วโมง
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600">
                    เช็คชื่อ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkHours.map((wh) => (
                  <tr
                    key={wh.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(wh.date).toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {wh.taName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {wh.studentId}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {wh.course}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {wh.hours} ชม.
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wh.status === "checked"}
                          onChange={() => toggleStatus(wh.id)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {wh.status === "checked"
                            ? "เช็คแล้ว"
                            : "รอเช็ค"}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}