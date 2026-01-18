import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: AlertCircle,
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const iconColors = {
        success: 'text-green-600',
        error: 'text-red-600',
        info: 'text-blue-600',
    };

    const Icon = icons[type];

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${colors[type]} border rounded-lg shadow-lg p-4 pr-12 max-w-md relative`}>
                <div className="flex items-start gap-3">
                    <Icon className={`${iconColors[type]} flex-shrink-0 mt-0.5`} size={20} />
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
