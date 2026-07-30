import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'typescript', filename, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden font-mono text-xs shadow-xl">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-200">{filename}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">{language}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Skopiowano</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiuj</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="p-4 overflow-x-auto leading-relaxed">
        {lines.map((line, idx) => (
          <div key={idx} className="flex gap-4">
            {showLineNumbers && (
              <span className="select-none text-slate-600 text-right w-6 shrink-0">{idx + 1}</span>
            )}
            <span className="text-slate-200">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
