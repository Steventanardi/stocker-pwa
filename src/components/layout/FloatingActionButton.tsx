import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, TrendingUp, TrendingDown, X } from 'lucide-react';

/* ============================================
   Floating Action Button (Mobile)
   ============================================ */

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Item',
      icon: Package,
      color: 'bg-primary-500 hover:bg-primary-600',
      onClick: () => {
        navigate('/inventory?action=add');
        setIsOpen(false);
      },
    },
    {
      label: 'Add Income',
      icon: TrendingUp,
      color: 'bg-accent-500 hover:bg-accent-600',
      onClick: () => {
        navigate('/money?action=income');
        setIsOpen(false);
      },
    },
    {
      label: 'Add Expense',
      icon: TrendingDown,
      color: 'bg-danger-500 hover:bg-danger-600',
      onClick: () => {
        navigate('/money?action=expense');
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-50" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 0.5rem)' }}>
      {/* Action items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-[fade-in_0.15s_ease-out]">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`
                flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl
                text-white font-medium text-sm shadow-lg
                transition-all duration-200 animate-[slide-up_0.2s_ease-out]
                ${action.color}
              `}
            >
              <action.icon className="w-5 h-5" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-2xl shadow-xl
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isOpen
            ? 'bg-surface-700 dark:bg-surface-600 rotate-45'
            : 'gradient-primary hover:shadow-2xl active:scale-95'
          }
        `}
        aria-label={isOpen ? 'Close quick actions' : 'Quick actions'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white -rotate-45" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
