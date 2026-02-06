import { LayoutDashboard, Clock, BookOpen, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

type Page = 'dashboard' | 'managed-courses' | 'courses' | 'profile';

interface PublicSidebarProps {
    currentPage?: Page;
}

export function PublicSidebar({ currentPage = 'courses' }: PublicSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40
                w-64 bg-white border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                lg:w-64
            `}>
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <h1 className="text-orange-600 font-bold text-lg md:text-xl">TA Management</h1>
                    <p className="text-gray-600 text-xs md:text-sm mt-1">สำหรับผู้ใช้ทั่วไป</p>
                </div>

                <nav className="flex-1 p-3 md:p-4 overflow-y-auto">
                    <ul className="space-y-1 md:space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePage === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleNavigation(item)}
                                        className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base ${isActive
                                            ? 'text-orange-600 bg-orange-50'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={20} className="flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-3 md:p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            navigate('/login');
                            setIsMobileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm md:text-base"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span>เข้าสู่ระบบ</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
