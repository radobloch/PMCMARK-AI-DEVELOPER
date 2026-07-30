import { AIStudioClient, AIStudioAuthError, AIStudioRateLimitError } from '../lib/aiStudioClient';

// Mock @google/genai module
const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
    Type: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING',
    },
  };
});

describe('AIStudioClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien rzucić AIStudioAuthError, gdy brakuje klucza API', async () => {
    const client = new AIStudioClient({ apiKey: '' });

    await expect(client.generateCode('Napisz funkcję sum', 'typescript')).rejects.toThrow(
      AIStudioAuthError
    );
  });

  it('powinien pomyślnie wygenerować kod za pomocą generateCode', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```typescript\nfunction sum(a: number, b: number): number {\n  return a + b;\n}\n```',
    });

    const client = new AIStudioClient({ apiKey: 'test-api-key' });
    const result = await client.generateCode('Stwórz funkcję dodawania', 'typescript');

    expect(result).toContain('function sum(a: number, b: number)');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-3.6-flash',
        contents: expect.stringContaining('Stwórz funkcję dodawania'),
      })
    );
  });

  it('powinien sparsować wynik z metody analyzeCode', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        errors: ['Brak obsługi błędów w async/await'],
        suggestions: ['Użyj try/catch wokół wywołania API'],
      }),
    });

    const client = new AIStudioClient({ apiKey: 'test-api-key' });
    const result = await client.analyzeCode('async function fetchData() {}', 'typescript');

    expect(result.errors).toEqual(['Brak obsługi błędów w async/await']);
    expect(result.suggestions).toEqual(['Użyj try/catch wokół wywołania API']);
  });

  it('powinien obsłużyć ponawianie zapytań przy Rate Limit (HTTP 429) i rzucić AIStudioRateLimitError po wyczerpaniu prób', async () => {
    mockGenerateContent.mockRejectedValue({
      status: 429,
      message: 'RESOURCE_EXHAUSTED: Rate limit exceeded',
    });

    const client = new AIStudioClient({
      apiKey: 'test-api-key',
      maxRetries: 1,
      initialBackoffMs: 10,
    });

    await expect(client.generateCode('Test prompt', 'javascript')).rejects.toThrow(
      AIStudioRateLimitError
    );
  });

  it('powinien wygenerować plik README.md za pomocą generateReadme', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '# Test App\n\n## Opis\nProjekt testowy\n\n## Licencja\nMIT',
    });

    const client = new AIStudioClient({ apiKey: 'test-api-key' });
    const readme = await client.generateReadme('Test App', 'Projekt testowy', '', 'Polski');

    expect(readme).toContain('# Test App');
    expect(readme).toContain('## Opis');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});
