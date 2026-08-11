import React, { useState, useRef } from 'react';
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Square,
  Circle,
  Minus,
  List,
  ListOrdered,
  CheckSquare,
  Grid,
  Sparkles,
  Download,
  Save,
  Columns,
  Image as ImageIcon,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSpreadsheet,
  Palette,
  Layout,
  Eye,
  Sliders,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers2,
  Scissors,
  Upload
} from 'lucide-react';
import { CVElement, ElementType, ShapeType, ListType } from '../types/document';

export type RibbonTab = 'accueil' | 'insertion' | 'creation' | 'disposition' | 'affichage' | 'ai_ats';

interface WordRibbonToolbarProps {
  selectedElements: CVElement[];
  activePageId: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  onAddElement: (type: ElementType, presetContent?: any, extraStyle?: any) => void;
  onAddShape: (shapeType: ShapeType) => void;
  onAddList: (listType: ListType) => void;
  onAddTwoColumnSection: (leftPercent: number, rightPercent: number) => void;
  onUpdateStyle: (stylePatch: Partial<any>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onToggleLockSelected: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onOpenAIAssistant: () => void;
  onOpenATSAnalyzer: () => void;
  onExportPDF: () => void;
  onSaveCV: () => void;
  autoSaveStatus?: 'saved' | 'saving' | 'error';
  onToggleViewMode?: (mode: 'visual' | 'form') => void;
  viewMode?: 'visual' | 'form';
  onApplyThemeColor?: (color: string) => void;
  onApplyFontFamily?: (font: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Bleu Exécutif', hex: '#1E3A8A' },
  { name: 'Émeraude Moderne', hex: '#065F46' },
  { name: 'Indigo Tech', hex: '#4338CA' },
  { name: 'Sable Chaud', hex: '#78350F' },
  { name: 'Gris Anthracite', hex: '#1F2937' },
  { name: 'Bordeaux Élégant', hex: '#831843' }
];

const FONT_PRESETS = [
  'Inter',
  'Plus Jakarta Sans',
  'Playfair Display',
  'Roboto',
  'Montserrat',
  'Merriweather'
];

export const WordRibbonToolbar: React.FC<WordRibbonToolbarProps> = ({
  selectedElements,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomLevel,
  onZoomChange,
  gridSnap,
  onToggleGridSnap,
  onAddElement,
  onAddShape,
  onAddList,
  onAddTwoColumnSection,
  onUpdateStyle,
  onDeleteSelected,
  onDuplicateSelected,
  onToggleLockSelected,
  onBringToFront,
  onSendToBack,
  onAlignSelected,
  onOpenAIAssistant,
  onOpenATSAnalyzer,
  onExportPDF,
  onSaveCV,
  autoSaveStatus,
  onToggleViewMode,
  viewMode = 'visual',
  onApplyThemeColor,
  onApplyFontFamily
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('accueil');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedElement = selectedElements[0] || null;
  const currentStyle = selectedElement?.style || {};

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (selectedElement) {
        if (selectedElement.type === 'image') {
          selectedElement.content = { ...(selectedElement.content || {}), src: dataUrl };
        } else {
          selectedElement.content = { ...(selectedElement.content || {}), photoUrl: dataUrl, showPhoto: true };
        }
      } else {
        onAddElement('image', { src: dataUrl, alt: 'Photo de profil' }, { width: 120, height: 120, borderRadius: 9999 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleBold = () => {
    if (typeof window !== 'undefined') {
      try {
        document.execCommand('bold', false);
      } catch (_) {}
    }
    onUpdateStyle({
      fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold'
    });
  };

  const handleToggleItalic = () => {
    if (typeof window !== 'undefined') {
      try {
        document.execCommand('italic', false);
      } catch (_) {}
    }
    onUpdateStyle({
      fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic'
    });
  };

  const handleToggleUnderline = () => {
    if (typeof window !== 'undefined') {
      try {
        document.execCommand('underline', false);
      } catch (_) {}
    }
    onUpdateStyle({
      textDecoration: currentStyle.textDecoration === 'underline' ? 'none' : 'underline'
    });
  };

  const handleApplyListFormatting = (listType: ListType) => {
    if (typeof window !== 'undefined') {
      try {
        if (listType === 'bullet') {
          document.execCommand('insertUnorderedList', false);
        } else if (listType === 'numbered') {
          document.execCommand('insertOrderedList', false);
        }
      } catch (_) {}
    }
    if (selectedElement) {
      if (selectedElement.type === 'list') {
        selectedElement.content = { ...(selectedElement.content || {}), type: listType };
      } else {
        onUpdateStyle({ listType });
      }
    } else {
      onAddList(listType);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-30 select-none flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header Bar with Mode Switcher & Quick Export */}
      <div className="px-3 py-1.5 bg-slate-800 dark:bg-slate-950 text-white flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-blue-600 px-2 py-0.5 rounded-md font-bold tracking-wider text-[11px] uppercase">
            <span>DocuCV Word</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">| Éditeur Visuel de CV Professionnel</span>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleViewMode && (
            <div className="flex bg-slate-700/80 p-0.5 rounded-lg">
              <button
                onClick={() => onToggleViewMode('visual')}
                className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                  viewMode === 'visual' ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Mode Canva (Word)</span>
              </button>
              <button
                onClick={() => onToggleViewMode('form')}
                className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                  viewMode === 'form' ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Mode Formulaire</span>
              </button>
            </div>
          )}

          {autoSaveStatus && (
            <span className="text-[11px] text-slate-300 hidden md:inline">
              {autoSaveStatus === 'saving' ? 'Enregistrement...' : 'Enregistré'}
            </span>
          )}

          <button
            onClick={onSaveCV}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-md flex items-center space-x-1 font-medium transition-colors cursor-pointer"
            title="Enregistrer"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>

          <button
            onClick={onExportPDF}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
            title="Exporter en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Ribbon Navigation Tabs */}
      <div className="flex items-center space-x-1 px-2 pt-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('accueil')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'accueil'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Accueil</span>
        </button>

        <button
          onClick={() => setActiveTab('insertion')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'insertion'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>Insertion</span>
        </button>

        <button
          onClick={() => setActiveTab('creation')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'creation'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-amber-500" />
          <span>Création & Thème</span>
        </button>

        <button
          onClick={() => setActiveTab('disposition')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'disposition'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-indigo-500" />
          <span>Disposition & Colonnes</span>
        </button>

        <button
          onClick={() => setActiveTab('affichage')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'affichage'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-sky-500" />
          <span>Affichage & Zoom</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_ats')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'ai_ats'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 rounded-t-md shadow-2xs'
              : 'border-transparent text-purple-600 dark:text-purple-400 hover:text-purple-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
          <span>Assistant IA & ATS</span>
        </button>
      </div>

      {/* Ribbon Tab Contents */}
      <div className="p-2 min-h-[58px] bg-white dark:bg-slate-900 flex items-center overflow-x-auto scrollbar-none gap-3">
        
        {/* TAB 1: ACCUEIL */}
        {activeTab === 'accueil' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800">
            {/* Annuler / Rétablir & Presse-papier */}
            <div className="flex items-center space-x-1 pr-3">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Annuler (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
                <span className="text-[10px]">Annuler</span>
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Rétablir (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
                <span className="text-[10px]">Rétablir</span>
              </button>

              <button
                onClick={onDuplicateSelected}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Dupliquer l'élément sélectionné"
              >
                <Copy className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">Dupliquer</span>
              </button>

              <button
                onClick={onDeleteSelected}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Supprimer l'élément sélectionné"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px]">Supprimer</span>
              </button>
            </div>

            {/* Typography Formatting */}
            <div className="flex items-center space-x-2 px-3">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  <select
                    value={currentStyle.fontFamily || 'Inter'}
                    onChange={(e) => onUpdateStyle({ fontFamily: e.target.value })}
                    className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    {FONT_PRESETS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentStyle.fontSize || 14}
                    onChange={(e) => onUpdateStyle({ fontSize: parseInt(e.target.value, 10) })}
                    className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    {[9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((s) => (
                      <option key={s} value={s}>
                        {s} pt
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleToggleBold}
                    className={`p-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      currentStyle.fontWeight === 'bold'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                    title="Gras"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleToggleItalic}
                    className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      currentStyle.fontStyle === 'italic'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                    title="Italique"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleToggleUnderline}
                    className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      currentStyle.textDecoration === 'underline'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                    title="Souligné"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  {/* Bullet Lists */}
                  <button
                    onClick={() => handleApplyListFormatting('bullet')}
                    className="p-1 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="Appliquer la Puce"
                  >
                    <List className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleApplyListFormatting('numbered')}
                    className="p-1 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="Appliquer la Numérotation"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                  {/* Alignments */}
                  <button
                    onClick={() => onUpdateStyle({ textAlign: 'left' })}
                    className={`p-1 rounded-md cursor-pointer ${
                      currentStyle.textAlign === 'left' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' : 'text-slate-600'
                    }`}
                    title="Aligner à gauche"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateStyle({ textAlign: 'center' })}
                    className={`p-1 rounded-md cursor-pointer ${
                      currentStyle.textAlign === 'center' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' : 'text-slate-600'
                    }`}
                    title="Centrer"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateStyle({ textAlign: 'right' })}
                    className={`p-1 rounded-md cursor-pointer ${
                      currentStyle.textAlign === 'right' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' : 'text-slate-600'
                    }`}
                    title="Aligner à droite"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color pickers */}
              <div className="flex flex-col space-y-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500 font-medium">Texte:</span>
                  <input
                    type="color"
                    value={currentStyle.color || '#1E293B'}
                    onChange={(e) => onUpdateStyle({ color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    title="Couleur du texte"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500 font-medium">Fond:</span>
                  <input
                    type="color"
                    value={currentStyle.backgroundColor || '#ffffff'}
                    onChange={(e) => onUpdateStyle({ backgroundColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    title="Couleur de fond"
                  />
                </div>
              </div>
            </div>

            {/* Importer Photo button in Accueil */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Importer une photo depuis l'ordinateur"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold">Photo</span>
              </button>
            </div>

            {/* Lock / Unlock */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={onToggleLockSelected}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Verrouiller/Déverrouiller"
              >
                {selectedElement?.locked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-slate-500" />}
                <span className="text-[10px]">{selectedElement?.locked ? 'Verrouillé' : 'Verrou'}&nbsp;</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INSERTION */}
        {activeTab === 'insertion' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800">
            {/* Photo Import */}
            <div className="flex items-center space-x-1 pr-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center min-w-[60px]"
              >
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold">Importer Photo</span>
              </button>
            </div>

            {/* Texte & Titres */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={() => onAddElement('text', { text: 'Nouveau paragraphe' })}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center min-w-[50px]"
              >
                <Type className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-medium">Texte</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    'text',
                    { text: 'TITRE DE SECTION' },
                    { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' }
                  )
                }
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center min-w-[50px]"
              >
                <span className="font-bold text-xs text-blue-600">TITRE</span>
                <span className="text-[10px] font-medium">Titre</span>
              </button>
            </div>

            {/* Shapes & Graphics */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={() => onAddShape('rectangle')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Rectangle"
              >
                <Square className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px]">Rectangle</span>
              </button>

              <button
                onClick={() => onAddShape('circle')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Cercle"
              >
                <Circle className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">Cercle</span>
              </button>

              <button
                onClick={() => onAddShape('line')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Ligne séparatrice"
              >
                <Minus className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">Ligne</span>
              </button>

              <button
                onClick={() => onAddShape('badge')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Badge Pilule"
              >
                <div className="w-4 h-2 bg-purple-500 rounded-full" />
                <span className="text-[10px]">Badge</span>
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={() => onAddList('bullet')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Liste à puces"
              >
                <List className="w-4 h-4 text-sky-600" />
                <span className="text-[10px]">Puces</span>
              </button>

              <button
                onClick={() => onAddList('numbered')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4 text-sky-600" />
                <span className="text-[10px]">Numéros</span>
              </button>

              <button
                onClick={() => onAddList('checklist')}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Liste de compétences"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">Checklist</span>
              </button>
            </div>

            {/* Layout Columns */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={() => onAddTwoColumnSection(30, 70)}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Section 2 Colonnes (30% / 70%)"
              >
                <Columns className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-medium">2 Col (30/70)</span>
              </button>

              <button
                onClick={() => onAddTwoColumnSection(50, 50)}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Section 2 Colonnes (50% / 50%)"
              >
                <Columns className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-medium">2 Col (50/50)</span>
              </button>
            </div>

            {/* CV Pre-made Sections */}
            <div className="flex items-center space-x-1 pl-3">
              <button
                onClick={() =>
                  onAddElement('experience', {
                    title: 'Expérience Professionnelle',
                    items: [
                      {
                        poste: 'Intitulé du Poste',
                        entreprise: 'Nom de l\'Entreprise',
                        date: '2022 - Présent',
                        description: 'Description des réalisations et responsabilités clés.'
                      }
                    ]
                  })
                }
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">Expérience</span>
              </button>

              <button
                onClick={() =>
                  onAddElement('education', {
                    title: 'Formation',
                    items: [
                      {
                        diplome: 'Master / Diplôme',
                        ecole: 'Nom de l\'Université',
                        date: '2019 - 2022'
                      }
                    ]
                  })
                }
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span className="text-[10px]">Formation</span>
              </button>

              <button
                onClick={() =>
                  onAddElement('contact', {
                    email: 'email@example.com',
                    telephone: '+33 6 12 34 56 78',
                    adresse: 'Paris, France'
                  })
                }
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">Contact</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CRÉATION & THÈME */}
        {activeTab === 'creation' && (
          <div className="flex items-center space-x-4 divide-x divide-slate-200 dark:divide-slate-800">
            {/* Color Palette Presets */}
            <div className="flex flex-col space-y-1 pr-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Thèmes de Couleurs
              </span>
              <div className="flex items-center space-x-1.5">
                {COLOR_PRESETS.map((cp) => (
                  <button
                    key={cp.name}
                    onClick={() => onApplyThemeColor && onApplyThemeColor(cp.hex)}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: cp.hex }}
                    title={cp.name}
                  />
                ))}
              </div>
            </div>

            {/* Font Pairings */}
            <div className="flex flex-col space-y-1 px-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Combinaison de Polices
              </span>
              <div className="flex items-center space-x-1">
                {['Inter', 'Playfair Display', 'Plus Jakarta Sans', 'Montserrat'].map((f) => (
                  <button
                    key={f}
                    onClick={() => onApplyFontFamily && onApplyFontFamily(f)}
                    className="px-2 py-0.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DISPOSITION & ALIGNEMENT */}
        {activeTab === 'disposition' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800">
            {/* Columns Preset Addition */}
            <div className="flex items-center space-x-1 pr-3">
              <button
                onClick={() => onAddTwoColumnSection(30, 70)}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Séparer le CV en 2 Colonnes 30% / 70%"
              >
                <Columns className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">2 Col 30/70</span>
              </button>
              <button
                onClick={() => onAddTwoColumnSection(40, 60)}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Séparer le CV en 2 Colonnes 40% / 60%"
              >
                <Columns className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px]">2 Col 40/60</span>
              </button>
              <button
                onClick={() => onAddTwoColumnSection(50, 50)}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Séparer le CV en 2 Colonnes 50% / 50%"
              >
                <Columns className="w-4 h-4 text-purple-600" />
                <span className="text-[10px]">2 Col 50/50</span>
              </button>
            </div>

            {/* Object Layering Z-Index */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={onBringToFront}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Premier plan"
              >
                <ArrowUp className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">Premier plan</span>
              </button>

              <button
                onClick={onSendToBack}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Arrière plan"
              >
                <ArrowDown className="w-4 h-4 text-slate-600" />
                <span className="text-[10px]">Arrière plan</span>
              </button>
            </div>

            {/* Object Alignments */}
            <div className="flex items-center space-x-1 px-3">
              <button
                onClick={() => onAlignSelected('left')}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Aligner à gauche"
              >
                <AlignLeft className="w-4 h-4" />
                <span className="text-[10px]">G.</span>
              </button>

              <button
                onClick={() => onAlignSelected('center')}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Centrer horizontalement"
              >
                <AlignCenter className="w-4 h-4" />
                <span className="text-[10px]">Centre</span>
              </button>

              <button
                onClick={() => onAlignSelected('right')}
                disabled={!selectedElement}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center"
                title="Aligner à droite"
              >
                <AlignRight className="w-4 h-4" />
                <span className="text-[10px]">D.</span>
              </button>
            </div>

            {/* Grid Snap Toggle */}
            <div className="flex items-center space-x-1 pl-3">
              <button
                onClick={onToggleGridSnap}
                className={`p-1.5 rounded-lg cursor-pointer flex flex-col items-center transition-colors ${
                  gridSnap
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Activer/Désactiver le magnétisme sur la grille"
              >
                <Grid className="w-4 h-4" />
                <span className="text-[10px]">{gridSnap ? 'Grille active' : 'Grille'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: AFFICHAGE */}
        {activeTab === 'affichage' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 pr-3">
              <button
                onClick={() => onZoomChange(Math.max(0.3, zoomLevel - 0.1))}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Zoom arrière"
              >
                <ZoomOut className="w-4 h-4" />
                <span className="text-[10px]">Zoom -</span>
              </button>

              <span className="text-xs font-bold w-12 text-center text-slate-700 dark:text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={() => onZoomChange(Math.min(1.5, zoomLevel + 0.1))}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Zoom avant"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="text-[10px]">Zoom +</span>
              </button>

              <button
                onClick={() => onZoomChange(0.85)}
                className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col items-center"
                title="Ajuster à la page"
              >
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">Ajuster</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: IA & ATS */}
        {activeTab === 'ai_ats' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAIAssistant}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Générer / Reformuler avec Copilot IA</span>
            </button>

            <button
              onClick={onOpenATSAnalyzer}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Analyseur de Score ATS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

