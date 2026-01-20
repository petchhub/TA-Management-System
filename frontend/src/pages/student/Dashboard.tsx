import { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStudentApplications, getAllCourses, Course } from "../../services/courseService";
import { getNextClassDate } from "../../utils/dateUtils";
import { formatTime } from "../../utils/formatUtils";

const statusDist: Record<string, string> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ"
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const studentId = parseInt(user.id);
        const [apps, allCourses] = await Promise.all([
          getStudentApplications(studentId),
          getAllCourses()
        ]);

        // 1. Map Applications to Activities (Backend now provides all needed fields)
        const mappedActivities = apps.map((app, index) => {
          // Debug logging for rejected applications
          if (app.statusCode === "REJECTED") {
            console.log("Rejected application:", {
              courseName: app.courseName,
              statusCode: app.statusCode,
              rejectReason: app.rejectReason,
              fullApp: app
            });
          }

          // Use the course name and schedule directly from the backend response
          let courseDisplay = app.courseName || `Course ID: ${app.courseID}`;
          let schedule = app.classDay && app.classStart && app.classEnd
            ? `${app.classDay} ${formatTime(app.classStart)} - ${formatTime(app.classEnd)}`
            : "";

          let statusUI = "pending";
          if (app.statusCode === "APPROVED") statusUI = "approved";
          if (app.statusCode === "REJECTED") statusUI = "rejected";

          return {
            id: index,
            date: app.createdDate,
            courseName: courseDisplay,
            schedule: schedule,
            hours: 0, // Not provided in the response
            status: statusUI,
            rejectReason: app.rejectReason || null
          };
        });
        setActivities(mappedActivities);

        // 2. Identify Registered (Approved) Courses
        // Filter for approved applications only (case-insensitive)
        const approvedApps = apps.filter(app => app.statusCode?.toUpperCase() === "APPROVED");

        // Map approved applications to full course details
        const approvedCourses = approvedApps
          .map(app => {
            // Find matching course logic:
            // 1. Match by jobPostID (preferred if available)
            // 2. Match by courseID (fallback, handle string/number types)
            const course = allCourses.find(c =>
              c.jobPostID === app.courseID ||
              c.courseID === app.courseID ||
              c.courseID.toString() === app.courseID.toString()
            );

            if (course) {
              return { ...course, location: app.location || course.location };
            }
            return undefined;
          })
          .filter((c): c is Course => c !== undefined);

        // Remove duplicates if any
        const uniqueCourses = Array.from(new Map(approvedCourses.map(c => [c.courseID, c])).values());
        setRegisteredCourses(uniqueCourses);

        // 3. Calculate Upcoming Sessions
        const sessions = approvedCourses.map(course => {
          if (!course.classday || !course.classStart) return null;

          // Based on init.sql it seems to be single selection or string.
          // Let's assume single day for simplicity or simple parsing.
          const nextDate = getNextClassDate(course.classday, course.classStart);

          return {
            courseCode: course.courseCode,
            courseName: course.courseName,
            location: course.location,
            startTime: course.classStart,
            endTime: course.classEnd,
            date: nextDate,
            dayName: course.classday
          };
        }).filter(Boolean) as any[];

        // Sort by nearest date
        sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
        setUpcomingSessions(sessions.slice(0, 3)); // Take top 3

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        // setError("ไม่สามารถโหลดข้อมูลกิจกรรมได้"); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const applicationStatus = activities.some(a => a.status === "approved") ? "approved" : "pending";

  /* Removed monthly hours and top stats row as requested */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">แดชบอร์ดภาพรวม</h1>
        <p className="text-gray-600">
          ยินดีต้อนรับสู่ระบบจัดการผู้ช่วยสอน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming & Registered */}
        <div className="lg:col-span-2 space-y-8">

          {/* Upcoming Teaching Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">การสอนที่จะถึงนี้</h2>
              <span className="text-sm text-gray-500"></span>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-orange-200 transition-colors">
                    <div className="flex-shrink-0 w-14 h-14 bg-orange-50 rounded-lg flex flex-col items-center justify-center text-orange-600 border border-orange-100">
                      <span className="text-xs font-bold uppercase">{session.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="text-xl font-bold">{session.date.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{session.courseCode} {session.courseName}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{session.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                <p className="text-gray-500">ไม่มีตารางสอนเร็วๆ นี้</p>
              </div>
            )}
          </div>

          {/* Registered Courses */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">รายวิชาที่ดูแล</h2>
            {registeredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredCourses.map(course => (
                  <div key={course.courseID} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">กำลังดำเนินการ</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{course.courseCode}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-4">{course.courseName}</p>

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                      <span className="text-gray-500">Sec {course.section}</span>
                      <span className="text-gray-900 font-medium">{course.taAllocation} TAs</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                <p className="text-gray-500">ยังไม่มีรายวิชาที่ลงทะเบียน</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Status & Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">สถานะล่าสุด</h2>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${applicationStatus === 'approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {applicationStatus === 'approved' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {applicationStatus === 'approved' ? 'อนุมัติเป็นผู้ช่วยสอน' : 'รอการตรวจสอบ'}
                </p>
                <p className="text-sm text-gray-500">
                  {applicationStatus === 'approved' ? 'คุณสามารถเริ่มปฏิบัติงานได้' : 'ใบสมัครของคุณกำลังถูกพิจารณา'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ประวัติการสมัคร</h2>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${activity.status === 'approved' ? 'bg-green-500' :
                      activity.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{activity.courseName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.schedule}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </p>

                      {activity.status === 'rejected' && activity.rejectReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded-md flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-600">
                            {activity.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full capitalize ${activity.status === 'approved' ? 'bg-green-50 text-green-700' :
                      activity.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                      {statusDist[activity.status] || activity.status}
                    </span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">ไม่มีข้อมูลการสมัคร</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
