import { useState, useEffect } from 'react';
import {
    History, Calendar, ChevronRight, Loader2, AlertCircle,
    Download, X, CheckSquare, Square, FileSpreadsheet, ArrowLeft, FileText,
    Search, ArrowUpDown, BookOpen
} from 'lucide-react';

import { API_BASE_URL } from '../../config/env';

const API_BASE = API_BASE_URL;

interface SemesterHistory {
    semesterID: number;
    semesterValue: string;
    startDate: string;
    endDate: string;
    courseCount: number;
}

interface Course {
    courseID: number;
    courseCode: string;
    courseName: string;
    courseProgram: string;
    section: string;
    professorName: string;
    semester: string;
    workHour: number;
    classStart: string;
    classEnd: string;
}

interface AvailableMonth {
    monthID: number;
    monthName: string;
    year: number;
}

const THAI_MONTHS: Record<string, string> = {
    january: 'มกราคม', february: 'กุมภาพันธ์', march: 'มีนาคม',
    april: 'เมษายน', may: 'พฤษภาคม', june: 'มิถุนายน',
    july: 'กรกฎาคม', august: 'สิงหาคม', september: 'กันยายน',
    october: 'ตุลาคม', november: 'พฤศจิกายน', december: 'ธันวาคม',
};
function thaiMonth(m: string) { return THAI_MONTHS[m.toLowerCase().trim()] ?? m; }

