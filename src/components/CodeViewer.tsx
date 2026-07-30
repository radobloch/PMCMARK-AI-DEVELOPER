import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { Copy, Check, FileCode, Download, Code, Sparkles } from 'lucide-react';

interface CodeViewerProps {
  file: ProjectFile;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = file.content.split('\n');

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-100">{file.path}</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                {file.language}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{file.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Pobierz ten plik"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pobierz</span>
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Skopiowano!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiuj Kod</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto font-mono text-xs p-4 bg-slate-950/90 text-slate-200">
        <div className="table w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
              <span className="table-cell text-right pr-4 select-none text-slate-600 w-10 text-[11px] align-top">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre align-top text-slate-300 leading-relaxed">
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer statistics */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>{lines.length} linii kodu • Next.js 14 Zgodny</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <Sparkles className="w-3 h-3" />
          Gotowy do Vercel
        </span>
      </div>
    </div>
  );
};
