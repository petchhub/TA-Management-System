import { useState } from 'react';
import { X } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  workHourId: number | null;
  onClose: () => void;
}

export default function CorrectionModal({ isOpen, workHourId, onClose }: CorrectionModalProps) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the correction request to the backend
    console.log('Correction request submitted:', { workHourId, reason });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReason('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">ขอแก้ไขข้อมูล</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-900 mb-2">ส่งคำร้องสำเร็จ</p>
            <p className="text-gray-600">คำร้องของคุณได้ถูกส่งไปยังอาจารย์แล้ว</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                กรุณาระบุเหตุผลในการขอแก้ไขข้อมูลชั่วโมงการทำงาน
              </p>
              <label htmlFor="reason" className="block text-gray-700 mb-2">
                เหตุผล
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent resize-none"
                placeholder="ระบุเหตุผล..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={!reason.trim()}
                className="flex-1 py-2 px-4 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ส่งคำร้อง
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}