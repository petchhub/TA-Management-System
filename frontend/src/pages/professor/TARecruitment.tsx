import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  FileText,
  CreditCard,
  IdCard,
  Plus,
} from "lucide-react";
import { ApplicantModal } from "./ApplicantModal";
import { CreateTAAnnouncementModal } from "./CreateTAAnnouncementModal";
import { useAuth } from "../../context/AuthContext";
import { getProfessorApplications, approveApplication, rejectApplication, createJobPost } from "../../services/courseService";
import { Toast, ToastType } from "../../components/Toast";

const REJECT_TEMPLATES = [
  "จำนวนผู้ช่วยสอนครบตามจำนวนที่ต้องการแล้ว",
  "คุณสมบัติไม่ตรงตามเกณฑ์รายวิชา (GPA)",
  "เวลาปฏิบัติงานของผู้สมัครมากเกินไปแล้ว",
  "ต้องการผู้ช่วยสอนที่มีประสบการณ์มาก่อน",
  "เอกสารประกอบการสมัครไม่ครบถ้วน",
];

interface Applicant {
  id: number;
  name: string;
  studentId: string;
  gpa: number;
  email: string;
  phone: string;
  course: string;
  courseId: number;
  classDay?: string;
  classStart?: string;
  classEnd?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  documents: {
    transcript: boolean;
    bankAccount: boolean;
    studentCard: boolean;
  };
  experience: string;
  motivation: string;
}

