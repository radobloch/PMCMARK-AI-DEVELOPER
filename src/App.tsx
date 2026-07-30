import React, { useState } from 'react';
import { SKELETON_FILES } from './data/skeletonFiles';
import { ProjectFile } from './types';
import { FileTree } from './components/FileTree';
import { CodeViewer } from './components/CodeViewer';
import { CommandGuide } from './components/CommandGuide';
import { VercelChecklist } from './components/VercelChecklist';
import { LiveAppPreview } from './components/LiveAppPreview';
import { AIStudioShowcase } from './components/AIStudioShowcase';
import { GitHubShowcase } from './components/GitHubShowcase';
import DocsPage from '../app/docs/page';
import { 
  Bot, 
  Code, 
  Terminal, 
  ShieldCheck, 
  Play, 
  BookOpen, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  Layers,
  FolderTree,
  Github,
  FileText
} from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(SKELETON_FILES[4]); // default app/layout.tsx
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'aistudio' | 'github' | 'docs' | 'commands' | 'audit' | 'explanation'>('docs');
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAllFiles = () => {
    const fullProjectCode = SKELETON_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// Description: ${f.description}\n// ==========================================\n\n${f.content}`
    ).join('\n\n\n');

    navigator.clipboard.writeText(fullProjectCode);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleDownloadZipJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SKELETON_FILES, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "pmcmark-ai-developer-skeleton.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  PMCMARK <span className="text-blue-400">AI DEVELOPER</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                  Next.js 14 Skeleton
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Szkielet projektu Next.js 14 App Router + TypeScript + Tailwind CSS dla Vercel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllFiles}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Skopiowano Wszystkie Pliki</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kopiuj Cały Kod (All-in-One)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadZipJSON}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksportuj (.json)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Nav Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Struktura Plików & Kod</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Generator Dokumentacji (/docs)</span>
          </button>

          <button
            onClick={() => setActiveTab('aistudio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'aistudio'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Studio SDK Client</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub API Client</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Podgląd Na Żywo</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'commands'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Komendy & Inicjalizacja</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audyt Vercel</span>
          </button>

          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'explanation'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Wyjaśnienie Plików</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'editor' && (
          <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
            {/* Sidebar tree */}
            <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-3 overflow-y-auto">
              <FileTree
                files={SKELETON_FILES}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            </div>

            {/* Code viewer */}
            <div className="lg:col-span-8 xl:col-span-9 h-full">
              <CodeViewer file={selectedFile} />
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-5xl mx-auto">
            <DocsPage />
          </div>
        )}

        {activeTab === 'aistudio' && (
          <div className="max-w-5xl mx-auto">
            <AIStudioShowcase />
          </div>
        )}

        {activeTab === 'github' && (
          <div className="max-w-5xl mx-auto">
            <GitHubShowcase />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-5xl mx-auto">
            <LiveAppPreview />
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="max-w-4xl mx-auto">
            <CommandGuide />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="max-w-4xl mx-auto">
            <VercelChecklist />
          </div>
        )}

        {activeTab === 'explanation' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-lg text-white">Przewodnik po Strukturyzacji Plików</h2>
              </div>
              <p className="text-sm text-slate-400">
                Poniższa lista wyjaśnia rolę każdego pliku w wygenerowanym szkieletie projektu PMCMARK AI DEVELOPER:
              </p>

              <div className="grid gap-3 pt-2">
                {SKELETON_FILES.map((file) => (
                  <div
                    key={file.path}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-blue-400">{file.path}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {file.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{file.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setActiveTab('editor');
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium self-start sm:self-center transition-colors"
                    >
                      Zobacz kod
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>PMCMARK AI DEVELOPER • Next.js 14 App Router Skeleton</span>
          <span>Gotowy do wdrożenia na Vercel</span>
        </div>
      </footer>
    </div>
  );
}
