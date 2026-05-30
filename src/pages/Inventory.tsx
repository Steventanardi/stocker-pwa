import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageOpen, Plus, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import { useInventoryStore, getFilteredItems } from '@/stores/inventoryStore';
import InventoryCard from '@/components/inventory/InventoryCard';
import InventoryForm from '@/components/inventory/InventoryForm';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import { StockStatus } from '@/db/types';

/* ============================================
   Inventory Page
   ============================================ */

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, filters, setFilters, loadItems, loadCategories } = useInventoryStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadItems();
    loadCategories();
  }, [loadItems, loadCategories]);

  // Handle ?action=add from FAB
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleAddNew();
      setSearchParams({}); // Clear it
    }
  }, [searchParams, setSearchParams]);

  const handleAddNew = () => {
    setEditingItemId(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingItemId(id);
    setIsFormOpen(true);
  };

  const filteredItems = useMemo(() => getFilteredItems(items, filters), [items, filters]);

  const handleScan = (decodedText: string) => {
    // Check if we have an item with this barcode
    const existingItem = items.find(i => i.barcode === decodedText);
    if (existingItem) {
      setFilters({ search: decodedText });
    } else {
      // Prompt or simply search
      setFilters({ search: decodedText });
      alert(`Scanned barcode: ${decodedText}. No exact item found.`);
    }
  };

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      <Header 
        title="Inventory" 
        subtitle="Manage your personal belongings and stock"
        actions={
          <Button variant="primary" onClick={handleAddNew} className="hidden sm:flex">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-3 mb-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <SearchInput 
            value={filters.search} 
            onChange={(val) => setFilters({ search: val })} 
            placeholder="Search items, categories, barcode..."
          />
          <Button variant="secondary" onClick={() => setIsScannerOpen(true)} className="px-3" title="Scan Barcode">
            <PackageOpen className="w-5 h-5 text-[var(--text-secondary)]" /> {/* Re-using icon, ideally Scan line */}
          </Button>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 ${showFilters ? 'bg-surface-200 dark:bg-surface-700' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-[fade-in_0.2s_ease-out]">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
            <select 
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-sm p-2"
              value={filters.categoryId}
              onChange={(e) => setFilters({ categoryId: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Status</label>
            <select 
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-sm p-2"
              value={filters.stockStatus}
              onChange={(e) => setFilters({ stockStatus: e.target.value })}
            >
              <option value="">Any Status</option>
              <option value={StockStatus.InStock}>In Stock</option>
              <option value={StockStatus.LowStock}>Low Stock</option>
              <option value={StockStatus.OutOfStock}>Out of Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Sort By</label>
            <select 
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-sm p-2"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setFilters({ sortBy: by as any, sortOrder: order as any });
              }}
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="quantity-asc">Quantity (Low to High)</option>
              <option value="quantity-desc">Quantity (High to Low)</option>
              <option value="value-desc">Total Value (Highest)</option>
            </select>
          </div>
        </div>
      )}

      {/* Item Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEdit(item.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<PackageOpen className="w-8 h-8 text-primary-500" />}
          title={items.length === 0 ? "Your inventory is empty" : "No matching items found"}
          description={items.length === 0 
            ? "Start adding your belongings or stock items to keep track of them."
            : "Try adjusting your search or filters."
          }
          actionLabel={items.length === 0 ? "Add First Item" : "Clear Filters"}
          onAction={() => items.length === 0 ? handleAddNew() : setFilters({ search: '', categoryId: '', stockStatus: '' })}
        />
      )}

      {/* Modals */}
      <InventoryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        itemId={editingItemId}
      />

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
