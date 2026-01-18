import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { TARecruitment } from './TARecruitment';
import { TAWorkHours } from './TAWorkHours';
import { CourseManagement } from './CourseManagement';
import { useAuth } from '../../context/AuthContext';
import { getProfessorApplications } from '../../services/courseService';

type Page = 'dashboard' | 'recruitment' | 'work-hours' | 'courses';

interface ProfessorLayoutProps {
    initialPage?: Page;
}

export function ProfessorLayout({ initialPage = 'dashboard' }: ProfessorLayoutProps) {
    const [currentPage, setCurrentPage] = useState<Page>(initialPage);
    const [pendingCount, setPendingCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPendingCount = async () => {
            if (!user?.id) return;
            try {
                const apps = await getProfessorApplications(parseInt(user.id));
                const pending = apps.filter(app => app.statusCode === 'PENDING').length;
                setPendingCount(pending);
            } catch (error) {
                console.error("Failed to fetch pending applications count", error);
            }
        };

        fetchPendingCount(); // Initial fetch

        // Poll every 5 seconds to keep updated without heavy load
        const intervalId = setInterval(fetchPendingCount, 9000);

        return () => clearInterval(intervalId);
    }, [user?.id]);

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
            <Sidebar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                pendingCount={pendingCount}
            />
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}

export default ProfessorLayout;
