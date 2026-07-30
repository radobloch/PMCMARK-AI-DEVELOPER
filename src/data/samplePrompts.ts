export interface SamplePromptData {
  id: string;
  title: string;
  language: string;
  prompt: string;
  expectedOutputSnippet?: string;
  tags: string[];
}

export const SAMPLE_PROMPTS_DATA: SamplePromptData[] = [
  {
    id: 'prompt-1',
    title: 'Sortowanie tablicy w Pythonie',
    language: 'python',
    prompt: 'Stwórz funkcję sortującą tablicę obiektów użytkowników według wieku i nazwiska w Pythonie.',
    expectedOutputSnippet: 'def sort_users(users):\n    return sorted(users, key=lambda x: (x["age"], x["last_name"]))',
    tags: ['algorithms', 'python', 'sorting']
  },
  {
    id: 'prompt-2',
    title: 'Algorytm BFS w TypeScript',
    language: 'typescript',
    prompt: 'Zaimplementuj algorytm przeszukiwania grafu w szerokość (BFS) z pełnym typowaniem w TypeScript.',
    expectedOutputSnippet: 'export function bfs<T>(graph: Map<T, T[]>, startNode: T): T[] { ... }',
    tags: ['graphs', 'typescript', 'algorithms']
  },
  {
    id: 'prompt-3',
    title: 'REST API Server w Go',
    language: 'go',
    prompt: 'Napisz prosty serwer HTTP REST API z routingiem dla zasobu produktów w języku Go.',
    expectedOutputSnippet: 'package main\n\nimport (\n\t"net/http"\n)\n\nfunc main() { ... }',
    tags: ['backend', 'go', 'rest-api']
  },
  {
    id: 'prompt-4',
    title: 'Algorytm QuickSort w Rust',
    language: 'rust',
    prompt: 'Zaimplementuj szybkie sortowanie (QuickSort) na wektorze liczb całkowitych w języku Rust.',
    expectedOutputSnippet: 'pub fn quicksort(arr: &mut [i32]) { ... }',
    tags: ['rust', 'sorting', 'performance']
  },
  {
    id: 'prompt-5',
    title: 'Walidacja danych w Java',
    language: 'java',
    prompt: 'Napisz klasę walidatora adresów email i numerów telefonów w języku Java z użyciem wyrażeń regularnych.',
    expectedOutputSnippet: 'public class Validator {\n    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";\n}',
    tags: ['java', 'validation', 'regex']
  },
  {
    id: 'prompt-6',
    title: 'Przetwarzanie macierzy w C++',
    language: 'cpp',
    prompt: 'Zaimplementuj mnożenie dwóch macierzy dwuwymiarowych w C++ z obsługą szablonów (templates).',
    expectedOutputSnippet: 'template <typename T>\nstd::vector<std::vector<T>> multiplyMatrices(...)',
    tags: ['cpp', 'matrices', 'templates']
  },
  {
    id: 'prompt-7',
    title: 'Pobieranie danych w JavaScript',
    language: 'javascript',
    prompt: 'Napisz asynchroniczną funkcję fetchWithRetry w JavaScript, która ponawia zapytanie HTTP w przypadku błędu.',
    expectedOutputSnippet: 'async function fetchWithRetry(url, options = {}, retries = 3) { ... }',
    tags: ['javascript', 'async', 'http']
  }
];
