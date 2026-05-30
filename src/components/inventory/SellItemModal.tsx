import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMoneyStore } from '@/stores/moneyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatCurrency } from '@/utils/currency';
import { TransactionType } from '@/db/types';

interface SellItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

export default function SellItemModal({ isOpen, onClose, itemId }: SellItemModalProps) {
  const { items, adjustQuantity } = useInventoryStore();
  const { addTransaction } = useMoneyStore();
  const { currency: defaultCurrency } = useSettingsStore();
  
  const item = items.find(i => i.id === itemId);
  
  const [quantityToSell, setQuantityToSell] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(item?.sellingPrice || item?.purchasePrice || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update initial values if item changes
  if (!item) return null;

  const maxQuantity = item.quantity;
  const totalSaleValue = quantityToSell * sellingPrice;

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToSell <= 0 || quantityToSell > maxQuantity) return;

    setIsSubmitting(true);
    try {
      // 1. Deduct quantity
      await adjustQuantity(item.id, -quantityToSell);

      // 2. Create income transaction
      await addTransaction({
        amount: totalSaleValue,
        type: TransactionType.Income,
        categoryId: 'sales', // We'll just use a generic 'sales' ID, or we might need to look it up. Let's let the store handle it or leave as 'sales'.
        notes: `Sold ${quantityToSell}x ${item.name}`,
        date: new Date(),
        currency: item.currency || defaultCurrency,
      });

      onClose();
    } catch (error) {
      console.error('Failed to sell item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sell ${item.name}`}
      size="sm"
    >
      <form onSubmit={handleSell} className="space-y-4">
        <div className="bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg text-sm mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-[var(--text-secondary)]">Available Stock:</span>
            <span className="font-semibold text-[var(--text-primary)]">{maxQuantity} {item.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Base Selling Price:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatCurrency(item.sellingPrice || item.purchasePrice, item.currency || defaultCurrency)}
            </span>
          </div>
        </div>

        <Input
          label="Quantity to Sell"
          type="number"
          min="1"
          max={maxQuantity.toString()}
          value={quantityToSell}
          onChange={(e) => setQuantityToSell(parseInt(e.target.value) || 1)}
          required
        />

        <Input
          label="Selling Price (per unit)"
          type="number"
          min="0"
          step="0.01"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
          required
        />

        <div className="pt-4 border-t border-[var(--border-default)]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-[var(--text-secondary)]">Total Income:</span>
            <span className="text-xl font-bold text-success-600">
              {formatCurrency(totalSaleValue, item.currency || defaultCurrency)}
            </span>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={quantityToSell > maxQuantity || quantityToSell <= 0}>
              Confirm Sale
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
