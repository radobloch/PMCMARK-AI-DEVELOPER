import React, { useState } from 'react';
import { 
  Bot, 
  Code2, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Key, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  HelpCircle,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { aiStudioClient, AIStudioAuthError, AIStudioRateLimitError, CodeAnalysisResult } from '../lib/aiStudioClient';

export const AIStudioShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'code' | 'instructions'>('interactive');
  const [copiedCode, setCopiedCode] = useState(false);

  // Method testing state
  const [method, setMethod] = useState<'generate' | 'analyze' | 'translate' | 'explain'>('generate');
  const [language, setLanguage] = useState('typescript');
  const [toLanguage, setToLanguage] = useState('python');
  const [prompt, setPrompt] = useState('Stwórz funkcję do walidacji adresu email oraz pobierania gravatara w TypeScript.');
  const [codeSnippet, setCodeSnippet] = useState(
    `function calculateDiscount(price: number, isVIP: boolean): number {\n  if (price <= 0) return 0;\n  return isVIP ? price * 0.8 : price * 0.95;\n}`
  );

  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setErrorMessage(null);
    setResultText(null);
    setAnalysisResult(null);

    try {
      if (method === 'generate') {
        const res = await aiStudioClient.generateCode(prompt, language);
        setResultText(res);
      } else if (method === 'analyze') {
        const res = await aiStudioClient.analyzeCode(codeSnippet, language);
        setAnalysisResult(res);
      } else if (method === 'translate') {
        const res = await aiStudioClient.translateCode(codeSnippet, language, toLanguage);
        setResultText(res);
      } else if (method === 'explain') {
        const res = await aiStudioClient.explainCode(codeSnippet, language);
        setResultText(res);
      }
    } catch (err: any) {
      if (err instanceof AIStudioAuthError) {
        setErrorMessage(`[Auth Error] ${err.message}`);
      } else if (err instanceof AIStudioRateLimitError) {
        setErrorMessage(`[Rate Limit Exceeded] ${err.message}`);
      } else {
        setErrorMessage(err?.message || 'Wystąpił nieoczekiwany błąd podczas komunikacji z AI Studio.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fullTsCode = `import { GoogleGenAI, Type } from '@google/genai';

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

export const aiStudioClient = new AIStudioClient();`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullTsCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Google AI Studio (Vertex AI) Integration Client
              </h2>
              <p className="text-xs text-blue-300">
                Oficjalna klasa <code className="font-mono bg-blue-900/50 px-1.5 py-0.5 rounded text-white">lib/aiStudioClient.ts</code> obsłutująca generowanie, analizę, tłumaczenie i wyjaśnianie kodu z automatycznym Retry & Auth handling.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            @google/genai + @google-cloud/aiplatform
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'interactive'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tester Metod Live</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kod pliku lib/aiStudioClient.ts</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'instructions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Instrukcja Pobrania Klucza API</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Live Interactive Testing */}
      {activeTab === 'interactive' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Interaktywne Wywoływanie Metod Clienta</span>
            </h3>
            <p className="text-xs text-slate-400">
              Wybierz jedną z 4 zaimplementowanych metod i przetestuj jej działanie.
            </p>
          </div>

          {/* Method Selection Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'generate', name: '1. generateCode', desc: 'Generuje kod z promptu' },
              { id: 'analyze', name: '2. analyzeCode', desc: 'Wykrywa błędy & sugestie' },
              { id: 'translate', name: '3. translateCode', desc: 'Tłumaczy między językami' },
              { id: 'explain', name: '4. explainCode', desc: 'Wyjaśnia działanie kodu' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id as any)}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  method === m.id
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-xs font-bold text-blue-400">{m.name}</div>
                <div className="text-[10px] text-slate-400">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Configuration Controls */}
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Język Źródłowy</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            {method === 'translate' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Język Docelowy</label>
                <select
                  value={toLanguage}
                  onChange={(e) => setToLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="csharp">C#</option>
                </select>
              </div>
            )}
          </div>

          {/* Dynamic Input Area */}
          {method === 'generate' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Prompt dla Generatora Kodu</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Kod Wejściowy do Analizy / Tłumaczenia / Wyjaśnienia</label>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Execute Button */}
          <div className="flex justify-end">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Wywoływanie API Google AI Studio...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Uruchom {method}Code()</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Obsługa Błędu Clienta AI Studio:</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Result Output */}
          {resultText && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Wynik Zwrócony przez AI Studio:</span>
              </div>
              <pre className="p-3 rounded-lg bg-black font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {resultText}
              </pre>
            </div>
          )}

          {/* Analysis Output JSON */}
          {analysisResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strukturyzowany Wynik Analizy Kodu (JSON Output):</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Błędy & Usterki ({analysisResult.errors.length})
                  </h4>
                  {analysisResult.errors.length === 0 ? (
                    <p className="text-xs text-slate-400">Brak wykrytych krytycznych błędów.</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
                      {analysisResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sugestie Ulepszeń ({analysisResult.suggestions.length})
                  </h4>
                  {analysisResult.suggestions.length === 0 ? (
                    <p className="text-xs text-slate-400">Brak sugestii refaktoryzacji.</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs text-blue-200 space-y-1">
                      {analysisResult.suggestions.map((sug, idx) => (
                        <li key={idx}>{sug}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Full Code Display */}
      {activeTab === 'code' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Zawartość Pliku lib/aiStudioClient.ts</h3>
              <p className="text-xs text-slate-400">
                W pełni typowana klasa TypeScript z obsługą SDK <code className="font-mono text-blue-400">@google/genai</code> i <code className="font-mono text-blue-400">@google-cloud/aiplatform</code>.
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Skopiowano</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kopiuj Kod Clienta</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto max-h-[600px]">
            <pre className="leading-relaxed">
              <code>{fullTsCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: Instructions for API Key */}
      {activeTab === 'instructions' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Instrukcja Uzyskania Klucza API z Google AI Studio / Google Cloud Console</span>
            </h3>
            <p className="text-xs text-slate-400">
              Postępuj zgodnie z poniższymi krokami, aby uzyskać bezpłatny klucz API Google AI Studio i wdrożyć go w swojej aplikacji.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">1</span>
                <span>Wejdź na portal Google AI Studio</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                Otwórz stronę <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">https://aistudio.google.com/</a> i zaloguj się na swoje konto Google Cloud.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">2</span>
                <span>Wygeneruj Nowy Klucz API (Get API key)</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                W lewym menu bocznym kliknij przycisk <strong className="text-white">"Get API key"</strong>, a następnie wybierz <strong className="text-white">"Create API key in new project"</strong> lub połącz go z istniejącym projektem Google Cloud (GCP).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">3</span>
                <span>Ustaw Zmienną Środowiskową w Projekcie</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                Dodaj uzyskany klucz w pliku <code className="font-mono bg-slate-800 px-1 py-0.5 rounded text-amber-300">.env</code> lub w panelu <strong className="text-white">Settings &gt; Secrets</strong> w AI Studio:
              </p>
              <div className="p-3 rounded-lg bg-black font-mono text-xs text-emerald-400 ml-7 border border-slate-800">
                GOOGLE_AI_STUDIO_API_KEY="AIzaSyYourSecretKeyHere..."
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">4</span>
                <span>Inicjalizacja i Bezpieczeństwo</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                Klasa <code className="font-mono text-blue-400">AIStudioClient</code> automatycznie odczyta zmienną <code className="font-mono text-amber-300">GOOGLE_AI_STUDIO_API_KEY</code> (lub rezerwowo <code className="font-mono text-amber-300">GEMINI_API_KEY</code>). Pamiętaj, aby zawsze wykonywać zapytania po stronie serwera API, chroniąc klucz przed wyciekiem do przeglądarki.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
