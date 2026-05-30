import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ScanLine } from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ItemCondition, UNIT_TYPES } from '@/db/types';
import { CURRENCIES } from '@/utils/currency';
import BarcodeScanner from './BarcodeScanner';

/* ============================================
   Inventory Form Modal
   ============================================ */

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string; // If provided, we are editing
}

export default function InventoryForm({ isOpen, onClose, itemId }: InventoryFormProps) {
  const { items, categories, addItem, updateItem } = useInventoryStore();
  const { currency: defaultCurrency } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    quantity: number;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    minimumStock: number;
    condition: ItemCondition;
    notes: string;
    barcode: string;
    currency: string;
  }>({
    name: '',
    categoryId: '',
    quantity: 0,
    unit: 'pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    minimumStock: 5,
    condition: ItemCondition.New,
    notes: '',
    barcode: '',
    currency: defaultCurrency,
  });

  useEffect(() => {
    if (isOpen && itemId) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        setFormData({
          name: item.name,
          categoryId: item.categoryId,
          quantity: item.quantity,
          unit: item.unit,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice ?? 0,
          minimumStock: item.minimumStock,
          condition: item.condition as ItemCondition,
          notes: item.notes ?? '',
          barcode: item.barcode ?? '',
          currency: item.currency || defaultCurrency,
        });
      }
    } else if (isOpen && !itemId) {
      // Reset form on new add
      setFormData({
        name: '',
        categoryId: categories[0]?.id ?? '',
        quantity: 0,
        unit: 'pcs',
        purchasePrice: 0,
        sellingPrice: 0,
        minimumStock: 5,
        condition: ItemCondition.New,
        notes: '',
        barcode: '',
        currency: defaultCurrency,
      });
    }
  }, [isOpen, itemId, items, categories, defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const dataToSave = {
        ...formData,
        sellingPrice: formData.sellingPrice > 0 ? formData.sellingPrice : undefined,
      };

      if (itemId) {
        await updateItem(itemId, dataToSave);
      } else {
        await addItem(dataToSave);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save item', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const unitOptions = UNIT_TYPES.map(u => ({ value: u, label: u }));
  const conditionOptions = Object.entries(ItemCondition).map(([key, value]) => ({
    value,
    label: key
  }));
  const currencyOptions = CURRENCIES.map(c => ({ value: c.code, label: c.code }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemId ? 'Edit Item' : 'Add New Item'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. iPhone 13 Pro"
          required
        />

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Barcode / SKU (Optional)"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="Scan or type barcode"
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => setIsScannerOpen(true)} className="mb-0.5 px-3">
            <ScanLine className="w-5 h-5 text-[var(--text-secondary)]" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categoryOptions}
            required
          />
          <Select
            label="Condition"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
            options={conditionOptions}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            required
          />
          <Select
            label="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            options={unitOptions}
            required
          />
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
            label="Purchase Price"
            type="number"
            min="0"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Selling Price"
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice || ''}
            onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <Input
          label="Low Stock Warning Threshold"
          type="number"
          min="0"
          value={formData.minimumStock}
          onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
          hint="Alert me when quantity falls below this number"
          required
        />

        <Input
          label="Notes (Optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any extra details..."
        />

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {itemId ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => setFormData({ ...formData, barcode: code })}
      />
    </Modal>
  );
}