export function TARecruitment() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [gpaFilter, setGpaFilter] = useState<string>("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Approve Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState<number | null>(null);

  // Recruit TA Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) {
      console.log("No user found in AuthContext");
      return;
    }

    console.log("Current user in TARecruitment:", user);

    try {
      setLoading(true);
      setError(null);

      const professorId = parseInt(user.id);
      const apps = await getProfessorApplications(professorId, user.name);
      console.log("Apps returned to TARecruitment:", apps);

      // Map backend Application to frontend Applicant
      const mappedApplicants: Applicant[] = apps.map((app: any) => ({
        id: app.applicationId, // Should ideally use Application ID or fallback
        name: app.studentNameTH || app.studentName || `Student ID: ${app.studentID}`, // Prioritize Thai name
        studentId: app.studentID?.toString() || "-",
        gpa: parseFloat(app.grade) || 0.00, // Fallback as backend doesn't send this yet
        // Fallback for email as we don't have it
        email: app.studentID
          ? `${app.studentID}@kmitl.ac.th`
          : "-",
        phone: app.phoneNumber || "-", // Now using real phone number from backend
        course: app.courseName ? `${app.courseName}` : "Unknown Course",
        courseId: app.courseID || 0, // Map courseID
        classDay: app.classDay,
        classStart: app.classStart,
        classEnd: app.classEnd,
        status: (app.statusCode as any) || "PENDING",
        documents: {
          transcript: app.hasTranscript || false, // Real data from backend
          bankAccount: app.hasBankAccount || false, // Real data from backend
          studentCard: app.hasStudentCard || false, // Real data from backend
        },
        experience: "ข้อมูลไม่ระบุ",
        motivation: app.purpose || "ข้อมูลไม่ระบุ",
      }));

      setApplicants(mappedApplicants);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("ไม่สามารถโหลดข้อมูลผู้สมัครได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleApproveClick = (id: number) => {
    setSelectedApproveId(id);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedApproveId) return;
    try {
      await approveApplication(selectedApproveId);
      setApproveModalOpen(false);
      await fetchApplications(); // Refresh list
    } catch (err) {
      console.error("Failed to approve application:", err);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedRejectId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRejectId) return;
    try {
      await rejectApplication(selectedRejectId, rejectReason);
      setRejectModalOpen(false);
      await fetchApplications(); // Refresh list
    } catch (err) {
      console.error("Failed to reject application:", err);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };

  const handleSelectTemplate = (template: string) => {
    setRejectReason(template);
  };

  const handleCreateAnnouncement = async (data: any) => {
    try {
      setIsSubmitting(true);

      const professorID = user?.id ? parseInt(user.id) : 1;

      await createJobPost({
        courseID: data.courseID,
        professorID: professorID,
        location: data.location || "Building",
        taAllocation: data.taAllocation,
        gradeID: data.gradeID,
        task: data.task
      });

      setToast({ message: 'ประกาศรับสมัคร TA สำเร็จ!', type: 'success' });
      setShowCreateModal(false);

      // Refresh applications list
      setTimeout(() => {
        fetchApplications();
      }, 1500);
    } catch (error) {
      console.error('Failed to create announcement:', error);
      setToast({
        message: `เกิดข้อผิดพลาดในการสร้างประกาศ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.studentId.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
    const matchesGPA =
      gpaFilter === "all" ||
      (gpaFilter === "high" && app.gpa >= 3.5) ||
      (gpaFilter === "medium" &&
        app.gpa >= 3.0 &&
        app.gpa < 3.5) ||
      (gpaFilter === "low" && app.gpa < 3.0);

    return matchesSearch && matchesStatus && matchesGPA;
  });

  const statusCount = {
    all: applicants.length,
    pending: applicants.filter((a) => a.status === "PENDING")
      .length,
    approved: applicants.filter((a) => a.status === "APPROVED")
      .length,
    rejected: applicants.filter((a) => a.status === "REJECTED")
      .length,
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">การรับสมัคร TA</h1>
          <p className="text-gray-600">
            จัดการและอนุมัติผู้สมัครผู้ช่วยสอน
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus size={20} />
          ประกาศรับสมัคร TA
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">ทั้งหมด</p>
          <p className="text-gray-900">{statusCount.all} คน</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <p className="text-yellow-700 text-sm mb-1">
            รอพิจารณา
          </p>
          <p className="text-yellow-900">
            {statusCount.pending} คน
          </p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-green-700 text-sm mb-1">
            อนุมัติแล้ว
          </p>
          <p className="text-green-900">
            {statusCount.approved} คน
          </p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-red-700 text-sm mb-1">ปฏิเสธ</p>
          <p className="text-red-900">
            {statusCount.rejected} คน
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัสนิสิต..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="PENDING">รอพิจารณา</option>
            <option value="APPROVED">อนุมัติแล้ว</option>
            <option value="REJECTED">ปฏิเสธ</option>
          </select>

          <select
            value={gpaFilter}
            onChange={(e) => setGpaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          >
            <option value="all">GPA ทั้งหมด</option>
            <option value="high">≥ 3.5</option>
            <option value="medium">3.0 - 3.49</option>
            <option value="low">{"< 3.0"}</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-gray-600">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-gray-600">
                  รหัสนิสิต
                </th>
                <th className="px-6 py-3 text-left text-gray-600">
                  GPA
                </th>
                <th className="px-6 py-3 text-left text-gray-600">
                  วิชาที่สมัคร
                </th>
                <th className="px-6 py-3 text-left text-gray-600">
                  เอกสาร
                </th>
                <th className="px-6 py-3 text-left text-gray-600">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-gray-600">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-gray-900">
                    {applicant.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {applicant.studentId}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${applicant.gpa >= 3.5
                        ? "bg-green-100 text-green-800"
                        : applicant.gpa >= 3.0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {applicant.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {applicant.course}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <span title="Transcript">
                        <FileText
                          size={16}
                          className={
                            applicant.documents.transcript
                              ? "text-green-600"
                              : "text-gray-300"
                          }
                        />
                      </span>
                      <span title="Bank Account">
                        <CreditCard
                          size={16}
                          className={
                            applicant.documents.bankAccount
                              ? "text-green-600"
                              : "text-gray-300"
                          }
                        />
                      </span>
                      <span title="Student Card">
                        <IdCard
                          size={16}
                          className={
                            applicant.documents.studentCard
                              ? "text-green-600"
                              : "text-gray-300"
                          }
                        />
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${applicant.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : applicant.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {applicant.status === "PENDING"
                        ? "รอพิจารณา"
                        : applicant.status === "APPROVED"
                          ? "อนุมัติแล้ว"
                          : "ปฏิเสธ"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedApplicant(applicant)
                        }
                        className="p-1 text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] rounded"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={18} />
                      </button>
                      {applicant.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleApproveClick(applicant.id)
                            }
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="อนุมัติ"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleRejectClick(applicant.id)
                            }
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="ปฏิเสธ"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ระบุเหตุผลในการปฏิเสธ</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">เลือกข้อความอัตโนมัติ:</p>
              <div className="flex flex-wrap gap-2">
                {REJECT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectTemplate(template)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors border border-gray-200"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none mb-4"
              placeholder="ระบุเหตุผลเพิ่มเติม..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            {/* Warning Message */}
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <div className="p-1 bg-red-100 rounded-full">
                <X size={12} className="text-red-600" />
              </div>
              <p className="text-sm text-red-800">
                <strong>คำเตือน:</strong> การปฏิเสธคำขอจะไม่สามารถเรียกคืนได้ กรุณาตรวจสอบให้แน่ใจก่อนกดยืนยัน
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Check size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">ยืนยันการอนุมัติ</h3>
            </div>

            <p className="text-gray-600 mb-6">
              คุณต้องการอนุมัตินักศึกษาคนนี้ใช่หรือไม่?
              <br />
              <span className="text-red-600 font-medium mt-2 block">
                คำเตือน: เมื่ออนุมัติแล้วจะไม่สามารถยกเลิกหรือเปลี่ยนแปลงสถานะได้
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                ยืนยันการอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedApplicant && (
        <ApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onApprove={() => {
            handleApproveClick(selectedApplicant.id);
            setSelectedApplicant(null);
          }}
          onReject={() => {
            // Close details modal and open reject modal
            const id = selectedApplicant.id;
            setSelectedApplicant(null);
            handleRejectClick(id);
          }}
        />
      )}

      {/* Create TA Announcement Modal */}
      {showCreateModal && (
        <CreateTAAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAnnouncement}
          isSubmitting={isSubmitting}
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