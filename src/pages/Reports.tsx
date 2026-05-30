import { useEffect, useMemo, useState } from 'react';
import { Package, Wallet, TrendingDown, PieChart as PieChartIcon, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, addMonths } from 'date-fns';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMoneyStore } from '@/stores/moneyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatCurrency, convertAmount } from '@/utils/currency';
import { exportMonthlyReport } from '@/utils/exportCsv';
import { TransactionType } from '@/db/types';

/* ============================================
   Reports Page
   ============================================ */

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

export default function Reports() {
  const { items: inventoryItems, loadItems, loadCategories: loadInvCategories } = useInventoryStore();
  const { transactions, loadTransactions, getSpendingByCategory, filters, setFilters } = useMoneyStore();
  const { currency } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'financial'>('financial');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadItems();
    loadInvCategories();
    loadTransactions();
  }, [loadItems, loadTransactions, loadInvCategories]);

  // Inventory Calculations
  const inventoryCategoryData = useMemo(() => {
    const dataMap = new Map<string, { name: string; value: number; count: number }>();
    
    inventoryItems.forEach(item => {
      const existing = dataMap.get(item.categoryName) || { name: item.categoryName, value: 0, count: 0 };
      const itemValue = item.currency !== currency ? convertAmount(item.totalValue, item.currency || currency, currency) : item.totalValue;
      existing.value += itemValue;
      existing.count += item.quantity;
      dataMap.set(item.categoryName, existing);
    });

    return Array.from(dataMap.values()).sort((a, b) => b.value - a.value);
  }, [inventoryItems, currency]);

  const totalInventoryValue = useMemo(() => inventoryItems.reduce((acc, item) => {
    const val = item.currency !== currency ? convertAmount(item.totalValue, item.currency || currency, currency) : item.totalValue;
    return acc + val;
  }, 0), [inventoryItems, currency]);
  const totalInventoryCount = useMemo(() => inventoryItems.reduce((acc, item) => acc + item.quantity, 0), [inventoryItems]);
  const lowStockCount = useMemo(() => inventoryItems.filter(i => i.quantity <= i.minimumStock && i.quantity > 0).length, [inventoryItems]);
  const outOfStockCount = useMemo(() => inventoryItems.filter(i => i.quantity === 0).length, [inventoryItems]);

  // Financial Calculations
  const spendingData = useMemo(() => getSpendingByCategory(), [transactions, getSpendingByCategory]);
  
  const incomeVsExpenseData = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => {
      const amt = t.currency !== currency ? convertAmount(t.amount, t.currency || currency, currency) : t.amount;
      return sum + amt;
    }, 0);
    const expense = transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => {
      const amt = t.currency !== currency ? convertAmount(t.amount, t.currency || currency, currency) : t.amount;
      return sum + amt;
    }, 0);
    return [
      { name: 'Income', amount: income, fill: '#22c55e' },
      { name: 'Expenses', amount: expense, fill: '#ef4444' }
    ];
  }, [transactions, currency]);

  const currentMonthDate = new Date(filters.month + '-01T00:00:00');
  const handlePrevMonth = () => setFilters({ month: format(subMonths(currentMonthDate, 1), 'yyyy-MM') });
  const handleNextMonth = () => setFilters({ month: format(addMonths(currentMonthDate, 1), 'yyyy-MM') });

  const handleExportMonthly = () => {
    setIsExporting(true);
    try {
      const income = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => {
        const amt = t.currency !== currency ? convertAmount(t.amount, t.currency || currency, currency) : t.amount;
        return sum + amt;
      }, 0);
      const expense = transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => {
        const amt = t.currency !== currency ? convertAmount(t.amount, t.currency || currency, currency) : t.amount;
        return sum + amt;
      }, 0);
      
      const categoryBreakdown = transactions.map(t => ({
        category: t.categoryName,
        amount: t.amount,
        type: t.type
      }));
      
      exportMonthlyReport(filters.month, income, expense, categoryBreakdown);
    } finally {
      setIsExporting(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-medium text-slate-900 dark:text-white mb-1">{payload[0].name || label}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto animate-[fade-in_0.3s_ease-out] pb-20">
      <Header 
        title="Reports" 
        subtitle="Visualise your data and track your progress"
      />

      {/* Tabs */}
      <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'financial'
              ? 'bg-white dark:bg-slate-700 text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Financial
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'inventory'
              ? 'bg-white dark:bg-slate-700 text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory
        </button>
      </div>

      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Month Selector & Export */}
          <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
              <span className="font-semibold text-lg text-[var(--text-primary)] w-32 text-center">
                {format(currentMonthDate, 'MMMM yyyy')}
              </span>
              <button onClick={handleNextMonth} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <Button variant="secondary" onClick={handleExportMonthly} disabled={isExporting || transactions.length === 0}>
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income vs Expenses */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 shadow-sm flex flex-col h-96">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Income vs Expenses</h3>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{fill: '#888888'}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={60}>
                        {incomeVsExpenseData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={incomeVsExpenseData[index].fill} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending by Category */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 shadow-sm flex flex-col h-96">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Spending Breakdown</h3>
              </div>
              <div className="flex-1 min-h-0 relative">
                {spendingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="categoryName"
                      >
                        {spendingData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={spendingData[index].color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
                    <TrendingDown className="w-8 h-8 mb-2 opacity-50" />
                    <p>No expenses this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Total Value</p>
              <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
                {formatCurrency(totalInventoryValue, currency)}
              </p>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Total Items</p>
              <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {totalInventoryCount} <span className="text-sm font-normal text-[var(--text-tertiary)]">units</span>
              </p>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Low Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-warning-500">
                {lowStockCount} <span className="text-sm font-normal text-[var(--text-tertiary)]">items</span>
              </p>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Out of Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-danger-500">
                {outOfStockCount} <span className="text-sm font-normal text-[var(--text-tertiary)]">items</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Value by Category */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 shadow-sm flex flex-col h-96">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Value by Category</h3>
              </div>
              <div className="flex-1 min-h-0">
                {inventoryCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {inventoryCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p>No inventory data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Count by Category */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 shadow-sm flex flex-col h-96">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Items by Category</h3>
              </div>
              <div className="flex-1 min-h-0">
                {inventoryCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} width={100} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{payload[0].payload.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{payload[0].payload.count} units</p>
                              </div>
                            );
                          }
                          return null;
                        }} 
                        cursor={{fill: 'var(--bg-surface)'}} 
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                        {inventoryCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p>No inventory data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
