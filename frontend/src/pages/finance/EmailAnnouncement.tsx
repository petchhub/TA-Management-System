import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Users,
  BookOpen,
  User,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  getAllCoursesForFinance,
  sendEmailAll,
  sendEmailCourse,
  sendEmailIndividual,
  getEmailHistory,
  Course,
  EmailHistory
} from "../../services/courseService";
import { searchStudents } from "../../services/lookupService";

export function EmailAnnouncement() {
  const [recipientType, setRecipientType] = useState<
    "all" | "course" | "individual"
  >("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedIndividual, setSelectedIndividual] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<{ id: number, name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [emailLogs, setEmailLogs] = useState<EmailHistory[]>([]);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });



  useEffect(() => {
    fetchCourses();
    fetchEmailLogs();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getAllCoursesForFinance();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const data = await getEmailHistory();
      setEmailLogs(data || []);
    } catch (error) {
      console.error("Error fetching email history:", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (selectedIndividual && recipientType === 'individual') {
        if (selectedIndividual.length >= 2) {
          setIsSearching(true);
          try {
            const results = await searchStudents(selectedIndividual);
            setSearchResults(results || []);
            setShowDropdown(true);
          } catch (error) {
            console.error("Search failed", error);
          } finally {
            setIsSearching(false);
          }
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedIndividual, recipientType]);

  const selectStudent = (student: { id: number, name: string }) => {
    setSelectedIndividual(`${student.id} ${student.name}`);
    setSelectedStudentId(student.id);
    setShowDropdown(false);
  };

  const handleSendEmail = async () => {
    if (!subject || !message) {
      setAlertState({
        isOpen: true,
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุหัวข้อและข้อความ',
        type: 'error'
      });
      return;
    }

    if (recipientType === "course" && !selectedCourse) {
      setAlertState({
        isOpen: true,
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาเลือกรายวิชา',
        type: 'error'
      });
      return;
    }

    if (recipientType === "individual" && !selectedIndividual) {
      setAlertState({
        isOpen: true,
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุรหัสนิสิตหรือชื่อ',
        type: 'error'
      });
      return;
    }

    if (recipientType === "individual" && !selectedStudentId) {
      setAlertState({
        isOpen: true,
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาเลือกผู้ช่วยสอนจากรายการค้นหา',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      if (recipientType === "all") {
        await sendEmailAll({ subject, body: message });
      } else if (recipientType === "course") {
        await sendEmailCourse({
          subject,
          body: message,
          courseId: parseInt(selectedCourse)
        });
      } else if (recipientType === "individual" && selectedStudentId) {
        await sendEmailIndividual({
          subject,
          body: message,
          studentID: selectedStudentId
        });
      }

      setAlertState({
        isOpen: true,
        title: 'สำเร็จ',
        message: 'ส่งอีเมลเรียบร้อยแล้ว',
        type: 'success'
      });
      // Clear form
      setSubject("");
      setMessage("");
      setSelectedCourse("");
      setSelectedIndividual("");

      // Refresh logs
      fetchEmailLogs();

    } catch (error) {
      console.error("Failed to send email:", error);
      setAlertState({
        isOpen: true,
        title: 'เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการส่งอีเมล',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const isSuccessStatus = (status: string) => {
    return ["successful", "success", "sent"].includes(status.toLowerCase());
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl mb-2">ส่งอีเมลประกาศ</h2>
        <p className="text-gray-600">
          ส่งประกาศและแจ้งเตือนให้กับผู้ช่วยสอนผ่านทางอีเมล
        </p>
      </div>

      {/* Email Composition */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail size={20} className="text-gray-600" />
          <h3 className="text-lg">สร้างอีเมลใหม่</h3>
        </div>

        {/* Recipient Type Selection */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-3">
            เลือกผู้รับ
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setRecipientType("all")}
              className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${recipientType === "all"
                ? "border-[#E35205] bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <Users
                size={20}
                className={
                  recipientType === "all"
                    ? "text-[#E35205]"
                    : "text-gray-600"
                }
              />
              <div className="text-left">
                <p className="font-medium">ส่งถึงทั้งหมด</p>
                <p className="text-xs text-gray-600">
                  ผู้ช่วยสอนทุกคน
                </p>
              </div>
            </button>

            <button
              onClick={() => setRecipientType("course")}
              className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${recipientType === "course"
                ? "border-[#E35205] bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <BookOpen
                size={20}
                className={
                  recipientType === "course"
                    ? "text-[#E35205]"
                    : "text-gray-600"
                }
              />
              <div className="text-left">
                <p className="font-medium">ส่งเฉพาะรายวิชา</p>
                <p className="text-xs text-gray-600">
                  เลือกตามรายวิชา
                </p>
              </div>
            </button>

            <button
              onClick={() => setRecipientType("individual")}
              className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${recipientType === "individual"
                ? "border-[#E35205] bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <User
                size={20}
                className={
                  recipientType === "individual"
                    ? "text-[#E35205]"
                    : "text-gray-600"
                }
              />
              <div className="text-left">
                <p className="font-medium">ส่งเฉพาะบุคคล</p>
                <p className="text-xs text-gray-600">
                  ค้นหาด้วยชื่อ หรือรหัสนิสิต
                </p>
              </div>
            </button>
          </div>
        </div >

        {/* Course Selection */}
        {
          recipientType === "course" && (
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                เลือกรายวิชา
              </label>
              <select
                value={selectedCourse}
                onChange={(e) =>
                  setSelectedCourse(e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              >
                <option value="">-- เลือกรายวิชา --</option>
                {courses.map((course) => (
                  <option key={course.courseID} value={course.courseID}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          )
        }

        {/* Individual Search */}
        {
          recipientType === "individual" && (
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                ค้นหาผู้ช่วยสอน
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={selectedIndividual}
                  onChange={(e) => {
                    setSelectedIndividual(e.target.value);
                    setSelectedStudentId(null);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  placeholder="ระบุรหัสนิสิต หรือ ชื่อ-นามสกุล..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
                {/* Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <button
                        key={student.id}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col"
                        onClick={() => selectStudent(student)}
                      >
                        <span className="font-medium text-gray-900">{student.name}</span>
                        <span className="text-sm text-gray-500">{student.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                * ระบบจะค้นหาจากฐานข้อมูลและส่งไปยังอีเมลของผู้ที่ตรงกับข้อมูล
              </p>
              {showDropdown && (
                <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)}></div>
              )}
            </div>
          )
        }

        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            หัวข้อ
          </label>
          <input
            type="text"
            placeholder="เช่น แจ้งเตือนการเซ็นชื่อเบิกจ่ายค่าตอบแทน"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          />
        </div>

        {/* Message Body */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            ข้อความ
          </label>
          <textarea
            rows={6}
            placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          />
        </div>

        {/* Quick Templates */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            เทมเพลตด่วน
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSubject(
                  "แจ้งเตือน: มาเซ็นชื่อเบิกจ่ายค่าตอบแทน",
                );
                setMessage(
                  "เรียน ผู้ช่วยสอน\n\nกรุณามาเซ็นชื่อเบิกจ่ายค่าตอบแทนประจำเดือน ณ สำนักงานคณะ\n\nขอบคุณครับ/ค่ะ",
                );
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              เซ็นชื่อเบิกจ่าย
            </button>
            <button
              onClick={() => {
                setSubject("แจ้งแก้ไขเอกสาร");
                setMessage(
                  "เรียน ผู้ช่วยสอน\n\nพบปัญหาในเอกสารหรือชั่วโมงงาน กรุณาติดต่อสำนักงานเพื่อดำเนินการแก้ไข\n\nขอบคุณครับ/ค่ะ",
                );
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              แจ้งแก้ไขเอกสาร
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendEmail}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send size={18} />
          )}
          {loading ? "กำลังส่ง..." : "ส่งอีเมล"}
        </button>
      </div >

      {/* Email Log */}
      < div className="bg-white rounded-lg shadow p-6" >
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-600" />
          <h3 className="text-lg">ประวัติการส่งอีเมล</h3>
        </div>
        <div className="space-y-3">
          {emailLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    {log.subject}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    ถึง: {log.receivedName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createDate).toLocaleString('th-TH')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${isSuccessStatus(log.status)
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {log.status}
                </span>
              </div>
            </div>
          ))}
          {emailLogs.length === 0 && (
            <p className="text-center text-gray-500 py-4">ไม่พบประวัติการส่งอีเมล</p>
          )}
        </div>
      </div >
      <AlertDialog open={alertState.isOpen} onOpenChange={(open) => setAlertState(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertState.type === 'success' ? (
                <CheckCircle2 className="text-green-500" size={24} />
              ) : (
                <AlertCircle className="text-red-500" size={24} />
              )}
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
              className={alertState.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}