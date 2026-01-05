import { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  CheckCircle,
  User,
  Clock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProfessorCourses, getApplicationsForCourse, Course, Application } from "../../services/courseService";
import { getTADutyRoadmap, markDutyAsDone, DutyChecklistItem } from "../../services/taDutyService";

interface TADutyData {
  ta: Application;
  duties: DutyChecklistItem[];
}

export function TAWorkHours() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"courses" | "duties">("courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [taDutiesList, setTaDutiesList] = useState<TADutyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Fetch Courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const result = await getProfessorCourses(parseInt(user.id));
        setCourses(result);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (viewMode === "courses") {
      fetchCourses();
    }
  }, [user?.id, viewMode]);

  // Fetch TAs and Duties when a course is selected
  useEffect(() => {
    const fetchTADuties = async () => {
      if (!selectedCourse) return;
      setLoading(true);
      try {
        console.log("fetch duties");
        // 1. Get TAs (Applications)
        // using courseID from the selected course. 
        // Note: getApplicationsForCourse usually expects specific ID, let's assume courseID works.
        const applications = await getApplicationsForCourse(selectedCourse.courseID);

        // Filter only APPROVED TAs
        const approvedTAs = applications.filter(app => app.statusCode === "APPROVED");

        // 2. For each TA, get their duty roadmap
        const dutiesData = await Promise.all(
          approvedTAs.map(async (ta) => {
            // studentID is needed. Application has 'studentID'.
            const duties = await getTADutyRoadmap(selectedCourse.courseID, ta.studentID);
            return {
              ta,
              duties: duties || [] // Ensure duties is array
            };
          })
        );

        setTaDutiesList(dutiesData);
      } catch (error) {
        console.error("Failed to fetch TA duties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (viewMode === "duties" && selectedCourse) {
      fetchTADuties();
    }
  }, [viewMode, selectedCourse]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setViewMode("duties");
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setViewMode("courses");
    setTaDutiesList([]);
  };

  const handleMarkDone = async (studentID: number, date: string) => {
    if (!selectedCourse) return;

    if (!confirm(`ยืนยันการเช็คชื่อวันที่ ${new Date(date).toLocaleDateString("th-TH")}?`)) {
      return;
    }

    try {
      await markDutyAsDone(selectedCourse.courseID, studentID, date);

      // Update local state
      setTaDutiesList(prevList =>
        prevList.map(item => {
          if (item.ta.studentID === studentID) {
            return {
              ...item,
              duties: item.duties.map(duty =>
                duty.date === date ? { ...duty, isChecked: true, status: "Done" } : duty // Assuming 'Done' is the status string backend sets, or just use isChecked
              )
            };
          }
          return item;
        })
      );
    } catch (error) {
      alert("Failed to mark duty as done");
    }
  };

  // -- RENDER: Course List --
  if (viewMode === "courses") {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            เลือกรายวิชาเพื่อตรวจสอบชั่วโมงงาน
          </h1>
          <p className="text-gray-600">
            เลือกรายวิชาที่ต้องการตรวจสอบบันทึกการปฏิบัติงานของ TA
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">กำลังโหลดรายวิชา...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">ไม่พบรายวิชาที่สอน</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.courseID}
                  onClick={() => handleCourseSelect(course)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#E35205] cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-[#E35205] transition-colors">
                      <BookOpen size={24} className="text-[#E35205] group-hover:text-white transition-colors" />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {course.courseProgram}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {course.courseCode}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-1">{course.courseName}</p>

                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{course.classday}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }



  // -- RENDER: Duties View --

  // Pivot data for Matrix View
  // 1. Get all unique dates
  const allDatesSet = new Set<string>();
  taDutiesList.forEach(item => {
    item.duties.forEach(duty => allDatesSet.add(duty.date));
  });
  const sortedDates = Array.from(allDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Filter dates by Selected Month
  const filteredDates = sortedDates.filter(dateStr => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });

  return (
    <div className="p-8">
      <button
        onClick={handleBackToCourses}
        className="flex items-center gap-2 text-gray-600 hover:text-[#E35205] mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        กลับไปหน้ารายวิชา
      </button>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCourse?.courseCode} - {selectedCourse?.courseName}
            </h1>
          </div>
          <p className="text-gray-600">
            ตรวจสอบชั่วโมงงาน TA (Student ID)
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-orange-50 text-gray-600 hover:text-[#E35205] rounded transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-gray-800 min-w-[150px] text-center">
            {currentMonth.toLocaleDateString("th-TH", { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-orange-50 text-gray-600 hover:text-[#E35205] rounded transition-colors">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">กำลังโหลดข้อมูลการทำงาน...</p>
        </div>
      ) : taDutiesList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">ไม่พบ TA ที่ผ่านการอนุมัติในรายวิชานี้ หรือยังไม่มีข้อมูลการทำงาน</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#E35205] text-white font-bold border-b border-orange-600">
              <tr>
                <th className="px-6 py-4 sticky left-0 bg-[#E35205] z-10 border-r border-orange-400 min-w-[200px]">
                  วันที่
                </th>
                {taDutiesList.map((data) => (
                  <th key={data.ta.studentID} className="px-6 py-4 text-center min-w-[120px] border-r border-orange-400 last:border-r-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        {/* Only Student ID as requested */}
                        <span className="text-sm font-bold">{data.ta.studentID}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {filteredDates.length === 0 ? (
                <tr>
                  <td colSpan={taDutiesList.length + 1} className="px-6 py-12 text-center text-gray-500">
                    ไม่มีข้อมูลในเดือนนี้
                  </td>
                </tr>
              ) : (
                filteredDates.map((dateString) => (
                  <tr key={dateString} className="hover:bg-orange-50 transition-colors">
                    {/* Date Column */}
                    <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">
                      {new Date(dateString).toLocaleDateString("th-TH", {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short' // Short month to save space
                      })}
                    </td>

                    {/* Duty Cells for each TA */}
                    {taDutiesList.map((data) => {
                      const duty = data.duties.find(d => d.date === dateString);
                      return (
                        <td key={`${data.ta.studentID}-${dateString}`} className="px-6 py-4 text-center border-r border-gray-100 last:border-r-0">
                          {duty ? (
                            <div className="flex justify-center">
                              {duty.isChecked ? (
                                <div className="text-green-600">
                                  <CheckCircle size={20} />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMarkDone(data.ta.studentID, duty.date)}
                                  className="w-6 h-6 rounded border-2 border-gray-300 hover:border-[#E35205] hover:bg-orange-50 flex items-center justify-center transition-all group"
                                  title="Check"
                                >
                                  {/* Empty checkbox style, check on hover */}
                                  <div className="w-3 h-3 rounded-sm bg-[#E35205] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}