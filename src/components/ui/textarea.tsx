import React, { useEffect, useRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  value,
  onChange,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono resize-none ${
          error
            ? 'border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
