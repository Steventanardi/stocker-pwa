import Papa from 'papaparse';
import { format } from 'date-fns';
import type { InventoryItemWithCategory, TransactionWithCategory } from '@/db/types';

/* ============================================
   CSV Export Utilities
   ============================================ */

function downloadCsv(csvString: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Export inventory items to CSV
 */
export function exportInventoryToCsv(items: InventoryItemWithCategory[]) {
  const data = items.map((item) => ({
    Name: item.name,
    Category: item.categoryName,
    Quantity: item.quantity,
    Unit: item.unit,
    'Purchase Price': item.purchasePrice,
    'Selling Price': item.sellingPrice ?? '',
    'Total Value': item.totalValue,
    'Minimum Stock': item.minimumStock,
    'Stock Status': item.stockStatus,
    Condition: item.condition,
    Notes: item.notes ?? '',
    'Date Added': format(new Date(item.createdAt), 'yyyy-MM-dd'),
    'Last Updated': format(new Date(item.updatedAt), 'yyyy-MM-dd'),
  }));

  const csv = Papa.unparse(data);
  const date = format(new Date(), 'yyyy-MM-dd');
  downloadCsv(csv, `stocker-inventory-${date}.csv`);
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCsv(transactions: TransactionWithCategory[]) {
  const data = transactions.map((t) => ({
    Date: format(new Date(t.date), 'yyyy-MM-dd'),
    Type: t.type,
    Category: t.categoryName,
    Amount: t.amount,
    'Payment Method': t.paymentMethod,
    Notes: t.notes ?? '',
    Created: format(new Date(t.createdAt), 'yyyy-MM-dd'),
  }));

  const csv = Papa.unparse(data);
  const date = format(new Date(), 'yyyy-MM-dd');
  downloadCsv(csv, `stocker-transactions-${date}.csv`);
}

/**
 * Export monthly report summary
 */
export function exportMonthlyReport(
  month: string,
  income: number,
  expenses: number,
  categoryBreakdown: Array<{ category: string; amount: number; type: string }>
) {
  const summary = [
    { Label: 'Month', Value: month },
    { Label: 'Total Income', Value: income },
    { Label: 'Total Expenses', Value: expenses },
    { Label: 'Net Balance', Value: income - expenses },
    { Label: '', Value: '' },
    { Label: '--- Category Breakdown ---', Value: '' },
  ];

  const categories = categoryBreakdown.map((c) => ({
    Label: `${c.type}: ${c.category}`,
    Value: c.amount,
  }));

  const csv = Papa.unparse([...summary, ...categories]);
  downloadCsv(csv, `stocker-report-${month}.csv`);
}
