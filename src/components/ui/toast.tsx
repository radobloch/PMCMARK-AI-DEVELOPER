import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (msg: ToastMessage) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (msg: ToastMessage) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border max-w-md ${
              toast.variant === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-800'
                : toast.variant === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
                : 'bg-slate-900/90 text-slate-100 border-slate-800'
            }`}
          >
            {toast.variant === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {(!toast.variant || toast.variant === 'info') && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
              {toast.description && <p className="text-xs opacity-90">{toast.description}</p>}
            </div>

            <button
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
