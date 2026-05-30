import { Package, MoreVertical, Edit2, Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import type { InventoryItemWithCategory } from '@/db/types';
import { StockStatus } from '@/db/types';
import { formatCurrency } from '@/utils/currency';
import { useSettingsStore } from '@/stores/settingsStore';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useInventoryStore } from '@/stores/inventoryStore';
import SellItemModal from './SellItemModal';

/* ============================================
   Inventory Item Card (Responsive)
   ============================================ */

interface InventoryCardProps {
  item: InventoryItemWithCategory;
  onEdit: () => void;
}

export default function InventoryCard({ item, onEdit }: InventoryCardProps) {
  const { currency } = useSettingsStore();
  const { adjustQuantity, deleteItem } = useInventoryStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const getStatusBadge = () => {
    switch (item.stockStatus) {
      case StockStatus.OutOfStock:
        return <Badge variant="danger">Out of Stock</Badge>;
      case StockStatus.LowStock:
        return <Badge variant="warning">Low Stock</Badge>;
      default:
        return <Badge variant="success">In Stock</Badge>;
    }
  };

  const handleAdjust = async (delta: number) => {
    await adjustQuantity(item.id, delta);
  };

  const handleDelete = async () => {
    await deleteItem(item.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 shadow-sm hover:shadow-md transition-shadow group relative">
        {/* Menu Toggle */}
        <div className="absolute top-3 right-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-surface-100 hover:text-[var(--text-primary)] transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Quick Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 w-36 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg z-20 py-1 animate-[fade-in_0.15s_ease-out]">
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

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
              {item.name}
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] truncate">
              {item.categoryName} • {item.condition}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => handleAdjust(-1)}
              disabled={item.quantity <= 0}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] disabled:opacity-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-2 min-w-[3rem] text-center font-semibold text-[var(--text-primary)]">
              {item.quantity}
            </div>
            <button
              onClick={() => handleAdjust(1)}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="ml-3">
            <button
              onClick={() => setIsSellModalOpen(true)}
              disabled={item.quantity <= 0}
              className="px-3 py-1 bg-success-50 dark:bg-success-900/30 text-success-600 text-xs font-semibold rounded-lg hover:bg-success-100 dark:hover:bg-success-900/50 disabled:opacity-50 transition-colors"
            >
              Sell
            </button>
          </div>

          <div className="text-right flex-1">
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {formatCurrency(item.purchasePrice, item.currency || currency)}
            </div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Total: {formatCurrency(item.totalValue, item.currency || currency)}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex justify-between items-center">
          {getStatusBadge()}
          <span className="text-xs text-[var(--text-tertiary)]">
            Min: {item.minimumStock} {item.unit}
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <SellItemModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        itemId={item.id}
      />
    </>
  );
}
