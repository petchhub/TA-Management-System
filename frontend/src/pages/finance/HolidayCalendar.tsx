import { useState } from 'react';
import { Calendar, Plus, Trash2, Edit2 } from 'lucide-react';

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'official' | 'special';
}

export function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', date: '2024-12-25', name: 'วันคริสต์มาส', type: 'official' },
    { id: '2', date: '2025-01-01', name: 'วันขึ้นปีใหม่', type: 'official' },
    { id: '3', date: '2025-02-14', name: 'วันสงกรานต์', type: 'official' },
    { id: '4', date: '2024-12-20', name: 'วันหยุดพิเศษ (ประชุมคณะ)', type: 'special' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [selectedMonth, setSelectedMonth] = useState('2024-12');

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      const holiday: Holiday = {
        id: Date.now().toString(),
        date: newHoliday.date,
        name: newHoliday.name,
        type: 'special',
      };
      setHolidays([...holidays, holiday]);
      setNewHoliday({ date: '', name: '' });
      setShowAddModal(false);
    }
  };

  const deleteHoliday = (id: string) => {
    if (confirm('คุณต้องการลบวันหยุดนี้หรือไม่?')) {
      setHolidays(holidays.filter((h) => h.id !== id));
    }
  };

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const holiday = holidays.find((h) => h.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`p-2 border border-gray-200 min-h-[80px] ${holiday ? (holiday.type === 'official' ? 'bg-red-50' : 'bg-yellow-50') : 'bg-white'
            } ${isToday ? 'ring-2 ring-[var(--color-primary-500)]' : ''}`}
        >
          <div className="text-sm font-medium mb-1">{day}</div>
          {holiday && (
            <div className={`text-xs p-1 rounded ${holiday.type === 'official' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
              {holiday.name}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl mb-2">จัดการวันหยุด</h2>
        <p className="text-gray-600">กำหนดและจัดการวันหยุดสำหรับการคำนวณชั่วโมงการทำงาน</p>
      </div>

      {/* Month Selector and Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">เลือกเดือน:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors"
        >
          <Plus size={18} />
          เพิ่มวันหยุดพิเศษ
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
            <div key={day} className="p-2 text-center text-sm text-gray-600 bg-slate-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {renderCalendar()}
        </div>
      </div>

      {/* Holiday List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg mb-4">รายการวันหยุดทั้งหมด</h3>
        <div className="space-y-2">
          {holidays
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-gray-600" />
                  <div>
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(holiday.date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${holiday.type === 'official'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {holiday.type === 'official' ? 'วันหยุดปกติ' : 'วันหยุดพิเศษ'}
                  </span>
                </div>
                {holiday.type === 'special' && (
                  <div className="flex gap-2">
                    <button className="p-2 text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] rounded">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteHoliday(holiday.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl mb-4">เพิ่มวันหยุดพิเศษ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">วันที่</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">ชื่อวันหยุด</label>
                <input
                  type="text"
                  placeholder="เช่น วันหยุดพิเศษ (ประชุมคณะ)"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={addHoliday}
                  className="flex-1 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)]"
                >
                  เพิ่มวันหยุด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
