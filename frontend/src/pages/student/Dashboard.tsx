import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Calendar,
  Award,
} from "lucide-react";
import StatusCard from "./StatusCard";
import { useAuth } from "../../context/AuthContext";
import { getStudentApplications, getAllCoursesByStudentId, Application, Course } from "../../services/courseService";

export default function Dashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]); // Using any for composite activity type or define interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Fetch both applications and courses to map names
        const studentId = parseInt(user.id); // Assuming user.id is the student ID
        const [apps, courses] = await Promise.all([
          getStudentApplications(studentId),
          getAllCoursesByStudentId(studentId)
        ]);

        // Map applications to activities
        const mappedActivities = apps.map((app, index) => {
          // Find course details
          // Note: app.courseID from backend might be jobPostID or courseID depending on how it was saved.
          // We try to match with jobPostID or courseID in courses list.
          // Backend 'getApplicationByStudentId' returns course_ID column from ta_application.
          // And 'applyJobPost' inserts job_post_id into that column.
          // So app.courseID is likely the jobPostID.
          // We need to find the course that corresponds to this jobPostID.

          const course = courses.find(c => c.jobPostID === app.courseID || c.courseID === app.courseID.toString());
          const courseName = course
            ? `${course.courseID} - ${course.courseName}`
            : `Course ID: ${app.courseID}`;

          // Determine status string for UI
          let statusUI = "pending";
          if (app.statusCode === "APPROVED") statusUI = "approved";
          if (app.statusCode === "REJECTED") statusUI = "rejected"; // If exists

          return {
            id: index,
            date: app.createdDate,
            course: courseName,
            hours: course?.workHour || 0, // Use work hour from course or 0
            status: statusUI,
          };
        });

        setActivities(mappedActivities);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const applicationStatus = activities.some(a => a.status === "approved") ? "approved" : "pending";

  // Mock monthly hours for now as API doesn't provide this yet
  const monthlyHours = {
    completed: 0,
    total: activities.reduce((sum, a) => sum + (a.status === 'approved' ? a.hours : 0), 0),
    month: "ธันวาคม 2025",
  };

  const stats = [
    {
      title: "ชั่วโมงประจำเดือน",
      value: `${monthlyHours.completed}/${monthlyHours.total}`,
      subtitle: "ชั่วโมง",
      icon: Clock,
      color: "orange" as const,
    },
    {
      title: "สถานะการสมัคร",
      value:
        applicationStatus === "approved"
          ? "อนุมัติแล้ว"
          : "รอดำเนินการ",
      subtitle: "ตำแหน่ง TA",
      icon: CheckCircle,
      color: "purple" as const,
    },
    {
      title: "รายการทั้งหมด",
      value: activities.length.toString(),
      subtitle: "กิจกรรม",
      icon: Award,
      color: "green" as const,
    },
  ];

  const progress = monthlyHours.total > 0
    ? (monthlyHours.completed / monthlyHours.total) * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">ภาพรวม</h1>
        <p className="text-gray-600">
          ยินดีต้อนรับสู่ระบบจัดการผู้ช่วยสอน
        </p>
      </div>

      {/* Top Row - Status and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Application Status - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <StatusCard status={applicationStatus} />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {stats.slice(2, 3).map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              orange: "bg-orange-50 text-orange-600",
              purple: "bg-purple-50 text-purple-600",
              green: "bg-green-50 text-green-600",
            };
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 mb-2">
                      {stat.title}
                    </p>
                    <p className="text-gray-900">
                      {stat.value} {stat.subtitle}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${colorClasses[stat.color]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Row - Monthly Progress and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Hours Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-900 mb-1">
                ชั่วโมงงานประจำเดือน
              </h2>
              <p className="text-gray-600">
                {monthlyHours.month}
              </p>
            </div>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">ความคืบหน้า</span>
              <span className="text-orange-600">
                {monthlyHours.completed} / {monthlyHours.total}{" "}
                ชั่วโมง
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-orange-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.slice(0, 2).map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                orange:
                  "bg-orange-50 border-orange-100 text-orange-600",
                purple:
                  "bg-purple-50 border-purple-100 text-purple-600",
                green:
                  "bg-green-50 border-green-100 text-green-600",
              }[stat.color];
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${colorClasses}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5" />
                    <span>{stat.title}</span>
                  </div>
                  <p className="text-gray-900">
                    {stat.value} {stat.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-sm text-white">
          <h3 className="mb-2">สรุปภาพรวม</h3>
          <p className="text-orange-100 mb-6">
            ประจำเดือนนี้
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-orange-100">
                ชั่วโมงที่เหลือ
              </span>
              <span className="text-white">
                {monthlyHours.total - monthlyHours.completed}{" "}
                ชม.
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-100">
                ความสำเร็จ
              </span>
              <span className="text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="pt-4 border-t border-orange-400">
              <p className="text-orange-100 mb-1">
                สถานะ
              </p>
              <p className="text-white">กำลังดำเนินการ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-gray-900 mb-6">กิจกรรมล่าสุด</h2>

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        )}

        {error && <div className="text-red-500 py-4 text-center">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-3 text-gray-600">
                    วันที่
                  </th>
                  <th className="text-left pb-3 text-gray-600">
                    รายวิชา
                  </th>
                  <th className="text-left pb-3 text-gray-600">
                    ชั่วโมง
                  </th>
                  <th className="text-left pb-3 text-gray-600">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      ไม่มีข้อมูลกิจกรรม (ยังไม่ได้สมัคร TA)
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 text-gray-700">
                        {new Date(activity.date).toLocaleDateString(
                          "th-TH",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="py-4 text-gray-900 font-medium">
                        {activity.course}
                      </td>
                      <td className="py-4 text-gray-700">
                        {activity.hours} ชั่วโมง
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {activity.status === "approved" ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                ตรวจสอบแล้ว
                              </span>
                            </>
                          ) : activity.status === "rejected" ? (
                            <>
                              <Clock className="w-5 h-5 text-red-600" />
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                ปฏิเสธ
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                รอการตรวจสอบ
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}