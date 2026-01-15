import { Users, CheckCircle, Clock, Plus, UserCheck, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateTAAnnouncementModal } from './CreateTAAnnouncementModal';
import { createJobPost, getProfessorApplications, Application } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';


interface DashboardProps {
  onNavigate?: (page: 'dashboard' | 'recruitment' | 'work-hours' | 'courses') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      try {
        const apps = await getProfessorApplications(parseInt(user.id));
        // Sort by ID descending as a proxy for recency, take top 3
        const sorted = apps.sort((a, b) => b.applicationId - a.applicationId).slice(0, 3);
        setRecentApplications(sorted);
      } catch (error) {
        console.error("Failed to load recent applications", error);
      }
    };
    fetchApplications();
  }, [user?.id]);

  const handleCreateAnnouncement = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Add professor ID from auth context if available
      const professorID = user?.id ? parseInt(user.id) : 1;

      // The modal now returns data structure ready for createJobPost
      // But let's ensure we use the explicit createJobPost service
      // We need to import it first

      const result = await createJobPost({
        courseID: data.courseID,
        professorID: professorID,
        location: data.location || "Building",
        taAllocation: data.taAllocation,
        gradeID: data.gradeID,
        task: data.task
      });

      console.log('Job post created:', result);
      alert(`ประกาศรับสมัคร TA สำเร็จ!`);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert(`เกิดข้อผิดพลาดในการสร้างประกาศ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const stats = [
    {
      title: 'จำนวนผู้สมัคร TA',
      value: '24',
      icon: Users,
      bgColor: '#FEF3EE',
      iconColor: '#E35205',
      change: '+3 ใหม่',
    },
    {
      title: 'ผู้ช่วยสอนที่อนุมัติแล้ว',
      value: '18',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: 'จาก 24 คน',
    },
    {
      title: 'ชั่วโมงงานที่เช็คแล้วรายเดือน',
      value: '342',
      icon: Clock,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: 'พฤศจิกายน 2025',
    },
  ];

  const quickActions = [
    {
      title: 'เปิดรับสมัคร TA',
      description: 'สร้างประกาศรับสมัครใหม่',
      icon: Plus,
      color: '#E35205',
      hoverColor: '#C54504',
      onClick: () => setShowCreateModal(true),
    },
    {
      title: 'อนุมัติ TA',
      description: 'ตรวจสอบและอนุมัติผู้สมัคร',
      icon: UserCheck,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => onNavigate?.('recruitment'),
    },
    {
      title: 'ดูชั่วโมงการทำงานของ TA',
      description: 'เช็คและตรวจสอบชั่วโมงกาารทำงาน',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => onNavigate?.('work-hours'),
    },
  ];

  // Removed mock recentApplications


  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">ภาพรวมการจัดการผู้ช่วยสอน</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isCustomColor = typeof stat.bgColor === 'string' && stat.bgColor.startsWith('#');
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={isCustomColor ? '' : `${stat.bgColor} ${stat.iconColor} p-3 rounded-lg`}
                  style={isCustomColor ? { backgroundColor: stat.bgColor, color: stat.iconColor, padding: '0.75rem', borderRadius: '0.5rem' } : {}}
                >
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isCustomColor = typeof action.color === 'string' && action.color.startsWith('#');
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                className={isCustomColor ? 'text-white rounded-lg p-6 text-left transition-colors' : `${action.color} text-white rounded-lg p-6 text-left transition-colors`}
                style={isCustomColor ? { backgroundColor: action.color } : {}}
                onMouseEnter={(e) => {
                  if (isCustomColor && action.hoverColor) {
                    e.currentTarget.style.backgroundColor = action.hoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCustomColor && action.color) {
                    e.currentTarget.style.backgroundColor = action.color;
                  }
                }}
              >
                <Icon size={24} className="mb-3" />
                <h3 className="mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">ผู้สมัครล่าสุด</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-gray-600">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-gray-600">รหัสนิสิต</th>
                <th className="px-6 py-3 text-left text-gray-600">GPA</th>
                <th className="px-6 py-3 text-left text-gray-600">สถานะ</th>
                <th className="px-6 py-3 text-left text-gray-600">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.applicationId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{app.studentName || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{app.studentID}</td>
                  <td className="px-6 py-4 text-gray-900">{app.grade || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${app.statusCode === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      app.statusCode === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {app.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onNavigate?.('recruitment')}
                      className="hover:underline text-sm"
                      style={{ color: '#E35205' }}
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => onNavigate?.('recruitment')}
            className="hover:underline text-sm"
            style={{ color: '#E35205' }}
          >
            ดูทั้งหมด →
          </button>
        </div>
      </div>

      {/* Create TA Announcement Modal */}
      {showCreateModal && (
        <CreateTAAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAnnouncement}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default Dashboard;