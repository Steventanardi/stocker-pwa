/* ============================================
   ProgressBar Component
   ============================================ */

type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const barColors: Record<ProgressVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-accent-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Auto-determine variant based on percentage
  const effectiveVariant =
    variant === 'primary'
      ? percentage >= 100
        ? 'danger'
        : percentage >= 80
          ? 'warning'
          : 'primary'
      : variant;

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`
            h-full rounded-full ${barColors[effectiveVariant]}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
