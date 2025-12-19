import { CheckCircle, Clock, XCircle } from 'lucide-react';

type Status = 'pending' | 'approved' | 'rejected';

interface StatusCardProps {
  status: Status;
}

export default function StatusCard({ status }: StatusCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: 'รอการอนุมัติ',
      description: 'ใบสมัครของคุณอยู่ระหว่างการพิจารณา',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900'
    },
    approved: {
      icon: CheckCircle,
      title: 'อนุมัติแล้ว',
      description: 'คุณได้รับอนุมัติให้ปฏิบัติหน้าที่ TA แล้ว',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    rejected: {
      icon: XCircle,
      title: 'ไม่อนุมัติ',
      description: 'ใบสมัครของคุณไม่ได้รับการอนุมัติ กรุณาติดต่ออาจารย์',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-xl p-5 mb-4 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className={`${config.textColor} mb-1`}>สถานะการสมัคร</h3>
          <p className={`${config.textColor} mb-2`}>{config.title}</p>
          <p className="text-gray-600">{config.description}</p>
        </div>
      </div>
    </div>
  );
}
