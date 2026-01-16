import { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
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

interface Semester {
    id: number;
    year: number;
    term: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export function SemesterManagement() {
    // Mock Data
    const [semesters, setSemesters] = useState<Semester[]>([
        { id: 1, year: 2567, term: 1, startDate: '2024-06-01', endDate: '2024-10-31', isActive: false },
        { id: 2, year: 2567, term: 2, startDate: '2024-11-01', endDate: '2025-03-31', isActive: true },
        { id: 3, year: 2568, term: 1, startDate: '2025-06-01', endDate: '2025-10-31', isActive: false },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear() + 543);
    const [newTerm, setNewTerm] = useState(1);
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    const handleAddSemester = () => {
        const newId = Math.max(...semesters.map(s => s.id), 0) + 1;
        setSemesters([
            ...semesters,
            {
                id: newId,
                year: newYear,
                term: newTerm,
                startDate: newStartDate,
                endDate: newEndDate,
                isActive: false
            }
        ]);
        setIsAddModalOpen(false);
        // Reset form
        setNewStartDate('');
        setNewEndDate('');
    };

    const handleDeleteClick = (id: number) => {
        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเทอมนี้?")) {
            setSemesters(semesters.filter(s => s.id !== id));
        }
    };

    const handleToggleActive = (id: number) => {
        setSemesters(semesters.map(s => ({
            ...s,
            isActive: s.id === id
        })));
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
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">สถานะ</th>
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
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(semester.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${semester.isActive
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {semester.isActive ? 'ปัจจุบัน' : 'ไม่ใช้งาน'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(semester.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    ไม่พบข้อมูลภาคการศึกษา
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Semester Modal */}
            <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>เพิ่มภาคการศึกษาใหม่</AlertDialogTitle>
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
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAddSemester}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            ยืนยัน
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default SemesterManagement;
