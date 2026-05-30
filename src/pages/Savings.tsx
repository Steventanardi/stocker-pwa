import { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { useSavingsStore } from '@/stores/savingsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatCurrency, CURRENCIES } from '@/utils/currency';
import { toast } from '@/components/ui/Toast';
import { GoalStatus } from '@/db/types';

/* ============================================
   Savings Goals Page
   ============================================ */

export default function Savings() {
  const { goals, loadGoals, addGoal, updateGoal, deleteGoal, addMoney } = useSavingsStore();
  const { currency } = useSettingsStore();

  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isTxFormOpen, setIsTxFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  
  // Goal Form Data
  const [goalData, setGoalData] = useState({ name: '', targetAmount: 0, deadline: '', currency: currency });
  
  // Tx Form Data
  const [txData, setTxData] = useState({ goalId: '', type: 'deposit' as 'deposit' | 'withdrawal', amount: 0, notes: '', currency: currency });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleAddNewGoal = () => {
    setEditingId(undefined);
    setGoalData({ name: '', targetAmount: 0, deadline: '', currency: currency });
    setIsGoalFormOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setEditingId(goal.id);
    setGoalData({ 
      name: goal.name, 
      targetAmount: goal.targetAmount, 
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      currency: goal.currency || currency
    });
    setIsGoalFormOpen(true);
  };

  const handleAddFunds = (goalId: string, goalCurrency: string) => {
    setTxData({ goalId, type: 'deposit', amount: 0, notes: '', currency: goalCurrency });
    setIsTxFormOpen(true);
  };

  const handleWithdrawFunds = (goalId: string, goalCurrency: string) => {
    setTxData({ goalId, type: 'withdrawal', amount: 0, notes: '', currency: goalCurrency });
    setIsTxFormOpen(true);
  };

  const submitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goalData.targetAmount <= 0 || !goalData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const parsedDeadline = goalData.deadline ? new Date(goalData.deadline) : undefined;
      
      if (editingId) {
        await updateGoal(editingId, { 
          name: goalData.name, 
          targetAmount: goalData.targetAmount, 
          deadline: parsedDeadline,
          currency: goalData.currency
        });
        toast('success', 'Goal updated');
      } else {
        await addGoal({ 
          name: goalData.name, 
          targetAmount: goalData.targetAmount,
          currentAmount: 0,
          status: GoalStatus.Active,
          deadline: parsedDeadline,
          currency: goalData.currency
        });
        toast('success', 'Goal created');
      }
      setIsGoalFormOpen(false);
    } catch (error) {
      toast('error', 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txData.amount <= 0) return;

    setIsSubmitting(true);
    try {
      const amount = txData.type === 'deposit' ? txData.amount : -txData.amount;
      await addMoney(txData.goalId, amount);
      toast('success', `${txData.type === 'deposit' ? 'Added' : 'Withdrew'} funds successfully`);
      setIsTxFormOpen(false);
    } catch (error: any) {
      toast('error', error.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await deleteGoal(deletingId);
      toast('success', 'Goal deleted');
    } catch (error) {
      toast('error', 'Failed to delete goal');
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingId(undefined);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <Header 
        title="Savings Goals" 
        subtitle="Track your financial targets"
        actions={
          <Button variant="primary" onClick={handleAddNewGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        }
      />

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 shadow-sm relative group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-500 flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{goal.name}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {goal.deadline ? `Target: ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditGoal(goal)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-surface-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setDeletingId(goal.id); setIsDeleteDialogOpen(true); }} className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-end justify-between mb-2">
                  <div className="text-2xl font-bold text-[var(--text-primary)] leading-none">
                    {formatCurrency(goal.currentAmount, currency)}
                  </div>
                  <div className="text-sm font-medium text-[var(--text-tertiary)] mb-0.5">
                    of {formatCurrency(goal.targetAmount, currency)}
                  </div>
                </div>
                <ProgressBar 
                  value={(goal.currentAmount / goal.targetAmount) * 100} 
                  variant={goal.status === GoalStatus.Completed ? 'success' : 'primary'} 
                  size="md"
                />
                
                <div className="flex justify-between mt-2 text-xs font-medium">
                  <span className="text-[var(--text-secondary)]">{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% complete</span>
                  {goal.status === GoalStatus.Completed ? (
                    <span className="text-success-600 font-bold">Goal Reached! 🎉</span>
                  ) : (
                    <span className="text-[var(--text-secondary)]">
                      {formatCurrency(goal.targetAmount - goal.currentAmount, currency)} left
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-default)] flex gap-2">
                <Button variant="secondary" className="flex-1 text-success-600 bg-success-50 hover:bg-success-100 dark:bg-success-900/20 dark:hover:bg-success-900/40 border-transparent" onClick={() => handleAddFunds(goal.id, goal.currency)}>
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => handleWithdrawFunds(goal.id, goal.currency)} disabled={goal.currentAmount <= 0}>
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<Target className="w-8 h-8 text-primary-500" />}
          title="No savings goals"
          description="Create your first savings goal to start tracking your progress towards your dreams."
          actionLabel="Create Goal"
          onAction={handleAddNewGoal}
        />
      )}

      {/* Goal Form Modal */}
      <Modal isOpen={isGoalFormOpen} onClose={() => setIsGoalFormOpen(false)} title={editingId ? 'Edit Goal' : 'New Goal'} size="sm">
        <form onSubmit={submitGoal} className="space-y-4 pt-2">
          <Input label="Goal Name" value={goalData.name} onChange={e => setGoalData({...goalData, name: e.target.value})} placeholder="e.g. New Laptop, Vacation" required autoFocus />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Currency"
              value={goalData.currency}
              onChange={(e) => setGoalData({ ...goalData, currency: e.target.value })}
              options={CURRENCIES.map(c => ({ value: c.code, label: c.code }))}
              required
            />
            <Input label="Target Amount" type="number" min="1" step="0.01" value={goalData.targetAmount || ''} onChange={e => setGoalData({...goalData, targetAmount: parseFloat(e.target.value) || 0})} required />
          </div>
          <Input label="Target Date (Optional)" type="date" value={goalData.deadline} onChange={e => setGoalData({...goalData, deadline: e.target.value})} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsGoalFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Transaction Form Modal */}
      <Modal isOpen={isTxFormOpen} onClose={() => setIsTxFormOpen(false)} title={txData.type === 'deposit' ? 'Add Funds' : 'Withdraw Funds'} size="sm">
        <form onSubmit={submitTx} className="space-y-4 pt-2">
          <Input label="Amount" type="number" min="0.01" step="0.01" value={txData.amount || ''} onChange={e => setTxData({...txData, amount: parseFloat(e.target.value) || 0})} required autoFocus />
          <Input label="Notes (Optional)" value={txData.notes} onChange={e => setTxData({...txData, notes: e.target.value})} placeholder="Where did this come from?" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsTxFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant={txData.type === 'deposit' ? 'success' : 'danger'} loading={isSubmitting}>Confirm</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this savings goal? This will also remove its transaction history."
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
}
