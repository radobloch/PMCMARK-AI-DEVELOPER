import { Octokit } from '@octokit/rest';

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
   * 1. Pobiera listę publicznych repozytoriów wskazanego użytkownika.
   */
  async getUserRepos(username: string): Promise<Repo[]> {
    try {
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
    } catch (error: any) {
      this.handleError(error, 'Pobieranie repozytoriów użytkownika nie powiodło się.');
      throw error;
    }
  }

  /**
   * 2. Tworzy nowy issue w wybranym repozytorium.
   */
  async createIssue(owner: string, repo: string, title: string, body: string): Promise<Issue> {
    try {
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
    } catch (error: any) {
      this.handleError(error, 'Tworzenie issue nie powiodło się.');
      throw error;
    }
  }

  /**
   * 3. Pobiera szczegółowe dane konkretnego Pull Requesta.
   */
  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<PullRequest> {
    try {
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
    } catch (error: any) {
      this.handleError(error, 'Pobieranie danych Pull Requesta nie powiodło się.');
      throw error;
    }
  }

  /**
   * 4. Dodaje nowy komentarz do wskazanego Pull Requesta.
   */
  async createPullRequestComment(
    owner: string,
    repo: string,
    prNumber: number,
    body: string
  ): Promise<void> {
    try {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body,
      });
    } catch (error: any) {
      this.handleError(error, 'Dodawanie komentarza do PR nie powiodło się.');
      throw error;
    }
  }

  /**
   * 5. Pobiera i dekoduje (UTF-8) zawartość pliku z repozytorium.
   */
  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      const data = response.data;

      if (Array.isArray(data)) {
        throw new Error(`Ścieżka '${path}' wskazuje na katalog, a nie pojedynczy plik.`);
      }

      if ('content' in data && data.content) {
        // Dekodowanie Base64
        const buffer = Buffer.from(data.content, 'base64');
        return buffer.toString('utf-8');
      }

      throw new Error(`Brak zawartości tekstowej dla pliku '${path}'.`);
    } catch (error: any) {
      this.handleError(error, `Pobieranie zawartości pliku '${path}' nie powiodło się.`);
      throw error;
    }
  }

  private handleError(error: any, defaultMsg: string): void {
    if (error?.status === 401) {
      throw new GitHubAuthError(
        'Nieprawidłowy lub wygasły GitHub Personal Access Token (401 Unauthorized).'
      );
    }
    if (error?.status === 403 && error?.message?.includes('rate limit')) {
      throw new Error('Przekroczono limit zapytań GitHub API (Rate Limit Exceeded).');
    }
    if (error?.status === 404) {
      throw new Error('Nie znaleziono zasobu na GitHubie (404 Not Found). Sprawdź nazwę ownera i repozytorium.');
    }
  }
}

// Domyślny eksport uniwersalnej instancji z opcjonalną autoryzacją
export const githubClient = new GitHubClient();
