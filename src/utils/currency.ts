import type { CurrencyOption } from '@/db/types';

/* ============================================
   Currency Configuration & Formatting
   ============================================ */

export const CURRENCIES: CurrencyOption[] = [
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', locale: 'zh-TW' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID' },
];

/**
 * Format a number as currency using Intl.NumberFormat
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options?: { compact?: boolean }
): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const locale = currency?.locale ?? 'en-US';

  try {
    if (options?.compact && Math.abs(amount) >= 1000) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    }

    // For currencies like JPY, IDR, KRW — no decimal places
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR'];
    const maximumFractionDigits = noDecimalCurrencies.includes(currencyCode) ? 0 : 2;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    // Fallback formatting
    return `${currency?.symbol ?? '$'}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? '$';
}

/**
 * Format a number with grouping (no currency)
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Convert an amount between currencies.
 * exchangeRate is always defined as how many IDR is 1 TWD.
 */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number = 490 // default fallback
): number {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'TWD' && toCurrency === 'IDR') {
    return amount * exchangeRate;
  }
  
  if (fromCurrency === 'IDR' && toCurrency === 'TWD') {
    return amount / exchangeRate;
  }
  
  return amount; // Fallback
}
