import React, { useState, useRef } from 'react';
import { BackgroundControlPanel } from '../components/BackgroundControlPanel';
import { TEMPLATE_PRESETS } from '../data/templatePresets';
import { toggleColumnLayout, switchTemplateSafely } from '../state/cvActions';
import {
  ArrowLeft,
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
  EyeOff,
  Sliders,
  Plus,
  ArrowUp,
  ArrowDown,
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
  Shield,
  HelpCircle,
  Menu,
  X,
  Ruler,
  Star,
  Phone,
  Mail,
  MapPin,
  Heart,
  QrCode,
  CheckCircle2,
  RotateCw,
  FolderTree,
  FileCheck2,
  Strikethrough,
  Highlighter,
  WrapText,
  Eraser,
  Heading1,
  Heading2,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Move
} from 'lucide-react';
import { CVElement, ElementType, ShapeType, ListType } from '../types/document';
import { CV, Section } from '../types';
import { getTranslation, getLocalizedTemplateName } from '../i18n/translations';
import { printCV } from '../utils/pdfExport';

export type RibbonTab =
  | 'fichier'
  | 'accueil'
  | 'insertion'
  | 'structure'
  | 'creation'
  | 'disposition'
  | 'references'
  | 'publipostage'
  | 'revision'
  | 'affichage'
  | 'export'
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
  onPrint?: () => void;
  onSaveCV: () => void;
  autoSaveStatus?: 'saved' | 'saving' | 'error';
  onToggleViewMode?: (mode: 'visual' | 'form') => void;
  viewMode?: 'visual' | 'form';
  onApplyThemeColor?: (color: string) => void;
  onApplyFontFamily?: (font: string) => void;
  onApplyPageBackground?: (color: string) => void;
  cv?: CV;
  onUpdateCV?: (cvPatch: Partial<CV>) => void;
  onBack?: () => void;
}

const FONT_PRESETS = [
  'Inter',
  'Plus Jakarta Sans',
  'Playfair Display',
  'Roboto',
  'Montserrat',
  'Merriweather',
  'Lora',
  'Poppins',
  'Open Sans',
  'Lato',
  'Raleway'
];

