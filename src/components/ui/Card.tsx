/* ============================================
   Card Component
   ============================================ */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export default function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]
        shadow-xs transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-[var(--border-hover)] cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
