import { LayoutDashboard, Clock, BookOpen, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Page = 'dashboard' | 'managed-courses' | 'courses' | 'profile';

interface StudentSidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

export function StudentSidebar({ currentPage, onNavigate }: StudentSidebarProps) {
    const { user, logout } = useAuth();

    const username = user?.name || 'Student';
    const role = user?.role === 'STUDENT' ? 'นักศึกษา' : user?.role || 'Student';

    const menuItems = [
        { id: 'dashboard' as Page, label: 'หน้าหลัก', icon: LayoutDashboard },
        { id: 'managed-courses' as Page, label: 'รายวิชาที่ดูแลอยู่', icon: Clock },
        { id: 'courses' as Page, label: 'ค้นหาตำแหน่ง', icon: BookOpen },
        { id: 'profile' as Page, label: 'โปรไฟล์', icon: User },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-orange-600 font-bold text-xl">TA Management</h1>
                <p className="text-gray-600 text-sm mt-1">ระบบสำหรับนิสิต</p>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onNavigate(item.id)}
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
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
                    <LogOut size={20} />
                    <span>ออกจากระบบ</span>
                </button>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-orange-600">
                        {username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{username}</p>
                        <p className="text-xs text-gray-500">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
