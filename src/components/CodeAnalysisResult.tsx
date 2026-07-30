import React, { useState } from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button,
  useToast
} from './ui';
import { AlertTriangle, Lightbulb, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { CodeAnalysisResult as CodeAnalysisResultType } from '../lib/aiStudioClient';

export interface CodeAnalysisResultProps {
  result: CodeAnalysisResultType;
  language?: string;
}

export function CodeAnalysisResult({ result, language }: CodeAnalysisResultProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const errorsCount = result?.errors?.length || 0;
  const suggestionsCount = result?.suggestions?.length || 0;

  const handleCopy = () => {
    const formattedText = `=== AUDYT I ANALIZA KODU (${language ? language.toUpperCase() : 'AUTO'}) ===\n\n` +
      `[BŁĘDY (${errorsCount})]:\n` +
      (result.errors.length > 0 ? result.errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n') : 'Brak wykrytych błędów krytycznych.') +
      `\n\n[SUGESTIE POPRAWY (${suggestionsCount})]:\n` +
      (result.suggestions.length > 0 ? result.suggestions.map((sug, idx) => `${idx + 1}. ${sug}`).join('\n') : 'Brak dodatkowych sugestii.');

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    showToast({
      title: 'Skopiowano wyniki',
      description: 'Pełny raport z analizy kodu został zapisany w schowku.',
      variant: 'info'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span>Wyniki Analizy Kodu AI</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Szczegółowy audyt pod kątem bezpieczeństwa, wydajności i czystości kodu.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2 self-start sm:self-auto border-slate-300 dark:border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Skopiowano</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Kopiuj Raport</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <Tabs defaultValue="errors" className="w-full">
          <TabsList className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4">
            <TabsTrigger value="errors" className="flex items-center justify-center gap-2 py-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Błędy</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                errorsCount > 0 
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {errorsCount}
              </span>
            </TabsTrigger>

            <TabsTrigger value="suggestions" className="flex items-center justify-center gap-2 py-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Sugestie</span>
              <span className="px-2 py-0.5 text-xs rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {suggestionsCount}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Errors */}
          <TabsContent value="errors" className="space-y-3 mt-2">
            {errorsCount === 0 ? (
              <div className="p-6 text-center border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-semibold text-sm">Nie wykryto krytycznych błędów!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Twój kod przeszedł podstawową weryfikację poprawności składniowej i logicznej.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {result.errors.map((error, idx) => (
                  <li 
                    key={idx}
                    className="p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-slate-800 dark:text-rose-200 text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold text-xs uppercase text-rose-600 dark:text-rose-400 block mb-0.5">Problem #{idx + 1}</span>
                      <span>{error}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* Tab 2: Suggestions */}
          <TabsContent value="suggestions" className="space-y-3 mt-2">
            {suggestionsCount === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-slate-500">
                <p className="text-sm">Brak dodatkowych sugestii optymalizacyjnych.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {result.suggestions.map((suggestion, idx) => (
                  <li 
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-slate-800 dark:text-amber-200 text-sm"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold text-xs uppercase text-amber-600 dark:text-amber-400 block mb-0.5">Rekomendacja #{idx + 1}</span>
                      <span>{suggestion}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
