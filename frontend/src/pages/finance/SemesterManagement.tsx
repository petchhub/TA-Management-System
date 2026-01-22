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

                alert("แก้ไขภาคการศึกษาเรียบร้อยแล้ว");
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

                alert("เพิ่มภาคการศึกษาเรียบร้อยแล้ว");
                await fetchSemesters();
                console.log("Calling onSemesterChange"); // Debug log
                if (onSemesterChange) onSemesterChange();
            }

            closeModal();
        } catch (error) {
            alert(`เกิดข้อผิดพลาดในการ${editingId ? 'แก้ไข' : 'เพิ่ม'}ภาคการศึกษา: ` + error);
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
        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเทอมนี้?")) {
            setSemesters(semesters.filter(s => s.id !== id));
            // Assuming there is a delete API call here, we would also call onSemesterChange()
        }
    };

    const handleSetActive = async (id: number) => {
        try {
            await setSemesterActive(id);
            alert("ตั้งค่าภาคการศึกษาปัจจุบันเรียบร้อยแล้ว");
            await fetchSemesters();
            if (onSemesterChange) onSemesterChange();
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการตั้งค่าภาคการศึกษาปัจจุบัน: " + error);
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

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการภาคการศึกษา</h1>
                    <p className="text-gray-500">เพิ่มและจัดการข้อมูลภาคการศึกษาในระบบ</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>เพิ่มภาคการศึกษา</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ปีการศึกษา</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ภาคเรียน</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">วันเริ่มภาคเรียน</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">วันสิ้นสุดภาคเรียน</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">สถานะ</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {semesters.length > 0 ? (
                            semesters
                                .sort((a, b) => (b.year * 10 + b.term) - (a.year * 10 + a.term)) // Sort Newest First
                                .map((semester) => (
                                    <tr key={semester.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900">{semester.year}</td>
                                        <td className="px-6 py-4 text-gray-900">{semester.term}</td>
                                        <td className="px-6 py-4 text-gray-900">{formatDate(semester.startDate)}</td>
                                        <td className="px-6 py-4 text-gray-900">{formatDate(semester.endDate)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {semester.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={14} />
                                                    ปัจจุบัน
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetActive(semester.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                                >
                                                    ตั้งเป็นปัจจุบัน
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(semester)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors mr-2"
                                                title="แก้ไข"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    ไม่พบข้อมูลภาคการศึกษา
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Semester Modal */}
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
        </div>
    );
}

export default SemesterManagement;
