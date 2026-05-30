import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/* ============================================
   Toast Notification System
   ============================================ */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-accent-500" />,
  error: <AlertCircle className="w-5 h-5 text-danger-500" />,
  info: <Info className="w-5 h-5 text-info-500" />,
  warning: <AlertCircle className="w-5 h-5 text-warning-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'border-accent-500/30 bg-accent-50 dark:bg-accent-950/50',
  error: 'border-danger-500/30 bg-danger-50 dark:bg-danger-950/50',
  info: 'border-info-500/30 bg-info-50 dark:bg-info-950/50',
  warning: 'border-warning-500/30 bg-warning-50 dark:bg-warning-950/50',
};

// Global toast state
let toastListeners: Array<(toasts: ToastMessage[]) => void> = [];
let currentToasts: ToastMessage[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...currentToasts]));
}

export function toast(type: ToastType, message: string, duration = 3000) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const newToast: ToastMessage = { id, type, message, duration };
  currentToasts = [...currentToasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      currentToasts = currentToasts.filter((t) => t.id !== id);
      notifyListeners();
    }, duration);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
            animate-[slide-down_0.3s_ease-out] pointer-events-auto
            ${bgColors[t.type]}
          `}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm font-medium text-[var(--text-primary)]">
            {t.message}
          </p>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
