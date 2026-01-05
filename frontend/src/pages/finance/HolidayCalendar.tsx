import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Holiday {
  id: number;
  date: string; // ISO string 2006-01-02T00:00:00Z...
  name: string;
  type: string; // 'official' | 'special'
}

export function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchHolidays = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const response = await fetch(`http://localhost:8084/TA-management/lookup/holiday?month=${month}&year=${year}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch holidays');
      const data = await response.json();
      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [selectedMonth]);

  const addHoliday = async () => {
    if (newHoliday.date && newHoliday.name) {
      try {
        const payload = {
          date: new Date(newHoliday.date).toISOString(),
          nameThai: newHoliday.name,
          type: 'special',
        };
        const response = await fetch('http://localhost:8084/TA-management/lookup/holiday', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to add holiday');

        await fetchHolidays();
        setNewHoliday({ date: '', name: '' });
        setShowAddModal(false);
      } catch (error) {
        console.error('Error adding holiday:', error);
        alert('Failed to add holiday');
      }
    }
  };

  const deleteHoliday = async (id: number) => {
    if (confirm('คุณต้องการลบวันหยุดนี้หรือไม่?')) {
      try {
        const response = await fetch(`http://localhost:8084/TA-management/lookup/holiday/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to delete holiday');
        setHolidays(holidays.filter((h) => h.id !== id));
      } catch (error) {
        console.error('Error deleting holiday:', error);
        alert('Failed to delete holiday');
      }
    }
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 - 1, 1); // Subtract 1 month
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + 1, 1); // Add 1 month
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    setNewHoliday({ date: dateStr, name: '' });
    setShowAddModal(true);
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
      // Basic string matching for date (assuming backend returns correct date part)
      const holiday = holidays.find((h) => h.date.startsWith(dateStr));
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`p-2 border border-gray-200 min-h-[80px] cursor-pointer hover:bg-gray-50 transition-colors ${holiday ? (holiday.type === 'official' ? 'bg-red-50' : 'bg-yellow-50') : 'bg-white'
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
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">เลือกเดือน:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>

          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={() => {
            setNewHoliday({ date: '', name: '' });
            setShowAddModal(true);
          }}
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
          {holidays.length === 0 ? (
            <p className="text-gray-500 text-center py-4">ไม่มีวันหยุดในเดือนนี้</p>
          ) : (
            holidays
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <CalendarIcon size={18} className="text-gray-600" />
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
                      {/* <button className="p-2 text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] rounded">
                        <Edit2 size={16} />
                      </button> */}
                      <button
                        onClick={() => deleteHoliday(holiday.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
          )}
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
