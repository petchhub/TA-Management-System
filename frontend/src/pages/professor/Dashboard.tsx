import { Users, CheckCircle, Clock, Plus, UserCheck, FileText, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateTAAnnouncementModal } from './CreateTAAnnouncementModal';
import { createJobPost, getProfessorApplications, getProfessorCourses, Application } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { Toast, ToastType } from '../../components/Toast';


interface DashboardProps {
  onNavigate?: (page: 'dashboard' | 'recruitment' | 'work-hours' | 'courses') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Stats State
  const [loading, setLoading] = useState(true);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const professorId = parseInt(user.id);
        const [apps, courses] = await Promise.all([
          getProfessorApplications(professorId),
          getProfessorCourses(professorId)
        ]);

        // Recent apps logic
        const sorted = apps.sort((a, b) => b.applicationId - a.applicationId).slice(0, 5);
        setRecentApplications(sorted);

        // Stats logic
        setTotalApplicants(apps.length);
        setTotalApproved(apps.filter(a => a.statusCode === 'APPROVED').length);

        // Courses logic: Count of courses
        setTotalCourses(courses.length);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleCreateAnnouncement = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Add professor ID from auth context if available
      const professorID = user?.id ? parseInt(user.id) : 1;

      const result = await createJobPost({
        courseID: data.courseID,
        professorID: professorID,
        location: data.location || "Building",
        taAllocation: data.taAllocation,
        gradeID: data.gradeID,
        task: data.task
      });

      console.log('Job post created:', result);
      setToast({ message: 'ประกาศรับสมัคร TA สำเร็จ!', type: 'success' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create announcement:', error);
      setToast({
        message: `เกิดข้อผิดพลาดในการสร้างประกาศ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const summaryCards = [
    {
      title: 'จำนวนผู้สมัคร TA',
      value: loading ? "..." : totalApplicants.toString(),
      icon: Users,
      color: "bg-orange-500",
    },
    {
      title: 'ผู้ช่วยสอนที่อนุมัติแล้ว',
      value: loading ? "..." : totalApproved.toString(),
      icon: CheckCircle,
      color: "bg-green-600",
    },
    {
      title: 'รายวิชาที่รับผิดชอบ',
      value: loading ? "..." : totalCourses.toString(),
      icon: BookOpen,
      color: "bg-purple-600",
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


  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">แดชบอร์ดภาพรวม</h1>
        <p className="text-gray-600">ภาพรวมการจัดการผู้ช่วยสอน</p>
      </div>

      {/* Stats Cards - Finance Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg shadow-md`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">เมนูด่วน</h2>
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
                  <td className="px-6 py-4 text-gray-900">{app.studentNameTH || app.studentName || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{app.studentID}</td>
                  <td className="px-6 py-4 text-gray-900">{app.grade || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${app.statusCode === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      app.statusCode === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {app.statusCode === 'PENDING' ? 'รอพิจารณา' :
                        app.statusCode === 'APPROVED' ? 'อนุมัติแล้ว' :
                          'ไม่ผ่านการคัดเลือก'
                      }
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;