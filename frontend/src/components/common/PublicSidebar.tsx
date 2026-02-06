import { LayoutDashboard, Clock, BookOpen, User, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

type Page = 'dashboard' | 'managed-courses' | 'courses' | 'profile';

interface PublicSidebarProps {
    currentPage?: Page;
}

export function PublicSidebar({ currentPage = 'courses' }: PublicSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current page based on path if not provided
    const getCurrentPage = (): Page => {
        if (currentPage) return currentPage;
        if (location.pathname === '/') return 'courses';
        return 'courses';
    };

    const activePage = getCurrentPage();

    const menuItems = [
        { id: 'dashboard', label: 'หน้าหลัก', icon: LayoutDashboard, path: '/login' },
        { id: 'managed-courses', label: 'ตารางปฎิบัติงาน', icon: Clock, path: '/login' },
        { id: 'courses', label: 'ค้นหาตำแหน่ง', icon: BookOpen, path: '/' },
        { id: 'profile', label: 'โปรไฟล์', icon: User, path: '/login' },
    ];

    const handleNavigation = (item: typeof menuItems[0]) => {
        navigate(item.path);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-orange-600 font-bold text-xl">TA Management</h1>
                <p className="text-gray-600 text-sm mt-1">สำหรับผู้ใช้ทั่วไป</p>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavigation(item)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                    <LogOut size={20} />
                    <span>เข้าสู่ระบบ</span>
                </button>
            </div>
        </aside>
    );
}
