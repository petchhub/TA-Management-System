import {
  Users,
  BookOpen,
  Clock,
  Download,
  Calendar,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCoursesForFinance, getEmailHistory, Course, EmailHistory, getApplicationsForCourse } from "../../services/courseService";
import { getSemesters } from "../../services/lookupService";
import { CourseExport } from "./CourseExport";
import { EmailAnnouncement } from "./EmailAnnouncement";

interface CourseWithStats extends Course {
  actualTaCount?: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalTAs, setTotalTAs] = useState(0);
  const [currentSemester, setCurrentSemester] = useState<string>("ยังไม่ได้เลือกภาคการศึกษาปัจจุบัน");

  useEffect(() => {
    fetchData();
  }, []);

  const getThaiStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'successful': 'สำเร็จ',
      'success': 'สำเร็จ',
      'sent': 'ส่งแล้ว',
      'failed': 'ล้มเหลว',
      'error': 'เกิดข้อผิดพลาด',
      'pending': 'กำลังส่ง'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, emailData, semestersData] = await Promise.all([
        getAllCoursesForFinance(),
        getEmailHistory(),
        getSemesters()
      ]);

      const coursesWithStats = await Promise.all(coursesData.map(async (course) => {
        try {
          const apps = await getApplicationsForCourse(course.courseID);
          const approvedCount = apps.filter(a => a.statusID === 5 || a.statusID === 6).length;
          return { ...course, actualTaCount: approvedCount };
        } catch (error) {
          console.error(`Error fetching apps for course ${course.courseID}`, error);
          return { ...course, actualTaCount: 0 };
        }
      }));

      setCourses(coursesWithStats);
      setEmailLogs(emailData || []);

      // Calculate stats
      setTotalCourses(coursesData.length);
      const taCount = coursesWithStats.reduce((sum, c) => sum + (c.actualTaCount || 0), 0);
      setTotalTAs(taCount);

      const activeSem = semestersData.find(s => s.isActive);
      if (activeSem) {
        setCurrentSemester(`${activeSem.term}/${activeSem.year}`);
      } else {
        setCurrentSemester("ยังไม่ได้เลือกภาคการศึกษาปัจจุบัน");
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      title: "จำนวนผู้ช่วยสอนทั้งหมด",
      value: loading ? "..." : totalTAs.toString(),
      icon: Users,
      color: "bg-orange-500",
    },
    {
      title: "จำนวนรายวิชาที่เปิดเบิกจ่าย",
      value: loading ? "..." : totalCourses.toString(),
      icon: BookOpen,
      color: "bg-orange-600",
    },
    {
      title: "ภาคการศึกษาปัจจุบัน",
      value: loading ? "..." : currentSemester,
      icon: Calendar,
      color: "bg-orange-400",
      onClick: currentSemester === "ยังไม่ได้เลือกภาคการศึกษาปัจจุบัน" ? () => navigate("/finance/semester") : undefined,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl mb-2">แดชบอร์ดภาพรวม</h2>
        <p className="text-gray-600">
          ระบบจัดการข้อมูลชั่วโมงการทำงานผู้ช่วยสอน
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 ${card.onClick ? 'cursor-pointer hover:shadow-lg transition-all hover:bg-orange-50/50 group' : ''}`}
              onClick={card.onClick}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">
                    {card.title}
                  </p>
                  <p className={`${card.value.length > 20 ? "text-lg" : "text-3xl"} font-bold text-gray-900`}>{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg shadow-md`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">เมนูด่วน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/finance/export")}
                className="bg-white border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50 p-4 rounded-xl flex items-center gap-4 transition-all group text-left"
              >
                <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                  <Download className="text-orange-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-orange-700">Export ข้อมูล</h4>
                  <p className="text-sm text-gray-500">จัดการข้อมูลชั่วโมงงาน</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/finance/announcement")}
                className="bg-white border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-xl flex items-center gap-4 transition-all group text-left"
              >
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Mail className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">ส่งอีเมลประกาศ</h4>
                  <p className="text-sm text-gray-500">แจ้งเตือนผู้ช่วยสอน</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity (Email History) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">ประวัติการส่งอีเมลล่าสุด</h3>
              <button
                onClick={() => navigate("/finance/announcement")}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                ดูทั้งหมด <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-500 py-4">กำลังโหลด...</p>
              ) : emailLogs.length > 0 ? (
                emailLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Mail size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{log.subject}</p>
                        <p className="text-xs text-gray-500">ถึง: {log.receivedName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${["successful", "success", "sent"].includes(log.status.toLowerCase())
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {getThaiStatus(log.status)}
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(log.createDate).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">ไม่พบประวัติการส่งอีเมล</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Course Overview List */}
        <div className="bg-white rounded-lg shadow p-6 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">
            <h3 className="text-lg font-medium">รายวิชา ({courses.length})</h3>
            <button
              onClick={() => navigate("/finance/courses")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              จัดการ
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 py-4">กำลังโหลด...</p>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.courseID} className="p-3 border border-gray-100 rounded-lg hover:border-orange-200 transition-colors">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {course.courseCode}
                      </span>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1" title={course.courseName}>
                        {course.courseName}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      อาจารย์ผู้สอน: {course.professorName || "-"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{course.actualTaCount || 0} คน</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{course.workHour || 0} ชม.</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">ไม่มีรายวิชา</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;