import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/database';
import type { InventoryItem, InventoryCategory, InventoryItemWithCategory } from '@/db/types';
import { StockStatus } from '@/db/types';

/* ============================================
   Inventory Store
   ============================================ */

interface InventoryFilters {
  search: string;
  categoryId: string;
  stockStatus: string;
  sortBy: 'name' | 'quantity' | 'value' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

interface InventoryState {
  items: InventoryItemWithCategory[];
  categories: InventoryCategory[];
  filters: InventoryFilters;
  isLoading: boolean;

  // Data operations
  loadItems: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  adjustQuantity: (id: string, delta: number) => Promise<void>;

  // Category operations
  addCategory: (name: string, icon?: string, color?: string) => Promise<void>;
  updateCategory: (id: string, name: string, icon?: string, color?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Filter operations
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: InventoryFilters = {
  search: '',
  categoryId: '',
  stockStatus: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

function getStockStatus(item: InventoryItem): StockStatus {
  if (item.quantity <= 0) return StockStatus.OutOfStock;
  if (item.quantity <= item.minimumStock) return StockStatus.LowStock;
  return StockStatus.InStock;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  categories: [],
  filters: { ...defaultFilters },
  isLoading: false,

  loadItems: async () => {
    set({ isLoading: true });
    try {
      const [rawItems, categories] = await Promise.all([
        db.inventoryItems.toArray(),
        db.inventoryCategories.toArray(),
      ]);

      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const items: InventoryItemWithCategory[] = rawItems.map((item) => ({
        ...item,
        categoryName: categoryMap.get(item.categoryId)?.name ?? 'Uncategorized',
        totalValue: item.quantity * item.purchasePrice,
        stockStatus: getStockStatus(item),
      }));

      set({ items, categories, isLoading: false });
    } catch (error) {
      console.error('Failed to load inventory:', error);
      set({ isLoading: false });
    }
  },

  loadCategories: async () => {
    const categories = await db.inventoryCategories.toArray();
    set({ categories });
  },

  addItem: async (itemData) => {
    const now = new Date();
    const item: InventoryItem = {
      id: uuidv4(),
      ...itemData,
      createdAt: now,
      updatedAt: now,
    };
    await db.inventoryItems.put(item);
    await get().loadItems();
  },

  updateItem: async (id, updates) => {
    await db.inventoryItems.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    await get().loadItems();
  },

  deleteItem: async (id) => {
    await db.inventoryItems.delete(id);
    await get().loadItems();
  },

  adjustQuantity: async (id, delta) => {
    const item = await db.inventoryItems.get(id);
    if (item) {
      const newQty = Math.max(0, item.quantity + delta);
      await db.inventoryItems.update(id, {
        quantity: newQty,
        updatedAt: new Date(),
      });
      await get().loadItems();
    }
  },

  addCategory: async (name, icon, color) => {
    const existing = await db.inventoryCategories.where('name').equalsIgnoreCase(name).first();
    if (existing) throw new Error('Category already exists');

    await db.inventoryCategories.put({
      id: uuidv4(),
      name,
      icon,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await get().loadCategories();
  },

  updateCategory: async (id, name, icon, color) => {
    await db.inventoryCategories.update(id, {
      name,
      icon,
      color,
      updatedAt: new Date(),
    });
    await get().loadCategories();
    await get().loadItems(); // Refresh items to update category names
  },

  deleteCategory: async (id) => {
    const itemCount = await db.inventoryItems.where('categoryId').equals(id).count();
    if (itemCount > 0) return false;

    await db.inventoryCategories.delete(id);
    await get().loadCategories();
    return true;
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },
}));

/**
 * Apply filters and sorting to inventory items (selector helper)
 */
export function getFilteredItems(items: InventoryItemWithCategory[], filters: InventoryFilters): InventoryItemWithCategory[] {
  let result = [...items];

  // Search
  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.barcode?.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (filters.categoryId) {
    result = result.filter((item) => item.categoryId === filters.categoryId);
  }

  // Stock status filter
  if (filters.stockStatus) {
    result = result.filter((item) => item.stockStatus === filters.stockStatus);
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortBy) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'quantity':
        cmp = a.quantity - b.quantity;
        break;
      case 'value':
        cmp = a.totalValue - b.totalValue;
        break;
      case 'updatedAt':
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return filters.sortOrder === 'desc' ? -cmp : cmp;
  });

  return result;
}
