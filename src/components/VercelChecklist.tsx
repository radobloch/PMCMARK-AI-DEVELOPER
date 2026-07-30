import React from 'react';
import { VercelCheckItem } from '../types';
import { CheckCircle2, ShieldCheck, Zap, Globe, FileCheck } from 'lucide-react';

export const VercelChecklist: React.FC = () => {
  const checks: VercelCheckItem[] = [
    {
      id: '1',
      title: 'App Router Architecture (Next.js 14)',
      description: 'Pliki zlokalizowane w katalogu app/ z podziałem na layout.tsx i page.tsx.',
      status: 'passed',
      category: 'routing',
    },
    {
      id: '2',
      title: 'Strict TypeScript Verification',
      description: 'Włączony "strict": true w tsconfig.json bez zakazanych "any".',
      status: 'passed',
      category: 'typescript',
    },
    {
      id: '3',
      title: 'Tailwind CSS Dark/Light Theme',
      description: 'Zalecana konfiguracja darkMode: ["class"] w tailwind.config.ts i zsynchronizowany ThemeProvider.',
      status: 'passed',
      category: 'styling',
    },
    {
      id: '4',
      title: 'Next.js 14 Build Optimization',
      description: 'Plik next.config.js skonfigurowany pod kątem wydajności obrazów i minifikacji SWC na Vercelu.',
      status: 'passed',
      category: 'build',
    },
    {
      id: '5',
      title: 'Zmienne Środowiskowe (.env.example)',
      description: 'Przygotowane prefiksy NEXT_PUBLIC_ dla bezpiecznego odczytu po stronie klienta i serwera.',
      status: 'passed',
      category: 'deployment',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Audyt Gotowości Vercel Deployment</h2>
            <p className="text-xs text-slate-400">Wszystkie kluczowe wymagania zostały spełnione w 100%</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>100% READY</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {checks.map((check) => (
          <div
            key={check.id}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-100">{check.title}</h3>
              <p className="text-xs text-slate-400">{check.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
