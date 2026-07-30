import { ProjectFile } from '../types';

export const SKELETON_FILES: ProjectFile[] = [
  {
    path: 'lib/githubClient.ts',
    name: 'githubClient.ts',
    category: 'lib',
    language: 'typescript',
    description: 'Oficjalny klient GitHub API v3 (Octokit) do zarządzania repozytoriami, Pull Requestami, kwestiami (Issues) i plikami.',
    content: `import { Octokit } from '@octokit/rest';

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  language: string | null;
  isPrivate: boolean;
  updatedAt: string | null;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  htmlUrl: string;
  createdAt: string;
  author: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  htmlUrl: string;
  createdAt: string;
  author: string;
  merged: boolean;
  draft: boolean;
  commitsCount?: number;
  additions?: number;
  deletions?: number;
}

export interface GitHubClientConfig {
  auth?: string;
  baseUrl?: string;
}

export class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthError';
  }
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(config: GitHubClientConfig = {}) {
    const token =
      config.auth ||
      (typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined) ||
      (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GITHUB_TOKEN : undefined);

    this.octokit = new Octokit({
      auth: token || undefined,
      baseUrl: config.baseUrl || 'https://api.github.com',
      userAgent: 'github-client-app/1.0.0',
    });
  }

  /**
   * 1. Pobiera listę repozytoriów użytkownika.
   */
  async getUserRepos(username: string): Promise<Repo[]> {
    const response = await this.octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 30,
    });

    return response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      language: repo.language,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
    }));
  }

  /**
   * 2. Tworzy nowy issue w repozytorium.
   */
  async createIssue(owner: string, repo: string, title: string, body: string): Promise<Issue> {
    const response = await this.octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
    });

    const issue = response.data;
    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body ?? null,
      state: issue.state,
      htmlUrl: issue.html_url,
      createdAt: issue.created_at,
      author: issue.user?.login || 'unknown',
    };
  }

  /**
   * 3. Pobiera dane Pull Requesta.
   */
  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<PullRequest> {
    const response = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    const pr = response.data;
    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body ?? null,
      state: pr.state,
      htmlUrl: pr.html_url,
      createdAt: pr.created_at,
      author: pr.user?.login || 'unknown',
      merged: pr.merged ?? false,
      draft: pr.draft ?? false,
      commitsCount: pr.commits,
      additions: pr.additions,
      deletions: pr.deletions,
    };
  }

  /**
   * 4. Dodaje komentarz do PR.
   */
  async createPullRequestComment(
    owner: string,
    repo: string,
    prNumber: number,
    body: string
  ): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
  }

  /**
   * 5. Pobiera zawartość pliku z repozytorium.
   */
  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const response = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    const data = response.data;
    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    throw new Error('Nieprawidłowa zawartość pliku.');
  }
}

export const githubClient = new GitHubClient();`
  },
  {
    path: 'lib/aiStudioClient.ts',
    name: 'aiStudioClient.ts',
    category: 'lib',
    language: 'typescript',
    description: 'Klient integracji z Google AI Studio (Vertex AI) obsłuujący generowanie, analizę, tłumaczenie i wyjaśnianie kodu z automatycznym Retry & Auth handling.',
    content: `import { GoogleGenAI, Type } from '@google/genai';

export interface CodeAnalysisResult {
  errors: string[];
  suggestions: string[];
}

export interface AIStudioClientConfig {
  apiKey?: string;
  projectId?: string;
  location?: string;
  model?: string;
  maxRetries?: number;
  initialBackoffMs?: number;
}

export class AIStudioAuthError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AIStudioAuthError';
  }
}

export class AIStudioRateLimitError extends Error {
  constructor(message: string, public retryAfterSeconds?: number) {
    super(message);
    this.name = 'AIStudioRateLimitError';
  }
}

export class AIStudioClient {
  private apiKey: string;
  private projectId: string;
  private location: string;
  private model: string;
  private maxRetries: number;
  private initialBackoffMs: number;
  private aiGenClient: GoogleGenAI | null = null;
  private vertexPredictionClient: PredictionServiceClient | null = null;

  constructor(config: AIStudioClientConfig = {}) {
    this.apiKey =
      config.apiKey ||
      process.env.GOOGLE_AI_STUDIO_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '';

    this.projectId =
      config.projectId ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCP_PROJECT_ID ||
      'default-project';

    this.location = config.location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    this.model = config.model || 'gemini-3.6-flash';
    this.maxRetries = config.maxRetries ?? 3;
    this.initialBackoffMs = config.initialBackoffMs ?? 1000;

    if (this.apiKey) {
      this.aiGenClient = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    try {
      this.vertexPredictionClient = new PredictionServiceClient({
        apiEndpoint: \`\${this.location}-aiplatform.googleapis.com\`,
      });
    } catch {
      this.vertexPredictionClient = null;
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        if (!this.apiKey && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          throw new AIStudioAuthError(
            'Brak klucza API. Ustaw zmienną GOOGLE_AI_STUDIO_API_KEY lub GEMINI_API_KEY.'
          );
        }
        return await fn();
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        const status = error?.status || error?.statusCode || error?.code;

        if (
          status === 401 ||
          status === 403 ||
          errorMsg.includes('API_KEY_INVALID') ||
          errorMsg.includes('UNAUTHENTICATED') ||
          errorMsg.includes('PERMISSION_DENIED')
        ) {
          throw new AIStudioAuthError(\`Błąd autoryzacji: \${errorMsg}\`, status);
        }

        const isRateLimit =
          status === 429 ||
          errorMsg.includes('RESOURCE_EXHAUSTED') ||
          errorMsg.includes('Rate limit');

        if (isRateLimit) {
          attempt++;
          if (attempt > this.maxRetries) {
            throw new AIStudioRateLimitError(
              \`Przekroczono limit zapytań po \${this.maxRetries} próbach.\`
            );
          }
          const backoff = this.initialBackoffMs * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }

        throw error;
      }
    }
    throw new Error('Błąd zapytania do AI Studio.');
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const formattedPrompt = \`Wygeneruj czysty kod w języku \${language}.\\nPrompt: \${prompt}\`;
      if (this.aiGenClient) {
        const response = await this.aiGenClient.models.generateContent({
          model: this.model,
          contents: formattedPrompt,
        });
        return this.cleanCodeOutput(response.text || '');
      }
      throw new AIStudioAuthError('Brak skonfigurowanego klienta AI Studio.');
    });
  }

  async analyzeCode(code: string, language: string): Promise<CodeAnalysisResult> {
    return this.executeWithRetry(async () => {
      const promptStr = \`Przeanalizuj kod \${language}:\\n\${code}\`;
      if (this.aiGenClient) {
        const response = await this.aiGenClient.models.generateContent({
          model: this.model,
          contents: promptStr,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                errors: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['errors', 'suggestions'],
            },
          },
        });
        return JSON.parse(response.text || '{}');
      }
      return { errors: [], suggestions: [] };
    });
  }

  async translateCode(code: string, fromLanguage: string, toLanguage: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const promptStr = \`Przetłumacz kod z \${fromLanguage} na \${toLanguage}:\\n\${code}\`;
      if (this.aiGenClient) {
        const response = await this.aiGenClient.models.generateContent({
          model: this.model,
          contents: promptStr,
        });
        return this.cleanCodeOutput(response.text || '');
      }
      throw new AIStudioAuthError('Brak skonfigurowanego klienta.');
    });
  }

  async explainCode(code: string, language: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const promptStr = \`Wyjaśnij kod \${language}:\\n\${code}\`;
      if (this.aiGenClient) {
        const response = await this.aiGenClient.models.generateContent({
          model: this.model,
          contents: promptStr,
        });
        return response.text || '';
      }
      throw new AIStudioAuthError('Brak skonfigurowanego klienta.');
    });
  }

  private cleanCodeOutput(rawText: string): string {
    let text = rawText.trim();
    if (text.startsWith('\`\`\`')) {
      const firstLineEnd = text.indexOf('\\n');
      if (firstLineEnd !== -1) text = text.substring(firstLineEnd + 1);
      if (text.endsWith('\`\`\`')) text = text.substring(0, text.length - 3);
    }
    return text.trim();
  }
}

export const aiStudioClient = new AIStudioClient();`
  },
  {
    path: 'package.json',
    name: 'package.json',
    category: 'config',
    language: 'json',
    description: 'Konfiguracja pakietu z zależnościami Next.js 14, React 18, Tailwind CSS, Radix UI i TypeScript.',
    content: `{
  "name": "pmcmark-ai-developer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.453.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.17.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.15"
  }
}`
  },
  {
    path: 'next.config.js',
    name: 'next.config.js',
    category: 'config',
    language: 'javascript',
    description: 'Plik konfiguracyjny Next.js z optymalizacjami dla Vercel, nagłówkami bezpieczeństwa i obsługą obrazów.',
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;`
  },
  {
    path: 'tsconfig.json',
    name: 'tsconfig.json',
    category: 'config',
    language: 'json',
    description: 'Ścisła konfiguracja TypeScript (Strict Mode) ze zdefiniowanym aliasem ścieżek @/* dla App Router.',
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`
  },
  {
    path: 'tailwind.config.ts',
    name: 'tailwind.config.ts',
    category: 'config',
    language: 'typescript',
    description: 'Konfiguracja Tailwind CSS z natywną obsługą trybu ciemnego (darkMode: "class") i paletą kolorów PMCMARK.',
    content: `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0265d2',
          700: '#034ea2',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;`
  },
  {
    path: 'app/layout.tsx',
    name: 'layout.tsx',
    category: 'app',
    language: 'typescript',
    description: 'Główny układ aplikacji Next.js App Router z motywem i systemem Toast.',
    content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PMCMARK AI DEVELOPER | Komponenty UI & Platforma AI',
  description: 'Szybkie, bezpieczne i nowoczesne środowisko z kompletnym zestawem komponentów shadcn/ui i Radix.',
  keywords: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Radix', 'AI Developer', 'Vercel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={\`\${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col\`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToastProvider>
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}`
  },
  {
    path: 'app/page.tsx',
    name: 'page.tsx',
    category: 'app',
    language: 'typescript',
    description: 'Strona główna z formularzem do generowania kodu za pomocą Google AI Studio (Gemini API) oraz zestawem komponentów UI.',
    content: `'use client';

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
  CodeBlock,
  LoadingSpinner
} from '@/components';
import { aiStudioClient, AIStudioAuthError, AIStudioRateLimitError } from '@/lib/aiStudioClient';
import { Sparkles, Code2, Terminal, Send, Lightbulb, Play, RefreshCw, Copy, Check } from 'lucide-react';

export interface SamplePrompt {
  title: string;
  language: string;
  prompt: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    title: 'Sortowanie tablicy (Python)',
    language: 'python',
    prompt: 'Stwórz funkcję sortującą tablicę obiektów użytkowników według wieku i nazwiska w Pythonie.',
  },
  {
    title: 'Algorytm BFS (TypeScript)',
    language: 'typescript',
    prompt: 'Zaimplementuj algorytm przeszukiwania grafu w szerokość (BFS) z pełnym typowaniem w TypeScript.',
  },
  {
    title: 'REST API Server (Go)',
    language: 'go',
    prompt: 'Napisz prosty serwer HTTP REST API z routingiem dla zasobu produktów w języku Go.',
  },
  {
    title: 'Algorytm QuickSort (Rust)',
    language: 'rust',
    prompt: 'Zaimplementuj szybkie sortowanie (QuickSort) na wektorze liczb całkowitych w języku Rust.',
  },
];

export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
];

export default function HomePage() {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('Stwórz funkcję sortującą tablicę obiektów po wybranym kluczu w Pythonie.');
  const [language, setLanguage] = useState('python');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      showToast({
        title: 'Błąd walidacji',
        description: 'Wprowadź opis zadania przed wygenerowaniem kodu.',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedCode(null);

    try {
      const code = await aiStudioClient.generateCode(prompt, language);
      setGeneratedCode(code);
      showToast({
        title: 'Sukces wygenerowania kodu!',
        description: 'Pomyślnie wygenerowano kod w języku ' + language.toUpperCase() + '.',
        variant: 'success',
      });
    } catch (error: any) {
      let errorMsg = 'Wystąpił nieoczekiwany błąd podczas generowania kodu.';
      if (error instanceof AIStudioAuthError) {
        errorMsg = 'Błąd autoryzacji: Ustaw klucz API GOOGLE_AI_STUDIO_API_KEY lub GEMINI_API_KEY.';
      } else if (error instanceof AIStudioRateLimitError) {
        errorMsg = 'Przekroczono limit zapytań Google AI Studio (Rate Limit Exceeded). Spróbuj ponownie za chwilę.';
      } else if (error?.message) {
        errorMsg = error.message;
      }

      showToast({
        title: 'Błąd Generowania Kodu',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applySamplePrompt = (sample: SamplePrompt) => {
    setPrompt(sample.prompt);
    setLanguage(sample.language);
    showToast({
      title: 'Wczytano przykładowy prompt',
      description: 'Ustawiono język: ' + sample.language.toUpperCase(),
      variant: 'info',
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header Banner */}
      <section className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generator Kodu AI (Google AI Studio & Gemini API)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Generator Kodu <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">AI Studio</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Opisz logikę biznesową, wybierz język programowania i wygeneruj czysty, gotowy do wdrożenia kod produkcyjny.
        </p>
      </section>

      {/* Main Generator Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            <span>Formularz Generowania Kodu</span>
          </CardTitle>
          <CardDescription>
            Wybierz docelowy język programowania oraz wprowadź szczegółowe wymagania.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Form Fields: Select & Textarea */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Select
                label="Język Programowania"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGE_OPTIONS}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Wybierz Przykładowy Prompt
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySamplePrompt(sp)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    <span>{sp.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Textarea
            label="Opis Zadania (Prompt)"
            placeholder="Opisz, jaki kod chcesz wygenerować..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            hint="Szczegółowy opis zachowania funkcji, typów wejściowych oraz ograniczeń przyspiesza generowanie."
          />
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <span className="text-[11px] text-slate-500">
            Napędzane przez model Google Gemini 3.6 Flash / 1.5 Pro
          </span>
          <Button
            variant="primary"
            onClick={handleGenerateCode}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" label="Generowanie kodu..." />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Wygeneruj Kod</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Result CodeBlock Display */}
      {generatedCode && (
        <Card className="border-emerald-500/30 bg-slate-950 text-white shadow-2xl animate-in fade-in">
          <CardHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Wygenerowany Kod ({language.toUpperCase()})</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <CodeBlock
              language={language}
              code={generatedCode}
              filename={'generated_code.' + language}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}`
  },
  {
    path: 'app/analyze/page.tsx',
    name: 'page.tsx',
    category: 'app',
    language: 'typescript',
    description: 'Strona /analyze z formularzem do analizy kodu za pomocą Gemini API i dwoma zakładkami wyników.',
    content: `'use client';

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
} from '@/components';
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
        description: 'Otrzymano ' + result.errors.length + ' błędów i ' + result.suggestions.length + ' sugestii.',
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
}`
  },
  {
    path: 'app/docs/page.tsx',
    name: 'page.tsx',
    category: 'app',
    language: 'typescript',
    description: 'Strona /docs z formularzem do generowania profesjonalnej dokumentacji README.md za pomocą Gemini AI Studio.',
    content: `'use client';

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

export function formatMarkdownCode(rawMarkdown: string): string {
  if (!rawMarkdown) return '';

  let text = rawMarkdown.trim();

  const tripleTicks = String.fromCharCode(96, 96, 96);
  if (text.startsWith(tripleTicks)) {
    const firstLineEnd = text.indexOf('\\n');
    if (firstLineEnd !== -1) {
      text = text.substring(firstLineEnd + 1);
    }
    if (text.endsWith(tripleTicks)) {
      text = text.substring(0, text.length - 3);
    }
  }

  return text
    .replace(/\\r\\n/g, '\\n')
    .replace(/\\n{3,}/g, '\\n\\n')
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
      const prompt = 'Stwórz profesjonalny plik README.md dla projektu o nazwie ' + projectName + '. Opis: ' + projectDescription + '. Kod (opcjonalnie): ' + (codeSnippet || 'Brak') + '. Użyj języka ' + language + '. Dodaj sekcje: Opis, Funkcjonalności, Instalacja, Użycie, Przykład, Licencja.';
      
      let rawResult = '';
      if (typeof (aiStudioClient as any).generateReadme === 'function') {
        rawResult = await (aiStudioClient as any).generateReadme(
          projectName,
          projectDescription,
          codeSnippet,
          language
        );
      } else {
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

      {isLoading && (
        <Card className="border-blue-500/30 p-8 text-center bg-slate-900/40">
          <LoadingSpinner size="lg" variant="spinner" label="Tworzenie sekcji README w Google AI Studio..." className="justify-center" />
        </Card>
      )}

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
`
  },
  {
    path: 'components/CodeAnalysisResult.tsx',
    name: 'CodeAnalysisResult.tsx',
    category: 'components',
    language: 'typescript',
    description: 'Komponent prezentujący wyniki analizy kodu w zakładkach Błędy i Sugestie z funkcją kopiowania raportu.',
    content: `import React, { useState } from 'react';
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
} from '@/components';
import { AlertTriangle, Lightbulb, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { CodeAnalysisResult as CodeAnalysisResultType } from '@/lib/aiStudioClient';

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
    const formattedText = '=== AUDYT I ANALIZA KODU (' + (language ? language.toUpperCase() : 'AUTO') + ') ===\\n\\n' +
      '[BŁĘDY (' + errorsCount + ')]:\\n' +
      (result.errors.length > 0 ? result.errors.map((err, idx) => (idx + 1) + '. ' + err).join('\\n') : 'Brak wykrytych błędów krytycznych.') +
      '\\n\\n[SUGESTIE POPRAWY (' + suggestionsCount + ')]:\\n' +
      (result.suggestions.length > 0 ? result.suggestions.map((sug, idx) => (idx + 1) + '. ' + sug).join('\\n') : 'Brak dodatkowych sugestii.');

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
              <span className={'px-2 py-0.5 text-xs rounded-full font-bold ' + (errorsCount > 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20')}>
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
}`
  },
  {
    path: 'components/ui/button.tsx',
    name: 'button.tsx',
    category: 'components',
    language: 'typescript',
    description: '1. Komponent Przycisk (Button) z wariantami primary, secondary, outline, ghost, destructive.',
    content: `import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 border border-blue-500/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    outline: 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
    destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 border border-rose-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    icon: 'p-2 w-9 h-9 text-sm',
  };

  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}`
  },
  {
    path: 'components/ui/input.tsx',
    name: 'input.tsx',
    category: 'components',
    language: 'typescript',
    description: '2. Komponent Pole Tekstowe (Input) z obsługą etykiety, błędów i wskazówek.',
    content: `import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={\`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors \${
          error
            ? 'border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/30'
        } disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 \${className}\`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}`
  },
  {
    path: 'components/ui/textarea.tsx',
    name: 'textarea.tsx',
    category: 'components',
    language: 'typescript',
    description: '3. Komponent Obszar Tekstowy (Textarea) z automatyczną zmianą wysokości (Auto-Resize).',
    content: `import React, { useRef, useEffect } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  autoResize = true,
  className = '',
  onChange,
  value,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = \`\${textareaRef.current.scrollHeight + 2}px\`;
    }
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e);
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        rows={3}
        className={\`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none min-h-[90px] \${
          error
            ? 'border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/30'
        } \${className}\`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}`
  },
  {
    path: 'components/ui/card.tsx',
    name: 'card.tsx',
    category: 'components',
    language: 'typescript',
    description: '4. Komponent Karta (Card) z podziałem na CardHeader, CardTitle, CardDescription, CardContent, CardFooter.',
    content: `import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={\`p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors \${className}\`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={\`space-y-1 mb-4 \${className}\`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={\`font-bold text-lg text-slate-900 dark:text-white tracking-tight \${className}\`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={\`text-xs text-slate-500 dark:text-slate-400 \${className}\`}>{children}</p>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={\`space-y-4 \${className}\`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={\`mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between \${className}\`}>{children}</div>;
}`
  },
  {
    path: 'components/ui/dialog.tsx',
    name: 'dialog.tsx',
    category: 'components',
    language: 'typescript',
    description: '5. Komponent Okno Dialogowe / Modal (Dialog) w oparciu o Radix Primitives / React Portal concept.',
    content: `'use client';

import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function Dialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    if (!isControlled) setInternalOpen(val);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('DialogTrigger musi być wewnątrz Dialog');

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      if (children.props.onClick) children.props.onClick(e);
      ctx.setOpen(true);
    },
  });
}

export function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(DialogContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={\`relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 \${className}\`}>
        <button
          onClick={() => ctx.setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-bold text-lg text-slate-900 dark:text-white">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 dark:text-slate-400">{children}</p>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">{children}</div>;
}`
  },
  {
    path: 'components/ui/toast.tsx',
    name: 'toast.tsx',
    category: 'components',
    language: 'typescript',
    description: '6. Komponent Powiadomienia Toast z dostawcą (ToastProvider) i hookiem useToast.',
    content: `'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const variants = {
            success: 'bg-emerald-950 border-emerald-800 text-emerald-200',
            error: 'bg-rose-950 border-rose-800 text-rose-200',
            info: 'bg-blue-950 border-blue-800 text-blue-200',
            warning: 'bg-amber-950 border-amber-800 text-amber-200',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          };

          const variantKey = t.variant || 'info';

          return (
            <div
              key={t.id}
              className={\`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 \${variants[variantKey]}\`}
            >
              <div className="flex items-start gap-3">
                {icons[variantKey]}
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">{t.title}</h4>
                  {t.description && <p className="text-xs opacity-90">{t.description}</p>}
                </div>
              </div>
              <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast musi być użyty wewnątrz ToastProvider');
  return ctx;
}`
  },
  {
    path: 'components/ui/code-block.tsx',
    name: 'code-block.tsx',
    category: 'components',
    language: 'typescript',
    description: '7. Komponent Bloku Kodu (CodeBlock) z wyśmielaniem linii, kopiowaniem i etykietą języka.',
    content: `'use client';

import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = 'typescript', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl text-xs font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-200">{filename || 'Snippet'}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans text-xs">Skopiowano</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans text-xs">Kopiuj</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-slate-200">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50">
                <td className="w-8 pr-4 text-right select-none text-slate-600 text-[11px] align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre align-top text-slate-300">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`
  },
  {
    path: 'components/ui/select.tsx',
    name: 'select.tsx',
    category: 'components',
    language: 'typescript',
    description: '8. Komponent Wyboru / Dropdown (Select) z opcjami i etykietą.',
    content: `import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export function Select({
  label,
  options,
  error,
  hint,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={\`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border text-slate-900 dark:text-slate-100 text-sm appearance-none focus:outline-none focus:ring-2 transition-colors pr-10 cursor-pointer \${
            error
              ? 'border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/30'
          } \${className}\`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}`
  },
  {
    path: 'components/ui/tabs.tsx',
    name: 'tabs.tsx',
    category: 'components',
    language: 'typescript',
    description: '9. Komponent Zakładek (Tabs) z obsługą wariantów i natywnego kontekstu stanu.',
    content: `'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeValue: string;
  setActiveValue: (val: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalVal, setInternalVal] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalVal;

  const setActiveValue = (val: string) => {
    if (onValueChange) onValueChange(val);
    if (value === undefined) setInternalVal(val);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={\`w-full \${className}\`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={\`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 \${className}\`}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger musi być wewnątrz Tabs');

  const isActive = ctx.activeValue === value;

  return (
    <button
      onClick={() => ctx.setActiveValue(value)}
      className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none \${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
      } \${className}\`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent musi być wewnątrz Tabs');

  if (ctx.activeValue !== value) return null;

  return <div className={\`pt-4 animate-in fade-in-50 duration-200 \${className}\`}>{children}</div>;
}`
  },
  {
    path: 'components/ui/loading-spinner.tsx',
    name: 'loading-spinner.tsx',
    category: 'components',
    language: 'typescript',
    description: '10. Komponent Wskaźnika Ładowania (LoadingSpinner) w różnych wariantach i rozmiarach.',
    content: `import React from 'react';
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
    <div className={\`inline-flex items-center gap-2 font-medium text-slate-400 \${className}\`}>
      {variant === 'spinner' && (
        <Loader2 className={\`animate-spin text-blue-500 \${sizeMap[size]}\`} />
      )}
      {variant === 'dots' && (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
        </div>
      )}
      {variant === 'pulse' && (
        <div className={\`rounded-full bg-blue-500 animate-pulse \${sizeMap[size]}\`} />
      )}
      {label && <span className="text-xs text-slate-300">{label}</span>}
    </div>
  );
}`
  },
  {
    path: 'components/index.ts',
    name: 'index.ts',
    category: 'components',
    language: 'typescript',
    description: 'Główny punkt eksportu wszystkich 10 komponentów UI dla czystych importów.',
    content: `export * from './ui/button';
export * from './ui/input';
export * from './ui/textarea';
export * from './ui/card';
export * from './ui/dialog';
export * from './ui/toast';
export * from './ui/code-block';
export * from './ui/select';
export * from './ui/tabs';
export * from './ui/loading-spinner';`
  },
  {
    path: 'lib/utils.ts',
    name: 'utils.ts',
    category: 'lib',
    language: 'typescript',
    description: 'Funkcje pomocnicze, m.in. scalanie klas Tailwind (`cn`) i formatowanie dat.',
    content: `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}`
  },
  {
    path: 'lib/ai-client.ts',
    name: 'ai-client.ts',
    category: 'lib',
    language: 'typescript',
    description: 'Klient połączenia z API AI z bezpieczną obsługą zapytania HTTP POST.',
    content: `export interface GenerateCodeParams {
  prompt: string;
  language?: string;
}

export async function generateAICode({ prompt, language = 'typescript' }: GenerateCodeParams) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, language }),
  });

  if (!response.ok) {
    throw new Error('Nie udało się wygenerować kodu przez PMCMARK AI');
  }

  return response.json();
}`
  },
  {
    path: 'types/index.ts',
    name: 'index.ts',
    category: 'types',
    language: 'typescript',
    description: 'Główne interfejsy i typy TypeScript dla całej aplikacji PMCMARK AI DEVELOPER.',
    content: `export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer';
}

export interface AIPromptRequest {
  prompt: string;
  context?: string;
}

export interface AIPromptResponse {
  success: boolean;
  data?: {
    receivedPrompt: string;
    generatedCode: string;
    timestamp: string;
  };
  error?: string;
}

export interface ProjectConfig {
  name: string;
  version: string;
  environment: 'development' | 'production';
}`
  },
  {
    path: '.gitignore',
    name: '.gitignore',
    category: 'config',
    language: 'ignore',
    description: 'Standardowy plik .gitignore dla projektów Next.js ignorujący node_modules i .next.',
    content: `# node_modules
/node_modules
/.pnp
.pnp.js

# build output
/.next/
/out/
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`
  },
  {
    path: '.env.example',
    name: '.env.example',
    category: 'config',
    language: 'env',
    description: 'Szablon zmiennych środowiskowych wymaganych przy wdrożeniu.',
    content: `# PMCMARK AI DEVELOPER - Zmienne środowiskowe
NEXT_PUBLIC_APP_NAME="PMCMARK AI DEVELOPER"
NEXT_PUBLIC_APP_URL="https://pmcmark-ai.vercel.app"

# Klucz API dla Usług AI (opcjonalny)
GEMINI_API_KEY="twój_klucz_api_gemini"`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'docs',
    language: 'markdown',
    description: 'Pełna instrukcja uruchomienia i wdrożenia na Vercel w języku polskim.',
    content: `# PMCMARK AI DEVELOPER - Szkielet Projektu Next.js 14 z Komponentami UI

Kompletny, nowoczesny szkielet aplikacji webowej budowany w oparciu o **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS** oraz 10 komponentów **shadcn/ui i Radix UI**.

## 🚀 Instalacja Komponentów UI

Aby zainstalować wymagane zależności shadcn i Radix w swoim projekcie Next.js:

\`\`\`bash
# 1. Inicjalizacja shadcn/ui
npx shadcn@latest init --defaults

# 2. Instalacja komponentów Radix & ikon
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast clsx tailwind-merge lucide-react
\`\`\`

## 📦 Wygenerowane Komponenty UI:
1. \`components/ui/button.tsx\` - Przycisk z wariantami (primary, secondary, outline, ghost, destructive)
2. \`components/ui/input.tsx\` - Pole tekstowe z etykietą i walidacją błędów
3. \`components/ui/textarea.tsx\` - Obszar tekstowy z automatyczną zmianą wysokości (auto-resize)
4. \`components/ui/card.tsx\` - Struktura karty (Header, Title, Description, Content, Footer)
5. \`components/ui/dialog.tsx\` - Okno modalne z tłem rozmycia
6. \`components/ui/toast.tsx\` - System powiadomień Toast z hookiem \`useToast\`
7. \`components/ui/code-block.tsx\` - Prezentacja kodu z numerami linii i przyciskiem kopiowania
8. \`components/ui/select.tsx\` - Rozwijane menu wyboru (Dropdown Select)
9. \`components/ui/tabs.tsx\` - Zakładki (Tabs, TabsList, TabsTrigger, TabsContent)
10. \`components/ui/loading-spinner.tsx\` - Animowane wskaźniki ładowania (sm, md, lg, spinner, dots, pulse)
`
  },
  {
    path: 'jest.config.js',
    name: 'jest.config.js',
    category: 'config',
    language: 'javascript',
    description: 'Konfiguracja runnera testów Jest dla środowiska Next.js i React Testing Library.',
    content: `const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@root/(.*)$': '<rootDir>/$1',
    '\\\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = config;`
  },
  {
    path: 'jest.setup.js',
    name: 'jest.setup.js',
    category: 'config',
    language: 'javascript',
    description: 'Plik inicjalizujący środowisko DOM i mocki klipboardu oraz rozszerzenia jest-dom.',
    content: `import '@testing-library/jest-dom';

if (!global.fetch) {
  global.fetch = jest.fn();
}

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
});`
  },
  {
    path: '__tests__/aiStudioClient.test.ts',
    name: 'aiStudioClient.test.ts',
    category: 'lib',
    language: 'typescript',
    description: 'Testy jednostkowe dla klienta Google AI Studio (mockowanie wywołań Gemini API).',
    content: `import { AIStudioClient, AIStudioAuthError } from '../lib/aiStudioClient';

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING' },
}));

describe('AIStudioClient', () => {
  it('powinien rzucić AIStudioAuthError przy braku klucza API', async () => {
    const client = new AIStudioClient({ apiKey: '' });
    await expect(client.generateCode('Test', 'typescript')).rejects.toThrow(AIStudioAuthError);
  });
});`
  }
];
