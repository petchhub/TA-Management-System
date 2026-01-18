import { useState, useEffect } from 'react';
import { X, TrendingUp, MapPin, Award, FileText, Users, Edit2, Save, XCircle, BookOpen } from 'lucide-react';
import { getGrades, LookupItem } from '../../services/lookupService';
import { updateJobPost } from '../../services/courseService';
import { formatTime as formatTimeFn } from '@/utils/formatUtils';
import { Toast, ToastType } from '../../components/Toast';

interface Course {
    id: string;
    code: string;
    name: string;
    semester: string;
    section: string;
    program: string;
    day: string;
    timeStart: string;
    timeEnd: string;
    requiredTAs: number;
    approvedTAs: number;
    pendingApplications: number;
    totalHours: number;
    recruitment: {
        announced: boolean;
        status?: string;
        totalSeats?: number;
        jobPostID?: number;
        location?: string;
        grade?: string;
        gradeID?: number;
        task?: string;
    };
    tas: {
        id: string;
        name: string;
        studentId: string;
        hoursWorked: number;
        hoursThisMonth: number;
        status: 'active' | 'inactive';
    }[];
}

interface CourseDetailModalProps {
    course: Course;
    onClose: () => void;
    onUpdate?: () => void;
}

export function CourseDetailModal({ course, onClose, onUpdate }: CourseDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [gradeOptions, setGradeOptions] = useState<LookupItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [editFormData, setEditFormData] = useState({
        taAllocation: course.recruitment.totalSeats || 0,
        location: course.recruitment.location || '',
        gradeID: course.recruitment.gradeID || 1,
        task: course.recruitment.task || '',
    });

    const statusTranslation: { [key: string]: string } = {
        'OPEN': 'เปิดรับสมัคร',
        'Closed': 'ปิดรับสมัคร',
        'Successful': 'ได้ TA ครบแล้ว',
        'SUCCESSFUL': 'ได้ TA ครบแล้ว',
        'Pending': 'รอพิจารณา'
    };

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const grades = await getGrades();
                setGradeOptions(grades);
            } catch (error) {
                console.error('Failed to fetch grades:', error);
            }
        };
        fetchGrades();
    }, []);

    const handleEdit = () => {
        setEditFormData({
            taAllocation: course.recruitment.totalSeats || 0,
            location: course.recruitment.location || '',
            gradeID: course.recruitment.gradeID || 1,
            task: course.recruitment.task || '',
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!course.recruitment.jobPostID) return;

        try {
            setIsSaving(true);
            await updateJobPost({
                id: course.recruitment.jobPostID,
                taAllocation: editFormData.taAllocation,
                location: editFormData.location,
                gradeID: editFormData.gradeID,
                task: editFormData.task,
            });
            setIsEditing(false);
            setToast({ message: 'บันทึกการเปลี่ยนแปลงสำเร็จ!', type: 'success' });

            // Delay the update callback to show the toast first
            setTimeout(() => {
                if (onUpdate) onUpdate();
            }, 1500);
        } catch (error) {
            console.error('Failed to update job post:', error);
            setToast({
                message: 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้ กรุณาลองใหม่อีกครั้ง',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof typeof editFormData, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {course.code} - {course.name}
                        </h2>
                        <p className="text-sm text-gray-600">รายละเอียดรายวิชาและประกาศรับ TA</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Course Information */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                        <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                            <BookOpen size={18} className="text-[#E35205]" />
                            ข้อมูลรายวิชา
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">รหัสวิชา</p>
                                <p className="font-medium text-gray-900">{course.code}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">ชื่อวิชา</p>
                                <p className="font-medium text-gray-900">{course.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Section</p>
                                <p className="font-medium text-gray-900">{course.section}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">หลักสูตร</p>
                                <p className="font-medium text-gray-900">{course.program}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">ภาคการศึกษา</p>
                                <p className="font-medium text-gray-900">{course.semester}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">วัน/เวลา</p>
                                <p className="font-medium text-gray-900">
                                    {course.day} {formatTimeFn(course.timeStart)} - {formatTimeFn(course.timeEnd)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recruitment Status */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                                <TrendingUp size={18} className="text-[#E35205]" />
                                สถานะการรับสมัคร TA
                            </h3>
                            {course.recruitment.announced && !isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                >
                                    <Edit2 size={16} />
                                    แก้ไข
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">สถานะประกาศ</p>
                                {course.recruitment.announced ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ประกาศรับแล้ว
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        ยังไม่ประกาศ
                                    </span>
                                )}
                            </div>
                            {course.recruitment.announced && (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">สถานะ</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.recruitment.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {statusTranslation[course.recruitment.status || ''] || course.recruitment.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">TA ที่อนุมัติ/ทั้งหมด</p>
                                        <p className="font-semibold text-gray-900">
                                            {course.approvedTAs}/{course.requiredTAs} คน
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Job Post Details */}
                    {course.recruitment.announced && (
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-[#E35205]" />
                                รายละเอียดประกาศรับสมัคร
                            </h3>

                            <div className="space-y-4">
                                {/* TA Allocation */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Users size={16} />
                                        จำนวน TA ที่ต้องการ
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            value={editFormData.taAllocation}
                                            onChange={(e) => handleInputChange('taAllocation', parseInt(e.target.value) || 1)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{course.recruitment.totalSeats} คน</p>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MapPin size={16} />
                                        สถานที่ปฏิบัติงาน
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editFormData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder="เช่น ห้อง 514, Online, Hybrid"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{course.recruitment.location || '-'}</p>
                                    )}
                                </div>

                                {/* Minimum Grade */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Award size={16} />
                                        เกรดขั้นต่ำที่ต้องการ
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={editFormData.gradeID}
                                            onChange={(e) => handleInputChange('gradeID', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            {gradeOptions.map((grade) => (
                                                <option key={grade.id} value={grade.id}>
                                                    {grade.value}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-gray-900">{course.recruitment.grade || '-'}</p>
                                    )}
                                </div>

                                {/* Task/Requirements */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FileText size={16} />
                                        ข้อมูลเพิ่มเติม / ความต้องการ
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editFormData.task}
                                            onChange={(e) => handleInputChange('task', e.target.value)}
                                            placeholder="เช่น ต้องมี GPA ไม่ต่ำกว่า 3.0, มีความรู้ในการเขียนโปรแกรม..."
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 whitespace-pre-wrap">{course.recruitment.task || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Edit Mode Actions */}
                            {isEditing && (
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <XCircle size={16} />
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* No Job Post Message */}
                    {!course.recruitment.announced && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <p className="text-yellow-800 text-sm">
                                ยังไม่มีการประกาศรับสมัคร TA สำหรับรายวิชานี้
                            </p>
                        </div>
                    )}
                </div>
            </div>

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
