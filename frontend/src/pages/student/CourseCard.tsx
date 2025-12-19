import { BookOpen, User, Clock, MapPin, Calendar, AlertCircle } from 'lucide-react';

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  program: string;
  days: string[];
  instructor: string;
  semester: string;
  positions: number;
  hoursPerWeek: number;
  requirements: string;
  description: string;
  location: string;
  deadline: string;
  status: 'open' | 'closed';
}

interface CourseCardProps {
  course: Course;
  onApply: (courseId: number) => void;
}

export default function CourseCard({ course, onApply }: CourseCardProps) {
  const isDeadlineSoon = () => {
    const deadline = new Date(course.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3 && daysUntil > 0;
  };

  const formatDeadline = () => {
    return new Date(course.deadline).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md flex flex-col h-full ${course.status === 'open' ? 'border-gray-100' : 'border-gray-200 opacity-60'
      }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-primary-50)] rounded-lg">
              <BookOpen className="w-5 h-5 text-[var(--color-primary-600)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-gray-900 font-semibold">{course.code}</h3>
                <span className="text-sm text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {course.program}
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-gray-900 mb-2">{course.name}</h2>
          <p className="text-gray-600 mb-3">{course.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full ${course.status === 'open'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
            }`}>
            {course.status === 'open' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
          </span>
          <span className="px-3 py-1 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full">
            {course.semester}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 text-gray-700">
          <User className="w-4 h-4 text-gray-400" />
          <span>อาจารย์: {course.instructor}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>สถานที่: {course.location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>วันเรียน: {course.days.join(', ')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{course.hoursPerWeek} ชม./สัปดาห์</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span>{course.positions} ตำแหน่ง</span>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <p className="text-gray-600 mb-2">คุณสมบัติ:</p>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
          {course.requirements}
        </p>
      </div>

      {/* Deadline Warning */}
      {isDeadlineSoon() && course.status === 'open' && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-700">
            ใกล้ปิดรับสมัคร! เหลือเวลาอีกไม่กี่วัน
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>ปิดรับ: {formatDeadline()}</span>
        </div>
        <button
          onClick={() => onApply(course.id)}
          disabled={course.status === 'closed'}
          className={`px-6 py-2 rounded-lg transition-colors ${course.status === 'open'
            ? 'bg-orange-600 hover:bg-orange-700 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          {course.status === 'open' ? 'สมัครเลย' : 'ปิดรับสมัคร'}
        </button>
      </div>
    </div>
  );
}