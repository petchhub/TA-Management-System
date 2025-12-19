import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Upload,
  FileText,
  CreditCard,
  IdCard,
  CheckCircle2,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const [uploadedFiles, setUploadedFiles] = useState<{
    transcript: File | null;
    bankAccount: File | null;
    studentCard: File | null;
  }>({
    transcript: null,
    bankAccount: null,
    studentCard: null,
  });

  const taProfile = {
    name: "สมศักดิ์ รักการเรียน",
    studentId: "66012345",
    email: "somsak.r@university.ac.th",
    phone: "081-234-5678",
    department: "คณะวิศวกรรมศาสตร์ร์",
    major: "วิศวกรรมคอมพิวเตอร์",
  };

  const assignedCourses = [
    {
      id: 1,
      code: "01076112",
      name: "Introduction to Programming",
      instructor: "ผศ.ดร. สมชาย ใจดี",
      semester: "1/2568",
      hoursPerWeek: 6,
      students: 120,
    },
    {
      id: 2,
      code: "01076114",
      name: "Data Structures",
      instructor: "ผศ.ดร. วิชัย รักษ์ศิลป์",
      semester: "1/2568",
      hoursPerWeek: 4,
      students: 95,
    },
  ];

  const workHistory = [
    { month: "พฤศจิกายน 2025", hours: 40, status: "completed" },
    { month: "ตุลาคม 2025", hours: 38, status: "completed" },
    { month: "กันยายน 2025", hours: 40, status: "completed" },
    { month: "สิงหาคม 2025", hours: 35, status: "completed" },
    { month: "กรกฎาคม 2025", hours: 42, status: "completed" },
    { month: "มิถุนายน 2025", hours: 37, status: "completed" },
  ];

  const totalHours = workHistory.reduce(
    (sum, h) => sum + h.hours,
    0,
  );
  const avgHours = Math.round(totalHours / workHistory.length);

  const handleFileUpload = (
    type: "transcript" | "bankAccount" | "studentCard",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleFileRemove = (
    type: "transcript" | "bankAccount" | "studentCard"
  ) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const documentTypes = [
    {
      id: "transcript" as const,
      label: "ใบแสดงผลการเรียน (Transcript)",
      icon: FileText,
      color: "blue",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      id: "bankAccount" as const,
      label: "สำเนาบัญชีธนาคาร",
      icon: CreditCard,
      color: "green",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      id: "studentCard" as const,
      label: "สำเนาบัตรนักศึกษา",
      icon: IdCard,
      color: "purple",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">โปรไฟล์</h1>
        <p className="text-gray-600">
          ข้อมูลส่วนตัวและประวัติการทำงาน
        </p>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-[var(--color-primary-600)]" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">
                {taProfile.name}
              </h2>
              <p className="text-gray-600 mb-6">
                รหัสนักศึกษา: {taProfile.studentId}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">อีเมล</p>
                    <p className="text-gray-900">
                      {taProfile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">เบอร์โทร</p>
                    <p className="text-gray-900">
                      {taProfile.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">สาขาวิชา</p>
                    <p className="text-gray-900">
                      {taProfile.major}
                    </p>
                    <p className="text-gray-600">
                      {taProfile.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl p-8 shadow-sm text-white">
          <h3 className="mb-6">สถิติการทำงาน</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-primary-400)]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="text-[var(--color-primary-100)]">
                  รวมทั้งหมด
                </span>
              </div>
              <span className="text-white">
                {totalHours} ชม.
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-primary-400)]">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                <span className="text-[var(--color-primary-100)]">
                  ค่าเฉลี่ย/เดือน
                </span>
              </div>
              <span className="text-white">{avgHours} ชม.</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span className="text-[var(--color-primary-100)]">รายวิชา</span>
              </div>
              <span className="text-white">
                {assignedCourses.length} วิชา
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Courses */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-gray-900 mb-6">
          รายวิชาที่ปฏิบัติหน้าที่
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignedCourses.map((course) => (
            <div
              key={course.id}
              className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">
                      {course.code}
                    </h3>
                    <span className="px-2 py-1 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded">
                      {course.semester}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    {course.name}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>อาจารย์: {course.instructor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {course.hoursPerWeek} ชั่วโมง/สัปดาห์
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {course.students} นักศึกษา
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work History */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">
            ประวัติชั่วโมงย้อนหลัง
          </h2>
          <div className="text-right">
            <p className="text-gray-600">รวมทั้งหมด</p>
            <p className="text-[var(--color-primary-600)]">
              {totalHours} ชั่วโมง
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-4 text-gray-600">
                  เดือน
                </th>
                <th className="text-right pb-4 text-gray-600">
                  ชั่วโมง
                </th>
                <th className="text-right pb-4 text-gray-600">
                  สถานะ
                </th>
                <th className="text-right pb-4 text-gray-600">
                  ความคืบหน้า
                </th>
              </tr>
            </thead>
            <tbody>
              {workHistory.map((history, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {history.month}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-gray-900">
                    {history.hours} ชม.
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      เสร็จสมบูรณ์
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="w-24 ml-auto bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Upload Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mt-6">
        <div className="mb-6">
          <h2 className="text-gray-900 mb-2">เอกสารประกอบการสมัคร</h2>
          <p className="text-gray-600">
            อัปโหลดเอกสารเพื่อใช้ในการสมัครตำแหน่ง TA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            const file = uploadedFiles[docType.id];
            const colorClasses = {
              blue: "bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border-[var(--color-primary-100)]",
              green: "bg-green-50 text-green-600 border-green-100",
              purple: "bg-purple-50 text-purple-600 border-purple-100",
            }[docType.color];

            return (
              <div
                key={docType.id}
                className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[var(--color-primary-300)] transition-all"
              >
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900">{docType.label}</h3>
                  </div>
                </div>

                {/* File Status */}
                {file ? (
                  <div className="space-y-3">
                    {/* Uploaded File Info */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-green-700 mb-1">
                            อัปโหลดสำเร็จ
                          </p>
                          <p className="text-green-600 truncate">
                            {file.name}
                          </p>
                          <p className="text-green-600">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleFileRemove(docType.id)}
                      className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      ลบไฟล์
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Upload Button */}
                    <label className="block">
                      <input
                        type="file"
                        accept={docType.accept}
                        onChange={(e) => handleFileUpload(docType.id, e)}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-3 bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <Upload className="w-5 h-5" />
                        เลือกไฟล์
                      </div>
                    </label>

                    {/* Accepted Formats */}
                    <p className="text-gray-500 text-center">
                      รองรับไฟล์: PDF, JPG, PNG
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">
                อัปโหลดแล้ว:{" "}
                {Object.values(uploadedFiles).filter((f) => f !== null).length}{" "}
                / {documentTypes.length} ไฟล์
              </span>
            </div>
            {Object.values(uploadedFiles).filter((f) => f !== null).length ===
              documentTypes.length && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>อัปโหลดครบถ้วน</span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}