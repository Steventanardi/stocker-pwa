import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, parse } from 'date-fns';

/* ============================================
   Month Selector Component
   ============================================ */

interface MonthSelectorProps {
  currentMonth: string; // 'YYYY-MM'
  onChange: (newMonth: string) => void;
}

export default function MonthSelector({ currentMonth, onChange }: MonthSelectorProps) {
  const date = parse(currentMonth, 'yyyy-MM', new Date());

  const handlePrev = () => {
    onChange(format(subMonths(date, 1), 'yyyy-MM'));
  };

  const handleNext = () => {
    onChange(format(addMonths(date, 1), 'yyyy-MM'));
  };

  const isCurrentMonth = currentMonth === format(new Date(), 'yyyy-MM');

  return (
    <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-1 shadow-sm">
      <button
        onClick={handlePrev}
        className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col items-center px-4 cursor-pointer">
        <span className="text-sm font-bold text-[var(--text-primary)]">
          {format(date, 'MMMM yyyy')}
        </span>
        {isCurrentMonth && (
          <span className="text-[10px] font-medium text-primary-600 uppercase tracking-wider">
            Current Month
          </span>
        )}
      </div>

      <button
        onClick={handleNext}
        className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
