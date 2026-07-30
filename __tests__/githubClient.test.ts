import { GitHubClient, GitHubAuthError } from '../lib/githubClient';

const mockListForUser = jest.fn();
const mockCreateIssue = jest.fn();
const mockPullsGet = jest.fn();
const mockCreateComment = jest.fn();
const mockGetContent = jest.fn();

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: {
        repos: {
          listForUser: mockListForUser,
          getContent: mockGetContent,
        },
        issues: {
          create: mockCreateIssue,
          createComment: mockCreateComment,
        },
        pulls: {
          get: mockPullsGet,
        },
      },
    })),
  };
});

describe('GitHubClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien pobrać listę repozytoriów użytkownika za pomocą getUserRepos', async () => {
    mockListForUser.mockResolvedValueOnce({
      data: [
        {
          id: 101,
          name: 'my-app',
          full_name: 'octocat/my-app',
          description: 'Przykładowy projekt',
          html_url: 'https://github.com/octocat/my-app',
          stargazers_count: 42,
          forks_count: 5,
          open_issues_count: 2,
          language: 'TypeScript',
          private: false,
          updated_at: '2026-07-29T12:00:00Z',
        },
      ],
    });

    const client = new GitHubClient({ auth: 'test-token' });
    const repos = await client.getUserRepos('octocat');

    expect(repos).toHaveLength(1);
    expect(repos[0].name).toBe('my-app');
    expect(repos[0].stargazersCount).toBe(42);
    expect(mockListForUser).toHaveBeenCalledWith({
      username: 'octocat',
      sort: 'updated',
      per_page: 30,
    });
  });

  it('powinien utworzyć nowy Issue za pomocą createIssue', async () => {
    mockCreateIssue.mockResolvedValueOnce({
      data: {
        id: 501,
        number: 12,
        title: 'Błąd w formularzu',
        body: 'Szczegóły błędu',
        state: 'open',
        html_url: 'https://github.com/octocat/my-app/issues/12',
        created_at: '2026-07-29T14:00:00Z',
        user: { login: 'tester' },
      },
    });

    const client = new GitHubClient({ auth: 'test-token' });
    const issue = await client.createIssue('octocat', 'my-app', 'Błąd w formularzu', 'Szczegóły błędu');

    expect(issue.number).toBe(12);
    expect(issue.author).toBe('tester');
    expect(mockCreateIssue).toHaveBeenCalledWith({
      owner: 'octocat',
      repo: 'my-app',
      title: 'Błąd w formularzu',
      body: 'Szczegóły błędu',
    });
  });

  it('powinien pobrać zawartość pliku z bazy Base64 za pomocą getFileContent', async () => {
    const rawContent = 'console.log("Hello GitHub");';
    const base64Content = Buffer.from(rawContent).toString('base64');

    mockGetContent.mockResolvedValueOnce({
      data: {
        type: 'file',
        content: base64Content,
      },
    });

    const client = new GitHubClient();
    const content = await client.getFileContent('octocat', 'my-app', 'src/index.ts');

    expect(content).toBe(rawContent);
  });

  it('powinien obsłużyć błąd 401 i rzucić GitHubAuthError', async () => {
    mockListForUser.mockRejectedValueOnce({
      status: 401,
      message: 'Bad credentials',
    });

    const client = new GitHubClient({ auth: 'invalid-token' });

    await expect(client.getUserRepos('invalid-user')).rejects.toThrow(GitHubAuthError);
  });
});
