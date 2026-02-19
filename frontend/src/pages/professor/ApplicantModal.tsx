import { useState, useEffect } from 'react';
import { X, FileText, CreditCard, IdCard, Check, XIcon, Eye, BookOpen } from 'lucide-react';
import { getStudentApplications, getAllTimeApprovedCoursesByStudentId, Application } from '../../services/courseService';
import { getStudentTranscriptUrl, getStudentBankAccountUrl, getStudentCardUrl } from '../../services/lookupService';
import { formatTimeRange, formatDay } from '../../utils/dateUtils';

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: {
    transcript: boolean;
    bankAccount: boolean;
    studentCard: boolean;
  };
  experience: string;
  motivation: string;
}

interface ApplicantModalProps {
  applicant: Applicant;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ApplicantModal({ applicant, onClose, onApprove, onReject }: ApplicantModalProps) {
  const [otherApplications, setOtherApplications] = useState<Application[]>([]);
  const [taHistory, setTaHistory] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!applicant.studentId) return;
      try {
        setLoadingApps(true);
        const studentIdNum = parseInt(applicant.studentId.replace(/\D/g, ''));
        if (!isNaN(studentIdNum)) {
          const [apps, history] = await Promise.all([
            getStudentApplications(studentIdNum),
            getAllTimeApprovedCoursesByStudentId(studentIdNum),
          ]);
          setOtherApplications(apps.filter(a => a.courseID !== applicant.courseId));
          setTaHistory(history);
        }
      } catch (error) {
        console.error("Failed to fetch student history:", error);
      } finally {
        setLoadingApps(false);
      }
    };

    fetchHistory();
  }, [applicant.studentId, applicant.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-1">รายละเอียดผู้สมัคร</h2>
            <p className="text-sm text-gray-600">{applicant.studentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-gray-900 mb-4">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</p>
                <p className="text-gray-900">{applicant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">รหัสนิสิต</p>
                <p className="text-gray-900">{applicant.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">GPA</p>
                <p className="text-gray-900">{applicant.gpa.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">สถานะ</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${applicant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  applicant.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {applicant.status === 'PENDING' ? 'รอพิจารณา' :
                    applicant.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                <p className="text-gray-900 text-sm">{applicant.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</p>
                <p className="text-gray-900">{applicant.phone}</p>
              </div>
            </div>
          </div>

          {/* Course */}
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 transition-opacity">
              <BookOpen size={64} className="text-[#E35205]" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-2">
                <BookOpen size={16} />
                วิชาที่สมัคร
              </p>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-xl font-bold text-gray-900 leading-tight">
                  {applicant.course}
                </p>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-orange-200 rounded-lg shrink-0 shadow-sm">
                  <span className="text-sm text-[#E35205] font-semibold flex items-center gap-1.5">
                    วัน{formatDay(applicant.classDay)}
                  </span>
                  <span className="w-1 h-1 bg-orange-300 rounded-full"></span>
                  <span className="text-sm text-[#E35205] font-bold">
                    {applicant.classStart && applicant.classEnd ? formatTimeRange(applicant.classStart, applicant.classEnd) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Applications */}
          <div>
            <h3 className="text-gray-900 mb-3 font-medium">ประวัติการสมัครวิชาอื่น</h3>
            {loadingApps ? (
              <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
            ) : otherApplications.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">วิชา</th>
                      <th className="px-4 py-2 text-left">วัน-เวลาเรียน</th>
                      <th className="px-4 py-2 text-left">อาจารย์ผู้สอน</th>
                      <th className="px-4 py-2 text-left">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {otherApplications.map((app) => (
                      <tr key={app.applicationId}>
                        <td className="px-4 py-2 text-gray-900">{app.courseName || `Course ID: ${app.courseID}`}</td>
                        <td className="px-4 py-2 text-[#E35205] font-medium">
                          วัน{formatDay(app.classDay)} {app.classStart && app.classEnd ? formatTimeRange(app.classStart, app.classEnd) : ''}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{app.professorName || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${app.statusCode === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            app.statusCode === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {app.statusCode === 'PENDING' ? 'รอพิจารณา' :
                              app.statusCode === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">ไม่มีประวัติการสมัครวิชาอื่น</p>
            )}
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-gray-900 mb-3">เอกสารแนบ</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText size={20} className={applicant.documents.transcript ? 'text-green-600' : 'text-gray-400'} />
                  <span className="text-gray-900">Transcript</span>
                </div>
                {applicant.documents.transcript ? (
                  <button
                    onClick={() => window.open(getStudentTranscriptUrl(parseInt(applicant.studentId)), '_blank')}
                    className="flex items-center gap-2 text-sm hover:underline text-[var(--color-primary-600)]"
                  >
                    <Eye size={16} />
                    ดูเอกสาร
                  </button>
                ) : (
                  <span className="text-sm text-red-600">ยังไม่อัปโหลด</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className={applicant.documents.bankAccount ? 'text-green-600' : 'text-gray-400'} />
                  <span className="text-gray-900">Bank Account</span>
                </div>
                {applicant.documents.bankAccount ? (
                  <button
                    onClick={() => window.open(getStudentBankAccountUrl(parseInt(applicant.studentId)), '_blank')}
                    className="flex items-center gap-2 text-sm hover:underline text-[var(--color-primary-600)]"
                  >
                    <Eye size={16} />
                    ดูเอกสาร
                  </button>
                ) : (
                  <span className="text-sm text-red-600">ยังไม่อัปโหลด</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <IdCard size={20} className={applicant.documents.studentCard ? 'text-green-600' : 'text-gray-400'} />
                  <span className="text-gray-900">Student Card</span>
                </div>
                {applicant.documents.studentCard ? (
                  <button
                    onClick={() => window.open(getStudentCardUrl(parseInt(applicant.studentId)), '_blank')}
                    className="flex items-center gap-2 text-sm hover:underline text-[var(--color-primary-600)]"
                  >
                    <Eye size={16} />
                    ดูเอกสาร
                  </button>
                ) : (
                  <span className="text-sm text-red-600">ยังไม่อัปโหลด</span>
                )}
              </div>
            </div>
          </div>

          {/* TA History — all-time approved courses */}
          <div>
            <h3 className="text-gray-900 mb-3">ประวัติการเป็น TA</h3>
            {loadingApps ? (
              <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
            ) : taHistory.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">รหัสวิชา</th>
                      <th className="px-4 py-2 text-left">ชื่อวิชา</th>
                      <th className="px-4 py-2 text-left">วัน-เวลาเรียน</th>
                      <th className="px-4 py-2 text-left">อาจารย์ผู้สอน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {taHistory.map((course, idx) => (
                      <tr key={`${course.courseID}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-[#E35205]">
                          {course.courseCode || '-'}
                        </td>
                        <td className="px-4 py-2 text-gray-900">{course.courseName || '-'}</td>
                        <td className="px-4 py-2 text-[#E35205] font-medium">
                          {formatDay(course.classDay)} {course.classStart && course.classEnd ? formatTimeRange(course.classStart, course.classEnd) : ''}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{course.professorName || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">ไม่มีประวัติการเป็น TA</p>
            )}
          </div>
        </div>
        {/* Actions */}
        {
          applicant.status === 'PENDING' && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
              <button
                onClick={onReject}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <XIcon size={18} />
                ปฏิเสธ
              </button>
              <button
                onClick={onApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check size={18} />
                อนุมัติ
              </button>
            </div>
          )
        }
      </div>
    </div>
  );
}