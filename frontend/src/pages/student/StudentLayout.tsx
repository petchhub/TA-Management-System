import { useState } from 'react';
import { StudentSidebar } from './StudentSidebar';
import Dashboard from './Dashboard';
import WorkHours from './WorkHours';
import Courses from './Courses';
import Profile from './Profile';

type Page = 'dashboard' | 'work-hours' | 'courses' | 'profile';

interface StudentLayoutProps {
    initialPage?: Page;
}

export function StudentLayout({ initialPage = 'dashboard' }: StudentLayoutProps) {
    const [currentPage, setCurrentPage] = useState<Page>(initialPage);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'work-hours':
                return <WorkHours />;
            case 'courses':
                return <Courses />;
            case 'profile':
                return <Profile />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <StudentSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default StudentLayout;
