import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid,
  Sparkles,
  Download,
  Sliders,
  Layout,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface ToolbarProps {
  viewMode: 'visual' | 'form';
  onToggleViewMode: (mode: 'visual' | 'form') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  onOpenAIAssistant: () => void;
  onOpenATSAnalyzer: () => void;
  onSaveCV: () => void;
  onExportPDF: () => void;
  autoSaveStatus?: 'saved' | 'saving';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  onToggleViewMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomLevel,
  onZoomChange,
  gridSnap,
  onToggleGridSnap,
  onOpenAIAssistant,
  onOpenATSAnalyzer,
  onExportPDF
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 sm:px-4 py-2 flex flex-wrap items-center justify-between shrink-0 shadow-2xs z-30 select-none gap-2">
      
      {/* Mode Switcher */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
        <button
          onClick={() => onToggleViewMode('visual')}
          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
            viewMode === 'visual'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Éditeur Visuel (Canva)"
        >
          <Layout className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Éditeur Visuel</span>
        </button>
        <button
          onClick={() => onToggleViewMode('form')}
          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
            viewMode === 'form'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Formulaire & Thème"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Formulaire</span>
        </button>
      </div>

      {/* Undo / Redo & Zoom Controls */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Annuler (Ctrl+Z)"
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Rétablir (Ctrl+Shift+Z)"
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Zoom Controls */}
        <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => onZoomChange(Math.max(0.3, zoomLevel - 0.1))}
            title="Zoom - "
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-300 px-1 w-9 sm:w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.8, zoomLevel + 0.1))}
            title="Zoom + "
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snap Grid Toggle */}
        <button
          onClick={onToggleGridSnap}
          title={gridSnap ? 'Grille active' : 'Grille désactivée'}
          className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            gridSnap
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-600'
              : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* AI, ATS & Export Actions */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={onOpenAIAssistant}
          className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
          title="Assistant IA Gemini"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Assistant IA</span>
        </button>

        <button
          onClick={onOpenATSAnalyzer}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
          title="Analyse ATS"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Score ATS</span>
        </button>

        <div className="hidden lg:flex items-center space-x-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 pl-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Enregistré</span>
        </div>

        <button
          onClick={onExportPDF}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exporter PDF</span>
        </button>
      </div>

    </div>
  );
};
