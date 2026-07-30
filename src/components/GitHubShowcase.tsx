import React, { useState } from 'react';
import {
  Github,
  GitPullRequest,
  FolderGit2,
  FileCode2,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  Key,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Star,
  GitFork,
  Code2,
  BookOpen,
  Send,
  Lock,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  GitHubClient,
  Repo,
  Issue,
  PullRequest,
  GitHubAuthError
} from '../lib/githubClient';

export const GitHubShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tester' | 'clientCode' | 'patGuide' | 'reactExample'>('tester');
  const [copiedCode, setCopiedCode] = useState(false);
  const [customToken, setCustomToken] = useState('');

  // Client instance based on custom token input
  const client = new GitHubClient({ auth: customToken || undefined });

  // Tester state
  const [activeMethod, setActiveMethod] = useState<'getUserRepos' | 'createIssue' | 'getPullRequest' | 'createPullRequestComment' | 'getFileContent'>('getUserRepos');

  // Form inputs
  const [usernameInput, setUsernameInput] = useState('octocat');
  const [ownerInput, setOwnerInput] = useState('facebook');
  const [repoInput, setRepoInput] = useState('react');
  const [issueTitle, setIssueTitle] = useState('Błąd w komponentach nawigacji');
  const [issueBody, setIssueBody] = useState('Podczas szybkiego klikania w zakładki występują nieoczekiwane przeskoki stanu.');
  const [prNumber, setPrNumber] = useState<number>(28000);
  const [prCommentBody, setPrCommentBody] = useState('LGTM! Świetna robota z tą poprawką. Wydajność wzrosła znacząco.');
  const [filePath, setFilePath] = useState('README.md');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [reposResult, setReposResult] = useState<Repo[] | null>(null);
  const [issueResult, setIssueResult] = useState<Issue | null>(null);
  const [prResult, setPrResult] = useState<PullRequest | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<boolean>(false);
  const [fileContentResult, setFileContentResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setErrorMessage(null);
    setReposResult(null);
    setIssueResult(null);
    setPrResult(null);
    setCommentSuccess(false);
    setFileContentResult(null);

    try {
      if (activeMethod === 'getUserRepos') {
        const res = await client.getUserRepos(usernameInput);
        setReposResult(res);
      } else if (activeMethod === 'createIssue') {
        if (!customToken) {
          throw new GitHubAuthError('Tworzenie Issue wymaga podania GitHub Personal Access Tokena (PAT).');
        }
        const res = await client.createIssue(ownerInput, repoInput, issueTitle, issueBody);
        setIssueResult(res);
      } else if (activeMethod === 'getPullRequest') {
        const res = await client.getPullRequest(ownerInput, repoInput, prNumber);
        setPrResult(res);
      } else if (activeMethod === 'createPullRequestComment') {
        if (!customToken) {
          throw new GitHubAuthError('Dodawanie komentarzy do PR wymaga podania GitHub Personal Access Tokena (PAT).');
        }
        await client.createPullRequestComment(ownerInput, repoInput, prNumber, prCommentBody);
        setCommentSuccess(true);
      } else if (activeMethod === 'getFileContent') {
        const res = await client.getFileContent(ownerInput, repoInput, filePath);
        setFileContentResult(res);
      }
    } catch (err: any) {
      if (err instanceof GitHubAuthError) {
        setErrorMessage(`[Błąd Autoryzacji GitHub] ${err.message}`);
      } else {
        setErrorMessage(err?.message || 'Wystąpił błąd podczas wywołania GitHub API.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clientCodeString = `import { Octokit } from '@octokit/rest';

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

export const githubClient = new GitHubClient();`;

  const reactExampleString = `import React, { useState, useEffect } from 'react';
import { githubClient, Repo } from '../lib/githubClient';
import { Star, GitFork, ExternalLink } from 'lucide-react';

export const UserReposList: React.FC<{ username?: string }> = ({ username = 'octocat' }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRepos() {
      try {
        setLoading(true);
        setError(null);
        // Pobieranie repozytoriów z użyciem naszej zaimplementowanej klasy GitHubClient
        const data = await githubClient.getUserRepos(username);
        setRepos(data);
      } catch (err: any) {
        setError(err?.message || 'Nie udało się pobrać repozytoriów.');
      } finally {
        setLoading(false);
      }
    }

    loadRepos();
  }, [username]);

  if (loading) return <div className="text-slate-400 text-xs">Ładowanie repozytoriów z GitHub API...</div>;
  if (error) return <div className="text-rose-400 text-xs">Błąd: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {repos.map((repo) => (
        <div key={repo.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
              {repo.fullName}
              <ExternalLink className="w-3 h-3" />
            </a>
            {repo.language && <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">{repo.language}</span>}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">{repo.description || 'Brak opisu repozytorium.'}</p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {repo.stargazersCount}</span>
            <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-blue-400" /> {repo.forksCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-zinc-900 to-stone-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 shadow-inner">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                GitHub API Client (Octokit REST)
              </h2>
              <p className="text-xs text-slate-400">
                Oficjalna klasa <code className="font-mono text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">lib/githubClient.ts</code> do obsługi Repozytoriów, Issues, Pull Requestów i Plików.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-semibold">
            @octokit/rest v21
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tester'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Tester Metod Live</span>
          </button>
          <button
            onClick={() => setActiveTab('clientCode')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'clientCode'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kod lib/githubClient.ts</span>
          </button>
          <button
            onClick={() => setActiveTab('patGuide')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'patGuide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Instrukcja PAT Token</span>
          </button>
          <button
            onClick={() => setActiveTab('reactExample')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'reactExample'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Przykład w React</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Live Interactive Tester */}
      {activeTab === 'tester' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* PAT Token Optional Override */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Opcjonalny GitHub Personal Access Token (PAT)</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {customToken ? 'Podano własny token' : 'Używa domyślnej autoryzacji (odczyt publiczny)'}
              </span>
            </div>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Wymagane do tworzenia Issue / Komentarzy)"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Method Picker */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wybierz Metodę do Wywołania</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { id: 'getUserRepos', name: '1. getUserRepos', icon: FolderGit2, desc: 'Pobiera repozytoria' },
                { id: 'createIssue', name: '2. createIssue', icon: Plus, desc: 'Tworzy nowy issue' },
                { id: 'getPullRequest', name: '3. getPullRequest', icon: GitPullRequest, desc: 'Pobiera dane PR' },
                { id: 'createPullRequestComment', name: '4. createPRComment', icon: MessageSquare, desc: 'Dodaje komentarz do PR' },
                { id: 'getFileContent', name: '5. getFileContent', icon: FileCode2, desc: 'Odczytuje plik' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                      activeMethod === m.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-400">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Method Inputs */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              <span>Parametry Wejściowe dla {activeMethod}()</span>
            </h4>

            {activeMethod === 'getUserRepos' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nazwa Użytkownika GitHub (Username)</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full max-w-md px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  placeholder="np. octocat, facebook, vercel, torvalds"
                />
              </div>
            )}

            {(activeMethod === 'createIssue' ||
              activeMethod === 'getPullRequest' ||
              activeMethod === 'createPullRequestComment' ||
              activeMethod === 'getFileContent') && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Właściciel Repozytorium (Owner)</label>
                  <input
                    type="text"
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    placeholder="np. facebook"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nazwa Repozytorium (Repo)</label>
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    placeholder="np. react"
                  />
                </div>
              </div>
            )}

            {activeMethod === 'createIssue' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tytuł Issue (title)</label>
                  <input
                    type="text"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Treść Issue (body)</label>
                  <textarea
                    rows={3}
                    value={issueBody}
                    onChange={(e) => setIssueBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {(activeMethod === 'getPullRequest' || activeMethod === 'createPullRequestComment') && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Numer Pull Requesta (prNumber)</label>
                <input
                  type="number"
                  value={prNumber}
                  onChange={(e) => setPrNumber(Number(e.target.value))}
                  className="w-full max-w-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
            )}

            {activeMethod === 'createPullRequestComment' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Treść Komentarza do PR (body)</label>
                <textarea
                  rows={3}
                  value={prCommentBody}
                  onChange={(e) => setPrCommentBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
            )}

            {activeMethod === 'getFileContent' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Ścieżka do Pliku (path)</label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="w-full max-w-md px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  placeholder="np. README.md lub package.json"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Wykonywanie zapytania Octokit...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Wywołaj {activeMethod}()</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Błąd Wykonania GitHub API:</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Results: Repos */}
          {reposResult && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pobrano {reposResult.length} Repozytoriów dla '{usernameInput}':</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {reposResult.map((repo) => (
                  <div key={repo.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
                        {repo.fullName}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        {repo.isPrivate ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                        {repo.language || 'Code'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{repo.description || 'Brak opisu repozytorium.'}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-300"><Star className="w-3 h-3 text-amber-400" /> {repo.stargazersCount}</span>
                        <span className="flex items-center gap-1 text-slate-300"><GitFork className="w-3 h-3 text-blue-400" /> {repo.forksCount}</span>
                      </div>
                      <span>Aktualizacja: {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Brak daty'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results: Created Issue */}
          {issueResult && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pomyślnie Utworzono Issue #{issueResult.number}!</span>
              </h4>
              <div className="p-3 bg-slate-900 rounded-lg space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">#{issueResult.number} {issueResult.title}</span>
                  <a href={issueResult.htmlUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline flex items-center gap-1">
                    Zobacz na GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300">{issueResult.body}</p>
                <div className="text-[10px] text-slate-500">Autor: {issueResult.author} | Stan: {issueResult.state}</div>
              </div>
            </div>
          )}

          {/* Results: Pull Request */}
          {prResult && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pobrano dane Pull Requesta #{prResult.number}:</span>
              </h4>
              <div className="p-3 bg-slate-900 rounded-lg space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">#{prResult.number} {prResult.title}</span>
                  <a href={prResult.htmlUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline flex items-center gap-1">
                    Otwórz w GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 line-clamp-3">{prResult.body || 'Brak opisu.'}</p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Autor: <strong className="text-white">{prResult.author}</strong></span>
                  <span>Stan: <strong className="text-amber-300">{prResult.state}</strong></span>
                  <span>Merged: <strong className={prResult.merged ? 'text-emerald-400' : 'text-slate-400'}>{prResult.merged ? 'Tak' : 'Nie'}</strong></span>
                  <span className="text-emerald-400">+{prResult.additions || 0}</span>
                  <span className="text-rose-400">-{prResult.deletions || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Results: Comment Success */}
          {commentSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl space-y-1 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Komentarz został pomyślnie dodany do PR #{prNumber}!</span>
            </div>
          )}

          {/* Results: File Content */}
          {fileContentResult && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zawartość Pliku '{filePath}' ({fileContentResult.length} bajtów):</span>
              </h4>
              <pre className="p-3 rounded-lg bg-black font-mono text-xs text-slate-200 overflow-x-auto max-h-[300px] whitespace-pre-wrap leading-relaxed">
                {fileContentResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Full Client Code Display */}
      {activeTab === 'clientCode' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Zawartość Pliku lib/githubClient.ts</h3>
              <p className="text-xs text-slate-400">
                W pełni typowana klasa TypeScript z metodami <code className="font-mono text-blue-400">getUserRepos</code>, <code className="font-mono text-blue-400">createIssue</code>, <code className="font-mono text-blue-400">getPullRequest</code>, <code className="font-mono text-blue-400">createPullRequestComment</code>, <code className="font-mono text-blue-400">getFileContent</code>.
              </p>
            </div>
            <button
              onClick={() => handleCopy(clientCodeString)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Skopiowano!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kopiuj Kod</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto max-h-[550px]">
            <pre className="leading-relaxed">
              <code>{clientCodeString}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: PAT Generation Guide */}
      {activeTab === 'patGuide' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Jak Wygenerować GitHub Personal Access Token (PAT)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Krok po kroku wygeneruj token autoryzacyjny dla Octokit API, aby móc dodawać kwestie (Issues), komentarze do PR i uzyskiwać dostęp do prywatnych repozytoriów.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">1</span>
                <span>Otwórz Ustawienia Developer Settings w GitHubie</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                Przejdź na stronę: <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">https://github.com/settings/tokens</a>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">2</span>
                <span>Kliknij "Generate new token" (Tokens classic)</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                Wybierz opcję <strong className="text-white">"Generate new token (classic)"</strong>. Podaj opis (Note), np. <code className="font-mono bg-slate-800 px-1 py-0.5 rounded text-amber-300">GitHub Client App</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">3</span>
                <span>Zaznacz Wymagane Uprawnienia (Scopes)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 pl-7 space-y-1">
                <li><strong className="text-amber-300">repo</strong> (Full control of private repositories) – do odczytu i zapisu repozytoriów, issues oraz PR-ów.</li>
                <li><strong className="text-amber-300">read:user</strong> – do pobierania szczegółowych danych profilu użytkownika.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">4</span>
                <span>Skopiuj Token i Ustaw w Środowisku</span>
              </div>
              <p className="text-xs text-slate-300 pl-7">
                Skopiuj ciąg rozpoczynający się od <code className="font-mono text-emerald-400">ghp_...</code> i wklej go do pliku <code className="font-mono text-amber-300">.env</code> lub ustaw w panelu Secrets:
              </p>
              <div className="p-3 rounded-lg bg-black font-mono text-xs text-emerald-400 ml-7 border border-slate-800">
                GITHUB_TOKEN="ghp_1234567890abcdefghijklmnopqrstuvwxyz"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: React Example Code */}
      {activeTab === 'reactExample' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Przykład Użycia GitHubClient w Komponencie React</h3>
              <p className="text-xs text-slate-400">
                Jak pobrać i wyświetlić listę repozytoriów z użyciem czystych hooków Reacta (<code className="font-mono text-blue-400">useEffect</code> / <code className="font-mono text-blue-400">useState</code>).
              </p>
            </div>
            <button
              onClick={() => handleCopy(reactExampleString)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Skopiowano!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kopiuj Kod Przykładu</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto max-h-[500px]">
            <pre className="leading-relaxed">
              <code>{reactExampleString}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
