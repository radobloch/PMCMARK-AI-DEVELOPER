import React, { useState } from 'react';
import { Terminal, Copy, Check, Rocket, Layers, Code2 } from 'lucide-react';

export const CommandGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const commands = [
    {
      title: '1. Zainicjowanie shadcn/ui w projekcie Next.js 14',
      command: 'npx shadcn@latest init --defaults',
      desc: 'Inicjalizuje konfigurację shadcn/ui z domyślnymi ustawieniami CSS variables dla Tailwind CSS.',
    },
    {
      title: '2. Instalacja zależności Radix UI primitives, Lucide i Tailwind Merge',
      command: 'npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast clsx tailwind-merge lucide-react',
      desc: 'Instaluje oficjalne pakiety dostępności Radix oraz ikony i wsparcie dla klas Tailwind.',
    },
    {
      title: '3. Komenda CLI do bezpośredniego dodawania komponentów shadcn',
      command: 'npx shadcn@latest add button input textarea card dialog select tabs toast',
      desc: 'Alternatywnie pobiera bazowe wersje surowych komponentów z oficjalnego rejestru shadcn/ui.',
    },
    {
      title: '4. Uruchomienie lokalnego serwera deweloperskiego Next.js',
      command: 'npm run dev',
      desc: 'Uruchamia aplikację pod adresem http://localhost:3000.',
    },
    {
      title: '5. Publikacja aplikacji na chmurze Vercel',
      command: 'npx vercel',
      desc: 'Przesyła kod i buduje produkcyjną wersję na platformie Vercel.',
    },
  ];

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-400" />
          <h2 className="font-bold text-lg text-white">Komendy Instalacji shadcn/ui & Radix UI</h2>
        </div>
        <p className="text-sm text-slate-400">
          Użyj poniższych poleceń w swoim terminalu, aby zainstalować wymagane zależności dla 10 komponentów UI w aplikacji PMCMARK AI DEVELOPER.
        </p>

        <div className="space-y-4 pt-2">
          {commands.map((cmd, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400">{cmd.title}</span>
                <button
                  onClick={() => handleCopy(cmd.command, idx)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Skopiowano</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopiuj</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-lg bg-black/60 font-mono text-xs text-emerald-400 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 select-none">$</span>
                  <span>{cmd.command}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">{cmd.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
