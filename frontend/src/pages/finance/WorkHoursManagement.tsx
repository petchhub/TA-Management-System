import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface WorkHour {
  id: string;
  taName: string;
  course: string;
  dateRange: string;
  totalHours: number;
  status: "pending" | "verified" | "issue";
}

export function WorkHoursManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<
    string[]
  >([]);
  const [selectedStatus, setSelectedStatus] =
    useState<string>("all");
  const [selectedMonth, setSelectedMonth] =
    useState<string>("2024-12");

  const courses = [
    "01076103 - Programming Fundamentals",
    "01076109 - Data Structures",
    "01076564 - Algorithms",
    "01076112 - Digital System Fundamentals",
    "01076035 - Software Development Process in Practice",
  ];

  const mockData: WorkHour[] = [
    {
      id: "1",
      taName: "สมชาย ใจดี",
      course: "01076103 - Programming Fundamentals",
      dateRange: "1-15 ธ.ค. 2567",
      totalHours: 12,
      status: "verified",
    },
    {
      id: "2",
      taName: "สมหญิง รักเรียน",
      course: "01076109 - Data Structures",
      dateRange: "1-15 ธ.ค. 2567",
      totalHours: 10,
      status: "pending",
    },
    {
      id: "3",
      taName: "วิชัย มานะ",
      course: "01076564 - Algorithms",
      dateRange: "1-15 ธ.ค. 2567",
      totalHours: 16,
      status: "verified",
    },
    {
      id: "4",
      taName: "ประภา สุขสันต์",
      course: "01076112 - Digital System Fundamentals",
      dateRange: "1-15 ธ.ค. 2567",
      totalHours: 8,
      status: "pending",
    },
    {
      id: "5",
      taName: "ธนากร วิทยา",
      course:
        "01076035 - Software Development Process in Practice",
      dateRange: "1-15 ธ.ค. 2567",
      totalHours: 4,
      status: "issue",
    },
    {
      id: "6",
      taName: "มาลี สวยงาม",
      course: "01076103 - Programming Fundamentals",
      dateRange: "16-31 ธ.ค. 2567",
      totalHours: 14,
      status: "verified",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <CheckCircle size={14} />
            ตรวจสอบแล้ว
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
            <Clock size={14} />
            รอตรวจสอบ
          </span>
        );
      case "issue":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            <AlertCircle size={14} />
            มีปัญหา
          </span>
        );
      default:
        return null;
    }
  };

  const filteredData = mockData.filter((item) => {
    const matchesSearch =
      item.taName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.course
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourses.length === 0 ||
      selectedCourses.includes(item.course);
    const matchesStatus =
      selectedStatus === "all" ||
      item.status === selectedStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl mb-2">จัดการชั่วโมงการทำงาน</h2>
        <p className="text-gray-600">
          ตรวจสอบและจัดการข้อมูลชั่วโมงการทำงานของผู้ช่วยสอน
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg">ตัวกรอง</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              ค้นหา
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ชื่อผู้ช่วยสอน หรือรายวิชา"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              />
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              รายวิชา
            </label>
            <select
              multiple
              value={selectedCourses}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value,
                );
                setSelectedCourses(selected);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              กด Ctrl/Cmd เพื่อเลือกหลายรายการ
            </p>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              เดือน
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              สถานะ
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            >
              <option value="all">ทั้งหมด</option>
              <option value="verified">ตรวจสอบแล้ว</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="issue">มีปัญหา</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Hours Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm text-gray-600">
                ชื่อผู้ช่วยสอน
              </th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">
                รายวิชา
              </th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">
                ช่วงวันที่ทำงาน
              </th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">
                ชั่วโมงรวม
              </th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">
                สถานะการตรวจสอบ
              </th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">
                การกระทำ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{item.taName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.course}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.dateRange}
                </td>
                <td className="px-6 py-4">
                  {item.totalHours} ชม.
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4">
                  <button className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] text-sm">
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        แสดง {filteredData.length} รายการจากทั้งหมด{" "}
        {mockData.length} รายการ
      </div>
    </div>
  );
}