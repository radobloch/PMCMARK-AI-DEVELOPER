import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  label,
  className = '',
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`inline-flex items-center gap-2 font-medium text-slate-400 ${className}`}>
      {variant === 'spinner' && (
        <Loader2 className={`animate-spin text-blue-500 ${sizeMap[size]}`} />
      )}
      {variant === 'dots' && (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
        </div>
      )}
      {variant === 'pulse' && (
        <div className={`rounded-full bg-blue-500 animate-pulse ${sizeMap[size]}`} />
      )}
      {label && <span className="text-xs text-slate-300">{label}</span>}
    </div>
  );
}
