import { useState } from 'react';
import { PackageOpen, ArrowRight, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const { setGuestMode, signInWithEmail } = useAuthStore();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage('');
    
    const { error } = await signInWithEmail(email);
    
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setIsSubmitting(false);
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

        <form onSubmit={handleSignIn} className="space-y-4 mb-8">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-5 h-5 text-[var(--text-secondary)]" />}
          />
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            loading={isSubmitting}
          >
            Send Magic Link
          </Button>
          
          {message && (
            <p className={`text-sm text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </form>

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
