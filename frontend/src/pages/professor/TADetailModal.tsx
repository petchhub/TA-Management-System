import { X, Clock, TrendingUp, Calendar } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  requiredTAs: number;
  approvedTAs: number;
  pendingApplications: number;
  totalHours: number;
  tas: {
    id: string;
    name: string;
    studentId: string;
    hoursWorked: number;
    hoursThisMonth: number;
    status: 'active' | 'inactive';
  }[];
}

interface TADetailModalProps {
  course: Course;
  onClose: () => void;
}

export function TADetailModal({ course, onClose }: TADetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-1">
              {course.code} - {course.name}
            </h2>
            <p className="text-sm text-gray-600">รายละเอียดชั่วโมงการทำงานของ TA</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {course.tas.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Clock size={32} className="text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">ยังไม่มี TA</h3>
              <p className="text-gray-600">วิชานี้ยังไม่มีผู้ช่วยสอนที่ได้รับการอนุมัติ</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 bg-[var(--color-primary-50)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-white rounded-lg bg-[var(--color-primary-600)]">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-primary-700)]">ชั่วโมงรวมทั้งหมด</p>
                      <p className="text-[var(--color-primary-900)]">{course.totalHours} ชม.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 text-white rounded-lg">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-green-700">เฉลี่ยต่อคน</p>
                      <p className="text-green-900">
                        {course.tas.length > 0
                          ? Math.round(course.totalHours / course.tas.length)
                          : 0}{' '}
                        ชม.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 text-white rounded-lg">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-purple-700">เดือนนี้</p>
                      <p className="text-purple-900">
                        {course.tas.reduce((sum, ta) => sum + ta.hoursThisMonth, 0)} ชม.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TA Details Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-gray-600">ชื่อ TA</th>
                        <th className="px-6 py-3 text-left text-gray-600">รหัสนิสิต</th>
                        <th className="px-6 py-3 text-left text-gray-600">ชั่วโมงรวม</th>
                        <th className="px-6 py-3 text-left text-gray-600">ชั่วโมงเดือนนี้</th>
                        <th className="px-6 py-3 text-left text-gray-600">สถานะ</th>
                        <th className="px-6 py-3 text-left text-gray-600">ความคืบหน้า</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.tas.map((ta) => {
                        const progress = course.totalHours > 0
                          ? (ta.hoursWorked / course.totalHours) * 100 * course.tas.length
                          : 0;

                        return (
                          <tr key={ta.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[var(--color-primary-600)]">
                                  {ta.name.charAt(0)}
                                </div>
                                <span className="text-gray-900">{ta.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{ta.studentId}</td>
                            <td className="px-6 py-4 text-gray-900">{ta.hoursWorked} ชม.</td>
                            <td className="px-6 py-4 text-gray-900">{ta.hoursThisMonth} ชม.</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${ta.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {ta.status === 'active' ? 'กำลังทำงาน' : 'ไม่ได้ทำงาน'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-[var(--color-primary-600)]"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 min-w-[3rem]">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Individual TA Cards */}
              <div>
                <h3 className="text-gray-900 mb-4">รายละเอียดแต่ละคน</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.tas.map((ta) => (
                    <div key={ta.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-[var(--color-primary-600)]">
                          {ta.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{ta.name}</p>
                          <p className="text-sm text-gray-600">{ta.studentId}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">ชั่วโมงรวม</p>
                          <p className="text-gray-900">{ta.hoursWorked} ชม.</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">เดือนนี้</p>
                          <p className="text-gray-900">{ta.hoursThisMonth} ชม.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}