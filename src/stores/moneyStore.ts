import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '@/db/database';
import type { Transaction, TransactionCategory, TransactionWithCategory } from '@/db/types';
import { TransactionType } from '@/db/types';
import { useSettingsStore } from './settingsStore';
import { convertAmount } from '@/utils/currency';
import { pushToCloud, deleteFromCloud, syncMoneyFromCloud } from '@/lib/sync';

/* ============================================
   Money Planner Store
   ============================================ */

interface MoneyFilters {
  search: string;
  type: string;
  categoryId: string;
  month: string; // 'YYYY-MM'
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

interface MoneyState {
  transactions: TransactionWithCategory[];
  categories: TransactionCategory[];
  filters: MoneyFilters;
  isLoading: boolean;

  // Summary
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;

  // Data operations
  loadTransactions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Category operations
  addCategory: (name: string, type: TransactionType, icon?: string, color?: string) => Promise<void>;
  updateCategory: (id: string, name: string, icon?: string, color?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Filter operations
  setFilters: (filters: Partial<MoneyFilters>) => void;
  resetFilters: () => void;

  // Helpers
  getSpendingByCategory: () => Array<{ categoryId: string; categoryName: string; color: string; amount: number; percentage: number }>;
}

const currentMonth = format(new Date(), 'yyyy-MM');

const defaultFilters: MoneyFilters = {
  search: '',
  type: '',
  categoryId: '',
  month: currentMonth,
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useMoneyStore = create<MoneyState>((set, get) => ({
  transactions: [],
  categories: [],
  filters: { ...defaultFilters },
  isLoading: false,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlyBalance: 0,

  loadTransactions: async () => {
    set({ isLoading: true });
    try {
      await syncMoneyFromCloud();

      const { filters } = get();
      const [year, month] = filters.month.split('-').map(Number);
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));

      const [rawTransactions, categories] = await Promise.all([
        db.transactions
          .where('date')
          .between(monthStart, monthEnd, true, true)
          .toArray(),
        db.transactionCategories.toArray(),
      ]);

      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const transactions: TransactionWithCategory[] = rawTransactions.map((t) => {
        const cat = categoryMap.get(t.categoryId);
        return {
          ...t,
          categoryName: cat?.name ?? 'Uncategorized',
          categoryColor: cat?.color,
        };
      });

      const { currency: defaultCurrency } = useSettingsStore.getState();

      const monthlyIncome = transactions
        .filter((t) => t.type === TransactionType.Income)
        .reduce((sum, t) => {
          const amt = t.currency !== defaultCurrency ? convertAmount(t.amount, t.currency, defaultCurrency) : t.amount;
          return sum + amt;
        }, 0);

      const monthlyExpenses = transactions
        .filter((t) => t.type === TransactionType.Expense)
        .reduce((sum, t) => {
          const amt = t.currency !== defaultCurrency ? convertAmount(t.amount, t.currency, defaultCurrency) : t.amount;
          return sum + amt;
        }, 0);

      set({
        transactions,
        categories,
        monthlyIncome,
        monthlyExpenses,
        monthlyBalance: monthlyIncome - monthlyExpenses,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({ isLoading: false });
    }
  },

  loadCategories: async () => {
    const categories = await db.transactionCategories.toArray();
    set({ categories });
  },

  addTransaction: async (tData) => {
    const now = new Date();
    const transaction: Transaction = {
      id: uuidv4(),
      ...tData,
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.put(transaction);

    // Sync to cloud
    await pushToCloud('transactions', transaction.id, {
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.categoryId,
      date: transaction.date.toISOString(),
      description: transaction.notes || '',
      related_item_id: transaction.paymentMethod,
      created_at: transaction.createdAt.toISOString()
    });

    await get().loadTransactions();
  },

  updateTransaction: async (id, updates) => {
    await db.transactions.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    const tx = await db.transactions.get(id);
    if (tx) {
      await pushToCloud('transactions', tx.id, {
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        category: tx.categoryId,
        date: tx.date.toISOString(),
        description: tx.notes || '',
        created_at: tx.createdAt.toISOString()
      });
    }

    await get().loadTransactions();
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    await deleteFromCloud('transactions', id);
    await get().loadTransactions();
  },

  addCategory: async (name, type, icon, color) => {
    const existing = await db.transactionCategories
      .where('name')
      .equalsIgnoreCase(name)
      .and((c) => c.type === type)
      .first();
    if (existing) throw new Error('Category already exists');

    const cat = {
      id: uuidv4(),
      name,
      type,
      icon,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.transactionCategories.put(cat);

    await pushToCloud('transaction_categories', cat.id, {
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      created_at: cat.createdAt.toISOString(),
      updated_at: cat.updatedAt.toISOString(),
    });

    await get().loadCategories();
  },

  updateCategory: async (id, name, icon, color) => {
    await db.transactionCategories.update(id, {
      name,
      icon,
      color,
      updatedAt: new Date(),
    });

    const cat = await db.transactionCategories.get(id);
    if (cat) {
      await pushToCloud('transaction_categories', cat.id, {
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        created_at: cat.createdAt.toISOString(),
        updated_at: cat.updatedAt.toISOString(),
      });
    }

    await get().loadCategories();
    await get().loadTransactions();
  },

  deleteCategory: async (id) => {
    const txCount = await db.transactions.where('categoryId').equals(id).count();
    if (txCount > 0) return false;

    await db.transactionCategories.delete(id);
    await deleteFromCloud('transaction_categories', id);
    await get().loadCategories();
    return true;
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    // Reload if month changed
    if (filters.month) {
      get().loadTransactions();
    }
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
    get().loadTransactions();
  },

  getSpendingByCategory: () => {
    const { transactions } = get();
    const { currency: defaultCurrency } = useSettingsStore.getState();
    const expenses = transactions.filter((t) => t.type === TransactionType.Expense);
    const totalExpenses = expenses.reduce((sum, t) => {
      const amt = t.currency !== defaultCurrency ? convertAmount(t.amount, t.currency, defaultCurrency) : t.amount;
      return sum + amt;
    }, 0);

    const categoryTotals = new Map<string, { name: string; color: string; amount: number }>();
    for (const t of expenses) {
      const amt = t.currency !== defaultCurrency ? convertAmount(t.amount, t.currency, defaultCurrency) : t.amount;
      const existing = categoryTotals.get(t.categoryId);
      if (existing) {
        existing.amount += amt;
      } else {
        categoryTotals.set(t.categoryId, {
          name: t.categoryName,
          color: t.categoryColor ?? '#64748b',
          amount: amt,
        });
      }
    }

    return Array.from(categoryTotals.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        color: data.color,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  },
}));

/**
 * Apply filters and sorting to transactions (selector helper)
 */
export function getFilteredTransactions(
  transactions: TransactionWithCategory[],
  filters: MoneyFilters
): TransactionWithCategory[] {
  let result = [...transactions];

  // Search
  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.categoryName.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query) ||
        t.paymentMethod.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filters.type) {
    result = result.filter((t) => t.type === filters.type);
  }

  // Category filter
  if (filters.categoryId) {
    result = result.filter((t) => t.categoryId === filters.categoryId);
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortBy) {
      case 'date':
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        cmp = a.amount - b.amount;
        break;
    }
    return filters.sortOrder === 'desc' ? -cmp : cmp;
  });

  return result;
}
