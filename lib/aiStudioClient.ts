import { GoogleGenAI, Type } from '@google/genai';

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

/**
 * Klient integracji z Google AI Studio (oraz GCP Vertex AI)
 * Zaimplementowany zgodnie z najnowszym oficjalnym SDK @google/genai.
 */
export class AIStudioClient {
  private apiKey: string;
  private projectId: string;
  private location: string;
  private model: string;
  private maxRetries: number;
  private initialBackoffMs: number;
  private aiGenClient: GoogleGenAI | null = null;

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

    // Inicjalizacja klienta Google AI Studio SDK
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
  }

  /**
   * Wykonuje operację API z automatyczną obsługą powtórzeń (Exponential Backoff dla HTTP 429) oraz wyłapywaniem błędów autoryzacji.
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        if (!this.apiKey) {
          throw new AIStudioAuthError(
            'Brak klucza API. Ustaw zmienną środowiskową GOOGLE_AI_STUDIO_API_KEY lub GEMINI_API_KEY.'
          );
        }

        return await fn();
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        const status = error?.status || error?.statusCode || error?.code;

        // Błąd autoryzacji (401, 403, zły klucz API)
        if (
          status === 401 ||
          status === 403 ||
          errorMsg.includes('API_KEY_INVALID') ||
          errorMsg.includes('UNAUTHENTICATED') ||
          errorMsg.includes('PERMISSION_DENIED') ||
          errorMsg.includes('Brak klucza API')
        ) {
          throw new AIStudioAuthError(
            `Błąd autoryzacji Google AI Studio: ${errorMsg}`,
            status
          );
        }

        // Błąd limitu zapytań Rate Limit / Quota Exceeded (HTTP 429 / RESOURCE_EXHAUSTED)
        const isRateLimit =
          status === 429 ||
          errorMsg.includes('RESOURCE_EXHAUSTED') ||
          errorMsg.includes('Rate limit') ||
          errorMsg.includes('Quota exceeded');

        if (isRateLimit) {
          attempt++;
          if (attempt > this.maxRetries) {
            throw new AIStudioRateLimitError(
              `Przekroczono limit zapytań (Rate Limit / Quota Exceeded) po ${this.maxRetries} próbach.`
            );
          }

          const backoff = this.initialBackoffMs * Math.pow(2, attempt - 1) + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        throw error;
      }
    }

    throw new Error('Nieoczekiwany błąd podczas komunikacji z Google AI Studio.');
  }

  /**
   * 1. Generowanie kodu na podstawie promptu oraz wybranego języka programowania.
   */
  async generateCode(prompt: string, language: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const formattedPrompt = `Jesteś ekspertem programistą. Wygeneruj czysty, produkcyjny kod w języku ${language}.\nPrompt: ${prompt}\n\nZwróć wyłącznie kod. Jeśli kod zawiera komentarze, umieść je wewnątrz kodu.`;

      if (!this.aiGenClient) {
        throw new AIStudioAuthError('Klient Google AI Studio nie został zainicjalizowany (Brak klucza API).');
      }

      const response = await this.aiGenClient.models.generateContent({
        model: this.model,
        contents: formattedPrompt,
        config: {
          systemInstruction: `Jesteś zaawansowanym asystentem programowania w języku ${language}. Twórz czytelny, wydajny i bezpieczny kod.`,
        },
      });

      return this.cleanCodeOutput(response.text || '');
    });
  }

  /**
   * 2. Analiza kodu pod kątem błędów, luk bezpieczeństwa oraz propozycji refaktoryzacji.
   */
  async analyzeCode(code: string, language: string): Promise<CodeAnalysisResult> {
    return this.executeWithRetry(async () => {
      const prompt = `Przeanalizuj poniższy kod w języku ${language}.\nWykryj potencjalne błędy, luki bezpieczeństwa, problemy z wydajnością oraz zaproponuj ulepszenia.\n\nKod do analizy:\n\`\`\`${language}\n${code}\n\`\`\``;

      if (!this.aiGenClient) {
        throw new AIStudioAuthError('Klient Google AI Studio nie został zainicjalizowany.');
      }

      const response = await this.aiGenClient.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              errors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista znalezionych błędów, usterek lub punktów awarii.',
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista rekomendacji refaktoryzacji i ulepszeń kodu.',
              },
            },
            required: ['errors', 'suggestions'],
          },
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        return {
          errors: Array.isArray(parsed.errors) ? parsed.errors : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        };
      } catch {
        return {
          errors: ['Nie udało się przetworzyć odpowiedzi JSON z AI Studio.'],
          suggestions: [text],
        };
      }
    });
  }

  /**
   * 3. Tłumaczenie kodu z jednego języka programowania na inny.
   */
  async translateCode(code: string, fromLanguage: string, toLanguage: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const prompt = `Przetłumacz poniższy kod z języka ${fromLanguage} na język ${toLanguage}. Zachowaj identyczną logikę biznesową i używaj idiomatycznych wzorców dla ${toLanguage}.\n\nKod źródłowy (${fromLanguage}):\n\`\`\`${fromLanguage}\n${code}\n\`\`\``;

      if (!this.aiGenClient) {
        throw new AIStudioAuthError('Klient Google AI Studio nie został zainicjalizowany.');
      }

      const response = await this.aiGenClient.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return this.cleanCodeOutput(response.text || '');
    });
  }

  /**
   * 4. Wyjaśnianie działania kodu krok po kroku po polsku.
   */
  async explainCode(code: string, language: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const prompt = `Wyjaśnij krok po kroku działanie poniższego kodu w języku ${language}. Opisz architekturę, przepływ danych oraz kluczowe funkcje w przystępny sposób po polsku.\n\nKod:\n\`\`\`${language}\n${code}\n\`\`\``;

      if (!this.aiGenClient) {
        throw new AIStudioAuthError('Klient Google AI Studio nie został zainicjalizowany.');
      }

      const response = await this.aiGenClient.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return response.text || 'Brak wyjaśnienia.';
    });
  }

  /**
   * 5. Generowanie profesjonalnego pliku README.md dla projektu.
   */
  async generateReadme(
    name: string,
    description: string,
    code?: string,
    language: string = 'Polski'
  ): Promise<string> {
    return this.executeWithRetry(async () => {
      const prompt = `Stwórz profesjonalny plik README.md dla projektu o nazwie ${name}. Opis: ${description}. Kod (opcjonalnie): ${code || 'Brak'}. Użyj języka ${language}. Dodaj sekcje: Opis, Funkcjonalności, Instalacja, Użycie, Przykład, Licencja.`;

      if (!this.aiGenClient) {
        throw new AIStudioAuthError('Klient Google AI Studio nie został zainicjalizowany.');
      }

      const response = await this.aiGenClient.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return response.text || '';
    });
  }

  /**
   * Pomocnicze czyszczenie formatowania bloku kodu Markdown.
   */
  private cleanCodeOutput(rawText: string): string {
    let text = rawText.trim();
    if (text.startsWith('```')) {
      const firstLineEnd = text.indexOf('\n');
      if (firstLineEnd !== -1) {
        text = text.substring(firstLineEnd + 1);
      }
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    }
    return text.trim();
  }
}

// Domyślny eksport uniwersalnej instancji z automatycznym odczytem klucza API
export const aiStudioClient = new AIStudioClient();
