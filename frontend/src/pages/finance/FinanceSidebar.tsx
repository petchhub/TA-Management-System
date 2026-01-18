import { LayoutDashboard, Settings, LogOut, Clock, Download, Calendar, Mail, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Page = 'dashboard' | 'semester' | 'work-hours' | 'export' | 'announcement' | 'holidays';

interface FinanceSidebarProps {
    currentPage: Page;
    onNavigate?: (page: Page) => void;
}

export function FinanceSidebar({ currentPage, onNavigate }: FinanceSidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-orange-600 font-bold text-xl">TA Management</h1>
                <p className="text-gray-600 text-sm mt-1">ระบบสำหรับเจ้าหน้าที่การเงิน</p>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        const routeMap: Record<Page, string> = {
                                            'dashboard': '/finance/dashboard',
                                            'semester': '/finance/semester',
                                            'work-hours': '/finance/courses',
                                            'export': '/finance/export',
                                            'announcement': '/finance/announcement',
                                            'holidays': '/finance/holidays',
                                        };
                                        navigate(routeMap[item.id]);
                                    }}
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

            <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span>ออกจากระบบ</span>
                </button>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-orange-600 font-bold">
                        {username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate" title={username}>{username}</p>
                        <p className="text-xs text-gray-500 truncate">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default FinanceSidebar;
