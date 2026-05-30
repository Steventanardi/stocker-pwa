import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '@/db/database';
import type { BudgetWithUsage } from '@/db/types';
import { BudgetStatus, TransactionType } from '@/db/types';
import { useSettingsStore } from './settingsStore';
import { convertAmount } from '@/utils/currency';

/* ============================================
   Budget Store
   ============================================ */

interface BudgetState {
  budgets: BudgetWithUsage[];
  selectedMonth: string;
  totalBudget: number;
  totalSpent: number;
  isLoading: boolean;

  loadBudgets: (month?: string) => Promise<void>;
  addBudget: (categoryId: string, limitAmount: number, currency: string, month?: string) => Promise<void>;
  updateBudget: (id: string, limitAmount: number, currency: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setMonth: (month: string) => void;
}

function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  const ratio = limit > 0 ? spent / limit : 0;
  if (ratio >= 1) return BudgetStatus.OverBudget;
  if (ratio >= 0.8) return BudgetStatus.NearLimit;
  return BudgetStatus.Safe;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  selectedMonth: format(new Date(), 'yyyy-MM'),
  totalBudget: 0,
  totalSpent: 0,
  isLoading: false,

  loadBudgets: async (month?: string) => {
    const targetMonth = month ?? get().selectedMonth;
    set({ isLoading: true });

    try {
      const [rawBudgets, expenseCategories] = await Promise.all([
        db.budgets.where('month').equals(targetMonth).toArray(),
        db.transactionCategories.where('type').equals(TransactionType.Expense).toArray(),
      ]);

      // Get actual spending for the month
      const [year, m] = targetMonth.split('-').map(Number);
      const monthStart = startOfMonth(new Date(year, m - 1));
      const monthEnd = endOfMonth(new Date(year, m - 1));

      const monthTransactions = await db.transactions
        .where('date')
        .between(monthStart, monthEnd, true, true)
        .and((t) => t.type === TransactionType.Expense)
        .toArray();

      // Sum spending per category (convert to user default currency for overall view)
      const { currency: defaultCurrency } = useSettingsStore.getState();
      const spendingByCategory = new Map<string, number>();
      for (const t of monthTransactions) {
        const amount = t.currency !== defaultCurrency 
          ? convertAmount(t.amount, t.currency, defaultCurrency) 
          : t.amount;
        
        spendingByCategory.set(
          t.categoryId,
          (spendingByCategory.get(t.categoryId) ?? 0) + amount
        );
      }

      const categoryMap = new Map(expenseCategories.map((c) => [c.id, c]));

      const budgets: BudgetWithUsage[] = rawBudgets.map((b) => {
        // Convert budget limit to default currency for comparison if needed
        // We will do all comparisons in default currency
        const limitAmountInDefault = b.currency !== defaultCurrency
          ? convertAmount(b.limitAmount, b.currency, defaultCurrency)
          : b.limitAmount;

        const spent = spendingByCategory.get(b.categoryId) ?? 0;
        const remaining = Math.max(0, limitAmountInDefault - spent);
        const usagePercentage = limitAmountInDefault > 0 ? (spent / limitAmountInDefault) * 100 : 0;

        return {
          ...b,
          spent,
          remaining,
          usagePercentage,
          status: getBudgetStatus(spent, limitAmountInDefault),
          categoryName: categoryMap.get(b.categoryId)?.name ?? 'Unknown',
        };
      });

      const totalBudget = budgets.reduce((sum, b) => {
        return sum + (b.currency !== defaultCurrency ? convertAmount(b.limitAmount, b.currency, defaultCurrency) : b.limitAmount);
      }, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

      set({
        budgets,
        selectedMonth: targetMonth,
        totalBudget,
        totalSpent,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load budgets:', error);
      set({ isLoading: false });
    }
  },

  addBudget: async (categoryId, limitAmount, currency, month) => {
    const targetMonth = month ?? get().selectedMonth;

    // Check for duplicate
    const existing = await db.budgets
      .where('[month+categoryId]')
      .equals([targetMonth, categoryId])
      .first();
    if (existing) throw new Error('Budget already exists for this category and month');

    const now = new Date();
    await db.budgets.put({
      id: uuidv4(),
      month: targetMonth,
      categoryId,
      limitAmount,
      currency,
      createdAt: now,
      updatedAt: now,
    });
    await get().loadBudgets();
  },

  updateBudget: async (id, limitAmount, currency) => {
    await db.budgets.update(id, {
      limitAmount,
      currency,
      updatedAt: new Date(),
    });
    await get().loadBudgets();
  },

  deleteBudget: async (id) => {
    await db.budgets.delete(id);
    await get().loadBudgets();
  },

  setMonth: (month) => {
    set({ selectedMonth: month });
    get().loadBudgets(month);
  },
}));
