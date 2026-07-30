import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: ProjectFile;
  onSelectFile: (file: ProjectFile) => void;
}

interface TreeDirectory {
  name: string;
  files: ProjectFile[];
  subdirs: Record<string, TreeDirectory>;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFile,
  onSelectFile,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    'components/ui': true,
    lib: true,
    types: true,
  });

  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  // Build tree from flat path list
  const tree: Record<string, any> = {};

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;

    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = { _file: file };
      } else {
        if (!current[part]) {
          current[part] = { _isFolder: true };
        }
        current = current[part];
      }
    });
  });

  const renderNodes = (node: Record<string, any>, currentPath = '') => {
    const entries = Object.keys(node).sort((a, b) => {
      const aIsFolder = node[a]._isFolder;
      const bIsFolder = node[b]._isFolder;
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.localeCompare(b);
    });

    return entries.map((key) => {
      if (key === '_file' || key === '_isFolder') return null;

      const item = node[key];
      const path = currentPath ? `${currentPath}/${key}` : key;
      const isFolder = !!item._isFolder;

      if (isFolder) {
        const isOpen = openFolders[path] ?? true;

        return (
          <div key={path} className="select-none">
            <button
              onClick={() => toggleFolder(path)}
              className="w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors text-xs font-medium"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
              {isOpen ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400/80" />
              )}
              <span>{key}</span>
            </button>
            {isOpen && (
              <div className="pl-4 border-l border-slate-800/80 ml-3.5 my-0.5 space-y-0.5">
                {renderNodes(item, path)}
              </div>
            )}
          </div>
        );
      } else {
        const file = item._file as ProjectFile;
        const isSelected = selectedFile.path === file.path;

        return (
          <button
            key={file.path}
            onClick={() => onSelectFile(file)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
              isSelected
                ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <FileCode
                className={`w-3.5 h-3.5 shrink-0 ${
                  isSelected ? 'text-blue-400' : 'text-slate-500'
                }`}
              />
              <span className="truncate">{file.name}</span>
            </div>
            {isSelected && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
          </button>
        );
      }
    });
  };

  return (
    <div className="space-y-1">
      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Pliki i katalogi projektu
      </div>
      {renderNodes(tree)}
    </div>
  );
};
