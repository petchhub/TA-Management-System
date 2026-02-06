import { LayoutDashboard, LogOut, Download, Calendar, Mail, BookOpen, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type Page = 'dashboard' | 'semester' | 'work-hours' | 'export' | 'announcement' | 'holidays';

interface FinanceSidebarProps {
    currentPage: Page;
    onNavigate?: (page: Page) => void;
}

export function FinanceSidebar({ currentPage, onNavigate }: FinanceSidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isTabletOpen, setIsTabletOpen] = useState(false);

    const username = user?.name || 'Finance';
    const role = 'เจ้าหน้าที่การเงิน';

    const menuItems = [
        { id: 'dashboard' as Page, label: 'หน้าหลัก', icon: LayoutDashboard },
        { id: 'semester' as Page, label: 'จัดการเทอม', icon: GraduationCap },
        { id: 'work-hours' as Page, label: 'จัดการรายวิชา', icon: BookOpen },
        { id: 'export' as Page, label: 'Export ข้อมูล', icon: Download },
        { id: 'announcement' as Page, label: 'ส่งประกาศ', icon: Mail },
        { id: 'holidays' as Page, label: 'จัดการวันหยุด', icon: Calendar },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        setIsTabletOpen(false);
    };

    const handleNavigation = (itemId: Page) => {
        const routeMap: Record<Page, string> = {
            'dashboard': '/finance/dashboard',
            'semester': '/finance/semester',
            'work-hours': '/finance/courses',
            'export': '/finance/export',
            'announcement': '/finance/announcement',
            'holidays': '/finance/holidays',
        };
        navigate(routeMap[itemId]);
        setIsTabletOpen(false);
    };

    return (
        <>
            {/* Tablet Menu Button (hidden on desktop) */}
            <button
                onClick={() => setIsTabletOpen(!isTabletOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
            >
                {isTabletOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Tablet Overlay */}
            {isTabletOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsTabletOpen(false)}
                />
            )}

            {/* Sidebar - No mobile support, starts at tablet (md) */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-white border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isTabletOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <h1 className="text-orange-600 font-bold text-lg md:text-xl">TA Management</h1>
                    <p className="text-gray-600 text-xs md:text-sm mt-1">ระบบสำหรับเจ้าหน้าที่การเงิน</p>
                </div>

                <nav className="flex-1 p-3 md:p-4 overflow-y-auto">
                    <ul className="space-y-1 md:space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleNavigation(item.id)}
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

                <div className="p-3 md:p-4 border-t border-gray-200 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm md:text-base"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span>ออกจากระบบ</span>
                    </button>
                </div>

                <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white bg-orange-600 font-bold text-sm md:text-base flex-shrink-0">
                            {username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-900 truncate" title={username}>{username}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 truncate">{role}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default FinanceSidebar;
