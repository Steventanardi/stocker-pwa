import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Wallet, 
  PiggyBank, 
  Target, 
  ArrowRight,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSavingsStore } from '@/stores/savingsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatCurrency, convertAmount } from '@/utils/currency';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { StockStatus } from '@/db/types';

/* ============================================
   Dashboard Page
   ============================================ */

export default function Dashboard() {
  const navigate = useNavigate();
  const { currency } = useSettingsStore();
  const { items: inventoryItems, loadItems: loadInventory } = useInventoryStore();
  const { budgets, totalBudget, totalSpent, loadBudgets } = useBudgetStore();
  const { goals, loadGoals } = useSavingsStore();

  useEffect(() => {
    loadInventory();
    loadBudgets();
    loadGoals();
  }, [loadInventory, loadBudgets, loadGoals]);

  // Inventory stats
  const totalStockValue = inventoryItems.reduce((sum, item) => {
    const valueInDefault = item.currency !== currency ? convertAmount(item.totalValue, item.currency || currency, currency) : item.totalValue;
    return sum + valueInDefault;
  }, 0);
  const lowStockCount = inventoryItems.filter(i => 
    i.stockStatus === StockStatus.LowStock || i.stockStatus === StockStatus.OutOfStock
  ).length;

  // Budget stats
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  // Savings stats
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallSavingsProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      <Header 
        title="Dashboard" 
        subtitle="Here's what's happening with your stock and money"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Inventory Summary */}
        <Card 
          className="hover:border-primary-500/50 cursor-pointer transition-colors"
          onClick={() => navigate('/inventory')}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            {lowStockCount > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockCount} low
              </Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">Stock Value</p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {formatCurrency(totalStockValue, currency)}
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Across {inventoryItems.length} items
          </p>
        </Card>

        {/* Budget Summary */}
        <Card 
          className="hover:border-accent-500/50 cursor-pointer transition-colors"
          onClick={() => navigate('/budget')}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-accent-600" />
            </div>
            <span className="text-sm font-medium text-accent-600">This Month</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">Spent / Budget</p>
          <div className="flex items-end gap-2 mb-2">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none">
              {formatCurrency(totalSpent, currency)}
            </h3>
            <span className="text-sm text-[var(--text-tertiary)] mb-0.5">
              / {formatCurrency(totalBudget, currency)}
            </span>
          </div>
          <ProgressBar 
            value={budgetUsage} 
            variant={budgetUsage >= 100 ? 'danger' : budgetUsage >= 80 ? 'warning' : 'primary'} 
            size="sm"
          />
        </Card>

        {/* Savings Summary */}
        <Card 
          className="hover:border-success-500/50 cursor-pointer transition-colors"
          onClick={() => navigate('/savings')}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-success-600" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {goals.length} Goals
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">Total Saved</p>
          <div className="flex items-end gap-2 mb-2">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none">
              {formatCurrency(totalSaved, currency)}
            </h3>
          </div>
          <ProgressBar value={overallSavingsProgress} variant="success" size="sm" />
        </Card>

        {/* Quick Action */}
        <Card className="flex flex-col justify-center items-center text-center gradient-primary text-white">
          <PiggyBank className="w-10 h-10 mb-3 opacity-90" />
          <h3 className="font-semibold mb-1">Log a transaction</h3>
          <p className="text-xs opacity-80 mb-4 px-2">Keep your finances up to date</p>
          <button 
            onClick={() => navigate('/money?action=expense')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
          >
            Add Expense <ArrowRight className="w-4 h-4" />
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Low Stock Alerts</h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {inventoryItems.filter(i => i.stockStatus !== StockStatus.InStock).slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-warning-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.name}</h4>
                    <p className="text-xs text-[var(--text-tertiary)]">{item.categoryName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={item.stockStatus === StockStatus.OutOfStock ? 'danger' : 'warning'}>
                    {item.quantity} {item.unit} left
                  </Badge>
                </div>
              </div>
            ))}
            
            {lowStockCount === 0 && (
              <div className="text-center py-6 text-[var(--text-secondary)] text-sm">
                All stock levels look good!
              </div>
            )}
          </div>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Budget Status</h3>
            <button 
              onClick={() => navigate('/budget')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {budgets.slice(0, 4).map(budget => (
              <div key={budget.id}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{budget.categoryName}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.currency !== currency ? convertAmount(budget.limitAmount, budget.currency, currency) : budget.limitAmount, currency)}
                  </span>
                </div>
                  <ProgressBar 
                    value={budget.usagePercentage} 
                    variant={budget.usagePercentage >= 100 ? 'danger' : budget.usagePercentage >= 80 ? 'warning' : 'primary'} 
                    size="sm" 
                  />
              </div>
            ))}

            {budgets.length === 0 && (
              <div className="text-center py-6 text-[var(--text-secondary)] text-sm">
                No budgets set for this month yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