const COLOR_PALETTES = [
  { name: 'Exécutif Bleu', main: '#1E3A8A', sub: '#3B82F6', bg: '#EFF6FF' },
  { name: 'Émeraude Tech', main: '#065F46', sub: '#10B981', bg: '#ECFDF5' },
  { name: 'Indigo Moderne', main: '#4338CA', sub: '#6366F1', bg: '#EEF2FF' },
  { name: 'Sable & Cuir', main: '#78350F', sub: '#D97706', bg: '#FFFBEB' },
  { name: 'Anthracite Chic', main: '#1F2937', sub: '#6B7280', bg: '#F9FAFB' },
  { name: 'Bordeaux Élégant', main: '#831843', sub: '#EC4899', bg: '#FDF2F8' }
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
  onPrint,
  onSaveCV,
  autoSaveStatus,
  onToggleViewMode,
  viewMode = 'visual',
  onApplyThemeColor,
  onApplyFontFamily,
  onApplyPageBackground,
  cv,
  onUpdateCV,
  onBack
}) => {
  const lang = cv?.langue || 'fr';
  const [activeTab, setActiveTab] = useState<RibbonTab>('accueil');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown & Popover States
  const [showPasteDropdown, setShowPasteDropdown] = useState<boolean>(false);
  const [showFontDropdown, setShowFontDropdown] = useState<boolean>(false);
  const [showUnderlineDropdown, setShowUnderlineDropdown] = useState<boolean>(false);
  const [showColorPaletteDropdown, setShowColorPaletteDropdown] = useState<boolean>(false);
  const [showBulletDropdown, setShowBulletDropdown] = useState<boolean>(false);
  const [showNumberingDropdown, setShowNumberingDropdown] = useState<boolean>(false);
  const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState<boolean>(false);
  const [showStylesDropdown, setShowStylesDropdown] = useState<boolean>(false);
  const [showTableDropdown, setShowTableDropdown] = useState<boolean>(false);
  const [showShapeDropdown, setShowShapeDropdown] = useState<boolean>(false);
  const [showIconsDropdown, setShowIconsDropdown] = useState<boolean>(false);
  const [showSmartArtDropdown, setShowSmartArtDropdown] = useState<boolean>(false);
  const [showTextBoxDropdown, setShowTextBoxDropdown] = useState<boolean>(false);
  const [showSymbolDropdown, setShowSymbolDropdown] = useState<boolean>(false);
  const [showTemplatesGallery, setShowTemplatesGallery] = useState<boolean>(false);
  const [showMarginsDropdown, setShowMarginsDropdown] = useState<boolean>(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState<boolean>(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState<boolean>(false);
  const [showWrapDropdown, setShowWrapDropdown] = useState<boolean>(false);
  const [showBgPopover, setShowBgPopover] = useState<boolean>(false);
  const [showBordersDropdown, setShowBordersDropdown] = useState<boolean>(false);
  const [showPhotoDropdown, setShowPhotoDropdown] = useState<boolean>(false);
  const [refCategory, setRefCategory] = useState<string>('all');

  const [selectedRibbonSectionId, setSelectedRibbonSectionId] = useState<string>('');
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedElement = selectedElements[0] || null;
  const currentStyle = selectedElement?.style || {};

  React.useEffect(() => {
    if (selectedElement) {
      setActiveTab('format');
    }
  }, [selectedElement?.id]);

  const closeAllDropdowns = () => {
    setShowPasteDropdown(false);
    setShowFontDropdown(false);
    setShowUnderlineDropdown(false);
    setShowColorPaletteDropdown(false);
    setShowBulletDropdown(false);
    setShowNumberingDropdown(false);
    setShowLineSpacingDropdown(false);
    setShowStylesDropdown(false);
    setShowTableDropdown(false);
    setShowShapeDropdown(false);
    setShowIconsDropdown(false);
    setShowSmartArtDropdown(false);
    setShowTextBoxDropdown(false);
    setShowSymbolDropdown(false);
    setShowTemplatesGallery(false);
    setShowMarginsDropdown(false);
    setShowColumnsDropdown(false);
    setShowPositionDropdown(false);
    setShowWrapDropdown(false);
    setShowBgPopover(false);
    setShowBordersDropdown(false);
    setShowPhotoDropdown(false);
  };

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
      try { document.execCommand('bold', false); } catch (_) {}
    }
    onUpdateStyle({ fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold' });
  };

  const handleToggleItalic = () => {
    if (typeof window !== 'undefined') {
      try { document.execCommand('italic', false); } catch (_) {}
    }
    onUpdateStyle({ fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const handleToggleUnderline = (style: string = 'solid') => {
    if (typeof window !== 'undefined') {
      try { document.execCommand('underline', false); } catch (_) {}
    }
    onUpdateStyle({
      textDecoration: currentStyle.textDecoration === 'underline' ? 'none' : 'underline',
      textDecorationStyle: style
    });
    setShowUnderlineDropdown(false);
  };

  const handleCaseChange = (caseType: 'upper' | 'lower' | 'title') => {
    if (!selectedElement) return;
    if (typeof selectedElement.content === 'string') {
      let newText = selectedElement.content;
      if (caseType === 'upper') newText = newText.toUpperCase();
      else if (caseType === 'lower') newText = newText.toLowerCase();
      else if (caseType === 'title') {
        newText = newText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      selectedElement.content = newText;
      onUpdateStyle({});
    } else if (selectedElement.content?.text) {
      let newText = selectedElement.content.text;
      if (caseType === 'upper') newText = newText.toUpperCase();
      else if (caseType === 'lower') newText = newText.toLowerCase();
      else if (caseType === 'title') {
        newText = newText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      selectedElement.content = { ...selectedElement.content, text: newText };
      onUpdateStyle({});
    }
  };

  const handleClearFormatting = () => {
    onUpdateStyle({
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      backgroundColor: 'transparent',
      color: '#000000',
      fontSize: 11
    });
  };

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

  const handleSetTwoColumns = (leftPct: number = 32) => {
    if (cv && onUpdateCV) {
      const updated = toggleColumnLayout(cv, 2);
      onUpdateCV({ ...updated, largeurColonneGauche: leftPct });
    }
  };

  const handleSetOneColumn = () => {
    if (cv && onUpdateCV) {
      const updated = toggleColumnLayout(cv, 1);
      onUpdateCV(updated);
    }
  };

  const computeDocStats = () => {
    if (!cv) return { words: 0, chars: 0, pages: 1 };
    let textStr = `${cv.titreCV || ''} ${cv.profil?.nom || ''} ${cv.profil?.titrePro || ''} ${cv.profil?.resume || ''}`;
    (cv.sections || []).forEach(sec => {
      textStr += ` ${sec.titre || ''} ${JSON.stringify(sec.contenu || '')}`;
    });
    const cleanText = textStr.replace(/[^\w\sàâéèêëîïôûùüçœæ]/gi, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const chars = textStr.length;
    const pages = words > 450 ? Math.ceil(words / 450) : 1;
    return { words, chars, pages };
  };

  const docStats = computeDocStats();

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-sm z-50 select-none flex flex-col font-sans relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. TOP BAR — Word Studio Header & Quick Command Search */}
      <div className="px-3 py-1.5 bg-[#1B365D] text-white flex items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          {onBack && (
            <button
              onClick={onBack}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-md font-extrabold text-xs flex items-center space-x-1.5 transition-all cursor-pointer border border-white/30 shrink-0 shadow-xs"
              title="Retourner à la liste de mes CVs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-200 stroke-[2.5]" />
              <span>Retour aux CVs</span>
            </button>
          )}
          <div className="flex items-center space-x-1.5 bg-blue-600 px-2.5 py-1 rounded-md font-black tracking-wider text-[11px] uppercase shadow-xs">
            <FileText className="w-4 h-4 text-white" />
            <span>Word Studio CV</span>
          </div>
          <span className="text-slate-300 font-medium hidden md:inline truncate max-w-[200px]">
            {cv?.titreCV || cv?.titre || 'Mon_CV_Professionnel.docx'}
          </span>
        </div>

        {/* Command Search */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un outil (ex: puces, marges, photo, PDF)..."
              className="w-full bg-slate-700/80 hover:bg-slate-700 focus:bg-white focus:text-slate-900 text-slate-100 placeholder-slate-300 text-xs pl-8 pr-3 py-1 rounded-md border border-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* View Mode & Actions */}
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
                <span className="hidden sm:inline">Ruban Word</span>
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

          <button
            onClick={onExportPDF}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Exporter le CV en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md cursor-pointer flex items-center space-x-1"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-[11px] font-bold">Ruban</span>
          </button>
        </div>
      </div>

      {/* 2. RUBBON TABS HEADER */}
      <div className={`sm:flex ${mobileMenuOpen ? 'block' : 'hidden sm:block'} border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-x-auto scrollbar-none z-40 relative`}>
        <div className="flex items-center px-2 pt-1 gap-0.5 min-w-max">
          {[
            { id: 'fichier', label: getTranslation(lang, 'tabFile'), class: 'text-blue-800 dark:text-blue-300 font-black' },
            { id: 'accueil', label: getTranslation(lang, 'tabHome'), class: '' },
            { id: 'insertion', label: getTranslation(lang, 'tabInsert'), class: '' },
            { id: 'structure', label: getTranslation(lang, 'tabStructure'), class: 'text-purple-700 dark:text-purple-300 font-extrabold' },
            { id: 'creation', label: lang === 'en' ? 'Templates & Themes' : lang === 'ar' ? 'النماذج والسمات' : 'Modèles & Thèmes', class: 'text-purple-700 dark:text-purple-300 font-black bg-purple-50/80 dark:bg-purple-950/40 rounded-t-md px-2' },
            { id: 'disposition', label: getTranslation(lang, 'tabLayout'), class: '' },
            { id: 'references', label: lang === 'en' ? 'References' : lang === 'ar' ? 'المراجع' : 'Références', class: '' },
            { id: 'publipostage', label: lang === 'en' ? 'Contact & Badges' : lang === 'ar' ? 'بيانات الاتصال والشارات' : 'Coordonnées & Badges', class: '' },
            { id: 'revision', label: lang === 'en' ? 'Review & AI' : lang === 'ar' ? 'المراجعة والذكاء الاصطناعي' : 'Révision & IA', class: '' },
            { id: 'affichage', label: getTranslation(lang, 'tabView'), class: '' },
            { id: 'export', label: getTranslation(lang, 'tabExport'), class: 'text-emerald-700 dark:text-emerald-400 font-black' },
            ...(selectedElement ? [{ id: 'format', label: lang === 'en' ? 'Shape Format' : lang === 'ar' ? 'تنسيق الشكل' : 'Format de Forme', class: 'text-amber-600 font-black border-amber-500' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as RibbonTab);
                setMobileMenuOpen(false);
                closeAllDropdowns();
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

      {/* 3. SUB-TOOLBAR CONTROLS BAR */}
      <div className="p-2 min-h-[68px] bg-white dark:bg-slate-900 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs relative z-40 flex-wrap sm:flex-nowrap overflow-x-auto overflow-y-hidden">

        {/* ==================== TAB: FICHIER ==================== */}
        {activeTab === 'fichier' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800">
            <div className="flex items-center space-x-1.5 pr-3">
              <button
                onClick={onSaveCV}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 flex flex-col items-center cursor-pointer shadow-2xs"
              >
                <Save className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Enregistrer</span>
              </button>
              <button
                onClick={onExportPDF}
                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 flex flex-col items-center cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Exporter PDF</span>
              </button>
              <button
                onClick={() => (onPrint ? onPrint() : printCV('cv-preview-container'))}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex flex-col items-center cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Imprimer</span>
              </button>
            </div>
            <div className="pl-3 flex flex-col text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-slate-800 dark:text-slate-200">Format Standard Word CV A4</span>
              <span>Sauvegarde automatique & Exportation Vectorielle HD</span>
            </div>
          </div>
        )}

        {/* ==================== TAB: ACCUEIL (HOME) ==================== */}
        {activeTab === 'accueil' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 relative overflow-visible">
            
            {/* Groupe 1 — Presse-papiers */}
            <div className="flex items-center space-x-1 pr-3 relative">
              <div className="relative">
                <button
                  onClick={() => setShowPasteDropdown(!showPasteDropdown)}
                  className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold flex flex-col items-center cursor-pointer"
                  title="Options de Collage"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                  <div className="flex items-center space-x-0.5 text-[9px]">
                    <span>Coller</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </div>
                </button>

                {showPasteDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 w-52 space-y-1 text-xs">
                    <button
                      onClick={() => { setShowPasteDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg font-bold flex items-center justify-between"
                    >
                      <span>Coller Standard</span>
                      <span className="text-[10px] text-slate-400">Ctrl+V</span>
                    </button>
                    <button
                      onClick={() => { setShowPasteDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center justify-between"
                    >
                      <span>Coller sans mise en forme</span>
                    </button>
                    <button
                      onClick={() => { setShowPasteDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center justify-between"
                    >
                      <span>Collage Spécial CV</span>
                    </button>
                  </div>
                )}
              </div>

              <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center text-slate-700 dark:text-slate-300" title="Annuler (Ctrl+Z)">
                <Undo2 className="w-4 h-4" />
                <span className="text-[9px]">Annuler</span>
              </button>
              <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center text-slate-700 dark:text-slate-300" title="Rétablir (Ctrl+Y)">
                <Redo2 className="w-4 h-4" />
                <span className="text-[9px]">Rétablir</span>
              </button>
              <button onClick={onDuplicateSelected} disabled={!selectedElement} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer flex flex-col items-center text-blue-600" title="Copier / Dupliquer">
                <Copy className="w-4 h-4" />
                <span className="text-[9px]">Copier</span>
              </button>
              <button onClick={onDeleteSelected} disabled={!selectedElement} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 cursor-pointer flex flex-col items-center text-red-600" title="Couper / Supprimer">
                <Scissors className="w-4 h-4" />
                <span className="text-[9px]">Couper</span>
              </button>
            </div>

            {/* Groupe 2 — Police [GALERIE VISUELLE] */}
            <div className="px-3 flex flex-col space-y-1 relative">
              <div className="flex items-center space-x-1">
                {/* Font Selector with Live Rendered Gallery */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setShowFontDropdown(!showFontDropdown); }}
                    className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Type className="w-3.5 h-3.5 text-blue-600" />
                    <span style={{ fontFamily: cv?.police || currentStyle.fontFamily || 'Inter' }}>
                      {cv?.police || currentStyle.fontFamily || 'Inter'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showFontDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 w-60 space-y-1 max-h-72 overflow-y-auto">
                      <span className="text-[10px] font-bold uppercase text-slate-400 px-2 block border-b pb-1">
                        Galerie des Polices [GALERIE VISUELLE]
                      </span>
                      {FONT_PRESETS.map((font) => (
                        <button
                          key={font}
                          onClick={() => {
                            onApplyFontFamily?.(font);
                            onUpdateStyle({ fontFamily: font });
                            setShowFontDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-sm transition-all cursor-pointer border border-transparent hover:border-blue-200"
                          style={{ fontFamily: font }}
                        >
                          {font} — Rendu A4 Pro
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Font Size */}
                <select
                  value={currentStyle.fontSize || cv?.taillePoliceValeur || 11}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateStyle({ fontSize: val });
                    if (cv && onUpdateCV) onUpdateCV({ taillePoliceValeur: val });
                  }}
                  className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                >
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((s) => (
                    <option key={s} value={s}>{s} pt</option>
                  ))}
                </select>

                {/* A▲ / A▼ Buttons */}
                <button onClick={() => onUpdateStyle({ fontSize: Math.min(48, (currentStyle.fontSize || 11) + 1) })} className="px-1.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-black text-xs cursor-pointer" title="Agrandir la police (A▲)">
                  A▲
                </button>
                <button onClick={() => onUpdateStyle({ fontSize: Math.max(7, (currentStyle.fontSize || 11) - 1) })} className="px-1.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-black text-[10px] cursor-pointer" title="Réduire la police (A▼)">
                  A▼
                </button>

                {/* Case Modifier */}
                <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                  <button onClick={() => handleCaseChange('upper')} className="px-1 text-[10px] font-black text-slate-700 hover:text-blue-600 cursor-pointer" title="MAJUSCULES">AA</button>
                  <button onClick={() => handleCaseChange('lower')} className="px-1 text-[10px] font-bold text-slate-700 hover:text-blue-600 cursor-pointer" title="minuscules">aa</button>
                  <button onClick={() => handleCaseChange('title')} className="px-1 text-[10px] font-bold text-slate-700 hover:text-blue-600 cursor-pointer" title="Capitales En Début De Mot">Aa</button>
                </div>

                {/* Clear Formatting */}
                <button onClick={handleClearFormatting} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer" title="Effacer la mise en forme">
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Formatting & Color Row */}
              <div className="flex items-center space-x-1">
                <button onClick={handleToggleBold} className={`p-1 rounded-md text-xs font-bold cursor-pointer ${currentStyle.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`} title="Gras (G)">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleToggleItalic} className={`p-1 rounded-md text-xs cursor-pointer ${currentStyle.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`} title="Italique (I)">
                  <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Underline with Visual Style Menu [GALERIE VISUELLE] */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setShowUnderlineDropdown(!showUnderlineDropdown); }}
                    className={`p-1 rounded-md text-xs cursor-pointer flex items-center gap-0.5 ${currentStyle.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    title="Souligné (S) et sous-menu styles"
                  >
                    <Underline className="w-3.5 h-3.5" />
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>

                  {showUnderlineDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 w-48 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 px-2 block border-b pb-1">
                        Styles de Soulignement [GALERIE VISUELLE]
                      </span>
                      {[
                        { id: 'solid', label: 'Plein', line: 'border-b-2 border-slate-800' },
                        { id: 'dashed', label: 'Tirets', line: 'border-b-2 border-dashed border-slate-800' },
                        { id: 'dotted', label: 'Pointillé', line: 'border-b-2 border-dotted border-slate-800' },
                        { id: 'double', label: 'Double filet', line: 'border-b-4 border-double border-slate-800' }
                      ].map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleToggleUnderline(u.id)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between text-xs cursor-pointer"
                        >
                          <span>{u.label}</span>
                          <span className={`w-16 h-0.5 ${u.line}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => onUpdateStyle({ textDecoration: currentStyle.textDecoration === 'line-through' ? 'none' : 'line-through' })} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer" title="Barré">
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                {/* Color Pickers & Palette Gallery [GALERIE VISUELLE] */}
                <div className="flex items-center space-x-1 border-l border-slate-200 dark:border-slate-700 pl-1">
                  <div className="flex flex-col items-center">
                    <input
                      type="color"
                      value={currentStyle.color || '#1E293B'}
                      onChange={(e) => onUpdateStyle({ color: e.target.value })}
                      className="w-5 h-5 rounded border border-slate-300 cursor-pointer"
                      title="Couleur de police"
                    />
                    <span className="text-[8px] font-bold text-slate-400">Texte</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <input
                      type="color"
                      value={currentStyle.backgroundColor || '#FFFF00'}
                      onChange={(e) => onUpdateStyle({ backgroundColor: e.target.value })}
                      className="w-5 h-5 rounded border border-slate-300 cursor-pointer"
                      title="Surlignage Mots-clés ATS"
                    />
                    <span className="text-[8px] font-bold text-amber-600">Surligner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Groupe 3 — Paragraphe & Puces [GALERIE VISUELLE] */}
            <div className="px-3 flex flex-col space-y-1 relative">
              <div className="flex items-center space-x-1">
                {/* BULLETS GALLERY DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setShowBulletDropdown(!showBulletDropdown); }}
                    className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer font-bold text-slate-700 dark:text-slate-300"
                    title="Puces et bibliothèque visuelle Word"
                  >
                    <List className="w-3.5 h-3.5 text-blue-600" />
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showBulletDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 w-56 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 px-2 block border-b pb-1">
                        Bibliothèque de Puces [GALERIE VISUELLE]
                      </span>
                      {[
                        { id: 'disc', label: 'Puces rondes', icon: '•' },
                        { id: 'square', label: 'Puces carrées', icon: '■' },
                        { id: 'arrow', label: 'Flèches directionnelles', icon: '►' },
                        { id: 'check', label: 'Coches de validation', icon: '✓' },
                        { id: 'star', label: 'Étoiles d\'excellence', icon: '★' },
                        { id: 'dash', label: 'Tirés discrets', icon: '–' },
                        { id: 'diamond', label: 'Losanges modernes', icon: '◆' }
                      ].map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleSelectBulletStyle(b.id)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between text-xs font-semibold cursor-pointer border border-transparent hover:border-blue-200"
                        >
                          <span>{b.label}</span>
                          <span className="text-blue-600 font-bold text-sm bg-blue-100/60 dark:bg-slate-700 px-2 py-0.5 rounded">{b.icon}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* NUMBERED GALLERY DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setShowNumberingDropdown(!showNumberingDropdown); }}
                    className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer font-bold text-slate-700 dark:text-slate-300"
                    title="Numérotation [GALERIE VISUELLE]"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showNumberingDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 w-52 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 px-2 block border-b pb-1">
                        Formats de Numérotation [GALERIE VISUELLE]
                      </span>
                      {[
                        { id: 'num-1', label: '1. 2. 3.', sample: '1. Expérience' },
                        { id: 'num-2', label: '1) 2) 3)', sample: '1) Formation' },
                        { id: 'num-3', label: 'A. B. C.', sample: 'A. Compétence' },
                        { id: 'num-4', label: 'a) b) c)', sample: 'a) Sous-tâche' },
                        { id: 'num-5', label: 'I. II. III.', sample: 'I. Projets' }
                      ].map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            onAddList('numbered');
                            setShowNumberingDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between text-xs font-semibold cursor-pointer"
                        >
                          <span>{n.label}</span>
                          <span className="text-slate-500 text-[10px]">{n.sample}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alignments */}
                <button onClick={() => onUpdateStyle({ textAlign: 'left' })} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Aligner à gauche">
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onUpdateStyle({ textAlign: 'center' })} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Centrer">
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onUpdateStyle({ textAlign: 'right' })} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Aligner à droite">
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onUpdateStyle({ textAlign: 'justify' })} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Justifier">
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>

                {/* Line Spacing & Letter Spacing Popover */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setShowLineSpacingDropdown(!showLineSpacingDropdown); }}
                    className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer font-bold"
                    title="Interligne, espacement & inter-lettre"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showLineSpacingDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 z-[9999] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 w-64 space-y-3">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Interligne & Espacements</span>
                        <span className="text-[10px] font-mono text-slate-400">{((currentStyle.lineHeight as number) || (cv?.hauteurLigneValeur) || 1.25).toFixed(2)}x</span>
                      </div>

                      {/* Presets rapides */}
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { val: 0.85, label: '0.85x' },
                          { val: 1.0, label: '1.0x' },
                          { val: 1.15, label: '1.15x' },
                          { val: 1.25, label: '1.25x' },
                          { val: 1.5, label: '1.5x' },
                          { val: 1.75, label: '1.75x' }
                        ].map((item) => (
                          <button
                            key={item.val}
                            onClick={() => {
                              if (cv && onUpdateCV) onUpdateCV({ hauteurLigneValeur: item.val });
                              onUpdateStyle({ lineHeight: item.val });
                            }}
                            className="py-1 px-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Slider d'interligne direct */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          <span>Curseur Interligne :</span>
                          <span className="text-indigo-600 font-bold">{((currentStyle.lineHeight as number) || (cv?.hauteurLigneValeur) || 1.25).toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.6}
                          max={2.4}
                          step={0.05}
                          value={(currentStyle.lineHeight as number) || (cv?.hauteurLigneValeur) || 1.25}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (cv && onUpdateCV) onUpdateCV({ hauteurLigneValeur: val });
                            onUpdateStyle({ lineHeight: val });
                          }}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Slider d'espacement des lettres (Tracking) */}
                      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          <span>Inter-lettre (Tracking) :</span>
                          <span className="text-indigo-600 font-bold">{(currentStyle.letterSpacing as number) || 0} px</span>
                        </div>
                        <input
                          type="range"
                          min={-1}
                          max={8}
                          step={0.5}
                          value={(currentStyle.letterSpacing as number) || 0}
                          onChange={(e) => onUpdateStyle({ letterSpacing: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Slider d'espacement des sections */}
                      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          <span>Espacement Sections :</span>
                          <span className="text-indigo-600 font-bold">{cv?.espacementSectionsPx ?? 12} px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={35}
                          value={cv?.espacementSectionsPx ?? 12}
                          onChange={(e) => onUpdateCV?.({ espacementSectionsPx: parseInt(e.target.value, 10) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Borders Dropdown Tool */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setShowBordersDropdown(!showBordersDropdown); }}
                    className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer font-bold"
                    title="Bordures et contours"
                  >
                    <Square className="w-3.5 h-3.5 text-blue-600" />
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showBordersDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 z-[9999] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 w-64 space-y-3 text-xs">
                      <div className="font-extrabold uppercase text-[10px] text-blue-600 pb-1 border-b">
                        Bordures & Encadrements
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => onUpdateStyle({ borderWidth: 1, borderStyle: 'solid', borderColor: cv?.couleurAccent || '#2563EB' })}
                          className="p-1.5 rounded-lg border hover:bg-blue-50 text-[10px] font-bold text-left cursor-pointer"
                        >
                          Toutes Bordures (1px)
                        </button>
                        <button
                          onClick={() => onUpdateStyle({ borderWidth: 2, borderStyle: 'solid', borderColor: cv?.couleurAccent || '#2563EB' })}
                          className="p-1.5 rounded-lg border hover:bg-blue-50 text-[10px] font-bold text-left cursor-pointer"
                        >
                          Bordure Épaisse (2px)
                        </button>
                        <button
                          onClick={() => onUpdateStyle({ borderWidth: 1, borderStyle: 'dashed', borderColor: '#94A3B8' })}
                          className="p-1.5 rounded-lg border hover:bg-blue-50 text-[10px] font-bold text-left cursor-pointer"
                        >
                          Bordure Tirets
                        </button>
                        <button
                          onClick={() => onUpdateStyle({ borderWidth: 0, borderStyle: 'none' })}
                          className="p-1.5 rounded-lg border hover:bg-red-50 text-[10px] font-bold text-red-600 text-left cursor-pointer"
                        >
                          Sans Bordure
                        </button>
                      </div>

                      {/* Épaisseur & Couleur */}
                      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          <span>Épaisseur Bordure :</span>
                          <span className="text-blue-600 font-bold">{(currentStyle.borderWidth as number) || 0} px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={16}
                          value={(currentStyle.borderWidth as number) || 0}
                          onChange={(e) => onUpdateStyle({ borderWidth: parseInt(e.target.value, 10), borderStyle: 'solid' })}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      {/* Couleur de bordure */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Couleur Bordure :</span>
                        <input
                          type="color"
                          value={(currentStyle.borderColor as string) || '#2563EB'}
                          onChange={(e) => onUpdateStyle({ borderColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </div>

                      {/* Arrondi des angles */}
                      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          <span>Arrondi des angles :</span>
                          <span className="text-blue-600 font-bold">{(currentStyle.borderRadius as number) || 0} px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          value={(currentStyle.borderRadius as number) || 0}
                          onChange={(e) => onUpdateStyle({ borderRadius: parseInt(e.target.value, 10) })}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Groupe 4 — Galerie des Styles Rapides [GALERIE VISUELLE] */}
            <div className="px-3 flex items-center space-x-1.5 relative">
              <div className="relative">
                <button
                  onClick={() => { closeAllDropdowns(); setShowStylesDropdown(!showStylesDropdown); }}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Styles Rapides CV</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showStylesDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 w-72 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block border-b pb-1">
                      Galerie de Styles Rapides [Aperçu Visuel Réel]
                    </span>
                    {[
                      { name: 'TITRE DE SECTION', desc: 'Majuscule, Gras 16pt, Ligne sous le titre', patch: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' } },
                      { name: 'Intitulé de Poste / Sous-titre', desc: 'Semibold 13pt, Couleur Accent', patch: { fontSize: 13, fontWeight: '600' } },
                      { name: 'Corps de Texte A4', desc: 'Lisibilité Optimale 11pt', patch: { fontSize: 11, fontWeight: 'normal' } },
                      { name: 'Accroche & Synthèse Profil', desc: 'Italique 12pt, Espacé', patch: { fontSize: 12, fontStyle: 'italic' } }
                    ].map((st) => (
                      <button
                        key={st.name}
                        onClick={() => {
                          onUpdateStyle(st.patch);
                          setShowStylesDropdown(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        <span className="font-extrabold text-xs text-blue-900 dark:text-blue-300 block">{st.name}</span>
                        <span className="text-[10px] text-slate-500">{st.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Groupe 5 — Édition */}
            <div className="px-3 flex items-center space-x-1">
              <button onClick={() => { setSearchQuery(''); }} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer flex flex-col items-center" title="Rechercher / Remplacer dans le CV">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-[9px]">Rechercher</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB: INSERTION ==================== */}
        {activeTab === 'insertion' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 relative overflow-visible">
            
            {/* Photo de Profil Studio Popover */}
            <div className="pr-3 relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowPhotoDropdown(!showPhotoDropdown); }}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer hover:opacity-95"
              >
                <User className="w-4 h-4 text-amber-300" />
                <span>Photo de Profil</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showPhotoDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs space-y-3">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between pb-1 border-b">
                    <span className="text-blue-600 font-bold uppercase text-[10px]">Photo & En-tête CV</span>
                    {onOpenProfileEditor && (
                      <button
                        onClick={() => { setShowPhotoDropdown(false); onOpenProfileEditor(); }}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Éditeur complet ↗
                      </button>
                    )}
                  </div>

                  {/* Photo Preview & Buttons */}
                  <div className="flex items-center space-x-3">
                    {cv?.photoUrl ? (
                      <img
                        src={cv.photoUrl}
                        alt="Photo"
                        className={`w-12 h-12 object-cover border-2 shadow-xs shrink-0 ${
                          cv.photoForme === 'ronde'
                            ? 'rounded-full'
                            : cv.photoForme === 'arrondie'
                            ? 'rounded-xl'
                            : cv.photoForme === 'galet'
                            ? 'rounded-[35%_65%_70%_30%/30%_30%_70%_70%]'
                            : cv.photoForme === 'arche'
                            ? 'rounded-t-full rounded-b-lg'
                            : cv.photoForme === 'hexagone'
                            ? 'rounded-2xl'
                            : 'rounded-none'
                        }`}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1 flex-1">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{cv?.photoUrl ? 'Changer' : 'Importer'}</span>
                        </button>
                        {cv?.photoUrl && onUpdateCV && (
                          <button
                            type="button"
                            onClick={() => onUpdateCV({ photoUrl: '', afficherPhoto: false })}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                      <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cv?.afficherPhoto !== false && Boolean(cv?.photoUrl)}
                          onChange={(e) => onUpdateCV?.({ afficherPhoto: e.target.checked })}
                          className="w-3 h-3 rounded accent-blue-600"
                        />
                        <span>Afficher sur le CV</span>
                      </label>
                    </div>
                  </div>

                  {/* Formes de photo */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">Forme de découpe :</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'ronde', label: 'Ronde' },
                        { id: 'arrondie', label: 'Arrondie' },
                        { id: 'carree', label: 'Carrée' },
                        { id: 'arche', label: 'Arche' },
                        { id: 'hexagone', label: 'Hexagone' },
                        { id: 'galet', label: 'Galet' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => onUpdateCV?.({ photoForme: f.id as any })}
                          className={`py-1 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                            (cv?.photoForme || 'ronde') === f.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Taille photo slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Taille de la Photo :</span>
                      <span className="text-blue-600 font-bold">{cv?.photoTaille || 90} px</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={220}
                      value={cv?.photoTaille || 90}
                      onChange={(e) => onUpdateCV?.({ photoTaille: parseInt(e.target.value, 10) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Emplacement & Cadre */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Emplacement:</span>
                      <select
                        value={cv?.photoPosition || 'in-header'}
                        onChange={(e) => onUpdateCV?.({ photoPosition: e.target.value as any })}
                        className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold"
                      >
                        <option value="in-header">En-tête</option>
                        <option value="in-sidebar">Sidebar</option>
                        <option value="free">Libre (X/Y)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Cadre Photo:</span>
                      <select
                        value={cv?.cadrePhotoRing || 'none'}
                        onChange={(e) => onUpdateCV?.({ cadrePhotoRing: e.target.value as any })}
                        className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold"
                      >
                        <option value="none">Standard</option>
                        <option value="double-ring">Double Anneau</option>
                        <option value="gold-ring">Anneau Doré</option>
                        <option value="accent-ring">Anneau Accent</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pages: Saut de page */}
            <div className="px-3 flex items-center space-x-2">
              <button
                onClick={() => onAddElement('text', { text: '--- SAUT DE PAGE CV ---' })}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                title="Insérer un saut de page"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Saut de Page</span>
              </button>
            </div>

            {/* Tableaux [GALERIE VISUELLE] */}
            <div className="px-3 relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowTableDropdown(!showTableDropdown); }}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <TableIcon className="w-4 h-4 text-indigo-600" />
                <span>Tableau [Aperçu Grid]</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showTableDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 mb-2 flex justify-between items-center">
                    <span>Sélection Visuelle Grille</span>
                    <span className="text-[10px] text-blue-600 font-bold">{tableRows} L x {tableCols} C</span>
                  </div>

                  <div className="mb-3">
                    <div className="grid grid-cols-5 gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      {Array.from({ length: 5 }).map((_, rIdx) =>
                        Array.from({ length: 5 }).map((_, cIdx) => {
                          const r = rIdx + 1;
                          const c = cIdx + 1;
                          const active = r <= tableRows && c <= tableCols;
                          return (
                            <div
                              key={`${r}-${c}`}
                              onMouseEnter={() => { setTableRows(r); setTableCols(c); }}
                              onClick={() => {
                                const cellMatrix = Array(r).fill(0).map(() => Array(c).fill('Cellule'));
                                onAddElement('table', { rows: r, cols: c, cells: cellMatrix }, { width: 450, height: 140 });
                                setShowTableDropdown(false);
                              }}
                              className={`w-5 h-5 rounded border transition-all cursor-pointer ${
                                active ? 'bg-indigo-600 border-indigo-700' : 'bg-white dark:bg-slate-700 border-slate-300'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formes [GALERIE VISUELLE — Vignettes Graphiques Dessinées] */}
            <div className="px-3 relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowShapeDropdown(!showShapeDropdown); }}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Square className="w-4 h-4 text-amber-600" />
                <span>Formes [Vignettes Graphiques]</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showShapeDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 pb-1 border-b mb-2">
                    Galerie Visuelle de Formes Word
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'rectangle', name: 'Rectangle', icon: Square, color: 'bg-amber-100 text-amber-800' },
                      { id: 'rounded', name: 'Arrondi', icon: Square, color: 'bg-blue-100 text-blue-800' },
                      { id: 'circle', name: 'Disque', icon: Circle, color: 'bg-sky-100 text-sky-800' },
                      { id: 'badge', name: 'Badge Pilule', icon: Shield, color: 'bg-emerald-100 text-emerald-800' },
                      { id: 'star', name: 'Étoile', icon: Star, color: 'bg-amber-200 text-amber-900' },
                      { id: 'pillar', name: 'Pilier Bar', icon: Layout, color: 'bg-purple-100 text-purple-800' },
                      { id: 'line', name: 'Séparateur', icon: Minus, color: 'bg-slate-200 text-slate-900' },
                      { id: 'banner', name: 'Bannière', icon: FileText, color: 'bg-indigo-100 text-indigo-800' }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onAddShape(item.id as ShapeType);
                            setShowShapeDropdown(false);
                          }}
                          className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer ${item.color}`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-[11px] truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Icônes Vectorielles [GALERIE VISUELLE] */}
            <div className="px-3 relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowIconsDropdown(!showIconsDropdown); }}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Smile className="w-4 h-4 text-sky-600" />
                <span>Icônes Vectorielles</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showIconsDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 mb-2 border-b pb-1">
                    Bibliothèque d'Icônes [Aperçu Graphique]
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { name: 'Phone', icon: Phone, label: 'Téléphone' },
                      { name: 'Mail', icon: Mail, label: 'Email' },
                      { name: 'MapPin', icon: MapPin, label: 'Ville' },
                      { name: 'Globe', icon: Globe, label: 'Site/Web' },
                      { name: 'Star', icon: Star, label: 'Étoile' },
                      { name: 'Check', icon: Check, label: 'Coche' },
                      { name: 'Award', icon: Award, label: 'Médaille' },
                      { name: 'Heart', icon: Heart, label: 'Cœur' }
                    ].map((sym) => {
                      const Icon = sym.icon;
                      return (
                        <button
                          key={sym.name}
                          onClick={() => {
                            onAddElement('icon', { iconName: sym.name, text: '' }, { width: 32, height: 32 });
                            setShowIconsDropdown(false);
                          }}
                          className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title={sym.label}
                        >
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-[9px] mt-0.5 text-slate-600 dark:text-slate-300 font-bold">{sym.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SmartArt & Extras CV: Jauges, QR Code, Drapeau */}
            <div className="px-3 flex items-center space-x-1.5">
              <button onClick={() => onAddList('skill-progress')} className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer">
                <Sliders className="w-3.5 h-3.5" />
                <span>Jauge Compétence</span>
              </button>

              <button onClick={() => onAddElement('text', { text: 'QR Code: linkedin.com/in/mon-profil' })} className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer">
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Portfolio</span>
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Image / Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB: STRUCTURE ==================== */}
        {activeTab === 'structure' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 w-full overflow-x-auto py-1">
            {/* Section Selection Dropdown */}
            <div className="pr-3 flex items-center space-x-2 shrink-0">
              <div className="flex items-center space-x-1.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 px-2.5 py-1 rounded-xl text-xs font-black">
                <FolderTree className="w-4 h-4 text-purple-600" />
                <span>Section :</span>
              </div>
              <select
                value={selectedRibbonSectionId || (cv?.sections[0]?.id || '')}
                onChange={(e) => setSelectedRibbonSectionId(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-black text-slate-800 dark:text-slate-100 outline-none focus:border-purple-600"
              >
                {(cv?.sections || []).map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.titre} ({sec.colonne === 'gauche' ? 'G' : 'P'})
                  </option>
                ))}
              </select>
            </div>

            {/* Granular Section Style Controls */}
            {(() => {
              const activeSecId = selectedRibbonSectionId || cv?.sections[0]?.id;
              const activeSec = (cv?.sections || []).find((s) => s.id === activeSecId);
              if (!activeSec) return null;

              const secStyle = activeSec.styleSection || {};
              const updateActiveSecStyle = (patch: Partial<any>) => {
                if (!cv || !onUpdateCV) return;
                const newSections = cv.sections.map((s) =>
                  s.id === activeSec.id
                    ? { ...s, styleSection: { ...(s.styleSection || {}), ...patch } }
                    : s
                );
                onUpdateCV({ sections: newSections });
              };

              return (
                <div className="px-3 flex items-center space-x-3 text-xs shrink-0">
                  {/* Text Color */}
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300" title="Couleur du texte de cette section">
                    <span>Couleur Texte :</span>
                    <input
                      type="color"
                      value={secStyle.couleurTexte || '#1E293B'}
                      onChange={(e) => updateActiveSecStyle({ couleurTexte: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>

                  {/* Title Color */}
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300" title="Couleur du titre de cette section">
                    <span>Couleur Titre :</span>
                    <input
                      type="color"
                      value={secStyle.couleurTitre || '#2563EB'}
                      onChange={(e) => updateActiveSecStyle({ couleurTitre: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>

                  {/* Background Color */}
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300" title="Fond / Background de cette section">
                    <span>Background :</span>
                    <input
                      type="color"
                      value={secStyle.couleurFond || '#FFFFFF'}
                      onChange={(e) => updateActiveSecStyle({ couleurFond: e.target.value, backgroundType: 'solid' })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>

                  {secStyle.couleurFond && (
                    <button
                      onClick={() => updateActiveSecStyle({ couleurFond: undefined, backgroundType: 'transparent' })}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                      title="Effacer le background"
                    >
                      Effacer fond
                    </button>
                  )}

                  {/* Text Size */}
                  <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                    <span>Taille :</span>
                    <select
                      value={secStyle.tailleTextePt || 10}
                      onChange={(e) => updateActiveSecStyle({ tailleTextePt: Number(e.target.value) })}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs font-bold outline-none"
                    >
                      <option value={8}>8 pt</option>
                      <option value={9}>9 pt</option>
                      <option value={10}>10 pt</option>
                      <option value={11}>11 pt</option>
                      <option value={12}>12 pt</option>
                      <option value={14}>14 pt</option>
                    </select>
                  </div>

                  {/* Column Switcher */}
                  <button
                    onClick={() => {
                      if (!cv || !onUpdateCV) return;
                      const newSections = cv.sections.map((s) =>
                        s.id === activeSec.id
                          ? { ...s, colonne: (s.colonne === 'gauche' ? 'principale' : 'gauche') as any }
                          : s
                      );
                      onUpdateCV({ sections: newSections });
                    }}
                    className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-bold cursor-pointer hover:bg-purple-100"
                  >
                    Colonne : {activeSec.colonne === 'gauche' ? 'Gauche' : 'Principale'}
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => {
                      if (!cv || !onUpdateCV) return;
                      const newSections = cv.sections.map((s) =>
                        s.id === activeSec.id ? { ...s, visible: !s.visible } : s
                      );
                      onUpdateCV({ sections: newSections });
                    }}
                    className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer border ${
                      activeSec.visible !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    {activeSec.visible !== false ? 'Visible' : 'Masquée'}
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ==================== TAB: CRÉATION & THÈMES (DESIGN & MODÈLES) ==================== */}
        {activeTab === 'creation' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 relative overflow-visible">
            
            {/* Templates Visual Gallery Dropdown */}
            <div className="pr-3 relative flex items-center space-x-2">
              <button
                onClick={() => { closeAllDropdowns(); setShowTemplatesGallery(!showTemplatesGallery); }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer hover:opacity-95"
              >
                <Layout className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Changer de Modèle CV (Famille Ribbon & 30+ Modèles)</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* Direct Horizontal Strip of Ribbon & Popular Models for 1-Click Switch */}
              <div className="hidden xl:flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mr-1">Ribbons :</span>
                {['ribbon-classic', 'ribbon-green', 'ribbon-blue', 'ribbon-emerald', 'ribbon-burgundy', 'ribbon-orange', 'ribbon-purple'].map((presetKey) => {
                  const p = TEMPLATE_PRESETS[presetKey];
                  if (!p) return null;
                  const isActive = cv?.templateId === presetKey;
                  return (
                    <button
                      key={presetKey}
                      onClick={() => {
                        if (cv && onUpdateCV) {
                          const updatedCV = switchTemplateSafely(cv, presetKey);
                          onUpdateCV(updatedCV);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={`Appliquer ${p.titre} (Garde vos données)`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.couleurAccent }} />
                      <span>{p.titre}</span>
                    </button>
                  );
                })}
              </div>

              {showTemplatesGallery && (
                <div className="absolute left-0 top-full mt-1.5 w-[460px] p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs max-h-96 overflow-y-auto">
                  <div className="font-black text-slate-900 dark:text-slate-100 pb-1.5 border-b mb-2 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Galerie des Modèles de CV (Famille Ribbon & Pro)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Données 100% Conservées</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TEMPLATE_PRESETS).map(([presetKey, p]) => {
                      const isActive = cv?.templateId === presetKey;
                      return (
                        <button
                          key={presetKey}
                          onClick={() => {
                            if (cv && onUpdateCV) {
                              const updatedCV = switchTemplateSafely(cv, presetKey);
                              onUpdateCV(updatedCV);
                            }
                            setShowTemplatesGallery(false);
                          }}
                          className={`p-2 rounded-xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                            isActive
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-500/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50/30 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div className="h-3.5 w-full rounded-t mb-1.5 flex overflow-hidden" style={{ backgroundColor: p.couleurAccent }}>
                              {p.couleurFondSidebar && <div className="w-1/3 h-full" style={{ backgroundColor: p.couleurFondSidebar }} />}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[11px] block truncate text-slate-900 dark:text-slate-100">{p.titre}</span>
                              {isActive && <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3] shrink-0" />}
                            </div>
                            <span className="text-[9px] text-slate-500 block">{p.police} • {p.nombreColonnes || 2} Col</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Color Palettes Gallery [GALERIE VISUELLE] */}
            <div className="px-3 flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500">Palettes Duo :</span>
              {COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.name}
                  onClick={() => {
                    onUpdateCV?.({
                      couleurAccent: pal.main,
                      couleurAccentSecondaire: pal.sub,
                      couleurFondSidebar: pal.bg,
                      couleurTitreSection: pal.main
                    });
                    onApplyThemeColor?.(pal.main);
                  }}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-xs hover:scale-110 transition-transform cursor-pointer relative flex overflow-hidden"
                  title={`${pal.name} (Primaire: ${pal.main}, Secondaire: ${pal.sub})`}
                >
                  <div className="w-1/2 h-full" style={{ backgroundColor: pal.main }} />
                  <div className="w-1/2 h-full" style={{ backgroundColor: pal.sub }} />
                </button>
              ))}
            </div>

            {/* Couleurs Bicolores : Primaire, Inverser, Secondaire */}
            <div className="px-3 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Primaire:</span>
                <input
                  type="color"
                  value={cv?.couleurAccent || '#1E3A8A'}
                  onChange={(e) => {
                    onUpdateCV?.({ couleurAccent: e.target.value, couleurTitreSection: e.target.value });
                    onApplyThemeColor?.(e.target.value);
                  }}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0"
                  title="Couleur Primaire"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (cv && onUpdateCV) {
                    const currentPrim = cv.couleurAccent;
                    const currentSec = cv.couleurAccentSecondaire || '#3B82F6';
                    onUpdateCV({
                      couleurAccent: currentSec,
                      couleurAccentSecondaire: currentPrim,
                      couleurTitreSection: currentSec
                    });
                    onApplyThemeColor?.(currentSec);
                  }
                }}
                className="px-2 py-1 text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                title="Inverser les deux couleurs du CV (Primaire ⇄ Secondaire)"
              >
                <span>⇄</span>
                <span>Inverser</span>
              </button>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Secondaire:</span>
                <input
                  type="color"
                  value={cv?.couleurAccentSecondaire || '#3B82F6'}
                  onChange={(e) => onUpdateCV?.({ couleurAccentSecondaire: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0"
                  title="Couleur Secondaire"
                />
              </div>
            </div>

            {/* Personnalisation de l'En-Tête CV */}
            <div className="px-3 flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-slate-500">En-tête:</span>
              <select
                value={cv?.styleEnTete || 'banner'}
                onChange={(e) => onUpdateCV?.({ styleEnTete: e.target.value as any })}
                className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <optgroup label="🎨 2 Couleurs (Bicolores)">
                  <option value="two-tone-split">2 Couleurs (Split net)</option>
                  <option value="two-tone-stripe">2 Couleurs (Bandeau d'accent)</option>
                  <option value="baxter-diagonal">2 Couleurs (Découpe Diagonale)</option>
                  <option value="modern-split">2 Couleurs (Modern Split)</option>
                </optgroup>
                <optgroup label="🌊 Vagues (Wave)">
                  <option value="wave-bottom">Vague Inférieure Fluide</option>
                  <option value="wave-top">Vague Supérieure Incurvée</option>
                  <option value="wave-double">Double Vague Bicolore</option>
                  <option value="ocean-wave">Vague Aquatique / Océan</option>
                  <option value="curved-wave-badge">Onde Organique Portrait</option>
                  <option value="sylvie-wave">Vague Douce Sylvie</option>
                </optgroup>
                <optgroup label="✨ Normal & Simple">
                  <option value="clean">Normal & Épuré Editorial</option>
                  <option value="simple-minimal">Normal & Simple Aéré</option>
                  <option value="centered-clean">Normal & Centré Équilibré</option>
                  <option value="minimal">Minimaliste ATS</option>
                  <option value="executive-stripe">Exécutif avec Liseré</option>
                </optgroup>
                <optgroup label="🏛️ Autres">
                  <option value="banner">Bannière classique</option>
                  <option value="card">Carte Flottante</option>
                  <option value="arch">Arche Studio</option>
                  <option value="sidebar-top">Intégrée en Colonne</option>
                </optgroup>
              </select>

              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-bold text-slate-400">Fond:</span>
                <input
                  type="color"
                  value={cv?.couleurFondProfil || cv?.couleurAccent || '#1E3A8A'}
                  onChange={(e) => onUpdateCV?.({ couleurFondProfil: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0"
                  title="Couleur de fond de l'en-tête"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-bold text-slate-400">Texte:</span>
                <input
                  type="color"
                  value={cv?.couleurTexteProfil || '#FFFFFF'}
                  onChange={(e) => onUpdateCV?.({ couleurTexteProfil: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0"
                  title="Couleur du texte de l'en-tête"
                />
              </div>
            </div>

            {/* Page Background */}
            <div className="px-3 relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowBgPopover(!showBgPopover); }}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Couleur & Fond de Page</span>
              </button>

              {showBgPopover && cv && (
                <div className="absolute left-0 top-full mt-1.5 w-80 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">Fond de Page & Dégradés</span>
                    <button onClick={() => setShowBgPopover(false)} className="text-slate-400 font-bold cursor-pointer">✕</button>
                  </div>

                  <BackgroundControlPanel
                    label="Fond Global du CV"
                    backgroundType={cv.backgroundType}
                    colorSolid={cv.couleurFond}
                    opacity={cv.backgroundOpacity}
                    colorStart={cv.backgroundColorStart}
                    colorEnd={cv.backgroundColorEnd}
                    patternName={cv.backgroundPattern}
                    imageUrl={cv.backgroundImage}
                    onChange={(updates) => {
                      const newCvUpdates: Partial<CV> = {};
                      if (updates.backgroundType !== undefined) newCvUpdates.backgroundType = updates.backgroundType;
                      if (updates.colorSolid !== undefined) {
                        newCvUpdates.couleurFond = updates.colorSolid;
                        onApplyPageBackground?.(updates.colorSolid);
                      }
                      if (updates.opacity !== undefined) newCvUpdates.backgroundOpacity = updates.opacity;
                      if (updates.colorStart !== undefined) newCvUpdates.backgroundColorStart = updates.colorStart;
                      if (updates.colorEnd !== undefined) newCvUpdates.backgroundColorEnd = updates.colorEnd;
                      if (updates.patternName !== undefined) newCvUpdates.backgroundPattern = updates.patternName;
                      if (updates.imageUrl !== undefined) newCvUpdates.backgroundImage = updates.imageUrl;
                      onUpdateCV?.(newCvUpdates);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: DISPOSITION (LAYOUT) ==================== */}
        {activeTab === 'disposition' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 relative overflow-visible">
            
            {/* Marges [GALERIE VISUELLE] */}
            <div className="pr-3 relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowMarginsDropdown(!showMarginsDropdown); }}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-blue-600" />
                <span>Marges : {cv?.margeGlobalePage || 24}px</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showMarginsDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-56 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] text-xs space-y-1">
                  {[
                    { label: 'Étroite (12px)', margin: 12, desc: 'Maximum de contenu' },
                    { label: 'Normale (24px)', margin: 24, desc: 'Équilibre standard Word' },
                    { label: 'Aérée (32px)', margin: 32, desc: 'Style épuré luxe' }
                  ].map((m) => (
                    <button
                      key={m.label}
                      onClick={() => {
                        if (cv && onUpdateCV) onUpdateCV({ margeGlobalePage: m.margin });
                        setShowMarginsDropdown(false);
                      }}
                      className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      <span className="font-bold block">{m.label}</span>
                      <span className="text-[10px] text-slate-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colonnes [GALERIE VISUELLE] */}
            <div className="px-3 flex items-center space-x-2">
              <button
                onClick={handleSetOneColumn}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  cv?.nombreColonnes === 1
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                1 Colonne (Full)
              </button>
              <button
                onClick={() => handleSetTwoColumns(cv?.largeurColonneGauche || 30)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                  cv?.nombreColonnes === 2
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>2 Colonnes ({cv?.largeurColonneGauche || 30}/{100 - (cv?.largeurColonneGauche || 30)})</span>
              </button>
            </div>

            {/* Slider de largeur si 2 colonnes */}
            {cv?.nombreColonnes === 2 && (
              <div className="px-3 flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Gauches ({cv?.largeurColonneGauche || 30}%) :
                </span>
                <input
                  type="range"
                  min={20}
                  max={50}
                  value={cv?.largeurColonneGauche || 30}
                  onChange={(e) => onUpdateCV?.({ largeurColonneGauche: parseInt(e.target.value, 10) })}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
              </div>
            )}

            {/* Interligne Global du CV */}
            <div className="px-3 flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                Interligne ({(cv?.hauteurLigneValeur ?? 1.5).toFixed(2)}x) :
              </span>
              <input
                type="range"
                min={0.6}
                max={2.2}
                step={0.05}
                value={cv?.hauteurLigneValeur ?? 1.5}
                onChange={(e) => onUpdateCV?.({ hauteurLigneValeur: parseFloat(e.target.value) })}
                className="w-24 accent-indigo-600 cursor-pointer"
                title="Interligne global du CV"
              />
            </div>

            {/* Espacement Sections */}
            <div className="px-3 flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                Espacement ({cv?.espacementSectionsPx ?? 12}px) :
              </span>
              <input
                type="range"
                min={0}
                max={35}
                value={cv?.espacementSectionsPx ?? 12}
                onChange={(e) => onUpdateCV?.({ espacementSectionsPx: parseInt(e.target.value, 10) })}
                className="w-24 accent-blue-600 cursor-pointer"
                title="Espacement entre les sections"
              />
            </div>

            {/* Taille Titres & Corps */}
            <div className="px-3 flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Titres:</span>
                <select
                  value={cv?.tailleTitreSectionValeur ?? 11}
                  onChange={(e) => onUpdateCV?.({ tailleTitreSectionValeur: parseFloat(e.target.value) })}
                  className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                >
                  {[9, 10, 11, 12, 13, 14, 16, 18, 20].map((s) => (
                    <option key={s} value={s}>{s} pt</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Corps:</span>
                <select
                  value={cv?.taillePoliceValeur ?? 9}
                  onChange={(e) => onUpdateCV?.({ taillePoliceValeur: parseFloat(e.target.value) })}
                  className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                >
                  {[7, 8, 9, 9.5, 10, 10.5, 11, 12, 13].map((s) => (
                    <option key={s} value={s}>{s} pt</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Style d'En-tête de Section */}
            <div className="px-3 flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-slate-500">En-têtes sections:</span>
              <select
                value={cv?.styleEnTeteSection || 'underline'}
                onChange={(e) => onUpdateCV?.({ styleEnTeteSection: e.target.value as any })}
                className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <option value="underline">Souligné</option>
                <option value="banner">Bannière</option>
                <option value="left-border">Bordure G.</option>
                <option value="boxed">Encadré</option>
                <option value="minimal">Minimal</option>
                <option value="double-line">Double Ligne</option>
                <option value="arch-block">Bloc Arche</option>
              </select>
            </div>

            {/* Style d'Affichage des Compétences */}
            <div className="px-3 flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-slate-500">Compétences:</span>
              <select
                value={cv?.styleCompetences || 'progress'}
                onChange={(e) => onUpdateCV?.({ styleCompetences: e.target.value as any })}
                className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <option value="progress">Barres horizontales</option>
                <option value="circular-progress">Jauges circulaires (%)</option>
                <option value="badges">Badges pilules</option>
                <option value="pill-bars">Barres bicolores</option>
                <option value="dots">5 Pastilles (dots)</option>
                <option value="stars">Étoiles</option>
                <option value="list">Liste simple</option>
                <option value="minimal-cards">Cartes minimales</option>
                <option value="grid-3">Grille 3 colonnes</option>
              </select>
            </div>

            {/* Puces de Listes */}
            <div className="px-3 flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-slate-500">Puces:</span>
              <select
                value={cv?.stylePucesListes || cv?.bulletStyle || 'disc'}
                onChange={(e) => onUpdateCV?.({ stylePucesListes: e.target.value as any, bulletStyle: e.target.value as any })}
                className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <option value="disc">• Rondes standard</option>
                <option value="check">✓ Coches validées</option>
                <option value="star">✦ Étoiles</option>
                <option value="arrow">➔ Flèches</option>
                <option value="square">■ Carrés</option>
                <option value="dash">— Tirets</option>
                <option value="numbered">1. Numérotation</option>
              </select>
            </div>
          </div>
        )}

        {/* ==================== TAB: RÉFÉRENCES (BLOCS DE SECTIONS CV) ==================== */}
        {activeTab === 'references' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 relative overflow-visible">
            <div className="pr-3 flex items-center space-x-1.5">
              <button
                onClick={onOpenPresetElementsModal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bibliothèque de Blocs Prêts [GALERIE VISUELLE]</span>
              </button>
            </div>

            <div className="px-3 flex items-center space-x-1.5 flex-wrap gap-1">
              {[
                { name: 'Expériences', type: 'experience', icon: Briefcase },
                { name: 'Formations', type: 'formation', icon: GraduationCap },
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
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-lg flex items-center space-x-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ {sec.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB: COORDONNÉES & BADGES ==================== */}
        {activeTab === 'publipostage' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 relative overflow-visible">
            <div className="pr-3 flex items-center space-x-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                Style des Badges Coordonnées :
              </span>
              <select
                value={cv?.styleBadgesCoordonnees || 'none'}
                onChange={(e) => onUpdateCV?.({ styleBadgesCoordonnees: e.target.value as any })}
                className="h-8 text-xs font-extrabold border border-slate-300 dark:border-slate-700 rounded-xl px-2 bg-white dark:bg-slate-800 text-blue-600"
              >
                <option value="none">Texte Épuré Standard</option>
                <option value="pill">Badges Pilule (Total Arrondi)</option>
                <option value="rounded">Badges Rectangle Arrondi</option>
                <option value="outline">Badges Contour Seul</option>
                <option value="glass">Badges Effet Verre Glassmorphism</option>
                <option value="soft-tint">Badges Teinte Douce</option>
                <option value="solid-accent">Badges Couleur d'Accent Pleine</option>
              </select>
            </div>

            <div className="px-3 flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Fond :</span>
                <input
                  type="color"
                  value={cv?.couleurFondBadgeCoordonnees || cv?.couleurAccent || '#1E3A8A'}
                  onChange={(e) => onUpdateCV?.({ couleurFondBadgeCoordonnees: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Contour :</span>
                <input
                  type="color"
                  value={cv?.couleurBordureBadgeCoordonnees || cv?.couleurAccent || '#1E3A8A'}
                  onChange={(e) => onUpdateCV?.({ couleurBordureBadgeCoordonnees: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Rayon :</span>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={cv?.rayonBordureBadgeCoordonnees ?? 8}
                  onChange={(e) => onUpdateCV?.({ rayonBordureBadgeCoordonnees: parseInt(e.target.value, 10) })}
                  className="w-16 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: RÉVISION ==================== */}
        {activeTab === 'revision' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            <div className="pr-3 flex items-center space-x-2">
              <button
                onClick={onOpenAIAssistant}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Assistant Gemini IA</span>
              </button>
              <button
                onClick={onOpenATSAnalyzer}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer text-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Diagnostic Score ATS</span>
              </button>
            </div>

            <div className="px-3 flex items-center space-x-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>{docStats.words} Mots</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{docStats.chars} Caractères</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <Layout className="w-3.5 h-3.5 text-indigo-600" />
                <span>~{docStats.pages} Page(s) A4</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: AFFICHAGE ==================== */}
        {activeTab === 'affichage' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            <div className="pr-3 flex items-center space-x-1.5">
              <button onClick={() => onZoomChange(Math.max(0.3, zoomLevel - 0.1))} className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer" title="Zoom Arrière">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => onZoomChange(Math.min(1.8, zoomLevel + 0.1))} className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer" title="Zoom Avant">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => onZoomChange(0.85)} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold rounded-md cursor-pointer">
                100% A4
              </button>
            </div>

            <div className="px-3 flex items-center space-x-2">
              <button
                onClick={onToggleRuler}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                  rulerVisible ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Règle Graduée</span>
              </button>

              <button
                onClick={onToggleGridSnap}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                  gridSnap ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Magnétisme Grille</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB: EXPORT ==================== */}
        {activeTab === 'export' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
            <div className="pr-3 flex items-center space-x-2">
              <button
                onClick={onExportPDF}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl flex items-center space-x-2 shadow-md cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger en PDF Vectoriel HD</span>
              </button>

              <button
                onClick={() => (onPrint ? onPrint() : printCV('cv-preview-container'))}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl flex items-center space-x-1.5 text-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Imprimer Directement</span>
              </button>
            </div>

            <div className="px-3 flex items-center space-x-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Conforme Impression A4 (210×297mm) • Haute Résolution 300 DPI</span>
            </div>
          </div>
        )}

        {/* ==================== TAB: FORMAT ==================== */}
        {activeTab === 'format' && (
          <div className="flex items-center space-x-3 divide-x divide-slate-200 dark:divide-slate-800 shrink-0 overflow-x-auto py-0.5">
            {/* Shapes rapides */}
            <div className="pr-3 flex items-center space-x-1.5 shrink-0">
              <button onClick={() => onAddShape('rectangle')} className="px-2 py-1 border rounded-lg font-bold flex items-center space-x-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Square className="w-3.5 h-3.5 text-blue-600" />
                <span>Rectangle</span>
              </button>
              <button onClick={() => onAddShape('circle')} className="px-2 py-1 border rounded-lg font-bold flex items-center space-x-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Circle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cercle</span>
              </button>
              <button onClick={() => onAddShape('badge')} className="px-2 py-1 border rounded-lg font-bold flex items-center space-x-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Badge</span>
              </button>
            </div>

            {/* Couleurs de fond & texte */}
            <div className="px-3 flex items-center space-x-2 shrink-0">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Fond:</span>
                <input
                  type="color"
                  value={currentStyle.backgroundColor || '#2563EB'}
                  onChange={(e) => onUpdateStyle({ backgroundColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Texte:</span>
                <input
                  type="color"
                  value={currentStyle.color || '#1E293B'}
                  onChange={(e) => onUpdateStyle({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>

            {/* Bordures complètes de l'élément */}
            <div className="px-3 flex items-center space-x-2 shrink-0">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Bordure:</span>
                <input
                  type="color"
                  value={currentStyle.borderColor || '#1D4ED8'}
                  onChange={(e) => onUpdateStyle({ borderColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>

              <select
                value={currentStyle.borderStyle || 'solid'}
                onChange={(e) => onUpdateStyle({ borderStyle: e.target.value as any })}
                className="p-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
              >
                <option value="solid">Plein</option>
                <option value="dashed">Tirets</option>
                <option value="dotted">Points</option>
                <option value="double">Double</option>
                <option value="none">Aucun</option>
              </select>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Épaisseur:</span>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={currentStyle.borderWidth || 0}
                  onChange={(e) => onUpdateStyle({ borderWidth: parseInt(e.target.value, 10), borderStyle: 'solid' })}
                  className="w-16 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Arrondi:</span>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={currentStyle.borderRadius || 0}
                  onChange={(e) => onUpdateStyle({ borderRadius: parseInt(e.target.value, 10) })}
                  className="w-16 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Interligne & Tracking de l'élément */}
            <div className="px-3 flex items-center space-x-2 shrink-0">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Interligne:</span>
                <input
                  type="range"
                  min={0.6}
                  max={2.4}
                  step={0.05}
                  value={currentStyle.lineHeight || 1.4}
                  onChange={(e) => onUpdateStyle({ lineHeight: parseFloat(e.target.value) })}
                  className="w-16 accent-indigo-600 cursor-pointer"
                  title="Interligne de l'élément"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-500">Inter-lettre:</span>
                <input
                  type="range"
                  min={-1}
                  max={8}
                  step={0.5}
                  value={currentStyle.letterSpacing || 0}
                  onChange={(e) => onUpdateStyle({ letterSpacing: parseFloat(e.target.value) })}
                  className="w-16 accent-indigo-600 cursor-pointer"
                  title="Espacement des lettres"
                />
              </div>
            </div>

            {/* Calques & Suppression */}
            <div className="px-3 flex items-center space-x-3 shrink-0">
              <div className="flex items-center space-x-1">
                <button onClick={onBringToFront} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded font-bold text-[10px] flex items-center space-x-1 cursor-pointer">
                  <ArrowUp className="w-3 h-3 text-blue-600" />
                  <span>Avancer</span>
                </button>
                <button onClick={onSendToBack} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded font-bold text-[10px] flex items-center space-x-1 cursor-pointer">
                  <ArrowDown className="w-3 h-3 text-slate-600" />
                  <span>Reculer</span>
                </button>
              </div>

              {selectedElement && (
                <button onClick={onDeleteSelected} className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. RULER */}
      {rulerVisible && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 h-5 relative overflow-hidden select-none flex items-center justify-center text-[9px] font-mono text-slate-600 dark:text-slate-400 z-30">
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
