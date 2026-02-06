import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getSemesters, Semester } from '../../services/lookupService';
import { FinanceSidebar } from './FinanceSidebar';
import { Dashboard } from './Dashboard';
import { CourseManagement } from './CourseManagement';
import { CourseExport } from './CourseExport';
import { HolidayCalendar } from './HolidayCalendar';
import { EmailAnnouncement } from './EmailAnnouncement';
import { SemesterManagement } from './SemesterManagement';

type Page = 'dashboard' | 'semester' | 'work-hours' | 'export' | 'holidays' | 'announcement';

interface FinanceLayoutProps {
    initialPage?: Page;
}

export function FinanceLayout({ initialPage = 'dashboard' }: FinanceLayoutProps) {
    const [currentPage, setCurrentPage] = useState<Page>(initialPage);

    useEffect(() => {
        setCurrentPage(initialPage);
    }, [initialPage]);

    const [activeSemester, setActiveSemester] = useState<Semester | null>(null);

    const fetchSemesters = async () => {
        const data = await getSemesters();
        const active = data.find(s => s.isActive);
        setActiveSemester(active || null);
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    const refreshActiveSemester = () => {
        fetchSemesters();
    };

    const showExpiredWarning = activeSemester && new Date(activeSemester.endDate) < new Date();

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'semester':
                return <SemesterManagement onSemesterChange={refreshActiveSemester} />;
            case 'work-hours':
                return <CourseManagement />;
            case 'export':
                return <CourseExport />;
            case 'holidays':
                return <HolidayCalendar />;
            case 'announcement':
                return <EmailAnnouncement />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <FinanceSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {showExpiredWarning && (
                        <div className="mb-4 md:mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded-md shadow-sm flex items-start">
                            <AlertTriangle className="text-yellow-400 mr-2 md:mr-3 mt-0.5 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="text-base md:text-lg font-medium text-yellow-800">แจ้งเตือน: ภาคการศึกษาปัจจุบันสิ้นสุดลงแล้ว</h3>
                                <p className="mt-1 text-xs md:text-sm text-yellow-700">
                                    ภาคการศึกษาปัจจุบัน ({activeSemester?.term}/{activeSemester?.year}) ได้สิ้นสุดลงเมื่อวันที่ {formatDate(activeSemester?.endDate || '')} กรุณาเปลี่ยน"ตั้งเป็นปัจจุบัน"ให้กับภาคการศึกษาใหม่เพื่อความถูกต้องของการจัดการข้อมูล
                                </p>
                            </div>
                        </div>
                    )}
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default FinanceLayout;
