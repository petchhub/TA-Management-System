import { useState } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { applyToPosition } from '../../services/positionService';
import { useAuth } from '../../context/AuthContext';

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

export default function ApplicationModal({ isOpen, courseId, course, onClose }: ApplicationModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success' | 'error'>('form');
  const [formData, setFormData] = useState({
    motivation: '',
    experience: '',
    availability: '',
    gpa: '',
    transcript: null as File | null,
    resume: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!courseId || !formData.transcript || !user?.id) {
      setErrorMessage('ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง');
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
        motivation: formData.motivation,
        experience: formData.experience,
        availability: formData.availability,
        gpa: formData.gpa,
        transcript: formData.transcript,
        resume: formData.resume || undefined,
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
      motivation: '',
      experience: '',
      availability: '',
      gpa: '',
      transcript: null,
      resume: null
    });
    onClose();
  };

  const handleFileChange = (field: 'transcript' | 'resume', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">สมัครตำแหน่ง TA</h2>
            <p className="text-gray-600">{course.code} - {course.name}</p>
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
              <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg p-4 mb-6">
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
              <div className="space-y-4 mb-6">
                {/* GPA */}
                <div>
                  <label htmlFor="gpa" className="block text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
                    placeholder="0.00 - 4.00"
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label htmlFor="motivation" className="block text-gray-700 mb-2">
                    เหตุผลที่สมัคร <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent resize-none"
                    placeholder="เล่าถึงเหตุผลที่คุณสนใจตำแหน่งนี้..."
                  />
                </div>

                {/* Experience */}
                <div>
                  <label htmlFor="experience" className="block text-gray-700 mb-2">
                    ประสบการณ์ที่เกี่ยวข้อง
                  </label>
                  <textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent resize-none"
                    placeholder="ประสบการณ์การสอน, โปรเจคที่เกี่ยวข้อง..."
                  />
                </div>

                {/* Availability */}
                <div>
                  <label htmlFor="availability" className="block text-gray-700 mb-2">
                    ช่วงเวลาที่สามารถปฏิบัติงานได้ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent resize-none"
                    placeholder="เช่น จันทร์-ศุกร์ 13:00-17:00"
                  />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transcript */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Transcript (PDF) <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[var(--color-primary-400)] transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('transcript', e.target.files?.[0] || null)}
                        required
                        className="hidden"
                        id="transcript-upload"
                      />
                      <label htmlFor="transcript-upload" className="cursor-pointer">
                        {formData.transcript ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <FileText className="w-5 h-5" />
                            <span className="text-gray-900 truncate">{formData.transcript.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">อัปโหลด Transcript</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Resume */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Resume/CV (PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[var(--color-primary-400)] transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('resume', e.target.files?.[0] || null)}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        {formData.resume ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <FileText className="w-5 h-5" />
                            <span className="text-gray-900 truncate">{formData.resume.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">อัปโหลด Resume</p>
                          </div>
                        )}
                      </label>
                    </div>
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
                  className="flex-1 py-3 px-4 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-black rounded-lg transition-colors"
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
                    <p className="text-gray-600 mb-1">เหตุผลที่สมัคร</p>
                    <p className="text-gray-900">{formData.motivation}</p>
                  </div>

                  {formData.experience && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-1">ประสบการณ์</p>
                      <p className="text-gray-900">{formData.experience}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">ช่วงเวลาที่สามารถปฏิบัติงาน</p>
                    <p className="text-gray-900">{formData.availability}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">เอกสารแนบ</p>
                    <div className="space-y-1">
                      {formData.transcript && (
                        <div className="flex items-center gap-2 text-gray-900">
                          <FileText className="w-4 h-4" />
                          <span>Transcript: {formData.transcript.name}</span>
                        </div>
                      )}
                      {formData.resume && (
                        <div className="flex items-center gap-2 text-gray-900">
                          <FileText className="w-4 h-4" />
                          <span>Resume: {formData.resume.name}</span>
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
                  className="flex-1 py-3 px-4 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}