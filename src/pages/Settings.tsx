import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Palette, DollarSign, Trash2, Fingerprint, LogOut } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { CURRENCIES } from '@/utils/currency';
import { db } from '@/db/database';
import { exportInventoryToCsv, exportTransactionsToCsv } from '@/utils/exportCsv';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMoneyStore } from '@/stores/moneyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { isWebAuthnSupported, registerBiometrics } from '@/lib/webauthn';

/* ============================================
   Settings Page
   ============================================ */

export default function Settings() {
  const { theme, setTheme, currency, setCurrency } = useSettingsStore();
  const { loadItems } = useInventoryStore();
  const { loadTransactions } = useMoneyStore();
  const { isGuest, biometricCredentialId, enableBiometrics, disableBiometrics, signOut } = useAuthStore();
  
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    isWebAuthnSupported().then(setBiometricsSupported);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleExportInventory = async () => {
    setIsExporting(true);
    try {
      await loadItems();
      await exportInventoryToCsv(useInventoryStore.getState().items);
      alert('Inventory exported successfully');
    } catch (error) {
      console.error('Failed to export inventory', error);
      alert('Failed to export inventory');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTransactions = async () => {
    setIsExporting(true);
    try {
      await loadTransactions();
      await exportTransactionsToCsv(useMoneyStore.getState().transactions);
      alert('Transactions exported successfully');
    } catch (error) {
      console.error('Failed to export transactions', error);
      alert('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await db.delete();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data');
      setIsClearing(false);
      setIsClearDataOpen(false);
    }
  };

  const handleToggleBiometrics = async () => {
    if (biometricCredentialId) {
      disableBiometrics();
    } else {
      const pin = window.prompt("Enter your PIN to save for FaceID unlock:");
      if (!pin) return;
      
      setIsRegistering(true);
      try {
        const credId = await registerBiometrics();
        enableBiometrics(credId, pin);
        alert("FaceID successfully linked!");
      } catch (error: any) {
        alert(error.message || "Failed to link FaceID");
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const currencyOptions = CURRENCIES.map((c: any) => ({
    value: c.code,
    label: `${c.code} (${c.symbol}) - ${c.name}`
  }));

  const themeOptions = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <Header
        title="Settings"
        subtitle="Manage your app preferences and data"
      />

      <div className="space-y-6">
        {/* Appearance section */}
        <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <Select
              label="Theme Preference"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as any)}
              options={themeOptions}
            />
          </div>
        </section>

        {/* Currency section */}
        <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center text-accent-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Currency</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <Select
              label="Primary Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
            />
          </div>
        </section>

        {/* Security / Account section */}
        {!isGuest && (
          <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border-default)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Security</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {biometricsSupported && (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">FaceID / TouchID</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Unlock the app instantly without your PIN.</p>
                  </div>
                  <Button 
                    variant={biometricCredentialId ? "danger" : "primary"} 
                    onClick={handleToggleBiometrics}
                    loading={isRegistering}
                  >
                    {biometricCredentialId ? "Disable" : "Enable"}
                  </Button>
                </div>
              )}

              <div className={`pt-4 ${biometricsSupported ? 'border-t border-[var(--border-default)]' : ''}`}>
                <Button variant="secondary" onClick={signOut} className="w-full justify-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Lock / Sign Out
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Data section */}
        <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center text-danger-600">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Data Management</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">Export Inventory</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Download your stock as a CSV file.</p>
                <Button variant="secondary" onClick={handleExportInventory} disabled={isExporting} className="w-full">
                  Export Inventory
                </Button>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">Export Transactions</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Download your finances as a CSV file.</p>
                <Button variant="secondary" onClick={handleExportTransactions} disabled={isExporting} className="w-full">
                  Export Transactions
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)]">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">Clear All Data</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xl">
                This will permanently delete all your inventory items, transactions, budgets, and settings from this device. This action cannot be undone.
              </p>
              <Button
                variant="danger"
                onClick={() => setIsClearDataOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear App Data
              </Button>
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-primary shadow-lg shadow-primary-500/20 mb-3">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Stocker PWA</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Version 1.0.0 • Local First</p>
          
          <a href="#" className="flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors">
            <span className="w-5 h-5 flex items-center justify-center bg-[var(--text-secondary)] text-white rounded-full text-xs">G</span>
            GitHub
          </a>
        </section>
      </div>

      {/* Clear Data Dialog */}
      <ConfirmDialog
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
        onConfirm={handleClearData}
        title="Clear All Data?"
        message="Are you absolutely sure? This will delete all your data permanently. The app will reload and start fresh."
        confirmLabel="Yes, delete everything"
        variant="danger"
        loading={isClearing}
      />
    </div>
  );
}
