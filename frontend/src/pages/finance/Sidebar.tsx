import {
  LayoutDashboard,
  Clock,
  FileSpreadsheet,
  Calendar,
  Mail
} from 'lucide-react';

type View = 'dashboard' | 'work-hours' | 'course-export' | 'holiday' | 'email';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'work-hours' as View, label: 'จัดการชั่วโมงงาน', icon: Clock },
    { id: 'course-export' as View, label: 'ส่งออกข้อมูลรายวิชา', icon: FileSpreadsheet },
    { id: 'holiday' as View, label: 'จัดการวันหยุด', icon: Calendar },
    { id: 'email' as View, label: 'ส่งอีเมลประกาศ', icon: Mail },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl">ระบบการเงิน TA</h1>
        <p className="text-sm text-slate-400 mt-1">Finance Department</p>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${currentView === item.id
                ? 'bg-[var(--color-primary-600)] text-white'
                : 'text-slate-300 hover:bg-slate-700'
                }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
