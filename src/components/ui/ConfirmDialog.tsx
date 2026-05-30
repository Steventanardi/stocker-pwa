import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

/* ============================================
   ConfirmDialog Component
   ============================================ */

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center pt-2">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-4
            ${variant === 'danger'
              ? 'bg-danger-100 dark:bg-danger-900/30'
              : variant === 'warning'
                ? 'bg-warning-100 dark:bg-warning-900/30'
                : 'bg-primary-100 dark:bg-primary-900/30'
            }
          `}
        >
          <AlertTriangle
            className={`w-6 h-6 ${
              variant === 'danger'
                ? 'text-danger-600'
                : variant === 'warning'
                  ? 'text-warning-600'
                  : 'text-primary-600'
            }`}
          />
        </div>

        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>

        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'primary' ? 'primary' : 'danger'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
