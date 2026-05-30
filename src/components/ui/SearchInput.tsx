import { Search, X } from 'lucide-react';
import { useRef } from 'react';

/* ============================================
   SearchInput Component
   ============================================ */

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-lg border border-[var(--border-default)]
          bg-[var(--bg-input)] text-[var(--text-primary)]
          pl-10 pr-9 py-2.5 text-sm
          placeholder:text-[var(--text-tertiary)]
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
          hover:border-[var(--border-hover)]
        "
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
