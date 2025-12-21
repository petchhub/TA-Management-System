import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  FileText,
  CreditCard,
  IdCard,
} from "lucide-react";
import { ApplicantModal } from "./ApplicantModal";
import { useAuth } from "../../context/AuthContext";
import { getProfessorApplications, approveApplication } from "../../services/courseService";

interface Applicant {
  id: number;
  name: string;
  studentId: string;
  gpa: number;
  email: string;
  phone: string;
  course: string;
  status: "pending" | "approved" | "rejected";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gpaFilter, setGpaFilter] = useState<string>("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

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
        name: app.studentName || `Student ID: ${app.studentID}`, // Fallback since API lacks name
        studentId: app.studentID?.toString() || "-",
        gpa: parseFloat(app.grade) || 0.00, // Fallback as backend doesn't send this yet
        // Fallback for email as we don't have it
        email: app.studentID
          ? `${app.studentID}@kmitl.ac.th`
          : "-",
        phone: "-", // No phone in API
        course: app.courseName ? `${app.courseName}` : "Unknown Course",
        status: (app.statusCode?.toLowerCase() as any) || "pending",
        documents: {
          transcript: true, // Optimistically assuming true or we could check a 'hasTranscript' if backend sent it
          bankAccount: false,
          studentCard: false,
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

  const handleApprove = async (id: number) => {
    try {
      await approveApplication(id);
      // Refresh list
      await fetchApplications();
    } catch (err) {
      console.error("Failed to approve application:", err);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
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
    pending: applicants.filter((a) => a.status === "pending")
      .length,
    approved: applicants.filter((a) => a.status === "approved")
      .length,
    rejected: applicants.filter((a) => a.status === "rejected")
      .length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">การรับสมัคร TA</h1>
        <p className="text-gray-600">
          จัดการและอนุมัติผู้สมัครผู้ช่วยสอน
        </p>
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
            <option value="pending">รอพิจารณา</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธ</option>
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${applicant.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : applicant.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {applicant.status === "pending"
                        ? "รอพิจารณา"
                        : applicant.status === "approved"
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
                      {applicant.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleApprove(applicant.id)
                            }
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="อนุมัติ"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleReject()
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

      {selectedApplicant && (
        <ApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onApprove={() => {
            handleApprove(selectedApplicant.id);
            setSelectedApplicant(null);
          }}
          onReject={() => {
            handleReject();
            setSelectedApplicant(null);
          }}
        />
      )}
    </div>
  );
}