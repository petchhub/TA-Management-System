import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { TARecruitment } from './TARecruitment';
import { TAWorkHours } from './TAWorkHours';
import { CourseManagement } from './CourseManagement';

type Page = 'dashboard' | 'recruitment' | 'work-hours' | 'courses';

interface ProfessorLayoutProps {
    initialPage?: Page;
}

export function ProfessorLayout({ initialPage = 'dashboard' }: ProfessorLayoutProps) {
    const [currentPage, setCurrentPage] = useState<Page>(initialPage);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard onNavigate={setCurrentPage} />;
            case 'recruitment':
                return <TARecruitment />;
            case 'work-hours':
                return <TAWorkHours />;
            case 'courses':
                return <CourseManagement />;
            default:
                return <Dashboard onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}

export default ProfessorLayout;
