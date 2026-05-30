import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/* ============================================
   Modal Component
   ============================================ */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4" 
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--bg-overlay)] animate-[fade-in_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-[var(--bg-modal)] rounded-2xl shadow-xl
          animate-[scale-in_0.2s_ease-out]
          max-h-[90vh] flex flex-col
          border border-[var(--border-default)]
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
