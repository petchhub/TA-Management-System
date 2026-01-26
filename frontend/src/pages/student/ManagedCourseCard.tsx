import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";
import { Course } from "../../services/courseService";
import { formatTime } from "../../utils/formatUtils";

interface ManagedCourseCardProps {
    course: Course;
    onClick?: () => void;
}

export default function ManagedCourseCard({ course, onClick }: ManagedCourseCardProps) {
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
                        <span className="font-medium">อาจารย์:</span> {course.professorName || "N/A"}
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
        </div>
    );
}
