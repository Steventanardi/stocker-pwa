import { useState, useEffect } from 'react';
import { PackageOpen, ArrowRight, Lock, Fingerprint } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { isWebAuthnSupported, verifyBiometrics } from '@/lib/webauthn';

export default function Login() {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  
  const { setGuestMode, signInWithPIN, biometricCredentialId, savedPin } = useAuthStore();

  useEffect(() => {
    isWebAuthnSupported().then(setBiometricsSupported);
  }, []);

  const handleSignIn = async (e?: React.FormEvent, explicitPin?: string) => {
    if (e) e.preventDefault();
    const targetPin = explicitPin || pin;
    if (!targetPin) return;

    setIsSubmitting(true);
    setMessage('');
    
    const { error } = await signInWithPIN(targetPin);
    
    if (error) {
      setMessage(error.message);
    }
    // If successful, the authStore will automatically redirect via onAuthStateChange
    setIsSubmitting(false);
  };

  const handleBiometricUnlock = async () => {
    if (!biometricCredentialId || !savedPin) return;
    try {
      const verified = await verifyBiometrics(biometricCredentialId);
      if (verified) {
        await handleSignIn(undefined, savedPin);
      }
    } catch (err) {
      console.error(err);
      setMessage("FaceID/TouchID verification failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-default)] shadow-sm animate-[fade-in_0.4s_ease-out]">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">
          Welcome to Stocker
        </h1>
        <p className="text-center text-[var(--text-secondary)] mb-8">
          Your personal inventory & money planner
        </p>

        {biometricsSupported && biometricCredentialId && savedPin ? (
          <div className="space-y-4 mb-8">
            <Button 
              variant="primary" 
              className="w-full py-4 text-lg justify-center shadow-lg shadow-primary-500/20"
              onClick={handleBiometricUnlock}
              loading={isSubmitting}
            >
              <Fingerprint className="w-6 h-6 mr-3" />
              Unlock with FaceID
            </Button>
            
            <p className="text-center">
              <button 
                className="text-sm text-[var(--text-secondary)] hover:text-primary-500 underline underline-offset-4"
                onClick={() => useAuthStore.getState().disableBiometrics()}
              >
                Use PIN instead
              </button>
            </p>

            {message && (
              <p className={`text-sm text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4 mb-8">
          <Input
            label="Personal PIN"
            type="password"
            placeholder="Enter your PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            icon={<Lock className="w-5 h-5 text-[var(--text-secondary)]" />}
          />
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            loading={isSubmitting}
          >
            Unlock Personal Data
          </Button>
          {message && (
              <p className={`text-sm text-center ${message.includes('Error') || message.includes('failed') || message.includes('disabled') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
        </form>
        )}

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-default)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--bg-card)] text-[var(--text-secondary)]">
              Or
            </span>
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="w-full group"
          onClick={setGuestMode}
        >
          Continue as Guest
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="text-xs text-center text-[var(--text-secondary)] mt-3">
          Guest data is stored locally on this device.
        </p>
      </div>
    </div>
  );
}
