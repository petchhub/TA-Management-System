
import {
  Users,
  BookOpen,
  Clock,
  Download,
  Calendar,
  Mail,
} from "lucide-react";

export function Dashboard() {

  const summaryCards = [
    {
      title: "จำนวนผู้ช่วยสอนทั้งหมด",
      value: "32",
      icon: Users,
      color: "bg-orange-500",
    },
    {
      title: "จำนวนรายวิชาที่เปิดเบิกจ่าย",
      value: "12",
      icon: BookOpen,
      color: "bg-orange-600",
    },
    {
      title: "ชั่วโมงการทำงานที่เบิกจ่ายแล้ว",
      value: "238",
      icon: Clock,
      color: "bg-orange-400",
    },
  ];

  const quickActions = [
    {
      label: "Export ข้อมูลชั่วโมงงาน",
      icon: Download,
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      label: "จัดการวันหยุด",
      icon: Calendar,
      color: "bg-slate-600 hover:bg-slate-700",
    },
    {
      label: "ส่งอีเมลประกาศ",
      icon: Mail,
      color: "bg-orange-500 hover:bg-orange-600",
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
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">
                    {card.title}
                  </p>
                  <p className="text-3xl">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`${action.color} text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors`}
              >
                <Icon size={20} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg mb-4">กิจกรรมล่าสุด</h3>
        <div className="space-y-3">
          {[
            {
              action: "ตรวจสอบชั่วโมงงาน",
              course: "01076103 - Programming Fundamentals",
              time: "2 ชั่วโมงที่แล้ว",
            },
            {
              action: "ส่งออกข้อมูล",
              course: "01076109 - Data Structures",
              time: "5 ชั่วโมงที่แล้ว",
            },
            {
              action: "เพิ่มวันหยุด",
              course: "วันหยุดพิเศษ 20 ธ.ค. 2567",
              time: "1 วันที่แล้ว",
            },
            {
              action: "ส่งอีเมลประกาศ",
              course: "ถึงผู้ช่วยสอนทั้งหมด",
              time: "2 วันที่แล้ว",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm">{activity.action}</p>
                <p className="text-xs text-gray-500">
                  {activity.course}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;