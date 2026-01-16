import { useState, useEffect } from 'react';
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

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'semester':
                return <SemesterManagement />;
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
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default FinanceLayout;
