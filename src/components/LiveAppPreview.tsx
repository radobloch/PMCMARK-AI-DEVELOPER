import React, { useState } from 'react';
import { 
  Bot, 
  Sun, 
  Moon, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  Code2, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  X,
  MessageSquare
} from 'lucide-react';

export const LiveAppPreview: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'all' | 'buttons' | 'forms' | 'dialog' | 'toast' | 'code'>('all');
  
  // State for interactive component testing
  const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'>('primary');
  const [inputValue, setInputValue] = useState('PMCMARK AI App');
  const [inputError, setInputError] = useState('');
  const [textareaValue, setTextareaValue] = useState('Opis projektu...');
  const [selectedAI, setSelectedAI] = useState('gemini-1.5-pro');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; variant: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerToast = (variant: 'success' | 'error' | 'info') => {
    const titles = {
      success: 'Pomyślnie zapisano ustawienia PMCMARK AI',
      error: 'Wystąpił błąd autoryzacji Vercel Token',
      info: 'Zainicjalizowano nowy komponent shadcn/ui',
    };
    setToastMessage({ title: titles[variant], variant });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulateAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerToast('success');
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Simulation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-300 font-semibold">Podgląd na żywo aplikacji PMCMARK AI DEVELOPER (10 Komponentów UI)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Motyw:</span>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors font-medium"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Jasny</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ciemny</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Simulated Window */}
      <div
        className={`rounded-2xl border transition-colors duration-300 overflow-hidden shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-950 text-slate-100 border-slate-800'
            : 'bg-slate-50 text-slate-900 border-slate-300'
        }`}
      >
        {/* Navigation header inside simulated app */}
        <header className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-none">PMCMARK</span>
              <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-widest">AI DEVELOPER</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
              ● shadcn/ui + Radix Ready
            </span>
          </div>
        </header>

        {/* Main Content Showcase */}
        <main className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Prezentacja 10 Komponentów UI
            </h2>
            <p className={theme === 'dark' ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
              Przetestuj bezpośrednio wszystkie warianty przycisków, formularzy, dialogów i bloku kodu.
            </p>
          </div>

          {/* Interactive Navigation Filter Tabs */}
          <div className="flex items-center justify-center gap-1 p-1 bg-slate-800/40 rounded-xl max-w-2xl mx-auto text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'Wszystkie 10' },
              { id: 'buttons', label: '1. Button & Spinner' },
              { id: 'forms', label: '2. Input & Select' },
              { id: 'dialog', label: '3. Dialog Modal' },
              { id: 'toast', label: '4. Toast & Card' },
              { id: 'code', label: '5. CodeBlock' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid of Components */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Component 1 & 10: Button & LoadingSpinner */}
            {(activeTab === 'all' || activeTab === 'buttons') && (
              <div className={`p-5 rounded-2xl border space-y-4 ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <span className="font-bold text-xs text-blue-400">1. Button & 10. LoadingSpinner</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">components/ui/button.tsx</span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setButtonVariant('primary')} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-500/20">Primary</button>
                    <button onClick={() => setButtonVariant('secondary')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium">Secondary</button>
                    <button onClick={() => setButtonVariant('outline')} className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium">Outline</button>
                    <button onClick={() => setButtonVariant('ghost')} className="px-3 py-1.5 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-medium">Ghost</button>
                    <button onClick={() => setButtonVariant('destructive')} className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium">Destructive</button>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs text-slate-400">Akcja ze Spinnerem:</span>
                    <button
                      onClick={handleSimulateAction}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 shadow-md shadow-blue-500/20"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Ładowanie...</span>
                        </>
                      ) : (
                        <span>Uruchom Akcję</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Component 2, 3 & 8: Input, Textarea & Select */}
            {(activeTab === 'all' || activeTab === 'forms') && (
              <div className={`p-5 rounded-2xl border space-y-4 ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <span className="font-bold text-xs text-blue-400">2. Input, 3. Textarea, 8. Select</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">components/ui/input.tsx</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">2. Input Component</label>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">8. Select (Wybór Modelu AI)</label>
                    <select
                      value={selectedAI}
                      onChange={(e) => setSelectedAI(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="claude-3-5">Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Component 4 & 5: Card & Dialog */}
            {(activeTab === 'all' || activeTab === 'dialog') && (
              <div className={`p-5 rounded-2xl border space-y-4 ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <span className="font-bold text-xs text-blue-400">4. Card & 5. Dialog Modal</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">components/ui/dialog.tsx</span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Otwórz interaktywne okno modalne z automatyczną obsługą tła i przycisku zamknięcia.
                  </p>
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    Otwórz Dialog Modal
                  </button>
                </div>
              </div>
            )}

            {/* Component 6: Toast */}
            {(activeTab === 'all' || activeTab === 'toast') && (
              <div className={`p-5 rounded-2xl border space-y-4 ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <span className="font-bold text-xs text-blue-400">6. Toast (Powiadomienia)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">components/ui/toast.tsx</span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Wygeneruj wyskakujące powiadomienie Toast z automatycznym znikaniem.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerToast('success')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                    >
                      Toast Sukces
                    </button>
                    <button
                      onClick={() => triggerToast('error')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
                    >
                      Toast Błąd
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Component 7: CodeBlock */}
            {(activeTab === 'all' || activeTab === 'code') && (
              <div className="md:col-span-2">
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                    <span className="font-bold text-xs text-blue-400">7. CodeBlock (Przeglądarka Kodu z Syntax Highlight)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">components/ui/code-block.tsx</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-2">
                      <span>components/index.ts</span>
                      <span>TypeScript</span>
                    </div>
                    <pre className="text-slate-300 leading-relaxed overflow-x-auto">
                      <code>{`export * from './ui/button';
export * from './ui/input';
export * from './ui/textarea';
export * from './ui/card';
export * from './ui/dialog';
export * from './ui/toast';
export * from './ui/code-block';
export * from './ui/select';
export * from './ui/tabs';
export * from './ui/loading-spinner';`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interactive Modal Dialog Simulation */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-slate-100">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-white">Przykładowe Okno Modalne (Dialog)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To jest pełnoprawny komponent Dialog otwarty w symulatorze PMCMARK AI.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Toast Toast Message Overlay Simulation */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {toastMessage.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.variant === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {toastMessage.variant === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          <span className="text-xs font-semibold">{toastMessage.title}</span>
        </div>
      )}
    </div>
  );
};