function formatDate(d: string) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function daysSince(d: string) {
    return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

// ─── export panel (shown after clicking a term row) ────────────────────────
function CourseExportPanel({ semester, onBack }: {
    semester: SemesterHistory;
    onBack: () => void;
}) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<number[]>([]);

    // filters & sort
    const [search, setSearch] = useState('');
    const [curriculumFilter, setCurriculumFilter] = useState('all');
    const [sortOption, setSortOption] = useState('code_asc');

    // export modal state
    const [showModal, setShowModal] = useState(false);
    const [hourlyRate, setHourlyRate] = useState(100);
    const [months, setMonths] = useState<AvailableMonth[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<AvailableMonth | null>(null);
    const [loadingMonths, setLoadingMonths] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportMsg, setExportMsg] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/course/history/${semester.semesterID}`, { credentials: 'include' });
                if (!res.ok) throw new Error();
                const json = await res.json();
                setCourses(json.data ?? []);
            } catch {
                setError('ไม่สามารถโหลดรายวิชาได้');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [semester.semesterID]);

    const filtered = courses
        .filter(c => {
            const matchSearch =
                c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
                c.courseName.toLowerCase().includes(search.toLowerCase());
            let matchCurriculum = true;
            if (curriculumFilter !== 'all') {
                const prog = (c.courseProgram ?? '').toLowerCase();
                if (curriculumFilter === 'General')
                    matchCurriculum = prog.includes('general') || prog.includes('ปกติ') || prog.includes('ทั่วไป');
                else if (curriculumFilter === 'Continuing')
                    matchCurriculum = prog.includes('continuing') || prog.includes('ต่อเนื่อง');
                else if (curriculumFilter === 'International')
                    matchCurriculum = prog.includes('international') || prog.includes('นานาชาติ');
            }
            return matchSearch && matchCurriculum;
        })
        .sort((a, b) => {
            if (sortOption === 'code_asc') return a.courseCode.localeCompare(b.courseCode);
            if (sortOption === 'code_desc') return b.courseCode.localeCompare(a.courseCode);
            if (sortOption === 'name_asc') return a.courseName.localeCompare(b.courseName);
            if (sortOption === 'name_desc') return b.courseName.localeCompare(a.courseName);
            return 0;
        });

    const toggle = (id: number) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const toggleAll = () =>
        setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.courseID));

    const openModal = async () => {
        if (selected.length === 0) return;
        setShowModal(true);
        setLoadingMonths(true);
        try {
            const res = await fetch(
                `${API_BASE}/lookup/available-months?month=${selected[0]}`,
                { credentials: 'include' }
            );
            const data: AvailableMonth[] = await res.json();
            setMonths(data);
            if (data.length > 0) setSelectedMonth(data[0]);
        } catch { /* ignore */ }
        finally { setLoadingMonths(false); }
    };

    const confirmExport = async () => {
        if (!selectedMonth || selected.length === 0) return;
        setShowModal(false);
        setExporting(true);
        let ok = 0; let fail = 0;
        for (const courseID of selected) {
            setExportMsg(`กำลังส่งออก ${++ok + fail}/${selected.length}…`);
            try {
                const res = await fetch(`${API_BASE}/ta_duty/export-payment-report`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseID, hourlyRate, month: selectedMonth.monthID, year: selectedMonth.year }),
                });
                if (!res.ok) throw new Error();
                const course = courses.find(c => c.courseID === courseID);
                const blob = await res.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `ตารางเบิกเงิน_${course?.courseCode ?? courseID}_${thaiMonth(selectedMonth.monthName)}.xlsx`;
                a.click();
                URL.revokeObjectURL(a.href);
                await new Promise(r => setTimeout(r, 300));
            } catch { fail++; }
        }
        setExporting(false);
        setExportMsg(fail === 0 ? `✅ ส่งออกสำเร็จ ${ok} รายวิชา` : `⚠️ สำเร็จ ${ok}, ไม่สำเร็จ ${fail}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="animate-spin text-orange-500" size={36} />
        </div>
    );
    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={22} /><p className="text-red-800">{error}</p>
        </div>
    );

    return (
        <div>
            {/* Back button + header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FileText size={22} className="text-orange-600" />
                        รายวิชา — {semester.semesterValue}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(semester.startDate)} – {formatDate(semester.endDate)} &nbsp;·&nbsp; {courses.length} รายวิชา
                    </p>
                </div>
            </div>

            {/* Toolbar — search, filter, sort, export action */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

                    {/* Search */}
                    <div className="w-full lg:flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    {/* Filter + Sort */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                        {/* Curriculum filter */}
                        <div className="bg-gray-100 p-1 rounded-lg flex overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'General', label: 'ปกติ' },
                                { id: 'Continuing', label: 'ต่อเนื่อง' },
                                { id: 'International', label: 'นานาชาติ' },
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setCurriculumFilter(f.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${curriculumFilter === f.id
                                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div className="relative min-w-[180px]">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                <ArrowUpDown size={15} />
                            </div>
                            <select
                                value={sortOption}
                                onChange={e => setSortOption(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white appearance-none cursor-pointer text-sm font-medium text-gray-700 hover:border-orange-300 transition-colors"
                            >
                                <option value="code_asc">รหัสวิชา (น้อย-มาก)</option>
                                <option value="code_desc">รหัสวิชา (มาก-น้อย)</option>
                                <option value="name_asc">ชื่อวิชา (A-Z)</option>
                                <option value="name_desc">ชื่อวิชา (Z-A)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selection count + export button */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        เลือกแล้ว {selected.length} รายวิชา จากทั้งหมด {filtered.length} รายวิชา
                    </p>
                    <button
                        onClick={openModal}
                        disabled={selected.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        <Download size={16} />
                        ส่งออกรายงานการเบิกจ่าย
                    </button>
                </div>
            </div>

            {/* Export status */}
            {(exporting || exportMsg) && (
                <div className={`mb-4 rounded-lg p-3 text-sm flex items-center justify-between ${exporting ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    <span>{exporting ? <><Loader2 className="inline animate-spin mr-2" size={16} />{exportMsg}</> : exportMsg}</span>
                    {!exporting && <button onClick={() => setExportMsg('')}><X size={16} /></button>}
                </div>
            )}

            {/* Course list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Select-all header */}
                <div className="border-b border-gray-200 bg-slate-50 px-6 py-3">
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-2 text-sm hover:text-[#E35205]"
                    >
                        {filtered.length > 0 && filtered.every(c => selected.includes(c.courseID))
                            ? <CheckSquare size={18} className="text-[#E35205]" />
                            : <Square size={18} />}
                        <span>เลือกทั้งหมด ({filtered.length})</span>
                    </button>
                </div>

                <div className="divide-y divide-gray-200">
                    {filtered.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            ไม่พบข้อมูลรายวิชา
                        </div>
                    ) : (
                        filtered.map(c => {
                            const isSelected = selected.includes(c.courseID);
                            const prog = (c.courseProgram ?? '').toLowerCase();
                            const isGeneral = prog.includes('general') || prog.includes('ปกติ') || prog.includes('ทั่วไป');
                            const isContinuing = prog.includes('continuing') || prog.includes('ต่อเนื่อง');

                            return (
                                <div
                                    key={c.courseID}
                                    onClick={() => toggle(c.courseID)}
                                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-[#fff1ec]' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {isSelected
                                                ? <CheckSquare size={20} className="text-[#E35205]" />
                                                : <Square size={20} className="text-gray-400" />}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="font-bold text-[#E35205]">{c.courseCode}</p>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                                        Sec {c.section}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${isGeneral
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : isContinuing
                                                            ? 'bg-purple-50 text-purple-700'
                                                            : 'bg-green-50 text-green-700'
                                                        }`}>
                                                        {isGeneral ? 'หลักสูตรปกติ' : isContinuing ? 'หลักสูตรต่อเนื่อง' : 'หลักสูตรนานาชาติ'}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-100">
                                                        {c.semester}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-gray-900 mb-1">{c.courseName}</p>
                                                <p className="text-sm text-gray-500">อาจารย์ผู้สอน: {c.professorName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>


            {/* Export settings modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet size={20} className="text-orange-600" />
                                <h3 className="font-semibold text-gray-800">Export รายงานการเบิกจ่าย</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รายวิชาที่เลือก ({selected.length} รายการ)
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                    {selected.map(id => {
                                        const c = courses.find(x => x.courseID === id);
                                        return (
                                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200">
                                                {c?.courseCode ?? id}
                                                <button onClick={(e) => { e.stopPropagation(); toggle(id); }}><X size={12} /></button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">อัตราค่าตอบแทน (บาท/ชั่วโมง)</label>
                                <input
                                    type="number"
                                    value={hourlyRate}
                                    onChange={e => setHourlyRate(+e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เดือนที่ต้องการส่งออก</label>
                                {loadingMonths ? (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="animate-spin" size={16} />กำลังโหลด...</div>
                                ) : months.length === 0 ? (
                                    <p className="text-sm text-gray-400">ไม่พบข้อมูลชั่วโมงในรายวิชาที่เลือก</p>
                                ) : (
                                    <select
                                        value={selectedMonth ? `${selectedMonth.monthID}-${selectedMonth.year}` : ''}
                                        onChange={e => {
                                            const [mID, yr] = e.target.value.split('-').map(Number);
                                            setSelectedMonth(months.find(m => m.monthID === mID && m.year === yr) ?? null);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        {months.map(m => (
                                            <option key={`${m.monthID}-${m.year}`} value={`${m.monthID}-${m.year}`}>
                                                {thaiMonth(m.monthName)} {m.year}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                ยกเลิก
                            </button>
                            <button onClick={confirmExport}
                                disabled={!selectedMonth || hourlyRate <= 0}
                                className="px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center gap-2">
                                <Download size={16} />
                                ยืนยันการ Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── main page ──────────────────────────────────────────────────────────────
export function TermHistory() {
    const [history, setHistory] = useState<SemesterHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<SemesterHistory | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/course/history`, { credentials: 'include' });
                if (!res.ok) throw new Error();
                const json = await res.json();
                setHistory(json.data ?? []);
            } catch {
                setError('ไม่สามารถโหลดข้อมูลประวัติภาคการศึกษาได้');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (selected) {
        return <CourseExportPanel semester={selected} onBack={() => setSelected(null)} />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="inline-block animate-spin h-12 w-12 text-orange-500 mb-4" />
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <History size={28} className="text-orange-600" />
                    <h2 className="text-2xl font-semibold text-gray-800">ประวัติภาคการศึกษาที่ผ่านมา</h2>
                </div>
                <p className="text-gray-600 ml-10">
                    คลิกที่ภาคการศึกษาเพื่อดูรายวิชาและ Export รายงานการเบิกจ่าย
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <History size={22} className="text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">ภาคการศึกษาที่สิ้นสุดแล้ว</p>
                        <p className="text-2xl font-bold text-gray-800">{history.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen size={22} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">รายวิชาทั้งหมด (ทุกภาค)</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {history.reduce((s, x) => s + x.courseCount, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            {history.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                    <History size={48} className="mx-auto mb-3 opacity-30" />
                    <p>ยังไม่มีภาคการศึกษาที่สิ้นสุด</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* desktop */}
                    <table className="w-full hidden md:table">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ภาคการศึกษา</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> วันเริ่ม</span>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> วันสิ้นสุด</span>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">รายวิชา</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สิ้นสุดไปแล้ว</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map(sem => {
                                const days = daysSince(sem.endDate);
                                const isRecent = days <= 30;
                                return (
                                    <tr key={sem.semesterID}
                                        onClick={() => setSelected(sem)}
                                        className="hover:bg-orange-50 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{sem.semesterValue}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(sem.startDate)}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(sem.endDate)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                <BookOpen size={12} />{sem.courseCount} รายวิชา
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isRecent ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                }`}>
                                                {days} วัน
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                                                ดูรายวิชา <ChevronRight size={14} />
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* mobile cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {history.map(sem => {
                            const days = daysSince(sem.endDate);
                            const isRecent = days <= 30;
                            return (
                                <div key={sem.semesterID}
                                    onClick={() => setSelected(sem)}
                                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{sem.semesterValue}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatDate(sem.startDate)} – {formatDate(sem.endDate)}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">{sem.courseCount} รายวิชา</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isRecent ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {days} วัน
                                        </span>
                                        <ChevronRight size={16} className="text-orange-500" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <p className="mt-4 text-xs text-gray-400 text-center">
                คลิกที่แถวเพื่อดูรายวิชาและ Export รายงานการเบิกจ่ายของภาคการศึกษานั้น
            </p>
        </div>
    );
}

export default TermHistory;
