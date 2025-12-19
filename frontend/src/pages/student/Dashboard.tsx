import {
  CheckCircle,
  Clock,
  Calendar,
  Award,
} from "lucide-react";
import StatusCard from "./StatusCard";


export default function Dashboard() {


  const applicationStatus = "approved"; // 'pending' | 'approved' | 'rejected'
  const monthlyHours = {
    completed: 32,
    total: 40,
    month: "ธันวาคม 2025",
  };

  const recentActivities = [
    {
      id: 1,
      date: "2025-12-01",
      course: "01076101 - Introduction to Computer Engineering",
      hours: 3,
      status: "approved",
    },
    {
      id: 2,
      date: "2025-11-28",
      course: "01076102 - Data Structures",
      hours: 4,
      status: "pending",
    },
    {
      id: 3,
      date: "2025-11-25",
      course: "01076103 - Introduction to Programming",
      hours: 3,
      status: "approved",
    },
    {
      id: 4,
      date: "2025-11-22",
      course: "01076104 - Data Structures",
      hours: 5,
      status: "approved",
    },
    {
      id: 5,
      date: "2025-11-20",
      course: "01076105 - Introduction to Programming",
      hours: 3,
      status: "pending",
    },
  ];

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
      value: recentActivities.length.toString(),
      subtitle: "กิจกรรม",
      icon: Award,
      color: "green" as const,
    },
  ];



  const progress =
    (monthlyHours.completed / monthlyHours.total) * 100;

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
            <Calendar className="w-6 h-6 text-[var(--color-primary-600)]" />
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">ความคืบหน้า</span>
              <span className="text-[var(--color-primary-600)]">
                {monthlyHours.completed} / {monthlyHours.total}{" "}
                ชั่วโมง
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-[var(--color-primary-600)] h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.slice(0, 2).map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                orange:
                  "bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-primary-600)]",
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
        <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl p-6 shadow-sm text-white">
          <h3 className="mb-2">สรุปภาพรวม</h3>
          <p className="text-[var(--color-primary-100)] mb-6">
            ประจำเดือนนี้
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-primary-100)]">
                ชั่วโมงที่เหลือ
              </span>
              <span className="text-white">
                {monthlyHours.total - monthlyHours.completed}{" "}
                ชม.
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-primary-100)]">
                ความสำเร็จ
              </span>
              <span className="text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="pt-4 border-t border-[var(--color-primary-400)]">
              <p className="text-[var(--color-primary-100)] mb-1">
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
              {recentActivities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-gray-100"
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
                  <td className="py-4 text-gray-900">
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
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            ตรวจสอบแล้ว
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                            รอการตรวจสอบ
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}