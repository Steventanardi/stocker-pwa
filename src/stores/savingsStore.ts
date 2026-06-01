import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/database';
import type { SavingsGoal } from '@/db/types';
import { GoalStatus } from '@/db/types';
import { useSettingsStore } from './settingsStore';
import { convertAmount } from '@/utils/currency';
import { pushToCloud, deleteFromCloud } from '@/lib/sync';

/* ============================================
   Savings Store
   ============================================ */

interface SavingsState {
  goals: SavingsGoal[];
  isLoading: boolean;
  totalSaved: number;
  totalTarget: number;

  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMoney: (id: string, amount: number) => Promise<void>;
  markComplete: (id: string) => Promise<void>;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  goals: [],
  isLoading: false,
  totalSaved: 0,
  totalTarget: 0,

  loadGoals: async () => {
    set({ isLoading: true });
    try {
      const goals = await db.savingsGoals.orderBy('createdAt').reverse().toArray();
      const activeGoals = goals.filter((g) => g.status === GoalStatus.Active);
      const { currency: defaultCurrency } = useSettingsStore.getState();
      
      const totalSaved = activeGoals.reduce((sum, g) => {
        return sum + (g.currency !== defaultCurrency ? convertAmount(g.currentAmount, g.currency, defaultCurrency) : g.currentAmount);
      }, 0);
      const totalTarget = activeGoals.reduce((sum, g) => {
        return sum + (g.currency !== defaultCurrency ? convertAmount(g.targetAmount, g.currency, defaultCurrency) : g.targetAmount);
      }, 0);

      set({ goals, totalSaved, totalTarget, isLoading: false });
    } catch (error) {
      console.error('Failed to load savings goals:', error);
      set({ isLoading: false });
    }
  },

  addGoal: async (goalData) => {
    const now = new Date();
    const goal = {
      id: uuidv4(),
      ...goalData,
      createdAt: now,
      updatedAt: now,
    };
    await db.savingsGoals.put(goal);

    // Sync to cloud
    await pushToCloud('savings_goals', goal.id, {
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      currency: goal.currency,
      target_date: goal.deadline ? goal.deadline.toISOString() : null,
      created_at: goal.createdAt.toISOString()
    });

    await get().loadGoals();
  },

  updateGoal: async (id, updates) => {
    await db.savingsGoals.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    const goal = await db.savingsGoals.get(id);
    if (goal) {
      await pushToCloud('savings_goals', goal.id, {
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        currency: goal.currency,
        target_date: goal.deadline ? goal.deadline.toISOString() : null,
        created_at: goal.createdAt.toISOString()
      });
    }

    await get().loadGoals();
  },

  deleteGoal: async (id) => {
    await db.savingsGoals.delete(id);
    await deleteFromCloud('savings_goals', id);
    await get().loadGoals();
  },

  addMoney: async (id, amount) => {
    const goal = await db.savingsGoals.get(id);
    if (goal) {
      const newAmount = Math.max(0, goal.currentAmount + amount);
      const updates: Partial<SavingsGoal> = {
        currentAmount: newAmount,
        updatedAt: new Date(),
      };
      // Auto-complete if target reached
      if (newAmount >= goal.targetAmount) {
        updates.status = GoalStatus.Completed;
      }
      await db.savingsGoals.update(id, updates);

      const updatedGoal = await db.savingsGoals.get(id);
      if (updatedGoal) {
        await pushToCloud('savings_goals', updatedGoal.id, {
          name: updatedGoal.name,
          target_amount: updatedGoal.targetAmount,
          current_amount: updatedGoal.currentAmount,
          currency: updatedGoal.currency,
          target_date: updatedGoal.deadline ? updatedGoal.deadline.toISOString() : null,
          created_at: updatedGoal.createdAt.toISOString()
        });
      }

      await get().loadGoals();
    }
  },

  markComplete: async (id) => {
    await db.savingsGoals.update(id, {
      status: GoalStatus.Completed,
      updatedAt: new Date(),
    });

    const updatedGoal = await db.savingsGoals.get(id);
    if (updatedGoal) {
      await pushToCloud('savings_goals', updatedGoal.id, {
        name: updatedGoal.name,
        target_amount: updatedGoal.targetAmount,
        current_amount: updatedGoal.currentAmount,
        currency: updatedGoal.currency,
        target_date: updatedGoal.deadline ? updatedGoal.deadline.toISOString() : null,
        created_at: updatedGoal.createdAt.toISOString()
      });
    }

    await get().loadGoals();
  },
}));
