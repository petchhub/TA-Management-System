import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudentApplications, getAllCourses, Course } from "../../services/courseService";
import ManagedCourseCard from "./ManagedCourseCard";

export default function ManagedCourses() {
    const { user } = useAuth();
    const [managedCourses, setManagedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const studentId = parseInt(user.id);

                // Fetch applications and ALL courses to ensure we find the match
                const [apps, courses] = await Promise.all([
                    getStudentApplications(studentId),
                    getAllCourses()
                ]);

                console.log("Student Apps:", apps);
                console.log("All Courses:", courses);

                // Filter for approved applications only (case-insensitive)
                const approvedApps = apps.filter(app => app.statusCode?.toUpperCase() === "APPROVED");
                console.log("Approved Apps:", approvedApps);

                // Map approved applications to full course details
                const approvedCourses = approvedApps
                    .map(app => {
                        // Find matching course logic:
                        // 1. Match by jobPostID (preferred if available)
                        // 2. Match by courseID (fallback, handle string/number types)
                        const course = courses.find(c =>
                            c.jobPostID === app.courseID ||
                            c.courseID === app.courseID ||
                            c.courseID.toString() === app.courseID.toString()
                        );

                        if (course) {
                            // Use location from application if available (backend explicitly joins this now)
                            // otherwise fallback to course location
                            return { ...course, location: app.location || course.location };
                        }
                        return undefined;
                    })
                    .filter((c): c is Course => c !== undefined);

                // Remove duplicates if any
                const uniqueCourses = Array.from(new Map(approvedCourses.map(c => [c.courseID, c])).values());

                console.log("Final Managed Courses:", uniqueCourses);
                setManagedCourses(uniqueCourses);
            } catch (err) {
                console.error("Failed to fetch managed courses:", err);
                setError("ไม่สามารถโหลดข้อมูลรายวิชาที่ดูแลได้");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">รายวิชาที่ดูแลอยู่</h1>
                <p className="text-gray-600">
                    รายวิชาที่คุณได้รับการอนุมัติให้เป็นผู้ช่วยสอน
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    {error}
                </div>
            ) : managedCourses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรายวิชาที่ดูแล</h3>
                    <p className="text-gray-500">
                        คุณยังไม่มีรายวิชาที่ได้รับการอนุมัติให้เป็นผู้ช่วยสอนในขณะนี้
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managedCourses.map((course) => (
                        <ManagedCourseCard key={course.courseID} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}
