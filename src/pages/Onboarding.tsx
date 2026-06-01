import { useState } from 'react';
import { PackageOpen, ArrowRight, Check } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { CURRENCIES } from '@/utils/currency';
import Button from '@/components/ui/Button';

/* ============================================
   Onboarding Page
   ============================================ */

export default function Onboarding() {
  const { setCurrency, completeOnboarding } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]?.code ?? 'TWD');
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    await setCurrency(selectedCurrency);
    // Add artificial delay for smoother UX
    setTimeout(async () => {
      await completeOnboarding();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-[fade-in_0.5s_ease-out]">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-xl shadow-primary-500/20 mb-8">
              <PackageOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              Welcome to <span className="text-gradient">Stocker</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-10 px-4">
              Your personal hub for managing stock inventory and tracking money securely on your device.
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              className="group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Step 2: Currency Selection */}
        {step === 2 && (
          <div className="flex flex-col animate-[fade-in_0.4s_ease-out]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Choose your currency
              </h2>
              <p className="text-[var(--text-secondary)]">
                You can always change this later in settings.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-2 mb-8 shadow-sm h-[320px] overflow-y-auto custom-scrollbar">
              <div className="grid gap-1">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => setSelectedCurrency(currency.code)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl
                      transition-colors text-left
                      ${selectedCurrency === currency.code
                        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-500/30'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                        ${selectedCurrency === currency.code
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-300'
                          : 'bg-surface-200 text-[var(--text-secondary)] dark:bg-surface-700'
                        }
                      `}>
                        {currency.symbol}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">
                          {currency.code}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {currency.name}
                        </div>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleFinish}
              loading={isFinishing}
            >
              Finish Setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
