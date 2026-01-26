import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    BookOpen,
    Plus,
    Loader2,
    Pencil,
    Trash2,
    ArrowUpDown
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { getAllCoursesForFinance, createCourseAnnouncement, updateCourse, deleteCourse, Course } from '../../services/courseService';
import { getProfessors, getCourseProgram, getClassDays, getSemesters, LookupItem, getSemestersDropdown } from '../../services/lookupService';
import { formatTime } from '../../utils/formatUtils';

export function CourseManagement() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNoSemesterWarning, setShowNoSemesterWarning] = useState(false);
    const [sortOption, setSortOption] = useState("newest");
    const [curriculumFilter, setCurriculumFilter] = useState("all");

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
        programTypeId: "", // Store ID instead of value
        workingDay: "",
        classDayId: "",
        startTime: "09:00",
        endTime: "12:00",
        semesterId: "",
    });

    const [popupState, setPopupState] = useState<{
        isOpen: boolean;
        status: 'success' | 'error';
        message: string;
    }>({ isOpen: false, status: 'success', message: '' });

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
                getSemestersDropdown()
            ]);
            console.log(coursesData);
            setCourses(coursesData);
            setProfessors(profs);
            setPrograms(progs);
            setClassDays(days);
            setSemesters(sems);

            // Set default values from fetched data
            if (progs.length > 0 && !formData.programTypeId) {
                setFormData(prev => ({ ...prev, programTypeId: progs[0].id.toString() }));
            }
            if (days.length > 0 && !formData.workingDay) {
                setFormData(prev => ({
                    ...prev,
                    workingDay: days[0].value,
                    classDayId: days[0].id.toString()
                }));
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                // Update existing course
                await updateCourse(editingCourse.courseID, {
                    courseCode: formData.courseCode,
                    courseName: formData.courseName,
                    section: formData.section,
                    term: semesters.find(s => s.id.toString() === formData.semesterId)?.value || "",
                    programTypeId: parseInt(formData.programTypeId),
                    workingDay: formData.workingDay,
                    classDayId: parseInt(formData.classDayId),
                    classTime: {
                        startTime: formData.startTime,
                        endTime: formData.endTime
                    },
                    professorID: parseInt(formData.professorID),
                    semesterId: parseInt(formData.semesterId),
                });
                setPopupState({
                    isOpen: true,
                    status: 'success',
                    message: "แก้ไขรายวิชาสำเร็จ"
                });
            } else {
                // Create new course
                await createCourseAnnouncement({
                    courseCode: formData.courseCode,
                    courseName: formData.courseName,
                    section: formData.section,
                    term: semesters.find(s => s.id.toString() === formData.semesterId)?.value || "",
                    programTypeId: parseInt(formData.programTypeId),
                    workingDay: formData.workingDay,
                    classDayId: parseInt(formData.classDayId),
                    classTime: {
                        startTime: formData.startTime,
                        endTime: formData.endTime
                    },
                    professorID: parseInt(formData.professorID),
                    semesterId: parseInt(formData.semesterId),
                });
                setPopupState({
                    isOpen: true,
                    status: 'success',
                    message: "เพิ่มรายวิชาสำเร็จ"
                });
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            fetchInitialData(); // Refresh list
        } catch (error) {
            console.error("Error creating course:", error);
            setPopupState({
                isOpen: true,
                status: 'error',
                message: "เกิดข้อผิดพลาดในการเพิ่มรายวิชา"
            });
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        // Pre-fill form with course data
        const professor = professors.find(p => p.value === course.professorName);
        const program = programs.find(p => p.value === course.courseProgram);
        const semester = semesters.find(s => s.value === course.semester);
        const classDay = classDays.find(d => d.value === course.classday);

        setFormData({
            courseCode: course.courseCode,
            courseName: course.courseName,
            section: course.section || "",
            professorID: professor?.id.toString() || "",
            programTypeId: program?.id.toString() || "",
            workingDay: classDay?.value || "",
            classDayId: classDay?.id.toString() || "",
            // Extract HH:MM from ISO string 2024-01-01T09:00:00Z
            startTime: course.classStart.split('T')[1] ? course.classStart.split('T')[1].substring(0, 5) : course.classStart.substring(0, 5),
            endTime: course.classEnd.split('T')[1] ? course.classEnd.split('T')[1].substring(0, 5) : course.classEnd.substring(0, 5),
            semesterId: semester?.id.toString() || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (course: Course) => {
        setDeleteConfirmCourse(course);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmCourse) return;

        try {
            await deleteCourse(deleteConfirmCourse.courseID);
            setDeleteConfirmCourse(null);
            fetchInitialData(); // Refresh list
            setPopupState({
                isOpen: true,
                status: 'success',
                message: "ลบรายวิชาสำเร็จ"
            });
        } catch (error) {
            console.error("Error deleting course:", error);
            setPopupState({
                isOpen: true,
                status: 'error',
                message: "เกิดข้อผิดพลาดในการลบรายวิชา"
            });
        }
    };

    const handleAddCourse = () => {
        if (semesters.length === 0) {
            setShowNoSemesterWarning(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const filteredCourses = courses.filter(course => {
        // Search Filter
        const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

        // Curriculum Filter
        let matchesCurriculum = true;
        if (curriculumFilter !== "all") {
            const programStr = (course.courseProgram || "").toLowerCase();
            if (curriculumFilter === "General")
                matchesCurriculum = programStr.includes("general") || programStr.includes("ปกติ") || programStr.includes("ทั่วไป");
            else if (curriculumFilter === "Continuing")
                matchesCurriculum = programStr.includes("continuing") || programStr.includes("continuous") || programStr.includes("ต่อเนื่อง");
            else if (curriculumFilter === "International")
                matchesCurriculum = programStr.includes("international") || programStr.includes("นานาชาติ");
            else
                matchesCurriculum = course.courseProgram === curriculumFilter;
        }

        return matchesSearch && matchesCurriculum;
    }).sort((a, b) => {
        if (sortOption === "newest") {
            return b.courseID - a.courseID;
        } else if (sortOption === "oldest") {
            return a.courseID - b.courseID;
        } else if (sortOption === "code_asc") {
            return a.courseCode.localeCompare(b.courseCode);
        } else if (sortOption === "code_desc") {
            return b.courseCode.localeCompare(a.courseCode);
        } else if (sortOption === "name_asc") {
            return a.courseName.localeCompare(b.courseName);
        }
        return 0;
    });

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
                    onClick={handleAddCourse}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 hover:text-white"
                >
                    <Plus size={20} />
                    เพิ่มรายวิชา
                </button>
            </div>

            {/* Unified Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

                    {/* Search - Takes available space */}
                    <div className="w-full lg:flex-1 relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Filter & Sort Container */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

                        {/* Filter Segmented Control */}
                        <div className="bg-gray-100 p-1 rounded-lg flex overflow-x-auto no-scrollbar w-full sm:w-auto">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'General', label: 'ปกติ' },
                                { id: 'Continuing', label: 'ต่อเนื่อง' },
                                { id: 'International', label: 'นานาชาติ' }
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setCurriculumFilter(filter.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-none ${curriculumFilter === filter.id
                                        ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative min-w-[180px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                                <ArrowUpDown size={16} />
                            </div>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white appearance-none cursor-pointer text-sm font-medium text-gray-700 hover:border-orange-300 transition-colors"
                            >
                                <option value="newest">ใหม่สุด - เก่าสุด</option>
                                <option value="oldest">เก่าสุด - ใหม่สุด</option>
                                <option value="code_asc">รหัสวิชา (น้อย-มาก)</option>
                                <option value="code_desc">รหัสวิชา (มาก-น้อย)</option>
                                <option value="name_asc">ชื่อวิชา (A-Z)</option>
                                <option value="name_desc">ชื่อวิชา (Z-A)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCourses.map((course) => {
                        const programStr = (course.courseProgram || "").toLowerCase();
                        const isGeneral = programStr.includes("general") || programStr.includes("ปกติ") || programStr.includes("ทั่วไป");
                        const isContinuing = programStr.includes("continuing") || programStr.includes("continuous") || programStr.includes("ต่อเนื่อง");


                        return (
                            <div key={course.courseID} className="bg-white rounded-lg shadow p-6 border-l-4 border-l-transparent hover:border-l-orange-500 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-bold text-xl text-orange-600">{course.courseCode}</span>
                                            <span className="text-gray-400 text-xl hidden sm:inline">|</span>
                                            <span className="text-gray-900 font-semibold text-xl mr-2">{course.courseName}</span>

                                            <span
                                                className={`text-sm px-2 py-0.5 rounded font-medium ${isGeneral
                                                    ? "bg-blue-50 text-blue-700"
                                                    : isContinuing
                                                        ? "bg-purple-50 text-purple-700"
                                                        : "bg-green-50 text-green-700"
                                                    }`}
                                            >
                                                {isGeneral
                                                    ? "หลักสูตรปกติ"
                                                    : isContinuing
                                                        ? "หลักสูตรต่อเนื่อง"
                                                        : "หลักสูตรนานาชาติ"}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>กลุ่มเรียน: {course.section || "N/A"}</p>
                                            <p>อาจารย์ผู้สอน: {course.professorName}</p>
                                            <p>วันเรียน: {course.classday} | เวลา: {formatTime(course.classStart)} - {formatTime(course.classEnd)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-1">{course.semester}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                            <h3 className="text-xl font-bold">{editingCourse ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่'}</h3>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มเรียน (Section)</label>
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
                                        value={formData.programTypeId}
                                        onChange={e => setFormData({ ...formData, programTypeId: e.target.value })}
                                    >
                                        {programs.map(p => <option key={p.id} value={p.id}>{p.value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเรียน</label>
                                    <select
                                        required
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.classDayId}
                                        onChange={e => {
                                            const selectedDay = classDays.find(d => d.id.toString() === e.target.value);
                                            setFormData({
                                                ...formData,
                                                classDayId: e.target.value,
                                                workingDay: selectedDay?.value || ""
                                            });
                                        }}
                                    >
                                        {classDays.map(d => <option key={d.id} value={d.id}>{d.value}</option>)}
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
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingCourse(null);
                                    }}
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

            <AlertDialog open={popupState.isOpen} onOpenChange={(open) => setPopupState(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {popupState.status === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {popupState.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setPopupState(prev => ({ ...prev, isOpen: false }))}>
                            ตกลง
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmCourse !== null} onOpenChange={(open) => !open && setDeleteConfirmCourse(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบรายวิชา</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ที่จะลบรายวิชา "{deleteConfirmCourse?.courseName}" ({deleteConfirmCourse?.courseCode})?
                            การดำเนินการนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmCourse(null)}>
                            ยกเลิก
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            ลบรายวิชา
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* No Semester Warning Dialog */}
            <AlertDialog open={showNoSemesterWarning} onOpenChange={setShowNoSemesterWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ไม่พบภาคการศึกษา</AlertDialogTitle>
                        <AlertDialogDescription>
                            กรุณาสร้างภาคการศึกษาก่อนทำการเพิ่มรายวิชา
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowNoSemesterWarning(false)}>
                            ยกเลิก
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowNoSemesterWarning(false);
                                navigate('/finance/semester');
                            }}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            ไปที่จัดการภาคการศึกษา
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
