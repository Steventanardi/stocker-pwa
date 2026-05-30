import { useState, useEffect } from 'react';
import { PiggyBank, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import MonthSelector from '@/components/money/MonthSelector';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { useBudgetStore } from '@/stores/budgetStore';
import { useMoneyStore } from '@/stores/moneyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatCurrency, CURRENCIES } from '@/utils/currency';
import { TransactionType, BudgetStatus } from '@/db/types';
import { toast } from '@/components/ui/Toast';

/* ============================================
   Budget Page
   ============================================ */

export default function Budget() {
  const { budgets, totalBudget, totalSpent, selectedMonth, setMonth, loadBudgets, addBudget, updateBudget, deleteBudget } = useBudgetStore();
  const { categories, loadCategories } = useMoneyStore();
  const { currency } = useSettingsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [formData, setFormData] = useState({ categoryId: '', limitAmount: 0, currency: currency });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, [loadBudgets, loadCategories]);

  // Only expense categories can have budgets
  const expenseCategories = categories.filter(c => c.type === TransactionType.Expense);
  
  // Available categories for new budgets (exclude those that already have a budget this month)
  const availableCategories = expenseCategories.filter(c => !budgets.some(b => b.categoryId === c.id));
  const categoryOptions = (editingId ? expenseCategories : availableCategories).map(c => ({ value: c.id, label: c.name }));

  const handleAddNew = () => {
    if (availableCategories.length === 0) {
      toast('error', 'All expense categories already have budgets for this month.');
      return;
    }
    setEditingId(undefined);
    setFormData({ categoryId: availableCategories[0].id, limitAmount: 0, currency: currency });
    setIsFormOpen(true);
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setFormData({ categoryId: budget.categoryId, limitAmount: budget.limitAmount, currency: budget.currency || currency });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.limitAmount <= 0) {
      toast('error', 'Budget limit must be greater than zero');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateBudget(editingId, formData.limitAmount, formData.currency);
        toast('success', 'Budget updated');
      } else {
        await addBudget(formData.categoryId, formData.limitAmount, formData.currency);
        toast('success', 'Budget created');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast('error', error.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await deleteBudget(deletingId);
      toast('success', 'Budget deleted');
    } catch (error) {
      toast('error', 'Failed to delete budget');
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingId(undefined);
    }
  };

  const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <Header 
        title="Budgets" 
        subtitle="Manage your monthly spending limits"
        actions={
          <Button variant="primary" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Budget
          </Button>
        }
      />

      <div className="mb-6 max-w-sm mx-auto sm:mx-0">
        <MonthSelector currentMonth={selectedMonth} onChange={setMonth} />
      </div>

      {budgets.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 sm:p-6 mb-8 shadow-sm">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Total Monthly Budget</h3>
          <div className="flex items-end gap-2 mb-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] leading-none">
              {formatCurrency(totalSpent, currency)}
            </h2>
            <span className="text-sm font-medium text-[var(--text-tertiary)] mb-1">
              / {formatCurrency(totalBudget, currency)}
            </span>
          </div>
          <ProgressBar 
            value={overallUsage} 
            variant={overallUsage >= 100 ? 'danger' : overallUsage >= 80 ? 'warning' : 'primary'} 
            size="md"
          />
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className="text-[var(--text-secondary)]">{overallUsage.toFixed(0)}% used</span>
            <span className={totalBudget - totalSpent < 0 ? 'text-danger-600' : 'text-success-600'}>
              {formatCurrency(totalBudget - totalSpent, currency)} remaining
            </span>
          </div>
        </div>
      )}

      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => (
            <div key={budget.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 shadow-sm relative group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    budget.status === BudgetStatus.OverBudget 
                      ? 'bg-danger-50 text-danger-600' 
                      : budget.status === BudgetStatus.NearLimit 
                        ? 'bg-warning-50 text-warning-600' 
                        : 'bg-primary-50 text-primary-600'
                  }`}>
                    {budget.status === BudgetStatus.OverBudget ? <AlertTriangle className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{budget.categoryName}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {budget.status === BudgetStatus.OverBudget ? 'Over Budget' : budget.status === BudgetStatus.NearLimit ? 'Near Limit' : 'On Track'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(budget)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-surface-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setDeletingId(budget.id); setIsDeleteDialogOpen(true); }} className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className="text-[var(--text-primary)]">{formatCurrency(budget.spent, currency)}</span>
                  <span className="text-[var(--text-tertiary)]">{formatCurrency(budget.limitAmount, currency)}</span>
                </div>
                <ProgressBar 
                  value={budget.usagePercentage} 
                  variant={budget.status === BudgetStatus.OverBudget ? 'danger' : budget.status === BudgetStatus.NearLimit ? 'warning' : 'primary'} 
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<PiggyBank className="w-8 h-8 text-primary-500" />}
          title="No budgets set"
          description="Create budgets to monitor your spending and stay on track this month."
          actionLabel="Add Budget"
          onAction={handleAddNew}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Budget' : 'Add Budget'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categoryOptions}
            required
            disabled={!!editingId}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              options={CURRENCIES.map(c => ({ value: c.code, label: c.code }))}
              required
            />
            <Input
              label="Monthly Limit"
              type="number"
              min="0"
              step="0.01"
              value={formData.limitAmount || ''}
              onChange={(e) => setFormData({ ...formData, limitAmount: parseFloat(e.target.value) || 0 })}
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget limit? This won't delete any transactions."
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
}
