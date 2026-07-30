'use client';

import { useState } from 'react';
import { 
  Button, 
  Textarea, 
  Select, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  useToast,
  LoadingSpinner
} from '@/components/ui';
import { aiStudioClient, CodeAnalysisResult as CodeAnalysisResultType } from '@/lib/aiStudioClient';
import { CodeAnalysisResult } from '@/components/CodeAnalysisResult';
import { Code2, Search, Sparkles, RotateCcw } from 'lucide-react';

export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
];

export default function AnalyzePage() {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResultType | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      showToast({
        title: 'Brak kodu do analizy',
        description: 'Wklej swój kod w obszarze tekstowym przed uruchomieniem analizy.',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await aiStudioClient.analyzeCode(code, language);
      setAnalysisResult(result);
      showToast({
        title: 'Analiza zakończona sukcesem',
        description: `Otrzymano ${result.errors.length} błędów i ${result.suggestions.length} sugestii.`,
        variant: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Błąd Analizy Kodu',
        description: error?.message || 'Wystąpił nieoczekiwany błąd podczas komunikacji z Google AI Studio.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-4 py-4">
      {/* Header Banner */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inteligentny Audytor Kodu Gemini AI</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Analizator i Audytor <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">Kodu AI</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Wklej dowolny fragment kodu, aby wykryć potencjalne błędy, luki bezpieczeństwa i wygenerować rekomendacje optymalizacyjne.
        </p>
      </section>

      {/* Main Form Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            <span>Formularz Analizy Kodu</span>
          </CardTitle>
          <CardDescription>
            Wybierz język programowania oraz wklej kod do weryfikacji.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="max-w-xs">
            <Select
              label="Język Programowania"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          <Textarea
            label="Kod Do Analizy"
            placeholder="Wklej tutaj swój kod..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            hint="Obsługuje pliki źródłowe, skrypty, zapytania SQL oraz algorytmy."
          />
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!code && !analysisResult}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Wyczyść
          </Button>

          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" label="Analizowanie kodu..." />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analizuj Kod</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Loading State or Results */}
      {isLoading && (
        <Card className="border-blue-500/30 p-8 text-center bg-slate-900/40">
          <LoadingSpinner size="lg" variant="spinner" label="Przetwarzanie kodu w Google AI Studio..." className="justify-center" />
        </Card>
      )}

      {analysisResult && !isLoading && (
        <CodeAnalysisResult result={analysisResult} language={language} />
      )}
    </div>
  );
}
