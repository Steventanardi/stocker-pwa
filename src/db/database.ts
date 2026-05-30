import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import type {
  InventoryItem,
  InventoryCategory,
  Transaction,
  TransactionCategory,
  Budget,
  SavingsGoal,
  AppSettings,
} from './types';
import { TransactionType, ItemCondition, GoalStatus } from './types';

/* ============================================
   Stocker Database (Dexie / IndexedDB)
   ============================================ */

export class StockerDatabase extends Dexie {
  inventoryItems!: Table<InventoryItem>;
  inventoryCategories!: Table<InventoryCategory>;
  transactions!: Table<Transaction>;
  transactionCategories!: Table<TransactionCategory>;
  budgets!: Table<Budget>;
  savingsGoals!: Table<SavingsGoal>;
  settings!: Table<AppSettings>;

  constructor() {
    super('StockerDB');

    this.version(1).stores({
      inventoryItems: 'id, name, categoryId, quantity, createdAt, updatedAt',
      inventoryCategories: 'id, &name, createdAt',
      transactions: 'id, type, categoryId, date, createdAt',
      transactionCategories: 'id, name, type, createdAt',
      budgets: 'id, month, categoryId, [month+categoryId]',
      savingsGoals: 'id, name, status, createdAt',
      settings: 'id',
    });

    this.version(2).stores({
      // We didn't change indexed properties, so we just declare the same stores
      // and perform a data migration.
    }).upgrade(async (trans) => {
      // Get the default currency from settings (or fallback to TWD)
      let defaultCurrency = 'TWD';
      const settingsTable = trans.table('settings');
      const appSettings = await settingsTable.get('app_settings');
      if (appSettings && appSettings.currency) {
        defaultCurrency = appSettings.currency;
      }
      
      // Update all items to have the default currency
      await trans.table('inventoryItems').toCollection().modify((item) => {
        item.currency = item.currency || defaultCurrency;
      });
      await trans.table('transactions').toCollection().modify((tx) => {
        tx.currency = tx.currency || defaultCurrency;
      });
      await trans.table('budgets').toCollection().modify((b) => {
        b.currency = b.currency || defaultCurrency;
      });
      await trans.table('savingsGoals').toCollection().modify((sg) => {
        sg.currency = sg.currency || defaultCurrency;
      });
    });

    this.version(3).stores({
      inventoryItems: 'id, name, categoryId, quantity, barcode, createdAt, updatedAt',
    });
  }
}

export const db = new StockerDatabase();

/* ============================================
   Seed Default Data (runs on first launch)
   ============================================ */

export async function seedDefaultData() {
  const existingSettings = await db.settings.get('app_settings');
  if (existingSettings) return; // Already seeded

  const now = new Date();

  // Default settings
  await db.settings.put({
    id: 'app_settings',
    currency: 'TWD',
    theme: 'system',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  });

  // Default inventory categories
  const inventoryCategories: InventoryCategory[] = [
    { id: uuidv4(), name: 'Electronics', icon: '💻', color: '#6366f1', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Food & Beverages', icon: '🍕', color: '#f59e0b', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Clothes', icon: '👕', color: '#ec4899', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Household', icon: '🏠', color: '#10b981', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Office Supplies', icon: '📎', color: '#3b82f6', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Personal Items', icon: '🎒', color: '#8b5cf6', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Others', icon: '📦', color: '#64748b', createdAt: now, updatedAt: now },
  ];
  await db.inventoryCategories.bulkPut(inventoryCategories);

  // Default income categories
  const incomeCategories: TransactionCategory[] = [
    { id: uuidv4(), name: 'Salary', type: TransactionType.Income, icon: '💰', color: '#10b981', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Freelance', type: TransactionType.Income, icon: '💼', color: '#059669', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Business', type: TransactionType.Income, icon: '🏪', color: '#0d9488', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Gift', type: TransactionType.Income, icon: '🎁', color: '#6ee7b7', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Investment', type: TransactionType.Income, icon: '📈', color: '#34d399', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Others', type: TransactionType.Income, icon: '💵', color: '#a7f3d0', createdAt: now, updatedAt: now },
  ];

  // Default expense categories
  const expenseCategories: TransactionCategory[] = [
    { id: uuidv4(), name: 'Food', type: TransactionType.Expense, icon: '🍔', color: '#f59e0b', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Transport', type: TransactionType.Expense, icon: '🚗', color: '#3b82f6', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Rent', type: TransactionType.Expense, icon: '🏡', color: '#6366f1', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Shopping', type: TransactionType.Expense, icon: '🛍️', color: '#ec4899', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Education', type: TransactionType.Expense, icon: '📚', color: '#8b5cf6', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Entertainment', type: TransactionType.Expense, icon: '🎮', color: '#f43f5e', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Health', type: TransactionType.Expense, icon: '🏥', color: '#ef4444', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Bills', type: TransactionType.Expense, icon: '📄', color: '#64748b', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Subscription', type: TransactionType.Expense, icon: '🔄', color: '#0ea5e9', createdAt: now, updatedAt: now },
    { id: uuidv4(), name: 'Others', type: TransactionType.Expense, icon: '💸', color: '#94a3b8', createdAt: now, updatedAt: now },
  ];
  await db.transactionCategories.bulkPut([...incomeCategories, ...expenseCategories]);
}

// Export helper types that are useful
export type { InventoryItem, InventoryCategory, Transaction, TransactionCategory, Budget, SavingsGoal, AppSettings };
export { TransactionType, ItemCondition, GoalStatus };
