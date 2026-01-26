import {
  Mail,
  Phone,
  BookOpen,
  Upload,
  FileText,
  CreditCard,
  IdCard,
  CheckCircle2,
  X,
  Loader2,
  Edit2,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudentApplications, Application } from "../../services/courseService";
import {
  getStudentProfile,
  updateStudentProfile,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  StudentProfile,
} from "../../services/studentService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstnameThai: "",
    lastnameThai: "",
    phoneNumber: "",
  });
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: "transcript" | "bank-account" | "student-card" | null;
  }>({
    isOpen: false,
    type: null,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [apps, studentProfile] = await Promise.all([
          getStudentApplications(parseInt(user.id)),
          getStudentProfile(parseInt(user.id)),
        ]);
        setApplications(apps);
        setProfile(studentProfile);
        setEditData({
          firstnameThai: studentProfile.firstnameThai,
          lastnameThai: studentProfile.lastnameThai,
          phoneNumber: studentProfile.phoneNumber,
        });
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
    department: "วิศวกรรมศาสตร์", // Placeholder as backend doesn't provide this yet
    major: "วิศวกรรมคอมพิวเตอร์", // Placeholder
  };

  // Derive uploaded files status from profile
  const uploadedFiles = {
    transcript: profile?.hasTranscript ? true : null,
    bankAccount: profile?.hasBankAccount ? true : null,
    studentCard: profile?.hasStudentCard ? true : null,
  };

  const documentTypes = [
    {
      id: "transcript" as const,
      label: "ใบแสดงผลการเรียน (Transcript)",
      icon: FileText,
      color: "blue",
      accept: ".pdf",
    },
    {
      id: "bankAccount" as const,
      label: "สำเนาบัญชีธนาคาร",
      icon: CreditCard,
      color: "green",
      accept: ".pdf",
    },
    {
      id: "studentCard" as const,
      label: "สำเนาบัตรนักศึกษา",
      icon: IdCard,
      color: "purple",
      accept: ".pdf",
    },
  ];

  // Handler functions for edit mode
  const handleEditClick = () => {
    if (!profile) return;
    setEditData({
      firstnameThai: profile.firstnameThai,
      lastnameThai: profile.lastnameThai,
      phoneNumber: profile.phoneNumber,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!user?.id || !profile) return;

    try {
      await updateStudentProfile(parseInt(user.id), editData);
      // Refresh profile data
      const updatedProfile = await getStudentProfile(parseInt(user.id));
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Handler functions for documents
  const handleDocumentUpload = async (
    type: "transcript" | "bank-account" | "student-card",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Client-side PDF validation
    // Client-side PDF validation
    if (file.type !== "application/pdf") {
      toast.error("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      return;
    }

    try {
      setUploadingDoc(type);
      await uploadDocument(parseInt(user.id), type, file);
      // Refresh profile to update document status
      const updatedProfile = await getStudentProfile(parseInt(user.id));
      setProfile(updatedProfile);
      toast.success("อัปโหลดเอกสารสำเร็จ");
    } catch (err) {
      console.error("Failed to upload document:", err);
      toast.error("ไม่สามารถอัปโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDocumentView = async (
    type: "transcript" | "bank-account" | "student-card"
  ) => {
    if (!user?.id) return;

    try {
      const blob = await downloadDocument(parseInt(user.id), type);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // setTimeout(() => window.URL.revokeObjectURL(url), 1000); // Optional: Revoke after delay
    } catch (err) {
      console.error("Failed to view document:", err);
      toast.error("ไม่สามารถเปิดเอกสารได้");
    }
  };

  const handleDocumentDelete = async (
    type: "transcript" | "bank-account" | "student-card"
  ) => {
    setDeleteConfirmation({ isOpen: true, type });
  };

  const confirmDelete = async () => {
    if (!user?.id || !deleteConfirmation.type) return;

    try {
      await deleteDocument(parseInt(user.id), deleteConfirmation.type);
      // Refresh profile to update document status
      const updatedProfile = await getStudentProfile(parseInt(user.id));
      setProfile(updatedProfile);
      toast.success("ลบเอกสารสำเร็จ");
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error("ไม่สามารถลบเอกสารได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeleteConfirmation({ isOpen: false, type: null });
    }
  };


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
            <p className="text-gray-600 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {profile?.email || studentProfile.email}
            </p>
            <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              ผู้ช่วยสอน (TA)
            </span>
          </div>

          {/* Contact Information Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-600" />
                ข้อมูลติดต่อ
              </h3>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">แก้ไข</span>
                </button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">บันทึก</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">ยกเลิก</span>
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thai Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">ชื่อ-นามสกุล (ไทย)</p>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.firstnameThai}
                        onChange={(e) => setEditData({ ...editData, firstnameThai: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="ชื่อ"
                      />
                      <input
                        type="text"
                        value={editData.lastnameThai}
                        onChange={(e) => setEditData({ ...editData, lastnameThai: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="นามสกุล"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile ? `${profile.firstnameThai} ${profile.lastnameThai}` : "-"}
                    </p>
                  )}
                </div>
              </div>

              {/* Email (read-only) */}


              {/* Phone */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">เบอร์โทร</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="เบอร์โทรศัพท์"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile?.phoneNumber || studentProfile.phone}
                    </p>
                  )}
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
                <p className="text-sm text-gray-600 mb-1">คณะ</p>
                <p className="text-gray-900 font-medium mb-1">
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">เอกสารประกอบการสมัคร</h2>
          <p className="text-gray-600">
            อัปโหลดเอกสารเพื่อใช้ในการสมัครตำแหน่ง TA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
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
                {(() => {
                  const docTypeMap: Record<string, keyof Pick<StudentProfile, 'hasTranscript' | 'hasBankAccount' | 'hasStudentCard'>> = {
                    transcript: 'hasTranscript',
                    bankAccount: 'hasBankAccount',
                    studentCard: 'hasStudentCard',
                  };
                  const fileNameMap: Record<string, keyof Pick<StudentProfile, 'transcriptFileName' | 'bankAccountFileName' | 'studentCardFileName'>> = {
                    transcript: 'transcriptFileName',
                    bankAccount: 'bankAccountFileName',
                    studentCard: 'studentCardFileName',
                  };
                  const hasDocument = profile?.[docTypeMap[docType.id]];
                  const fileName = profile?.[fileNameMap[docType.id]];
                  const isUploading = uploadingDoc === `${docType.id.replace('Card', '-card').replace('Account', '-account')}`;

                  if (hasDocument) {
                    return (
                      <div className="space-y-3">
                        {/* Uploaded File Info */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-green-700 font-medium mb-1 truncate" title={fileName}>
                                {fileName || "อัปโหลดแล้ว"}
                              </p>
                              <p className="text-green-600 text-sm">
                                เอกสารถูกเก็บไว้ในระบบแล้ว
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDocumentView(docType.id.replace('Card', '-card').replace('Account', '-account') as any)}
                            className="flex-1 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <BookOpen className="w-4 h-4" />
                            ดูเอกสาร
                          </button>
                          <button
                            onClick={() => handleDocumentDelete(docType.id.replace('Card', '-card').replace('Account', '-account') as any)}
                            className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            ลบ
                          </button>
                        </div>

                        {/* Replace Button */}
                        <label className="block">
                          <input
                            type="file"
                            accept={docType.accept}
                            onChange={(e) => handleDocumentUpload(docType.id.replace('Card', '-card').replace('Account', '-account') as any, e)}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <div className="w-full px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 font-medium border border-orange-200">
                            <Upload className="w-4 h-4" />
                            แทนที่เอกสาร
                          </div>
                        </label>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {/* Upload Button */}
                      <label className="block">
                        <input
                          type="file"
                          accept={docType.accept}
                          onChange={(e) => handleDocumentUpload(docType.id.replace('Card', '-card').replace('Account', '-account') as any, e)}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <div className={`w-full px-4 py-4 rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 border-2 ${isUploading
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 hover:border-orange-300'
                          }`}>
                          {isUploading ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span className="font-medium">กำลังอัปโหลด...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-6 h-6" />
                              <span className="font-medium">เลือกไฟล์</span>
                            </>
                          )}
                        </div>
                      </label>

                      {/* Accepted Formats */}
                      <p className="text-gray-500 text-sm text-center">
                        รองรับไฟล์ PDF เท่านั้น (สูงสุด 10MB)
                      </p>
                    </div>
                  );
                })()}
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
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmation({ isOpen: false, type: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้? เมื่อลบแล้วจะไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              ลบเอกสาร
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}