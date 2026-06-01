import { useState, useEffect } from 'react';
import { Tag, Edit2, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useMoneyStore } from '@/stores/moneyStore';
import { TransactionType } from '@/db/types';
import { toast } from '@/components/ui/Toast';

/* ============================================
   Money Categories Page
   ============================================ */

export default function MoneyCategories() {
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useMoneyStore();

  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.Expense);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [formData, setFormData] = useState<{name: string; type: TransactionType}>({ name: '', type: TransactionType.Expense });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const displayedCategories = categories.filter(c => c.type === activeTab);

  const handleAddNew = () => {
    setEditingId(undefined);
    setFormData({ name: '', type: activeTab });
    setIsFormOpen(true);
  };

  const handleEdit = (category: { id: string, name: string, type: TransactionType }) => {
    setEditingId(category.id);
    setFormData({ name: category.name, type: category.type });
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData.name.trim());
        toast('success', 'Category updated successfully');
      } else {
        await addCategory(formData.name.trim(), formData.type);
        toast('success', 'Category added successfully');
        setActiveTab(formData.type); // Switch tab if they added to the other one
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast('error', error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteCategory(deletingId);
      if (success) {
        toast('success', 'Category deleted');
      } else {
        toast('error', 'Cannot delete category because it has transactions');
      }
    } catch (error) {
      toast('error', 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingId(undefined);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <Header 
        title="Money Categories" 
        subtitle="Manage categories for your income and expenses"
        actions={
          <Button variant="primary" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-default)] mb-6 shadow-sm">
        <button
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === TransactionType.Expense 
              ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400 shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab(TransactionType.Expense)}
        >
          <TrendingDown className="w-4 h-4" />
          Expenses
        </button>
        <button
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === TransactionType.Income 
              ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400 shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab(TransactionType.Income)}
        >
          <TrendingUp className="w-4 h-4" />
          Income
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
        {displayedCategories.length > 0 ? (
          <ul className="divide-y divide-[var(--border-default)]">
            {displayedCategories.map((category) => (
              <li key={category.id} className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    category.type === TransactionType.Income 
                      ? 'bg-success-50 text-success-600 dark:bg-success-900/30' 
                      : 'bg-danger-50 text-danger-600 dark:bg-danger-900/30'
                  }`}>
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-surface-200 dark:hover:bg-surface-700 hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePrompt(category.id)}
                    className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            No {activeTab === TransactionType.Income ? 'income' : 'expense'} categories found.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Category' : 'New Category'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* We only let them change type if they are creating a new one */}
          {!editingId && (
             <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
             <button
               type="button"
               className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                 formData.type === TransactionType.Expense 
                   ? 'bg-[var(--bg-card)] text-danger-600 shadow-sm' 
                   : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
               }`}
               onClick={() => setFormData({ ...formData, type: TransactionType.Expense })}
             >
               Expense
             </button>
             <button
               type="button"
               className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                 formData.type === TransactionType.Income 
                   ? 'bg-[var(--bg-card)] text-success-600 shadow-sm' 
                   : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
               }`}
               onClick={() => setFormData({ ...formData, type: TransactionType.Income })}
             >
               Income
             </button>
           </div>
          )}
         
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={formData.type === TransactionType.Income ? "e.g. Salary, Freelance" : "e.g. Groceries, Rent"}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? You can only delete it if there are no transactions using it."
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
}
