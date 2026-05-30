/* ============================================
   Stocker — Data Model Types & Enums
   ============================================ */

// ---- Enums ----

export const StockStatus = {
  InStock: 'in_stock',
  LowStock: 'low_stock',
  OutOfStock: 'out_of_stock',
} as const;
export type StockStatus = typeof StockStatus[keyof typeof StockStatus];

export const TransactionType = {
  Income: 'income',
  Expense: 'expense',
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const BudgetStatus = {
  Safe: 'safe',
  NearLimit: 'near_limit',
  OverBudget: 'over_budget',
} as const;
export type BudgetStatus = typeof BudgetStatus[keyof typeof BudgetStatus];

export const ItemCondition = {
  New: 'new',
  Used: 'used',
  Damaged: 'damaged',
  Refurbished: 'refurbished',
} as const;
export type ItemCondition = typeof ItemCondition[keyof typeof ItemCondition];

export const GoalStatus = {
  Active: 'active',
  Completed: 'completed',
} as const;
export type GoalStatus = typeof GoalStatus[keyof typeof GoalStatus];

// ---- Inventory ----

export interface InventoryCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice?: number;
  minimumStock: number;
  condition: ItemCondition;
  notes?: string;
  barcode?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Money / Transactions ----

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: Date;
  paymentMethod: string;
  notes?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Budget ----

export interface Budget {
  id: string;
  month: string; // format: 'YYYY-MM'
  categoryId: string;
  limitAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Savings Goal ----

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: GoalStatus;
  deadline?: Date;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- App Settings ----

export interface AppSettings {
  id: string; // always 'app_settings'
  currency: string;
  theme: 'light' | 'dark' | 'system';
  onboardingCompleted: boolean;
  exchangeRate?: number;
  exchangeRateLastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Computed / Derived Types ----

export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface BudgetWithUsage extends Budget {
  spent: number;
  remaining: number;
  usagePercentage: number;
  status: BudgetStatus;
  categoryName: string;
}

export interface InventoryItemWithCategory extends InventoryItem {
  categoryName: string;
  totalValue: number;
  stockStatus: StockStatus;
}

export interface TransactionWithCategory extends Transaction {
  categoryName: string;
  categoryColor?: string;
}

// ---- Currency ----

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

// ---- Payment Methods ----

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'E-Wallet',
  'Other',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// ---- Unit Types ----

export const UNIT_TYPES = [
  'pcs', 'kg', 'g', 'lb', 'oz',
  'L', 'mL', 'gal',
  'box', 'pack', 'set', 'pair',
  'roll', 'sheet', 'bag',
  'unit', 'other',
] as const;

export type UnitType = (typeof UNIT_TYPES)[number];
