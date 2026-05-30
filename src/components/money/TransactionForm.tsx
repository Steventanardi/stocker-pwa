import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useMoneyStore } from '@/stores/moneyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { TransactionType, PAYMENT_METHODS } from '@/db/types';
import { CURRENCIES } from '@/utils/currency';

/* ============================================
   Transaction Form Modal
   ============================================ */

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string; // If editing
  initialType?: TransactionType; // For "Add Income" vs "Add Expense" shortcuts
}

export default function TransactionForm({
  isOpen,
  onClose,
  transactionId,
  initialType = TransactionType.Expense,
}: TransactionFormProps) {
  const { transactions, categories, addTransaction, updateTransaction } = useMoneyStore();
  const { currency: defaultCurrency } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: initialType,
    amount: 0,
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Cash',
    notes: '',
    currency: defaultCurrency,
  });

  useEffect(() => {
    if (isOpen && transactionId) {
      const tx = transactions.find((t) => t.id === transactionId);
      if (tx) {
        setFormData({
          type: tx.type,
          amount: tx.amount,
          categoryId: tx.categoryId,
          date: format(new Date(tx.date), 'yyyy-MM-dd'),
          paymentMethod: tx.paymentMethod,
          notes: tx.notes ?? '',
          currency: tx.currency || defaultCurrency,
        });
      }
    } else if (isOpen && !transactionId) {
      // Find a default category for the current type
      const defaultCat = categories.find(c => c.type === (initialType || formData.type));
      setFormData({
        type: initialType || formData.type,
        amount: 0,
        categoryId: defaultCat?.id ?? '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Cash',
        notes: '',
        currency: defaultCurrency,
      });
    }
  }, [isOpen, transactionId, initialType, transactions, categories, defaultCurrency]);

  // When type changes, auto-select a category of that type
  const handleTypeChange = (newType: TransactionType) => {
    const defaultCat = categories.find(c => c.type === newType);
    setFormData({
      ...formData,
      type: newType,
      categoryId: defaultCat?.id ?? '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const dataToSave = {
        ...formData,
        date: new Date(formData.date),
      };

      if (transactionId) {
        await updateTransaction(transactionId, dataToSave);
      } else {
        await addTransaction(dataToSave);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save transaction', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories by selected type
  const filteredCategories = categories.filter(c => c.type === formData.type);
  const categoryOptions = filteredCategories.map(c => ({ value: c.id, label: c.name }));
  const paymentOptions = PAYMENT_METHODS.map(p => ({ value: p, label: p }));
  const currencyOptions = CURRENCIES.map(c => ({ value: c.code, label: c.code }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionId ? 'Edit Transaction' : 'Add Transaction'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Type Toggle */}
        <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              formData.type === TransactionType.Expense 
                ? 'bg-[var(--bg-card)] text-danger-600 shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => handleTypeChange(TransactionType.Expense)}
          >
            Expense
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              formData.type === TransactionType.Income 
                ? 'bg-[var(--bg-card)] text-success-600 shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => handleTypeChange(TransactionType.Income)}
          >
            Income
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={currencyOptions}
            required
          />
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
            autoFocus
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <Select
          label="Category"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          options={categoryOptions}
          required
        />

        <Select
          label="Payment Method"
          value={formData.paymentMethod}
          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          options={paymentOptions}
          required
        />

        <Input
          label="Notes (Optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="What was this for?"
        />

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant={formData.type === TransactionType.Expense ? 'danger' : 'success'} loading={isSubmitting}>
            {transactionId ? 'Save Changes' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
