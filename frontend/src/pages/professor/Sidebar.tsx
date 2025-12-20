import { LayoutDashboard, Users, Clock, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Page = 'dashboard' | 'recruitment' | 'work-hours' | 'courses';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  const username = user?.name || 'Professor';
  const role = user?.role === 'PROFESSOR' ? 'อาจารย์' : user?.role || 'Professor';
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recruitment' as Page, label: 'การรับสมัคร TA', icon: Users },
    { id: 'work-hours' as Page, label: 'ชั่วโมงการทำงาน', icon: Clock },
    { id: 'courses' as Page, label: 'จัดการรายวิชา', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-[var(--color-primary-600)]">TA Management</h1>
        <p className="text-gray-600 text-sm mt-1">Professor Dashboard</p>
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
                    ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-50)]'
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
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <Settings size={20} />
          <span>ตั้งค่า</span>
        </button>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[var(--color-primary-600)]">
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