import { useState, useEffect } from 'react';
import { StudentSidebar } from './StudentSidebar';
import Dashboard from './Dashboard';
import ManagedCourses from './ManagedCourses';
import Courses from './Courses';
import Profile from './Profile';

type Page = 'dashboard' | 'managed-courses' | 'courses' | 'profile';

interface StudentLayoutProps {
    initialPage?: Page;
}

export function StudentLayout({ initialPage = 'dashboard' }: StudentLayoutProps) {
    const [currentPage, setCurrentPage] = useState<Page>(initialPage);

    useEffect(() => {
        setCurrentPage(initialPage);
    }, [initialPage]);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'managed-courses':
                return <ManagedCourses />;
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
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default StudentLayout;
