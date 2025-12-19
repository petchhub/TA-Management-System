import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export interface WorkHour {
  id: number;
  date: string;
  course: string;
  hours: number;
  status: "approved" | "pending";
  task: string;
  approvedBy: string | null;
}

interface WorkHourCardProps {
  workHour: WorkHour;
  onRequestCorrection: (id: number) => void;
}

export default function WorkHourCard({
  workHour,
  onRequestCorrection,
}: WorkHourCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {workHour.status === "approved" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
            <span
              className={`px-2 py-1 rounded text-xs ${workHour.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {workHour.status === "approved"
                ? "ตรวจสอบแล้ว"
                : "รอการตรวจสอบ"}
            </span>
          </div>
          <h3 className="text-gray-900">{workHour.course}</h3>
        </div>
        <div className="text-right">
          <p className="text-[var(--color-primary-600)]">
            {workHour.hours} ชม.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <span className="text-gray-600">วันที่:</span>
          <span className="text-gray-900">
            {new Date(workHour.date).toLocaleDateString(
              "th-TH",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-600">รายละเอียด:</span>
          <span className="text-gray-900">{workHour.task}</span>
        </div>
        {workHour.approvedBy && (
          <div className="flex items-start gap-2">
            <span className="text-gray-600">ตรวจโดย:</span>
            <span className="text-gray-900">
              {workHour.approvedBy}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onRequestCorrection(workHour.id)}
        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <AlertCircle className="w-4 h-4" />
        <span>ขอแก้ไข</span>
      </button>
    </div>
  );
}