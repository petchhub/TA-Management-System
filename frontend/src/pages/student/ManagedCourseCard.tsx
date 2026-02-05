import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";
import { Course } from "../../services/courseService";
import { formatTime } from "../../utils/formatUtils";

interface ManagedCourseCardProps {
    course: Course;
    onClick?: () => void;
    onDiscordError?: (message: string) => void;
}

export default function ManagedCourseCard({ course, onClick, onDiscordError }: ManagedCourseCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            ผู้ช่วยสอน (TA)
                        </span>
                        <span className="text-gray-500 text-sm">
                            Sec {course.section || "1"}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {course.courseCode} {course.courseName}
                    </h3>
                    <p className="text-gray-500 text-sm">{course.courseProgram}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">
                        <span className="font-medium">ผู้สอน:</span> {course.professorName || "N/A"}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">
                        <span className="font-medium">วันเรียน:</span> {course.classday}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">
                        <span className="font-medium">เวลา:</span> {formatTime(course.classStart)} - {formatTime(course.classEnd)} น.
                    </span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">
                        <span className="font-medium">สถานที่:</span> {course.location}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Use discordRoleID to construct the join link
                        if (course.discordRoleID) {
                            window.open(`http://localhost:8081/join-course/${course.discordRoleID}`, '_blank');
                        } else {
                            if (onDiscordError) {
                                onDiscordError('ยังไม่มีลิงก์ Discord สำหรับรายวิชานี้ กรุณาติดต่อผู้สอนประจำวิชา');
                            } else {
                                alert('ยังไม่มีลิงก์ Discord สำหรับวิชานี้');
                            }
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                    </svg>
                    เข้าร่วมเซิร์ฟเวอร์ Discord TA
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                    ใช้สำหรับติดต่ออาจารย์และผู้ช่วยสอน (มีห้องแยกสำหรับแต่ละวิชา)
                </p>
            </div>
        </div>
    );
}
