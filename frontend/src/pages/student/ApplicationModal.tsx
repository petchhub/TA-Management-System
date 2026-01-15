import { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { applyToPosition } from '../../services/positionService';
import { useAuth } from '../../context/AuthContext';
import { getStudentTranscriptUrl, getStudentBankAccountUrl, getStudentCardUrl, checkFileExists } from '../../services/lookupService';

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  instructor: string;
  semester: string;
  positions: number;
  hoursPerWeek: number;
  requirements: string;
  description: string;
  location: string;
  deadline: string;
  status: string;
}

interface ApplicationModalProps {
  isOpen: boolean;
  courseId: number | null;
  course?: Course;
  onClose: () => void;
}

interface ExistingFiles {
  transcript: string | null;
  bankAccount: string | null;
  studentCard: string | null;
}

export default function ApplicationModal({ isOpen, courseId, course, onClose }: ApplicationModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success' | 'error'>('form');
  const [formData, setFormData] = useState({
    experience: '',
    gpa: '',
    transcript: null as File | null,
    phoneNumber: '',
    firstname_thai: '',
    lastname_thai: '',
    bankAccount: null as File | null,
    studentCard: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingFiles, setExistingFiles] = useState<ExistingFiles>({
    transcript: null,
    bankAccount: null,
    studentCard: null
  });
  const [previewFile, setPreviewFile] = useState<{ type: string; url: string } | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const { user } = useAuth();

  // Fetch existing files when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchExistingFiles();
    }
  }, [isOpen, user?.id]);

  const fetchExistingFiles = async () => {
    if (!user?.id) return;

    setLoadingFiles(true);
    try {
      const studentId = parseInt(user.id, 10);

      // Check each file type
      const transcriptUrl = getStudentTranscriptUrl(studentId);
      const bankAccountUrl = getStudentBankAccountUrl(studentId);
      const studentCardUrl = getStudentCardUrl(studentId);

      const [hasTranscript, hasBankAccount, hasStudentCard] = await Promise.all([
        checkFileExists(transcriptUrl),
        checkFileExists(bankAccountUrl),
        checkFileExists(studentCardUrl)
      ]);

      setExistingFiles({
        transcript: hasTranscript ? transcriptUrl : null,
        bankAccount: hasBankAccount ? bankAccountUrl : null,
        studentCard: hasStudentCard ? studentCardUrl : null
      });
    } catch (error) {
      console.error('Error fetching existing files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleRemoveExistingFile = (fileType: 'transcript' | 'bankAccount' | 'studentCard') => {
    setExistingFiles(prev => ({ ...prev, [fileType]: null }));
  };

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirm = async () => {
    // Check if transcript is required (either existing or new)
    if (!courseId || (!formData.transcript && !existingFiles.transcript) || !user?.id || !formData.phoneNumber || !formData.firstname_thai || !formData.lastname_thai) {
      setErrorMessage('ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง (กรุณากรอกชื่อ-นามสกุลภาษาไทยและเบอร์โทรศัพท์และแนบ Transcript)');
      setStep('error');
      return;
    }

    try {
      setSubmitting(true);

      // Submit application to backend
      // Convert user.id to number (assuming it's a student ID)
      const studentId = parseInt(user.id, 10);
      if (isNaN(studentId)) {
        throw new Error('Invalid student ID');
      }

      await applyToPosition(courseId, {
        studentID: studentId,
        statusID: 3, // 3 = Pending status
        motivation: "",
        experience: formData.experience,
        gpa: formData.gpa,
        attacheNewPDF: formData.transcript != null ? true : false,
        transcript: formData.transcript,
        phoneNumber: formData.phoneNumber,
        firstname_thai: formData.firstname_thai,
        lastname_thai: formData.lastname_thai,
        bankAccount: formData.bankAccount,
        studentCard: formData.studentCard,
      });

      setStep('success');
      setTimeout(() => {
        resetAndClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit application:', error);
      setErrorMessage('ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่อีกครั้ง');
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setFormData({
      experience: '',
      gpa: '',
      transcript: null,
      phoneNumber: '',
      firstname_thai: '',
      lastname_thai: '',
      bankAccount: null,
      studentCard: null
    });
    setExistingFiles({
      transcript: null,
      bankAccount: null,
      studentCard: null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">สมัครตำแหน่ง TA</h2>
            <p className="text-sm text-gray-600 mt-1">{course.code} - {course.name}</p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              {/* Course Info */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <h3 className="text-gray-900 mb-2">รายละเอียดตำแหน่ง</h3>
                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  <div>
                    <span className="text-gray-600">อาจารย์:</span> {course.instructor}
                  </div>
                  <div>
                    <span className="text-gray-600">ภาคการศึกษา:</span> {course.semester}
                  </div>
                  <div>
                    <span className="text-gray-600">ชั่วโมง/สัปดาห์:</span> {course.hoursPerWeek}
                  </div>
                  <div>
                    <span className="text-gray-600">ตำแหน่งว่าง:</span> {course.positions}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* GPA */}
                  <div>
                    <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                      เกรดเฉลี่ยสะสม (GPA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="md:col-span-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="0XX-XXX-XXXX"
                    />
                  </div>
                </div>

                {/* Thai Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name Thai */}
                  <div>
                    <label htmlFor="firstname_thai" className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstname_thai"
                      type="text"
                      value={formData.firstname_thai}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstname_thai: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="ชื่อภาษาไทย"
                    />
                  </div>

                  {/* Last Name Thai */}
                  <div>
                    <label htmlFor="lastname_thai" className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastname_thai"
                      type="text"
                      value={formData.lastname_thai}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastname_thai: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="นามสกุลภาษาไทย"
                    />
                  </div>
                </div>



                {/* Transcript Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript (PDF) <span className="text-red-500">*</span>
                  </label>

                  {loadingFiles ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <p className="text-gray-500">กำลังโหลดไฟล์...</p>
                    </div>
                  ) : existingFiles.transcript && !formData.transcript ? (
                    <div className="border-2 border-primary-500 bg-primary-50/30 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            <FileText className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Transcript ที่มีอยู่</p>
                            <p className="text-sm text-gray-500">คลิกเพื่อดูตัวอย่าง</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewFile({ type: 'Transcript', url: existingFiles.transcript! })}
                            className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                            title="ดูตัวอย่าง"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingFile('transcript')}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            title="ลบไฟล์"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${formData.transcript
                      ? 'border-primary-500 bg-primary-50/30'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                      }`}>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFormData(prev => ({ ...prev, transcript: e.target.files?.[0] || null }))}
                        required={!existingFiles.transcript}
                        className="hidden"
                        id="transcript-upload"
                      />
                      <label htmlFor="transcript-upload" className="cursor-pointer w-full h-full block">
                        {formData.transcript ? (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                              <FileText className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{formData.transcript.name}</p>
                              <p className="text-sm text-gray-500 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                              <Upload className="w-8 h-8 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">คลิกหรือลากไฟล์มาวางที่นี่</p>
                              <p className="text-sm text-gray-500 mt-1">รองรับไฟล์ PDF เท่านั้น</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Optional Documents - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Account Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สำเนาหน้าบัญชีธนาคาร (PDF)
                    </label>
                    {existingFiles.bankAccount && !formData.bankAccount ? (
                      <div className="border-2 border-primary-500 bg-primary-50/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                              <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">ไฟล์ที่มีอยู่</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewFile({ type: 'Bank Account', url: existingFiles.bankAccount! })}
                              className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                              title="ดูตัวอย่าง"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingFile('bankAccount')}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              title="ลบไฟล์"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${formData.bankAccount
                        ? 'border-primary-500 bg-primary-50/30'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.files?.[0] || null }))}
                          className="hidden"
                          id="bankAccount-upload"
                        />
                        <label htmlFor="bankAccount-upload" className="cursor-pointer w-full h-full block">
                          {formData.bankAccount ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="p-2 bg-white rounded-full shadow-sm">
                                <FileText className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{formData.bankAccount.name}</p>
                                <p className="text-xs text-gray-500 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="p-2 bg-gray-100 rounded-full">
                                <Upload className="w-6 h-6 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 text-sm">คลิกเพื่ออัปโหลด</p>
                                <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ PDF เท่านั้น</p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Student Card Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สำเนาบัตรนิสิต (PDF)
                    </label>
                    {existingFiles.studentCard && !formData.studentCard ? (
                      <div className="border-2 border-primary-500 bg-primary-50/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                              <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">ไฟล์ที่มีอยู่</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewFile({ type: 'Student Card', url: existingFiles.studentCard! })}
                              className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                              title="ดูตัวอย่าง"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingFile('studentCard')}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              title="ลบไฟล์"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${formData.studentCard
                        ? 'border-primary-500 bg-primary-50/30'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setFormData(prev => ({ ...prev, studentCard: e.target.files?.[0] || null }))}
                          className="hidden"
                          id="studentCard-upload"
                        />
                        <label htmlFor="studentCard-upload" className="cursor-pointer w-full h-full block">
                          {formData.studentCard ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="p-2 bg-white rounded-full shadow-sm">
                                <FileText className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{formData.studentCard.name}</p>
                                <p className="text-xs text-gray-500 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="p-2 bg-gray-100 rounded-full">
                                <Upload className="w-6 h-6 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 text-sm">คลิกเพื่ออัปโหลด</p>
                                <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ PDF เท่านั้น</p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  ถัดไป
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <h3 className="text-gray-900 mb-4">ยืนยันการสมัคร</h3>
                <p className="text-gray-600 mb-4">
                  กรุณาตรวจสอบข้อมูลก่อนส่งใบสมัคร
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">เกรดเฉลี่ยสะสม</p>
                    <p className="text-gray-900">{formData.gpa}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">ชื่อ-นามสกุล (ภาษาไทย)</p>
                    <p className="text-gray-900">{formData.firstname_thai} {formData.lastname_thai}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">เบอร์โทรศัพท์</p>
                    <p className="text-gray-900">{formData.phoneNumber}</p>
                  </div>

                  {formData.experience && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-1">ประสบการณ์</p>
                      <p className="text-gray-900">{formData.experience}</p>
                    </div>
                  )}

                  {/* Removed Availability */}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">เอกสารแนบ</p>
                    <div className="space-y-1">
                      {formData.transcript && (
                        <div className="flex items-center gap-2 text-gray-900">
                          <FileText className="w-4 h-4" />
                          <span>Transcript: {formData.transcript.name}</span>
                        </div>
                      )}
                      {formData.bankAccount && (
                        <div className="flex items-center gap-2 text-gray-900">
                          <FileText className="w-4 h-4" />
                          <span>Bank Account: {formData.bankAccount.name}</span>
                        </div>
                      )}
                      {formData.studentCard && (
                        <div className="flex items-center gap-2 text-gray-900">
                          <FileText className="w-4 h-4" />
                          <span>Student Card: {formData.studentCard.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  กลับไปแก้ไข
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'กำลังส่ง...' : 'ยืนยันการสมัคร'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">ส่งใบสมัครสำเร็จ!</h3>
              <p className="text-gray-600 mb-2">
                ใบสมัครของคุณได้ถูกส่งไปยังอาจารย์ผู้สอนแล้ว
              </p>
              <p className="text-gray-600">
                คุณจะได้รับอีเมลแจ้งผลการพิจารณาภายใน 7-14 วัน
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep('form')}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  กลับไปแก้ไข
                </button>
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl max-w-4xl w-full h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{previewFile.type}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={previewFile.url}
                className="w-full h-full border-0 rounded-lg"
                title={`Preview ${previewFile.type}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}