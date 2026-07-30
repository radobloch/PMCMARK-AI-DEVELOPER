export type ThemeMode = 'dark' | 'light' | 'system';

export interface ProjectFile {
  path: string;
  name: string;
  category: 'app' | 'components' | 'lib' | 'types' | 'config' | 'public' | 'docs';
  language: string;
  content: string;
  description: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  category?: string;
  description?: string;
}

export interface VercelCheckItem {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'info';
  category: 'build' | 'routing' | 'typescript' | 'styling' | 'deployment';
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  codeSnippet: string;
}
