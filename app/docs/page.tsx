'use client';

import { useState } from 'react';
import { 
  Button, 
  Input, 
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
} from '@/components';
import { CodeBlock } from '@/components/ui/code-block';
import { aiStudioClient } from '@/lib/aiStudioClient';
import { FileText, Sparkles, Download, Copy, Check, RotateCcw, BookOpen } from 'lucide-react';

/**
 * Funkcja do formatowania i czyszczenia kodu Markdown.
 * Normalizuje sekcje, usuwa zbędne potrójne cudzysłowy oraz nadmiarowe puste linie.
 */
export function formatMarkdownCode(rawMarkdown: string): string {
  if (!rawMarkdown) return '';

  let text = rawMarkdown.trim();

  // Usuwanie nagłówka/stopki bloku kodu Markdown (np. ```markdown ... ```)
  if (text.startsWith('```')) {
    const firstLineEnd = text.indexOf('\n');
    if (firstLineEnd !== -1) {
      text = text.substring(firstLineEnd + 1);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
  }

  // Normalizacja znaków końca linii i ograniczenie podwójnych pustych linii
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const DOC_LANGUAGE_OPTIONS = [
  { value: 'Polski', label: 'Polski (Polish)' },
  { value: 'English', label: 'English' },
  { value: 'Deutsch', label: 'Deutsch (German)' },
  { value: 'Español', label: 'Español (Spanish)' },
  { value: 'Français', label: 'Français (French)' },
];

export default function DocsPage() {
  const { showToast } = useToast();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [language, setLanguage] = useState('Polski');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateReadme = async () => {
    if (!projectName.trim()) {
      showToast({
        title: 'Brak nazwy projektu',
        description: 'Wprowadź nazwę projektu przed wygenerowaniem pliku README.',
        variant: 'error',
      });
      return;
    }

    if (!projectDescription.trim()) {
      showToast({
        title: 'Brak opisu projektu',
        description: 'Podaj krótki opis projektu, aby AI mogło wygenerować odpowiednie sekcje.',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedReadme(null);

    try {
      // Wywołanie Gemini AI Studio z dostosowanym promptem
      const prompt = `Stwórz profesjonalny plik README.md dla projektu o nazwie ${projectName}. Opis: ${projectDescription}. Kod (opcjonalnie): ${codeSnippet || 'Brak'}. Użyj języka ${language}. Dodaj sekcje: Opis, Funkcjonalności, Instalacja, Użycie, Przykład, Licencja.`;
      
      let rawResult = '';
      if (typeof (aiStudioClient as any).generateReadme === 'function') {
        rawResult = await (aiStudioClient as any).generateReadme(
          projectName,
          projectDescription,
          codeSnippet,
          language
        );
      } else {
        // Fallback w przypadku użycia podstawowej metody generateCode
        rawResult = await aiStudioClient.generateCode(prompt, 'markdown');
      }

      const formattedReadme = formatMarkdownCode(rawResult);
      setGeneratedReadme(formattedReadme);

      showToast({
        title: 'Wygenerowano README.md',
        description: 'Plik dokumentacji został pomyślnie wygenerowany za pomocą Google AI Studio.',
        variant: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Błąd generowania dokumentacji',
        description: error?.message || 'Wystąpił błąd podczas połączenia z Google AI Studio.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReadme = () => {
    if (!generatedReadme) return;

    const blob = new Blob([generatedReadme], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'README.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Pobrano README.md',
      description: 'Plik z dokumentacją został zapisany na Twoim komputerze.',
      variant: 'success',
    });
  };

  const handleCopyReadme = () => {
    if (!generatedReadme) return;

    navigator.clipboard.writeText(generatedReadme);
    setCopied(true);
    showToast({
      title: 'Skopiowano treść',
      description: 'Zawartość README.md trafiła do schowka.',
      variant: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setProjectName('');
    setProjectDescription('');
    setCodeSnippet('');
    setGeneratedReadme(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-4 py-4">
      {/* Sekcja Nagłówka */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generator Dokumentacji AI Studio</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Generator Plików <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">README.md</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Uzupełnij poniższe dane projektu, a sztuczna inteligencja wygeneruje gotowy, profesjonalny plik README.md z kompletnym układem sekcji.
        </p>
      </section>

      {/* Formularz Generatora */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span>Dane Projektu</span>
          </CardTitle>
          <CardDescription>
            Wprowadź podstawowe informacje o projekcie oraz opcjonalne fragmenty kodu.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Nazwa Projektu *"
              placeholder="np. PMCMARK AI Developer"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <Select
              label="Język Dokumentacji"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={DOC_LANGUAGE_OPTIONS}
            />
          </div>

          <Textarea
            label="Opis Projektu *"
            placeholder="Opisz krótko cel projektu, architekturę, użyte technologie i główne funkcje..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={4}
            hint="Szczegółowy opis pozwoli wygenerować bogatszą dokumentację."
          />

          <Textarea
            label="Kod Projektu (Opcjonalnie)"
            placeholder="Wklej reprezentatywny fragment kodu (np. App.tsx, server.ts, schemat bazy)..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            rows={6}
            hint="Na podstawie wklejonego kodu AI stworzy precyzyjniejsze przykłady użycia."
          />
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!projectName && !projectDescription && !codeSnippet && !generatedReadme}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Wyczyść Formularz
          </Button>

          <Button
            variant="primary"
            onClick={handleGenerateReadme}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" label="Generowanie README..." />
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generuj README</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Stan Ładowania */}
      {isLoading && (
        <Card className="border-blue-500/30 p-8 text-center bg-slate-900/40">
          <LoadingSpinner size="lg" variant="spinner" label="Tworzenie sekcji README w Google AI Studio..." className="justify-center" />
        </Card>
      )}

      {/* Wyświetlanie Wyniku i Podglądu */}
      {generatedReadme && !isLoading && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-0">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Wygenerowany Plik README.md</span>
                </CardTitle>
                <CardDescription>
                  Kompletna dokumentacja zawierająca sekcje: Opis, Funkcjonalności, Instalacja, Użycie, Przykład oraz Licencja.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReadme}
                  className="flex items-center gap-2 border-slate-300 dark:border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">Skopiowano</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Kopiuj</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadReadme}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Pobierz README.md</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <CodeBlock 
              code={generatedReadme} 
              language="markdown" 
              filename="README.md" 
              showLineNumbers={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
