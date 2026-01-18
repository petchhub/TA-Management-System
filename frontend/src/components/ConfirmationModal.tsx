import { CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    studentName?: string;
    studentID: number;
    date: string;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    studentID,
    date
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const formattedDate = new Date(date).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-in">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-[#E35205]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        ยืนยันการเช็คชื่อ
                    </h2>
                    <p className="text-gray-600">
                        คุณต้องการยืนยันการเช็คชื่อหรือไม่?
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                    {studentName && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">ชื่อ:</span>
                            <span className="font-medium text-gray-900">{studentName}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-600">รหัสนิสิต:</span>
                        <span className="font-medium text-gray-900">{studentID}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">วันที่:</span>
                        <span className="font-medium text-gray-900">{formattedDate}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 bg-[#E35205] text-white rounded-lg hover:bg-[#C54504] transition-colors font-medium"
                    >
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    );
}
