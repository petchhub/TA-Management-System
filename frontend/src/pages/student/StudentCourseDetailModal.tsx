import { useState, useEffect } from 'react';
import { X, MapPin, FileText, User, Calendar, Clock, BookOpen, MessageSquare } from 'lucide-react';
import { Course, getApplicationsForCourse } from '../../services/courseService';
import { formatTime } from '../../utils/formatUtils';

interface StudentCourseDetailModalProps {
    course: Course;
    onClose: () => void;
}

export function StudentCourseDetailModal({ course, onClose }: StudentCourseDetailModalProps) {
    const [actualTaCount, setActualTaCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchTaCount = async () => {
            try {
                const apps = await getApplicationsForCourse(course.courseID);
                const count = apps.filter(a => a.statusID === 5 || a.statusID === 6).length;
                setActualTaCount(count);
            } catch (error) {
                console.error("Failed to fetch TA count", error);
            }
        };
        fetchTaCount();
    }, [course.courseID]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                Section {course.section || "1"}
                            </span>
                            <span className="text-gray-500 text-sm">{course.semester}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {course.courseCode} {course.courseName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Key Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <User className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-0.5">อาจารย์ผู้สอน</p>
                                    <p className="font-semibold text-gray-900">{course.professorName || "ไม่ระบุ"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-0.5">หลักสูตร</p>
                                    <p className="font-semibold text-gray-900">{course.courseProgram}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Location */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            วันและเวล เรียน
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">วันเรียน</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{course.classday}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">เวลา</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                        {formatTime(course.classStart)} - {formatTime(course.classEnd)}
                                    </span>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-500 mb-1">สถานที่</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{course.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job/Task Details */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            รายละเอียดงาน / หน้าที่รับผิดชอบ (เบื้องต้น)
                        </h3>
                        {course.task ? (
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {course.task}
                            </p>
                        ) : (
                            <p className="text-gray-800">สนับสนุนการเรียนการสอน และปฏิบัติงานอื่นๆ ตามที่อาจารย์ผู้สอนมอบหมาย</p>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ชั่วโมงงานต่อสัปดาห์</p>
                                <p className="font-medium text-gray-900">{course.workHour} ชั่วโมง</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">จำนวน TA (ปัจจุบัน)</p>
                                <p className="font-medium text-gray-900">
                                    {actualTaCount !== null ? actualTaCount : '-'} คน
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Communication Channel Mockup */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#5865F2]" />
                                ช่องทางสื่อสาร (Discord)
                            </h3>
                            <button
                                onClick={() => window.open('https://discord.gg/mock-invite-link', '_blank')}
                                className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors text-sm font-medium"
                            >
                                <MessageSquare size={16} />
                                เข้าร่วมกลุ่ม
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            เข้าร่วมกลุ่ม Discord เพื่อรับข่าวสารและส่งงานกับอาจารย์ผู้สอน
                        </p>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
