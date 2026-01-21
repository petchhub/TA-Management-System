import { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  MapPin,
  CheckCircle,
  AlertCircle,
  Briefcase,
  FileText,
  Clock10,
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

        // 3. Calculate Upcoming Sessions (Next 3 occurrences per course)
        const sessions = approvedCourses.flatMap(course => {
          if (!course.classday || !course.classStart) return [];

          // Get the very next class date
          const firstDate = getNextClassDate(course.classday, course.classStart);

          // Generate 3 occurrences (next 3 weeks) to ensure we can fill the "Top 3" list
          // even if the student only has 1 course.
          const occurrences = [];
          for (let i = 0; i < 3; i++) {
            const date = new Date(firstDate);
            date.setDate(date.getDate() + (i * 7)); // Add i weeks

            occurrences.push({
              courseCode: course.courseCode,
              courseName: course.courseName,
              location: course.location,
              startTime: course.classStart,
              endTime: course.classEnd,
              date: date,
              dayName: course.classday
            });
          }
          return occurrences;
        });

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

      {/* Stats Row - Added to make dashboard fuller */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">รายวิชาที่ดูแล</p>
            <p className="text-3xl font-bold text-gray-900">{registeredCourses.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">รอการตรวจสอบ</p>
            <p className="text-3xl font-bold text-gray-900">{activities.filter(a => a.status === 'pending').length}</p>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">ชั่วโมงทำงาน/สัปดาห์</p>
            <p className="text-3xl font-bold text-gray-900">
              {registeredCourses.reduce((acc, curr) => acc + (curr.workHour || 0), 0)}
            </p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Clock10 size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming & Registered */}
        <div className="lg:col-span-2 space-y-8">

          {/* Upcoming Teaching Sessions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">ตารางสอนที่จะมาถึง</h2>
              <button
                onClick={() => window.location.href = '/student/work-hours'}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
              >
                ดูเพิ่มเติม
              </button>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      {/* Reverted to Big Date Box "Front View" */}
                      <div className="flex-shrink-0 w-14 h-14 bg-orange-50 rounded-lg flex flex-col items-center justify-center text-orange-600 border border-orange-100">
                        <span className="text-xs font-extrabold uppercase">{session.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-3 bg-gray-50 rounded-full mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">ไม่มีตารางสอนเร็วๆ นี้</p>
              </div>
            )}
          </div>

          {/* Registered Courses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">รายวิชาที่ดูแล</h2>
              <button
                onClick={() => window.location.href = '/student/work-hours?view=list'}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
              >
                ดูเพิ่มเติม
              </button>
            </div>

            {registeredCourses.length > 0 ? (
              <div className="space-y-4">
                {registeredCourses.map(course => (
                  <div key={course.courseID} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900">{course.courseCode} {course.courseName}</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium whitespace-nowrap">
                            กำลังดำเนินการ
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 truncate">อาจารย์: {course.professorName}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">Sec {course.section}</span>
                          <span>{course.workHour} ชม./สัปดาห์</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-3 bg-gray-50 rounded-full mb-3">
                  <BookOpen className="w-6 h-6 text-gray-400" />
                </div>
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
