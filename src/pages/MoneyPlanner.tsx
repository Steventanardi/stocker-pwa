import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, LayoutList } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import MonthSelector from '@/components/money/MonthSelector';
import TransactionForm from '@/components/money/TransactionForm';
import TransactionCard from '@/components/money/TransactionCard';
import { useMoneyStore } from '@/stores/moneyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { TransactionType } from '@/db/types';
import { formatCurrency } from '@/utils/currency';

/* ============================================
   Money Planner Page
   ============================================ */

export default function MoneyPlanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions, filters, monthlyIncome, monthlyExpenses, setFilters, loadTransactions, loadCategories } = useMoneyStore();
  const { currency } = useSettingsStore();

  const selectedMonth = filters.month;
  const setMonth = (month: string) => setFilters({ month });
  const totalIncome = monthlyIncome;
  const totalExpense = monthlyExpenses;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [initialType, setInitialType] = useState<TransactionType>(TransactionType.Expense);

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, [loadTransactions, loadCategories]);

  // Handle ?action=income or ?action=expense from FAB
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'income' || action === 'expense') {
      handleAddNew(action as TransactionType);
      setSearchParams({}); // Clear it
    }
  }, [searchParams, setSearchParams]);

  const handleAddNew = (type: TransactionType = TransactionType.Expense) => {
    setEditingId(undefined);
    setInitialType(type);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const balance = totalIncome - totalExpense;

  // Group transactions by date for better display (optional enhancement)
  // For now, just sort by date desc
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="max-w-4xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <Header 
        title="Money Planner" 
        subtitle="Track your income and expenses"
        actions={
          <div className="hidden sm:flex gap-2">
            <Button variant="success" onClick={() => handleAddNew(TransactionType.Income)}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Income
            </Button>
            <Button variant="danger" onClick={() => handleAddNew(TransactionType.Expense)}>
              <TrendingDown className="w-4 h-4 mr-2" />
              Expense
            </Button>
          </div>
        }
      />

      <div className="mb-6 max-w-sm mx-auto sm:mx-0">
        <MonthSelector currentMonth={selectedMonth} onChange={setMonth} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 text-center shadow-sm">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Income</p>
          <p className="text-sm sm:text-xl font-bold text-success-600 dark:text-success-500">
            {formatCurrency(totalIncome, currency)}
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 text-center shadow-sm">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Expenses</p>
          <p className="text-sm sm:text-xl font-bold text-danger-600 dark:text-danger-500">
            {formatCurrency(totalExpense, currency)}
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl border border-primary-500/30 p-4 text-center shadow-sm bg-primary-50/50 dark:bg-primary-900/10">
          <p className="text-xs sm:text-sm text-primary-700 dark:text-primary-400 font-medium mb-1">Balance</p>
          <p className={`text-sm sm:text-xl font-bold ${balance >= 0 ? 'text-[var(--text-primary)]' : 'text-danger-600'}`}>
            {formatCurrency(balance, currency)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Transactions</h3>
        <span className="text-sm text-[var(--text-tertiary)]">{transactions.length} entries</span>
      </div>

      {sortedTransactions.length > 0 ? (
        <div className="space-y-3">
          {sortedTransactions.map(tx => (
            <TransactionCard 
              key={tx.id} 
              transaction={tx} 
              onEdit={() => handleEdit(tx.id)} 
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<LayoutList className="w-8 h-8 text-[var(--text-tertiary)]" />}
          title="No transactions this month"
          description="Start tracking by adding your income and expenses."
          actionLabel="Add Expense"
          onAction={() => handleAddNew(TransactionType.Expense)}
        />
      )}

      {/* Form Modal */}
      <TransactionForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        transactionId={editingId}
        initialType={initialType}
      />
    </div>
  );
}
