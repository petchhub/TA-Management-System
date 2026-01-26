import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, CheckCircle } from 'lucide-react';
import { addSemester, updateSemester, getSemesters, setSemesterActive, Semester } from '../../services/lookupService';
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

interface SemesterManagementProps {
    onSemesterChange?: () => void;
}

export function SemesterManagement({ onSemesterChange }: SemesterManagementProps) {
    const [semesters, setSemesters] = useState<Semester[]>([]);

    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        try {
            const data = await getSemesters();
            // Backend already filters >= CURRENT_DATE and sorts by StartDate ASC
            // Frontend might want to sort differently if needed, but keeping default for now
            // Or sort desc by year/term as per previous mock?
            // "Sort Newest First" logic exists in render
            setSemesters(data);
        } catch (error) {
            console.error("Failed to fetch semesters:", error);
        }
    };


    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear() + 543);
    const [newTerm, setNewTerm] = useState(1);
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    const [popupState, setPopupState] = useState<{
        isOpen: boolean;
        status: 'success' | 'error';
        message: string;
    }>({ isOpen: false, status: 'success', message: '' });
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const handleSaveSemester = async () => {
        try {
            if (editingId) {
                // Edit Mode
                await updateSemester({
                    id: editingId,
                    semester: `${newTerm}/${newYear}`,
                    startDate: new Date(newStartDate).toISOString(),
                    endDate: new Date(newEndDate).toISOString()
                });

                setPopupState({
                    isOpen: true,
                    status: 'success',
                    message: "แก้ไขภาคการศึกษาเรียบร้อยแล้ว"
                });
                await fetchSemesters();
                if (onSemesterChange) onSemesterChange();
            } else {
                // Add Mode
                await addSemester({
                    semester: newTerm.toString(),
                    year: newYear.toString(),
                    startDate: new Date(newStartDate).toISOString(),
                    endDate: new Date(newEndDate).toISOString()
                });

                setPopupState({
                    isOpen: true,
                    status: 'success',
                    message: "เพิ่มภาคการศึกษาเรียบร้อยแล้ว"
                });
                await fetchSemesters();
                console.log("Calling onSemesterChange"); // Debug log
                if (onSemesterChange) onSemesterChange();
            }

            closeModal();
        } catch (error) {
            setPopupState({
                isOpen: true,
                status: 'error',
                message: `เกิดข้อผิดพลาดในการ${editingId ? 'แก้ไข' : 'เพิ่ม'}ภาคการศึกษา`
            });
        }
    };

    const openEditModal = (semester: Semester) => {
        setEditingId(semester.id);
        setNewYear(semester.year);
        setNewTerm(semester.term);
        // Ensure date format is YYYY-MM-DD for input type="date"
        setNewStartDate(semester.startDate.split('T')[0]);
        setNewEndDate(semester.endDate.split('T')[0]);
        setIsAddModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditingId(null);
        setNewYear(new Date().getFullYear() + 543);
        setNewTerm(1);
        setNewStartDate('');
        setNewEndDate('');
    };

    const handleDeleteClick = (id: number) => {
        setDeleteConfirmId(id);
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmId) {
            setSemesters(semesters.filter(s => s.id !== deleteConfirmId));
            // Assuming there is a delete API call here, we would also call onSemesterChange()
            setDeleteConfirmId(null);
        }
    };

    const handleSetActive = async (id: number) => {
        try {
            await setSemesterActive(id);
            setPopupState({
                isOpen: true,
                status: 'success',
                message: "ตั้งค่าภาคการศึกษาปัจจุบันเรียบร้อยแล้ว"
            });
            await fetchSemesters();
            if (onSemesterChange) onSemesterChange();
        } catch (error) {
            setPopupState({
                isOpen: true,
                status: 'error',
                message: "เกิดข้อผิดพลาดในการตั้งค่าภาคการศึกษาปัจจุบัน: " + error
            });
        }
    };



    // Format date for display (DD/MM/YYYY)
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const [searchTerm, setSearchTerm] = useState("");

    const activeSemester = semesters.find(s => s.isActive);

    const filteredSemesters = semesters.filter(s =>
        !s.isActive && (
            s.year.toString().includes(searchTerm) ||
            s.term.toString().includes(searchTerm)
        )
    ).sort((a, b) => (b.year * 10 + b.term) - (a.year * 10 + a.term)); // Sort Newest First

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl mb-2">จัดการภาคการศึกษา</h2>
                    <p className="text-gray-600">
                        เพิ่มและจัดการข้อมูลภาคการศึกษาในระบบ
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 hover:text-white"
                >
                    <Plus size={20} />
                    เพิ่มภาคการศึกษา
                </button>
            </div>

            {/* Active Semester Section */}
            {activeSemester ? (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        ภาคการศึกษาปัจจุบัน
                    </h3>
                    <div className="bg-gradient-to-r from-orange-50 to-white rounded-lg shadow-md border-l-4 border-orange-500 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <CheckCircle size={100} className="text-orange-500" />
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="font-bold text-2xl text-orange-700">
                                        ภาคเรียนที่ {activeSemester.term}
                                    </span>
                                    <span className="text-gray-300 text-2xl">/</span>
                                    <span className="font-bold text-2xl text-orange-700">
                                        {activeSemester.year}
                                    </span>
                                    <span className="ml-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm border border-green-200">
                                        <CheckCircle size={14} />
                                        กำลังใช้งาน
                                    </span>
                                </div>
                                <div className="text-gray-700 space-y-1 bg-white/50 inline-block p-3 rounded-lg backdrop-blur-sm border border-orange-100">
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium">วันเริ่มภาคเรียน:</span> {formatDate(activeSemester.startDate)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium">วันสิ้นสุดภาคเรียน:</span> {formatDate(activeSemester.endDate)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(activeSemester)}
                                    className="px-4 py-2 text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-all shadow-sm flex items-center gap-2"
                                >
                                    <Pencil size={18} />
                                    แก้ไข
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                semesters.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-red-100 rounded-full">
                            <CheckCircle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800">ยังไม่มีการกำหนดภาคการศึกษาปัจจุบัน</h3>
                            <p className="text-red-700 text-sm">ระบบต้องการภาคการศึกษาปัจจุบันเพื่อดำเนินการต่อ กรุณาเลือกภาคการศึกษาด้านล่างแล้วกด "ตั้งเป็นปัจจุบัน"</p>
                        </div>
                    </div>
                )
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">ภาคการศึกษาทั้งหมด</h3>
            </div>


            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {/* Re-using Search icon matching CourseManagement style if imported, otherwise using Lucide Search */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยปีการศึกษา หรือภาคเรียน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Semester List (Cards) */}
            <div className="grid grid-cols-1 gap-4">
                {filteredSemesters.map((semester) => (
                    <div
                        key={semester.id}
                        className={`bg-white rounded-lg shadow p-6 border-l-4 border-gray-200 hover:border-gray-300 transition-all`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-xl text-gray-900">
                                        ภาคเรียนที่ {semester.term}
                                    </span>
                                    <span className="text-gray-400 text-xl">/</span>
                                    <span className="font-semibold text-xl text-gray-900">
                                        {semester.year}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>วันเริ่มภาคเรียน: {formatDate(semester.startDate)}</p>
                                    <p>วันสิ้นสุดภาคเรียน: {formatDate(semester.endDate)}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(semester)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="แก้ไข"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleSetActive(semester.id)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium text-gray-500 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                                >
                                    ตั้งเป็นปัจจุบัน
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredSemesters.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                        {/* BookOpen icon reused or imported */}
                        <div className="mx-auto mb-3 opacity-50 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        </div>
                        <p>ไม่พบข้อมูลภาคการศึกษา</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Semester Modal using AlertDialog */}
            <AlertDialog open={isAddModalOpen} onOpenChange={(open) => !open && closeModal()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{editingId ? 'แก้ไขภาคการศึกษา' : 'เพิ่มภาคการศึกษาใหม่'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            กรุณาระบุปีการศึกษา ภาคเรียน และช่วงเวลา
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">ภาคเรียน</label>
                                <select
                                    value={newTerm}
                                    onChange={(e) => setNewTerm(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3 (ภาคฤดูร้อน)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">ปีการศึกษา (พ.ศ.)</label>
                                <input
                                    type="number"
                                    value={newYear}
                                    onChange={(e) => setNewYear(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">วันเริ่มภาคเรียน</label>
                                <input
                                    type="date"
                                    value={newStartDate}
                                    onChange={(e) => setNewStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">วันสิ้นสุดภาคเรียน</label>
                                <input
                                    type="date"
                                    value={newEndDate}
                                    onChange={(e) => setNewEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeModal}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSaveSemester}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {editingId ? 'บันทึกการแก้ไข' : 'ยืนยัน'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Popup Dialog for Success/Error */}
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

            {/* Delete Confirmation Dialog
            <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบภาคการศึกษา</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ที่จะลบภาคการศึกษานี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmId(null)}>
                            ยกเลิก
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            ลบภาคการศึกษา
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog> */}
        </div>
    );
}

export default SemesterManagement;
