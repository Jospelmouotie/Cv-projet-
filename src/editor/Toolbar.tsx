import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid,
  Sparkles,
  Download,
  Save,
  Sliders,
  Layout,
  CheckCircle2,
  Eye,
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
  onSaveCV,
  onExportPDF,
  autoSaveStatus = 'saved'
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-30 select-none">
      
      {/* Mode Switcher */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => onToggleViewMode('visual')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all cursor-pointer ${
            viewMode === 'visual'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Éditeur Visuel (Canva)</span>
        </button>
        <button
          onClick={() => onToggleViewMode('form')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all cursor-pointer ${
            viewMode === 'form'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Studio Thème & Formulaire</span>
        </button>
      </div>

      {/* Undo / Redo & Zoom Controls */}
      <div className="flex items-center space-x-3">
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

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoomLevel - 0.1))}
            title="Zoom - "
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 px-1 w-12 text-center">
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

      {/* AI, Auto-Save & Export Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenAIAssistant}
          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Assistant IA</span>
        </button>

        <button
          onClick={onOpenATSAnalyzer}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Score ATS</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Enregistré</span>
        </div>

        <button
          onClick={onExportPDF}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter PDF</span>
        </button>
      </div>

    </div>
  );
};
