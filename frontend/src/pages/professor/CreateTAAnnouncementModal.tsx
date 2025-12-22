import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getClassDays, getCourseProgram, getGrades, getSemesters, LookupItem } from '../../services/lookupService';

interface CreateTAAnnouncementModalProps {
    onClose: () => void;
    onSubmit: (data: TAAnnouncementData) => void;
}

export interface TAAnnouncementData {
    courseCode: string;
    courseName: string;
    section: string;
    term: string;
    programType: 'regular' | 'international';
    workingDay: string; // Changed from workingDays array
    classTime: {
        startTime: string;
        endTime: string;
    };
    numberOfTAs: number;
    minGrade: string; // Added minimum grade
    gradeId?: number;
    requirements: string;
    semesterId?: number;
}

// Removed hardcoded DAYS_OF_WEEK and GRADE_OPTIONS

export function CreateTAAnnouncementModal({ onClose, onSubmit }: CreateTAAnnouncementModalProps) {
    const [formData, setFormData] = useState<TAAnnouncementData>({
        courseCode: '',
        courseName: '',
        section: '',
        term: '',
        programType: 'regular',
        workingDay: '',
        classTime: {
            startTime: '',
            endTime: '',
        },
        numberOfTAs: 1,
        minGrade: 'C',
        requirements: '',
    });

    const [daysOfWeek, setDaysOfWeek] = useState<LookupItem[]>([]);
    const [gradeOptions, setGradeOptions] = useState<LookupItem[]>([]);
    const [semesters, setSemesters] = useState<LookupItem[]>([]);
    const [coursePrograms, setCoursePrograms] = useState<LookupItem[]>([]);

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const days = await getClassDays();
                const grades = await getGrades();
                const semestersData = await getSemesters();
                const courseProgramsData = await getCourseProgram();
                setDaysOfWeek(days);
                setGradeOptions(grades);
                console.log(grades)
                setSemesters(semestersData);
                setCoursePrograms(courseProgramsData);
            } catch (error) {
                console.error("Failed to fetch lookup data", error);
            }
        };

        fetchLookupData();
    }, []);

    const [errors, setErrors] = useState<Partial<Record<keyof TAAnnouncementData, string>>>({});

    const handleInputChange = (field: keyof TAAnnouncementData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDaySelect = (day: string) => {
        setFormData(prev => ({
            ...prev,
            workingDay: day,
        }));
        if (errors.workingDay) {
            setErrors(prev => ({ ...prev, workingDay: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof TAAnnouncementData, string>> = {};

        if (!formData.courseCode.trim()) newErrors.courseCode = 'กรุณากรอกรหัสวิชา';
        if (!formData.courseName.trim()) newErrors.courseName = 'กรุณากรอกชื่อวิชา';
        if (!formData.section.trim()) newErrors.section = 'กรุณากรอก Section';
        if (!formData.term.trim()) newErrors.term = 'กรุณากรอกภาคการศึกษา';
        if (!formData.workingDay) newErrors.workingDay = 'กรุณาเลือกวันทำงาน';
        if (!formData.classTime.startTime) newErrors.classTime = 'กรุณากรอกเวลาเริ่มเรียน';
        if (!formData.classTime.endTime) newErrors.classTime = 'กรุณากรอกเวลาเลิกเรียน';
        if (formData.numberOfTAs < 1) newErrors.numberOfTAs = 'จำนวน TA ต้องมากกว่า 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Resolve IDs
            const selectedSemester = semesters.find(s => s.value === formData.term);
            const selectedGrade = gradeOptions.find(g => g.value === formData.minGrade);

            const submissionData = {
                ...formData,
                semesterId: selectedSemester?.id,
                gradeId: selectedGrade?.id
            };

            onSubmit(submissionData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">เปิดรับสมัคร TA</h2>
                        <p className="text-sm text-gray-600 mt-1">สร้างประกาศรับสมัครผู้ช่วยสอนใหม่</p>
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
                    {/* Course Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">ข้อมูลรายวิชา</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Course Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รหัสวิชา <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    onChange={(e) => handleInputChange('courseCode', e.target.value)}
                                    placeholder="เช่น 01076104"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.courseCode ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.courseCode && (
                                    <p className="text-red-500 text-xs mt-1">{errors.courseCode}</p>
                                )}
                            </div>

                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => handleInputChange('section', e.target.value)}
                                    placeholder="เช่น 01, 02"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.section ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.section && (
                                    <p className="text-red-500 text-xs mt-1">{errors.section}</p>
                                )}
                            </div>
                        </div>

                        {/* Course Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ชื่อวิชา <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.courseName}
                                onChange={(e) => handleInputChange('courseName', e.target.value)}
                                placeholder="เช่น Programming Fundamental"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.courseName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.courseName && (
                                <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Term */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ภาคการศึกษา <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.term}
                                    onChange={(e) => handleInputChange('term', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.term ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">เลือกภาคการศึกษา</option>
                                    {semesters.map((sem) => (
                                        <option key={sem.id} value={sem.value}>
                                            {sem.value}
                                        </option>
                                    ))}
                                </select>
                                {errors.term && (
                                    <p className="text-red-500 text-xs mt-1">{errors.term}</p>
                                )}
                            </div>

                            {/* Program Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ประเภทหลักสูตร <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.programType}
                                    onChange={(e) => handleInputChange('programType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                                >
                                    <option value="">เลือกประเภทหลักสูตร</option>
                                    {coursePrograms.map((sem) => (
                                        <option key={sem.id} value={sem.value}>
                                            {sem.value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">ตารางเรียน</h3>

                        {/* Working Day - Single Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                วันที่ต้องการ TA <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map((day) => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => handleDaySelect(day.value)}
                                        className={`px-4 py-2 rounded-lg border transition-colors ${formData.workingDay === day.value
                                            ? 'bg-orange-600 text-white border-orange-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {day.value}
                                    </button>
                                ))}
                            </div>
                            {errors.workingDay && (
                                <p className="text-red-500 text-xs mt-1">{errors.workingDay}</p>
                            )}
                        </div>

                        {/* Class Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    เวลาเริ่มเรียน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.classTime.startTime}
                                    onChange={(e) => handleInputChange('classTime', { ...formData.classTime, startTime: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.classTime ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    เวลาเลิกเรียน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.classTime.endTime}
                                    onChange={(e) => handleInputChange('classTime', { ...formData.classTime, endTime: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${errors.classTime ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.classTime && (
                                <p className="text-red-500 text-xs mt-1 col-span-2">{errors.classTime}</p>
                            )}
                        </div>
                    </div>



                    {/* TA Requirements */}
                    <div className="space-y-4">
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
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            สร้างประกาศ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
