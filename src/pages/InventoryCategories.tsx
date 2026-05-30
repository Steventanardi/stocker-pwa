import { useState, useEffect } from 'react';
import { Tag, Edit2, Trash2, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useInventoryStore } from '@/stores/inventoryStore';
import { toast } from '@/components/ui/Toast';

/* ============================================
   Inventory Categories Page
   ============================================ */

export default function InventoryCategories() {
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useInventoryStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [formData, setFormData] = useState({ name: '' });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddNew = () => {
    setEditingId(undefined);
    setFormData({ name: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (category: { id: string, name: string }) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
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
        await addCategory(formData.name.trim());
        toast('success', 'Category added successfully');
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
        toast('error', 'Cannot delete category because it has items in it');
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
        title="Inventory Categories" 
        subtitle="Manage categories for your stock items"
        actions={
          <Button variant="primary" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        }
      />

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
        {categories.length > 0 ? (
          <ul className="divide-y divide-[var(--border-default)]">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-[var(--text-secondary)]">
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
            No categories found. Create one to organize your items.
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
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="e.g. Electronics, Groceries"
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
        message="Are you sure you want to delete this category? You can only delete it if there are no items using it."
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
}
