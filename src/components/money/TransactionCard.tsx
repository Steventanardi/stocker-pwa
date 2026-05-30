import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import type { TransactionWithCategory } from '@/db/types';
import { TransactionType } from '@/db/types';
import { formatCurrency } from '@/utils/currency';
import { useSettingsStore } from '@/stores/settingsStore';
import { useMoneyStore } from '@/stores/moneyStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

/* ============================================
   Transaction Card (Mobile-friendly list item)
   ============================================ */

interface TransactionCardProps {
  transaction: TransactionWithCategory;
  onEdit: () => void;
}

export default function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  const { currency } = useSettingsStore();
  const { deleteTransaction } = useMoneyStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isIncome = transaction.type === TransactionType.Income;

  const handleDelete = async () => {
    await deleteTransaction(transaction.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-shadow relative group">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${isIncome ? 'bg-success-50 text-success-600 dark:bg-success-900/30' : 'bg-danger-50 text-danger-600 dark:bg-danger-900/30'}
          `}>
            {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
          
          <div className="min-w-0 pr-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {transaction.categoryName}
            </h4>
            <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 truncate">
              <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
              <span>•</span>
              <span className="truncate">{transaction.notes || transaction.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`text-right font-bold ${isIncome ? 'text-success-600 dark:text-success-500' : 'text-[var(--text-primary)]'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency || currency)}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-surface-100 hover:text-[var(--text-primary)] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 w-32 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg z-20 py-1 animate-[fade-in_0.15s_ease-out]">
                  <button
                    onClick={() => { setIsMenuOpen(false); onEdit(); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-surface-100 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setIsDeleteDialogOpen(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
