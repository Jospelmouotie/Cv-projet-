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
  Upload,
  Search,
  Check,
  Table as TableIcon,
  Smile,
  Link,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Printer,
  Sparkles as SparklesIcon,
  Shield,
  HelpCircle,
  Menu,
  X,
  Ruler
} from 'lucide-react';
import { CVElement, ElementType, ShapeType, ListType } from '../types/document';
import { CV } from '../types';

export type RibbonTab =
  | 'fichier'
  | 'accueil'
  | 'insertion'
  | 'creation'
  | 'disposition'
  | 'references'
  | 'publipostage'
  | 'revision'
  | 'affichage'
  | 'format';

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
  rulerVisible?: boolean;
  onToggleRuler?: () => void;
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
  onOpenProfileEditor?: () => void;
  onOpenPresetElementsModal?: () => void;
  onExportPDF: () => void;
  onSaveCV: () => void;
  autoSaveStatus?: 'saved' | 'saving' | 'error';
  onToggleViewMode?: (mode: 'visual' | 'form') => void;
  viewMode?: 'visual' | 'form';
  onApplyThemeColor?: (color: string) => void;
  onApplyFontFamily?: (font: string) => void;
  onApplyPageBackground?: (color: string) => void;
  cv?: CV;
  onUpdateCV?: (cvPatch: Partial<CV>) => void;
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
  rulerVisible = true,
  onToggleRuler,
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
  onOpenProfileEditor,
  onOpenPresetElementsModal,
  onExportPDF,
  onSaveCV,
  autoSaveStatus,
  onToggleViewMode,
  viewMode = 'visual',
  onApplyThemeColor,
  onApplyFontFamily,
  onApplyPageBackground,
  cv,
  onUpdateCV
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('accueil');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBulletDropdown, setShowBulletDropdown] = useState<boolean>(false);
  const [showSymbolDropdown, setShowSymbolDropdown] = useState<boolean>(false);
  const [showTableDropdown, setShowTableDropdown] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedElement = selectedElements[0] || null;
  const currentStyle = selectedElement?.style || {};

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (cv && onUpdateCV) {
        onUpdateCV({ photoUrl: dataUrl, afficherPhoto: true });
      }
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

  // Bullet style picker action
  const handleSelectBulletStyle = (bulletStyle: string) => {
    if (cv && onUpdateCV) {
      onUpdateCV({ stylePucesListes: bulletStyle as any });
    }
    if (selectedElement) {
      onUpdateStyle({ bulletStyle, listType: 'bullet' });
    } else {
      onAddList('bullet');
    }
    setShowBulletDropdown(false);
  };

  // 2-Columns layout trigger
  const handleSetTwoColumns = (leftPct: number = 30) => {
    if (cv && onUpdateCV) {
      onUpdateCV({ nombreColonnes: 2, largeurColonneGauche: leftPct });
    }
    onAddTwoColumnSection(leftPct, 100 - leftPct);
  };

  const handleSetOneColumn = () => {
    if (cv && onUpdateCV) {
      onUpdateCV({ nombreColonnes: 1 });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-xs z-30 select-none flex flex-col font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. TOP TITLE & SEARCH BAR (Microsoft Word Style Header) */}
      <div className="px-3 py-1.5 bg-[#1B365D] text-white flex items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-blue-600 px-2.5 py-1 rounded-md font-extrabold tracking-wider text-[11px] uppercase shadow-xs">
            <FileText className="w-4 h-4 text-white" />
            <span>Word Studio</span>
          </div>
          <span className="text-slate-300 font-medium hidden md:inline truncate max-w-[200px]">
            {cv?.titreCV || cv?.titre || 'Curriculum Vitae.docx'}
          </span>
        </div>

        {/* Word Center Search Bar */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dites-nous ce que vous voulez faire..."
              className="w-full bg-slate-700/80 hover:bg-slate-700 focus:bg-white focus:text-slate-900 text-slate-100 placeholder-slate-300 text-xs pl-8 pr-3 py-1 rounded-md border border-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Action Switchers & Status */}
        <div className="flex items-center space-x-2 shrink-0">
          {onToggleViewMode && (
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => onToggleViewMode('visual')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'visual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mode Word</span>
              </button>
              <button
                onClick={() => onToggleViewMode('form')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'form' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Formulaire</span>
              </button>
            </div>
          )}

          {/* Connection Status */}
          <div className="hidden lg:flex items-center space-x-1 bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded text-[11px]">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Connecté</span>
          </div>

          <button
            onClick={onExportPDF}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Exporter le CV en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          {/* Mobile Ribbon Bar Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md cursor-pointer flex items-center space-x-1"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-[11px] font-bold">Ruban</span>
          </button>
        </div>
      </div>

      {/* 2. RIBBON NAVIGATION TABS (Desktop & Mobile Drawer) */}
      <div className={`sm:flex ${mobileMenuOpen ? 'block' : 'hidden sm:block'} border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-x-auto scrollbar-none`}>
        <div className="flex items-center px-2 pt-1 gap-0.5">
          {[
            { id: 'fichier', label: 'Fichier', class: 'text-blue-800 dark:text-blue-300 font-extrabold' },
            { id: 'accueil', label: 'Accueil', class: '' },
            { id: 'insertion', label: 'Insertion', class: '' },
            { id: 'creation', label: 'Création', class: '' },
            { id: 'disposition', label: 'Disposition', class: '' },
            { id: 'references', label: 'Références', class: '' },
            { id: 'publipostage', label: 'Publipostage', class: '' },
            { id: 'revision', label: 'Révision', class: '' },
            { id: 'affichage', label: 'Affichage', class: '' },
            { id: 'format', label: 'Format', class: 'text-amber-700 dark:text-amber-400 font-extrabold' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as RibbonTab);
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              } ${tab.class}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SUB-TOOLBAR RIBBON CONTROLS */}
      <div className="p-2 min-h-[62px] bg-white dark:bg-slate-900 flex items-center overflow-x-auto scrollbar-none gap-3 border-b border-slate-200 dark:border-slate-800 text-xs">
        
        {/* TAB: FICHIER */}
        {activeTab === 'fichier' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800">
            <div className="flex items-center space-x-1 pr-3">
              <button
                onClick={onSaveCV}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 flex flex-col items-center cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Enregistrer</span>
              </button>
              <button
                onClick={onExportPDF}
                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 flex flex-col items-center cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Exporter PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex flex-col items-center cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Imprimer</span>
              </button>
            </div>
            <div className="pl-3 flex items-center space-x-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Document Word A4 standard • Persistance synchronisée
              </span>
            </div>
          </div>
        )}

        {/* TAB: ACCUEIL */}
        {activeTab === 'accueil' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Presse-papier & Annuler */}
            <div className="flex items-center space-x-1 pr-3">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center text-slate-700 dark:text-slate-300"
                title="Annuler (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
                <span className="text-[9px]">Annuler</span>
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center text-slate-700 dark:text-slate-300"
                title="Rétablir (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
                <span className="text-[9px]">Rétablir</span>
              </button>
              <button
                onClick={onDuplicateSelected}
                disabled={!selectedElement}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center text-blue-600"
                title="Dupliquer"
              >
                <Copy className="w-4 h-4" />
                <span className="text-[9px]">Dupliquer</span>
              </button>
              <button
                onClick={onDeleteSelected}
                disabled={!selectedElement}
                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 cursor-pointer flex flex-col items-center text-red-600"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[9px]">Supprimer</span>
              </button>
            </div>

            {/* Police / Typographie */}
            <div className="px-3 flex flex-col space-y-1">
              <div className="flex items-center space-x-1">
                <select
                  value={currentStyle.fontFamily || 'Inter'}
                  onChange={(e) => onApplyFontFamily?.(e.target.value)}
                  className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {FONT_PRESETS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <select
                  value={currentStyle.fontSize || 12}
                  onChange={(e) => onUpdateStyle({ fontSize: parseInt(e.target.value, 10) })}
                  className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map((s) => (
                    <option key={s} value={s}>{s} pt</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleToggleBold}
                  className={`p-1 rounded-md text-xs font-bold cursor-pointer ${
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
                  className={`p-1 rounded-md text-xs cursor-pointer ${
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
                  className={`p-1 rounded-md text-xs cursor-pointer ${
                    currentStyle.textDecoration === 'underline'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Souligné"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <input
                  type="color"
                  value={currentStyle.color || '#1E293B'}
                  onChange={(e) => onUpdateStyle({ color: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                  title="Couleur du texte"
                />
              </div>
            </div>

            {/* Paragraphe & Puces Dropdown */}
            <div className="px-3 flex flex-col space-y-1">
              <div className="flex items-center space-x-1 relative">
                {/* BULLET STYLE DROPDOWN PICKER */}
                <div className="relative">
                  <button
                    onClick={() => setShowBulletDropdown(!showBulletDropdown)}
                    className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer font-bold text-slate-700 dark:text-slate-300"
                    title="Choisir le style de puce pour la sélection"
                  >
                    <List className="w-3.5 h-3.5 text-blue-600" />
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showBulletDropdown && (
                    <div className="absolute top-8 left-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 w-48 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 px-2 block">
                        Styles de Puces :
                      </span>
                      {[
                        { id: 'disc', label: 'Puces rondes •', icon: '•' },
                        { id: 'square', label: 'Puces carrées ■', icon: '■' },
                        { id: 'arrow', label: 'Flèches ➢', icon: '➢' },
                        { id: 'check', label: 'Coches ✓', icon: '✓' },
                        { id: 'star', label: 'Étoiles ★', icon: '★' },
                        { id: 'dash', label: 'Tirés -', icon: '-' },
                        { id: 'numbered', label: 'Numéroté 1.', icon: '1.' }
                      ].map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleSelectBulletStyle(b.id)}
                          className="w-full text-left px-2 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between text-xs font-semibold cursor-pointer"
                        >
                          <span>{b.label}</span>
                          <span className="text-blue-600 font-bold">{b.icon}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alignment */}
                <button
                  onClick={() => onUpdateStyle({ textAlign: 'left' })}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Aligner à gauche"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateStyle({ textAlign: 'center' })}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Centrer"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateStyle({ textAlign: 'right' })}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Aligner à droite"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateStyle({ textAlign: 'justify' })}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Justifier"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[9px] text-slate-400 uppercase font-bold text-center">
                Police & Paragraphe
              </span>
            </div>
          </div>
        )}

        {/* TAB: INSERTION */}
        {activeTab === 'insertion' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Header / Profile Edit Trigger */}
            <div className="pr-3 flex items-center space-x-2">
              <button
                onClick={onOpenProfileEditor}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Éditer En-tête & Profil</span>
              </button>
              <button
                onClick={onOpenPresetElementsModal}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Éléments par défaut (30 Modèles)</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Photo</span>
              </button>
            </div>

            {/* Tableaux, Formes, Symboles */}
            <div className="px-3 flex items-center space-x-2">
              <button
                onClick={() => onAddElement('shape', { shapeType: 'rectangle', label: 'Tableau' }, { width: 400, height: 120 })}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <TableIcon className="w-4 h-4 text-indigo-600" />
                <span>Tableau</span>
              </button>

              <button
                onClick={() => onAddShape('rectangle')}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Square className="w-4 h-4 text-amber-600" />
                <span>Forme</span>
              </button>

              <button
                onClick={() => onAddElement('icon', { iconName: 'Phone', text: '+33 6 12 34 56 78' })}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Smile className="w-4 h-4 text-sky-600" />
                <span>Symboles</span>
              </button>

              <button
                onClick={() => onAddElement('text', { text: 'https://mon-portfolio.com' })}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Link className="w-4 h-4 text-blue-600" />
                <span>Lien</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: CRÉATION */}
        {activeTab === 'creation' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Color Themes */}
            <div className="pr-3 flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500">Thème :</span>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => onApplyThemeColor?.(c.hex)}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-xs hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Grand Titre Mode & Page Background */}
            <div className="px-3 flex items-center space-x-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block">Grand Titre :</label>
                <select
                  value={cv?.grandTitreMode || 'nom'}
                  onChange={(e) => onUpdateCV?.({ grandTitreMode: e.target.value as any })}
                  className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="nom">Focus sur le Nom</option>
                  <option value="poste">Focus sur le Poste</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">Couleur de Page :</label>
                <input
                  type="color"
                  value={cv?.couleurFond || '#FFFFFF'}
                  onChange={(e) => {
                    onApplyPageBackground?.(e.target.value);
                    onUpdateCV?.({ couleurFond: e.target.value });
                  }}
                  className="w-7 h-7 rounded border cursor-pointer"
                  title="Couleur de fond de la page A4"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: DISPOSITION */}
        {activeTab === 'disposition' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Colonnes 1 vs 2 Mode & Reflow */}
            <div className="pr-3 flex items-center space-x-2">
              <button
                onClick={handleSetOneColumn}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  cv?.nombreColonnes === 1
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                1 Colonne
              </button>
              <button
                onClick={() => handleSetTwoColumns(30)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                  cv?.nombreColonnes === 2
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>2 Colonnes (30/70)</span>
              </button>
            </div>

            {/* Column Width Slider */}
            {cv?.nombreColonnes === 2 && (
              <div className="px-3 flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500">
                  Largeur Colonne ({cv?.largeurColonneGauche || 30}%) :
                </span>
                <input
                  type="range"
                  min={20}
                  max={50}
                  value={cv?.largeurColonneGauche || 30}
                  onChange={(e) => onUpdateCV?.({ largeurColonneGauche: parseInt(e.target.value, 10) })}
                  className="w-28 accent-blue-600 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB: RÉFÉRENCES (Sections Prédéfinies CV) */}
        {activeTab === 'references' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            <div className="pr-3 flex items-center space-x-1.5">
              <button
                onClick={onOpenPresetElementsModal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bibliothèque d'Exemples (30 CVs)</span>
              </button>
            </div>

            <div className="px-3 flex items-center space-x-1.5 flex-wrap gap-1">
              {[
                { name: 'Expérience', type: 'experience', icon: Briefcase },
                { name: 'Formation', type: 'formation', icon: GraduationCap },
                { name: 'Compétences', type: 'competences', icon: Award },
                { name: 'Langues', type: 'langues', icon: Globe },
                { name: 'Projets', type: 'projets', icon: Sparkles },
                { name: 'Certifications', type: 'certifications', icon: Check }
              ].map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.type}
                    onClick={() => {
                      onAddElement('section', {
                        section: {
                          id: `sec-quick-${Date.now()}`,
                          type: sec.type as any,
                          titre: sec.name.toUpperCase(),
                          ordre: 99,
                          visible: true,
                          contenu: []
                        }
                      });
                    }}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ {sec.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: PUBLIPOSTAGE (Bibliothèque d'icônes & Formes) */}
        {activeTab === 'publipostage' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Quick Contact Icons */}
            <div className="pr-3 flex items-center space-x-1 font-semibold text-xs">
              <span className="text-[10px] font-bold text-slate-400 mr-1">Icônes Réseaux :</span>
              <button
                onClick={() => onAddElement('icon', { iconName: 'Phone', text: '+33 6 00 00 00 00' })}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Insérer Téléphone"
              >
                📞
              </button>
              <button
                onClick={() => onAddElement('icon', { iconName: 'Mail', text: 'email@exemple.com' })}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Insérer Email"
              >
                📧
              </button>
              <button
                onClick={() => onAddElement('icon', { iconName: 'MapPin', text: 'Paris, France' })}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Insérer Adresse"
              >
                📍
              </button>
              <button
                onClick={() => onAddElement('icon', { iconName: 'Linkedin', text: 'linkedin.com/in/profil' })}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Insérer LinkedIn"
              >
                💼
              </button>
            </div>

            {/* Decorative Assets */}
            <div className="px-3 flex items-center space-x-2">
              <button
                onClick={() => onAddShape('badge')}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Insigne Pilule</span>
              </button>
              <button
                onClick={() => onAddShape('pillar')}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5 text-purple-600" />
                <span>Barre Latérale</span>
              </button>
              <button
                onClick={() => onAddList('skill-progress')}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Jauge Niveau</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: FORMAT (as depicted in Screenshot 2) */}
        {activeTab === 'format' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Shapes & WordArt */}
            <div className="pr-3 flex items-center space-x-2">
              <button
                onClick={() => onAddShape('rectangle')}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1 cursor-pointer"
              >
                <Square className="w-4 h-4 text-blue-600" />
                <span>Insérer Forme</span>
              </button>
              <button
                onClick={() => onAddShape('circle')}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1 cursor-pointer"
              >
                <Circle className="w-4 h-4 text-indigo-600" />
                <span>Cercle</span>
              </button>
            </div>

            {/* Opacity & Layers */}
            <div className="px-3 flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500">Opacité :</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round((currentStyle.opacity || 1) * 100)}
                  onChange={(e) => onUpdateStyle({ opacity: parseInt(e.target.value, 10) / 100 })}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {Math.round((currentStyle.opacity || 1) * 100)}%
                </span>
              </div>

              {/* Layer Z-Index */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={onBringToFront}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                  title="Premier plan"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Avancer</span>
                </button>
                <button
                  onClick={onSendToBack}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                  title="Arrière plan"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reculer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: AFFICHAGE */}
        {activeTab === 'affichage' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            {/* Zoom Controls */}
            <div className="pr-3 flex items-center space-x-1.5">
              <button
                onClick={() => onZoomChange(Math.max(0.3, zoomLevel - 0.1))}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Zoom Arrière"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => onZoomChange(Math.min(1.8, zoomLevel + 0.1))}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Zoom Avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Ruler & Grid Snap Toggles */}
            <div className="px-3 flex items-center space-x-2">
              <button
                onClick={onToggleRuler}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                  rulerVisible
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Règle A4</span>
              </button>

              <button
                onClick={onToggleGridSnap}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                  gridSnap
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Magnétisme Grille</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: RÉVISION / AI */}
        {activeTab === 'revision' && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenAIAssistant}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Assistant Gemini IA</span>
            </button>
            <button
              onClick={onOpenATSAnalyzer}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Diagnostic ATS</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. A4 MILLIMETER / CENTIMETER RULER (Règle graduée sous le ruban) */}
      {rulerVisible && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 h-5 relative overflow-hidden select-none flex items-center justify-center text-[9px] font-mono text-slate-600 dark:text-slate-400">
          <div className="w-[794px] h-full relative flex justify-between px-2">
            {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21].map((cm) => (
              <div key={cm} className="flex flex-col items-center">
                <div className="h-2 w-px bg-slate-500" />
                <span>{cm}cm</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
