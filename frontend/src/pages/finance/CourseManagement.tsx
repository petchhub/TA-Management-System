import { useState, useEffect } from "react";
import {
    Search,
    BookOpen,
    Plus,
    Loader2
} from "lucide-react";
import { getAllCoursesForFinance, createCourseAnnouncement, Course } from '../../services/courseService';
import { getProfessors, getCourseProgram, getClassDays, getSemesters, LookupItem } from '../../services/lookupService';
import { formatTime } from '../../utils/formatUtils';

export function CourseManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Lookup Data
    const [professors, setProfessors] = useState<LookupItem[]>([]);
    const [programs, setPrograms] = useState<LookupItem[]>([]);
    const [classDays, setClassDays] = useState<LookupItem[]>([]);
    const [semesters, setSemesters] = useState<LookupItem[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        courseCode: "",
        courseName: "",
        section: "",
        professorID: "",
        programType: "regular", // Default, will map to lookup
        workingDay: "monday",
        startTime: "09:00",
        endTime: "12:00",
        semesterId: "",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [coursesData, profs, progs, days, sems] = await Promise.all([
                getAllCoursesForFinance(),
                getProfessors(),
                getCourseProgram(),
                getClassDays(),
                getSemesters()
            ]);
            console.log(coursesData); 7
            setCourses(coursesData);
            setProfessors(profs);
            setPrograms(progs);
            setClassDays(days);
            setSemesters(sems);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCourseAnnouncement({
                courseCode: formData.courseCode,
                courseName: formData.courseName,
                section: formData.section,
                term: semesters.find(s => s.id.toString() === formData.semesterId)?.value || "",
                programType: formData.programType === "International" ? "international" : "regular",
                workingDay: formData.workingDay, // Map from ID if needed, or select value directly
                classTime: {
                    startTime: formData.startTime,
                    endTime: formData.endTime
                },
                professorID: parseInt(formData.professorID),
                semesterId: parseInt(formData.semesterId),
                // Add other mappings as necessary for the backend payload
            });
            setIsModalOpen(false);
            fetchInitialData(); // Refresh list
            alert("เพิ่มรายวิชาสำเร็จ");
        } catch (error) {
            console.error("Error creating course:", error);
            alert("เกิดข้อผิดพลาดในการเพิ่มรายวิชา");
        }
    };

    const filteredCourses = courses.filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl mb-2">จัดการรายวิชา</h2>
                    <p className="text-gray-600">
                        เพิ่มและจัดการข้อมูลรายวิชาสำหรับเปิดรับสมัครผู้ช่วยสอน
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 hover:text-white"
                >
                    <Plus size={20} />
                    เพิ่มรายวิชา
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Courses List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCourses.map((course) => (
                        <div key={course.courseID} className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg">{course.courseID}</span>
                                        <span className="text-gray-500">|</span>
                                        <span className="text-gray-900 font-medium">{course.courseName}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>ตอนเรียน: {course.section || "N/A"}</p>
                                        <p>อาจารย์ผู้สอน: {course.professorName}</p>
                                        <p>วันเรียน: {course.classday} | เวลา: {formatTime(course.classStart)} - {formatTime(course.classEnd)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {course.courseProgram}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-2">{course.semester}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredCourses.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                            <BookOpen className="mx-auto mb-3 opacity-50" size={48} />
                            <p>ไม่พบรายวิชา</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Course Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold">เพิ่มรายวิชาใหม่</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.courseCode}
                                        onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวิชา</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.courseName}
                                        onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ตอนเรียน (Section)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.section}
                                        onChange={e => setFormData({ ...formData, section: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ภาคการศึกษา</label>
                                    <select
                                        required
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.semesterId}
                                        onChange={e => setFormData({ ...formData, semesterId: e.target.value })}
                                    >
                                        <option value="">เลือกภาคการศึกษา</option>
                                        {semesters.map(op => <option key={op.id} value={op.id}>{op.value}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ผู้สอน</label>
                                <select
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.professorID}
                                    onChange={e => setFormData({ ...formData, professorID: e.target.value })}
                                >
                                    <option value="">เลือกอาจารย์</option>
                                    {professors.map(p => <option key={p.id} value={p.id}>{p.value}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">หลักสูตร</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.programType}
                                        onChange={e => setFormData({ ...formData, programType: e.target.value })}
                                    >
                                        {programs.map(p => <option key={p.id} value={p.value}>{p.value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเรียน</label>
                                    <select
                                        required
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.workingDay}
                                        onChange={e => setFormData({ ...formData, workingDay: e.target.value })}
                                    >
                                        {classDays.map(d => <option key={d.id} value={d.value}>{d.value}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุด</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>




                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
