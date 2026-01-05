import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getGrades, LookupItem } from '../../services/lookupService';
import { getProfessorCourses, getAllJobPosts, Course } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatUtils';

interface CreateTAAnnouncementModalProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export interface TAAnnouncementData {
    courseID: number;
    numberOfTAs: number;
    minGrade: string;
    gradeId?: number;
    requirements: string;
    location: string;
}

export function CreateTAAnnouncementModal({ onClose, onSubmit }: CreateTAAnnouncementModalProps) {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [gradeOptions, setGradeOptions] = useState<LookupItem[]>([]);

    // Form State
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [formData, setFormData] = useState<TAAnnouncementData>({
        courseID: 0,
        numberOfTAs: 1,
        minGrade: 'C',
        requirements: '',
        location: '',
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Partial<Record<keyof TAAnnouncementData | 'courseID', string>>>({});

    // Derived state for selected course display
    const selectedCourse = courses.find(c => c.courseID === parseInt(selectedCourseId));

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (!user?.id) return;

                setLoading(true);
                const [profCourses, grades, jobPosts] = await Promise.all([
                    getProfessorCourses(parseInt(user.id)),
                    getGrades(),
                    getAllJobPosts()
                ]);

                // Filter out courses that already have an OPEN announcement
                // We check if the courseID exists in jobPosts (now supported by backend)
                // Filter where status is OPEN (or just check existence if that's the rule, but usually openness matters)
                const openCourseIDs = new Set(
                    jobPosts
                        .filter((jp: any) => jp.status === 'OPEN')
                        .map((jp: any) => jp.courseID)
                );

                const availableCourses = profCourses.filter((c: Course) => !openCourseIDs.has(c.courseID));
                setCourses(availableCourses);
                setGradeOptions(grades);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [user?.id]);

    const handleInputChange = (field: keyof TAAnnouncementData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCourseSelect = (courseId: string) => {
        setSelectedCourseId(courseId);
        if (errors.courseID) {
            setErrors(prev => ({ ...prev, courseID: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof TAAnnouncementData | 'courseID', string>> = {};

        if (!selectedCourseId) newErrors.courseID = 'กรุณาและเลือกรายวิชา';
        if (formData.numberOfTAs < 1) newErrors.numberOfTAs = 'จำนวน TA ต้องมากกว่า 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {

            // Find grade ID
            const selectedGrade = gradeOptions.find(g => g.value === formData.minGrade);

            // Prepare submission
            // Note: In a real scenario, we might call createJobPost directly here or pass it up.
            // The Dashboard.tsx uses a wrapper that calls createCourseAnnouncement.
            // We should change Dashboard.tsx or handle logic here.
            // The plan says "Connect Professor UI to use createJobPost".
            // If we assume onSubmit is just a callback to refresh or notify, we can do the API call here.
            // However, Dashboard.tsx expects to call the API.
            // Let's pass the data up in a compatible format OR handle it here and modify Dashboard.tsx props.
            // For now, let's look at Dashboard.tsx... it calls createCourseAnnouncement.
            // That is wrong now. Dashboard needs to change foundamentally.
            // But to keep this file self-contained, I will enact the API call HERE if the prop allows, OR pass valid data up.
            // Given the refactor, let's try to do the API call here or pass enough info for Dashboard to separate logic.

            // Actually, the simplest way is to update Dashboard.tsx as well. 
            // I'll return the structured data needed for checking/creating job post.

            const submissionData = {
                courseCode: selectedCourse?.courseID || "",
                courseName: selectedCourse?.courseName || "",
                // We need to pass enough info for the Dashboard to know what to do, 
                // OR we just do the API call here?
                // The implementation plan says: "Submission: Call createJobPost directly..."
                // So I will update this component to handle the submission via direct service call?
                // No, the modal usually just returns data. 
                // Let's stick to the convention: pass data to parent.
                // Parent (Dashboard) will need to be updated to call createJobPost instead of createCourseAnnouncement.

                courseID: parseInt(selectedCourseId), // Actual ID for job post
                professorID: parseInt(user?.id || "0"),
                location: formData.location || "Building", // User input or fallback
                taAllocation: formData.numberOfTAs,
                gradeID: selectedGrade?.id || 1,
                task: formData.requirements,

                // Legacy fields to satisfy interface if needed, but we should change the interface in Dashboard
                minGrade: formData.minGrade,
                numberOfTAs: formData.numberOfTAs,
                requirements: formData.requirements
            };

            onSubmit(submissionData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">เปิดรับสมัคร TA</h2>
                        <p className="text-sm text-gray-600 mt-1">เลือกรายวิชาที่ต้องการเปิดรับสมัคร</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Course Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            เลือกรายวิชา <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.courseID ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">-- กรุณาเลือกรายวิชา --</option>
                            {courses.map((course) => (
                                <option key={course.courseID} value={course.courseID}>
                                    {course.courseCode} - {course.courseName}
                                </option>
                            ))}
                        </select>
                        {loading && <p className="text-xs text-gray-500 mt-1">กำลังโหลดรายวิชา...</p>}
                        {errors.courseID && (
                            <p className="text-red-500 text-xs mt-1">{errors.courseID}</p>
                        )}
                        {courses.length === 0 && !loading && (
                            <p className="text-sm text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
                                ไม่พบรายวิชาที่สอน กรุณาติดต่อฝ่ายการเงินเพื่อเพิ่มรายวิชา
                            </p>
                        )}
                    </div>

                    {/* Selected Course Details Preview */}
                    {selectedCourse && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200 text-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">ข้อมูลรายวิชา</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <p><span className="text-gray-500">รหัสวิชา:</span> {selectedCourse.courseCode}</p>
                                <p><span className="text-gray-500">ชื่อวิชา:</span> {selectedCourse.courseName}</p>
                                <p><span className="text-gray-500">Section:</span> {selectedCourse.section}</p>
                                <p><span className="text-gray-500">อาจารย์ผู้สอน:</span> {selectedCourse.professorName}</p>
                                <p><span className="text-gray-500">หลักสูตร:</span> {selectedCourse.courseProgram}</p>
                                <p><span className="text-gray-500">ภาคการศึกษา:</span> {selectedCourse.semester}</p>
                                <p><span className="text-gray-500">วัน/เวลา:</span> {selectedCourse.classday} {formatTime(selectedCourse.classStart)} - {formatTime(selectedCourse.classEnd)}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900">ความต้องการ TA</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Number of TAs */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    จำนวน TA ที่ต้องการ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.numberOfTAs}
                                    onChange={(e) => handleInputChange('numberOfTAs', parseInt(e.target.value) || 1)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.numberOfTAs ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.numberOfTAs && (
                                    <p className="text-red-500 text-xs mt-1">{errors.numberOfTAs}</p>
                                )}
                            </div>

                            {/* Minimum Grade */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    เกรดขั้นต่ำที่ต้องการ <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.minGrade}
                                    onChange={(e) => handleInputChange('minGrade', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                                >
                                    {gradeOptions.map((grade) => (
                                        <option key={grade.id} value={grade.value}>
                                            {grade.value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                สถานที่ปฏิบัติงาน (Location)
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="เช่น ห้อง 514, Online, Hybrid"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ข้อมูลเพิ่มเติม (Skill / Requirement)
                            </label>
                            <textarea
                                value={formData.requirements}
                                onChange={(e) => handleInputChange('requirements', e.target.value)}
                                placeholder="เช่น ต้องมี GPA ไม่ต่ำกว่า 3.0, มีความรู้ในการเขียนโปรแกรม..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedCourseId}
                            className={`px-6 py-2 rounded-lg text-white transition-colors ${!selectedCourseId
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700'
                                }`}
                        >
                            สร้างประกาศ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
