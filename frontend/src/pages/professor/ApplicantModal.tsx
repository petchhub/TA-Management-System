import { X, FileText, CreditCard, IdCard, Check, XIcon, Download } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  studentId: string;
  gpa: number;
  email: string;
  phone: string;
  course: string;
  status: 'pending' | 'approved' | 'rejected';
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    applicant.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {applicant.status === 'pending' ? 'รอพิจารณา' :
                    applicant.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
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
          <div>
            <p className="text-sm text-gray-600 mb-1">วิชาที่สมัคร</p>
            <p className="text-gray-900">{applicant.course}</p>
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
                  <button className="flex items-center gap-2 text-sm hover:underline text-[var(--color-primary-600)]">
                    <Download size={16} />
                    ดาวน์โหลด
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
                  <button className="flex items-center gap-2 text-sm hover:underline text-[var(--color-primary-600)]">
                    <Download size={16} />
                    ดาวน์โหลด
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
                  <button className="flex items-center gap-2 text-sm hover:underline text-[var(--color-primary-600)]">
                    <Download size={16} />
                    ดาวน์โหลด
                  </button>
                ) : (
                  <span className="text-sm text-red-600">ยังไม่อัปโหลด</span>
                )}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-gray-900 mb-2">ประสบการณ์</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{applicant.experience}</p>
          </div>

          {/* Motivation */}
          <div>
            <h3 className="text-gray-900 mb-2">เหตุผลในการสมัคร</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{applicant.motivation}</p>
          </div>
        </div>

        {/* Actions */}
        {applicant.status === 'pending' && (
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
        )}
      </div>
    </div>
  );
}