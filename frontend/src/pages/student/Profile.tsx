import {
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Upload,
  FileText,
  CreditCard,
  IdCard,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudentApplications, Application } from "../../services/courseService";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{
    transcript: File | null;
    bankAccount: File | null;
    studentCard: File | null;
  }>({
    transcript: null,
    bankAccount: null,
    studentCard: null,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const apps = await getStudentApplications(parseInt(user.id));
        setApplications(apps);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  // Derived data
  const assignedCourses = applications.filter(app => app.statusCode === 'APPROVED');
  const latestAppWithPhone = applications.find(app => app.phoneNumber);

  const studentProfile = {
    name: user?.name || "Loading...",
    studentId: user?.id || "",
    email: user?.email || "",
    phone: latestAppWithPhone?.phoneNumber || "-",
    department: "วิศวกรรมคอมพิวเตอร์", // Placeholder as backend doesn't provide this yet
    major: "วิศวกรรมคอมพิวเตอร์", // Placeholder
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">โปรไฟล์</h1>
        <p className="text-gray-600">
          ข้อมูลส่วนตัวและเอกสารที่เกี่ยวข้อง
        </p>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center mb-8">
            {/* Large Avatar */}
            <div className="w-32 h-32 bg-orange-50 border-4 border-white ring-1 ring-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <span className="text-5xl font-bold text-orange-600">
                {studentProfile.name.charAt(0)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {studentProfile.name}
            </h2>
            <p className="text-gray-600 mb-2">
              รหัสนักศึกษา: {studentProfile.studentId}
            </p>
            <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              ผู้ช่วยสอน (TA)
            </span>
          </div>

          {/* Contact Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              ข้อมูลติดต่อ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                  <p className="text-gray-900 font-medium">
                    {studentProfile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">เบอร์โทร</p>
                  <p className="text-gray-900 font-medium">
                    {studentProfile.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              ข้อมูลการศึกษา
            </h3>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BookOpen className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">สาขาวิชา</p>
                <p className="text-gray-900 font-medium mb-1">
                  {studentProfile.major}
                </p>
                <p className="text-gray-600 text-sm">
                  {studentProfile.department}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">สถิติภาพรวม</h3>

          <div className="space-y-4">
            {/* Active Courses */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-600">รายวิชาที่ดูแล</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{assignedCourses.length}</p>
              <p className="text-gray-500 text-sm mt-1">วิชา</p>
            </div>

            {/* Total Applications */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-600">การสมัครทั้งหมด</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-gray-500 text-sm mt-1">ตำแหน่ง</p>
            </div>

            {/* Document Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-600">สถานะเอกสาร</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(uploadedFiles).filter((f) => f !== null).length}/3
              </p>
              <p className="text-gray-500 text-sm mt-1">เอกสาร</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>สถานะ: {assignedCourses.length > 0 ? "ปฏิบัติงานอยู่" : "ไม่มีงานที่ทำอยู่"}</span>
            </div>
          </div>
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
              blue: "bg-orange-50 text-orange-600 border-orange-100",
              green: "bg-green-50 text-green-600 border-green-100",
              purple: "bg-purple-50 text-purple-600 border-purple-100",
            }[docType.color];

            return (
              <div
                key={docType.id}
                className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/30 transition-all"
              >
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-semibold">{docType.label}</h3>
                  </div>
                </div>

                {/* File Status */}
                {file ? (
                  <div className="space-y-3">
                    {/* Uploaded File Info */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-green-700 font-medium mb-1">
                            อัปโหลดสำเร็จ
                          </p>
                          <p className="text-green-600 text-sm truncate">
                            {file.name}
                          </p>
                          <p className="text-green-600 text-sm">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleFileRemove(docType.id)}
                      className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
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
                      <div className="w-full px-4 py-4 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-orange-200 hover:border-orange-300">
                        <Upload className="w-6 h-6" />
                        <span className="font-medium">เลือกไฟล์</span>
                      </div>
                    </label>

                    {/* Accepted Formats */}
                    <p className="text-gray-500 text-sm text-center">
                      รองรับเฉพาะไฟล์ PDF
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