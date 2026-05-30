import { Moon, Sun, RefreshCw } from 'lucide-react';
import { useSettingsStore, applyTheme } from '@/stores/settingsStore';
import { formatNumber } from '@/utils/currency';

/* ============================================
   Header Component
   ============================================ */

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { theme, setTheme, currency, setCurrency, exchangeRate, fetchExchangeRate } = useSettingsStore();

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'TWD' ? 'IDR' : 'TWD');
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {actions}

        {/* Exchange Rate Widget */}
        <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
          <span>1 TWD = {formatNumber(exchangeRate, 2)} IDR</span>
          <button onClick={fetchExchangeRate} className="hover:text-primary-500 transition-colors" title="Refresh Rate">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Currency Toggle */}
        <button
          onClick={toggleCurrency}
          className="
            px-3 py-2 rounded-xl font-bold text-sm
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            bg-surface-100 hover:bg-surface-200
            dark:bg-surface-800 dark:hover:bg-surface-700
            transition-all duration-200
          "
          title="Toggle Display Currency"
        >
          {currency}
        </button>

        <button
          onClick={toggleTheme}
          className="
            p-2.5 rounded-xl
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            bg-surface-100 hover:bg-surface-200
            dark:bg-surface-800 dark:hover:bg-surface-700
            transition-all duration-200
          "
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
