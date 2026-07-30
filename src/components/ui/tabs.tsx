import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  value: string;
  setValue: (val: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, className = '', children }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const activeValue = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleSetValue = (newVal: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newVal);
    }
    onValueChange?.(newVal);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue: handleSetValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;

  const isActive = ctx.value === value;

  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        isActive
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;

  return <div className={className}>{children}</div>;
}
