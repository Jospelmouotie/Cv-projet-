import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { CV, Section, Language, User, ExperienceItem, FormationItem, CompetenceItem, LangueItem, PersonnaliseeContenu } from '../types';
import { CV_TEMPLATES, ACCENT_COLORS, FONT_OPTIONS, FONT_SIZES } from '../data/templates';
import { getTranslation } from '../i18n/translations';
import { SortableSectionItem } from '../components/SortableSectionItem';
import { SpellCheckField } from '../components/SpellCheckField';
import { PhotoCropper } from '../components/PhotoCropper';
import { CVPreview } from '../components/CVPreview';
import { exportCVToPDF, exportCVToImage } from '../utils/pdfExport';

import {
  ArrowLeft,
  Save,
  Download,
  CreditCard,
  Plus,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Check,
  Eye,
  Trash2,
  AlertCircle,
  Sliders
} from 'lucide-react';

interface EditorViewProps {
  cv: CV;
  user: User | null;
  langue: Language;
  onBack: () => void;
  onSaveCV: (cv: CV) => Promise<void>;
  onOpenPayment: (cv: CV) => void;
  onOpenAuth: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  cv: initialCV,
  user,
  langue,
  onBack,
  onSaveCV,
  onOpenPayment,
  onOpenAuth
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [cv, setCv] = useState<CV>(initialCV);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'preview'>('content');
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});

  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync state if prop updates
  useEffect(() => {
    setCv(initialCV);
  }, [initialCV.id]);

  // Auto-save debounce effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      await onSaveCV(cv);
      setAutoSaveStatus('saved');
    }, 1500);

    return () => clearTimeout(timer);
  }, [cv]);

  // Handle DnD Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCv(prev => {
        const oldIndex = prev.sections.findIndex(s => s.id === active.id);
        const newIndex = prev.sections.findIndex(s => s.id === over.id);
        const reordered = arrayMove(prev.sections, oldIndex, newIndex).map((sec: Section, idx: number) => ({
          ...sec,
          ordre: idx + 1
        }));
        return { ...prev, sections: reordered };
      });
    }
  };

  // Reorder sections directly from Preview controls
  const handleMoveSectionUp = (secId: string) => {
    setCv(prev => {
      const idx = prev.sections.findIndex(s => s.id === secId);
      if (idx <= 0) return prev;
      const reordered = arrayMove(prev.sections, idx, idx - 1).map((s: Section, i: number) => Object.assign({}, s, { ordre: i + 1 }));
      return { ...prev, sections: reordered };
    });
  };

  const handleMoveSectionDown = (secId: string) => {
    setCv(prev => {
      const idx = prev.sections.findIndex(s => s.id === secId);
      if (idx === -1 || idx >= prev.sections.length - 1) return prev;
      const reordered = arrayMove(prev.sections, idx, idx + 1).map((s: Section, i: number) => Object.assign({}, s, { ordre: i + 1 }));
      return { ...prev, sections: reordered };
    });
  };

  // Section Toggle Expand - Default state is expanded (true), so first click toggles to false
  const toggleExpandSection = (id: string) => {
    setExpandedSectionIds(prev => {
      const isCurrentlyExpanded = prev[id] !== false;
      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  };

  // Section Visibility Toggle
  const toggleSectionVisibility = (id: string) => {
    setCv(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
    }));
  };

  // Duplicate Section
  const duplicateSection = (id: string) => {
    const target = cv.sections.find(s => s.id === id);
    if (!target) return;

    const newSection: Section = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-dup-${Date.now()}`,
      titre: `${target.titre} (Copie)`,
      ordre: cv.sections.length + 1
    };

    setCv(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  // Delete Section
  const deleteSection = (id: string) => {
    setCv(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  };

  // Update Section Title
  const updateSectionTitle = (id: string, title: string) => {
    setCv(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, titre: title } : s)
    }));
  };

  // Add Custom Section
  const addCustomSection = () => {
    const newSec: Section = {
      id: `sec-custom-${Date.now()}`,
      type: 'personnalisee',
      titre: 'Nouvelle Section',
      ordre: cv.sections.length + 1,
      visible: true,
      contenu: {
        typeLayout: 'texte_libre',
        texteLibre: 'Saisissez ici le texte de votre section personnalisée (certifications, bénévolat, projets...)'
      } as PersonnaliseeContenu
    };

    setCv(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
    setExpandedSectionIds(prev => ({ ...prev, [newSec.id]: true }));
  };

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean filename generator
  const getExportFilename = () => {
    const cleanName = (cv.sections.find(s => s.type === 'profil')?.contenu?.nomComplet || 'Mon_CV').replace(/\s+/g, '_');
    return `CV_${cleanName}`;
  };

  // Export Format Handlers
  const triggerExport = async (format: 'pdf' | 'png' | 'jpeg') => {
    const filename = getExportFilename();
    setShowExportMenu(false);
    setExportNotice({
      type: 'loading',
      message: `Génération du fichier ${format.toUpperCase()} HD en cours...`
    });

    try {
      let result;
      if (format === 'pdf') {
        result = await exportCVToPDF('cv-preview-container', filename);
      } else {
        result = await exportCVToImage('cv-preview-container', filename, format);
      }

      if (result.success) {
        setExportNotice({
          type: 'success',
          message: result.message || `Export ${format.toUpperCase()} réussi !`
        });
      } else {
        setExportNotice({
          type: 'error',
          message: result.message || `Échec de l'exportation ${format.toUpperCase()}.`
        });
      }
    } catch (err: any) {
      setExportNotice({
        type: 'error',
        message: `Erreur d'exportation: ${err?.message || 'Problème de rendu'}`
      });
    }

    setTimeout(() => {
      setExportNotice(null);
    }, 5000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors duration-200 relative">
      
      {/* Toast Notice Banner for Export Operations */}
      {exportNotice && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
            exportNotice.type === 'loading'
              ? 'bg-blue-900 text-blue-100 border-blue-500'
              : exportNotice.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-500'
              : 'bg-rose-900 text-rose-100 border-rose-500'
          }`}>
            {exportNotice.type === 'loading' && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />}
            {exportNotice.type === 'success' && <Check className="w-4 h-4 text-emerald-300 shrink-0" />}
            {exportNotice.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
            <span>{exportNotice.message}</span>
          </div>
        </div>
      )}

      {/* Top Editor Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-xs flex items-center justify-between">
        
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <input
              type="text"
              value={cv.titre}
              onChange={(e) => setCv({ ...cv, titre: e.target.value })}
              className="font-black text-slate-900 dark:text-white text-base bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 outline-hidden px-1"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1">
              {autoSaveStatus === 'saving' ? t('autoSaveSaving') : t('autoSaveSaved')}
            </p>
          </div>
        </div>

        {/* Center Mobile View Tabs - Compact & Styled */}
        <div className="flex md:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${activeTab === 'content' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Formulaire
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${activeTab === 'style' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Style
          </button>
        </div>

        {/* Right Actions: Eye (Preview on Mobile), Style (Palette), Export (Download) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Mobile Preview Button - Eye Icon Only */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'preview' ? 'content' : 'preview')}
            className={`p-2.5 sm:hidden rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Aperçu du CV (Œil)"
          >
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          </button>

          {/* Style Toggle (Desktop & Tablet) */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'style' ? 'content' : 'style')}
            className={`p-2.5 sm:px-3 sm:py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'style' 
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={t('customizeStyle')}
          >
            <Palette className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden sm:inline">{t('customizeStyle')}</span>
          </button>

          {/* Download / Export Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(prev => !prev)}
              className="p-2.5 sm:px-4 sm:py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              title="Télécharger / Exporter PDF ou Image"
            >
              <Download className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Télécharger / Exporter PDF ▾</span>
            </button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 rounded-md">
                  Exportation PDF HD A4 Gratuite
                </div>
                <button
                  onClick={() => triggerExport('pdf')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-red-500" />
                  <span>Document PDF (.pdf)</span>
                </button>
                <button
                  onClick={() => triggerExport('png')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Image PNG High-Res (.png)</span>
                </button>
                <button
                  onClick={() => triggerExport('jpeg')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Image JPEG Compressée (.jpg)</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Fixed Mobile Live Preview Button (Bottom Right) - Eye Icon Only */}
      <div className="fixed bottom-5 right-4 z-50 md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'preview' ? 'content' : 'preview')}
          className={`p-3.5 rounded-full shadow-2xl ring-4 ring-blue-500/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center ${
            activeTab === 'preview'
              ? 'bg-slate-900 text-white border border-slate-700'
              : 'bg-blue-600 text-white'
          }`}
          title="Aperçu du CV"
        >
          <Eye className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Form Controls & Style Options (Cols 1-6) */}
        <div className={`md:col-span-6 space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          
          {/* Style Customizer Panel */}
          {activeTab === 'style' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Personnalisation du Style, Police & Espacement
              </h2>

              {/* Template Select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Modèle Sélectionné ({CV_TEMPLATES.length} modèles disponibles)
                </label>
                <select
                  value={cv.templateId}
                  onChange={(e) => setCv({ ...cv, templateId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-blue-500 outline-hidden cursor-pointer"
                >
                  {CV_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Accent Color Picker + Custom Color Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Palette de Couleurs (24 Nuances + Personnalisée)
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-600">{cv.couleurAccent}</span>
                    <input
                      type="color"
                      value={cv.couleurAccent}
                      onChange={(e) => setCv({ ...cv, couleurAccent: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                      title="Choisir une couleur sur mesure"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setCv({ ...cv, couleurAccent: c.hex })}
                      className={`h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                        cv.couleurAccent === c.hex ? 'border-slate-900 scale-105 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {cv.couleurAccent === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family Selector (Liste déroulante) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Police de Caractères (Liste Déroulante)
                </label>
                <select
                  value={cv.police || 'Inter'}
                  onChange={(e) => setCv({ ...cv, police: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-blue-500 outline-hidden cursor-pointer"
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Typography & Precision Formatting Controls */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Réglages Précis Typographie & Interligne
                </h3>

                {/* Font Size Slider & Numeric Input (4px to 30px) */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Taille des Textes (de 4 à 30 px) :
                    </label>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border">
                      {cv.taillePoliceValeur ?? 11} px
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={4}
                      max={30}
                      step={1}
                      value={cv.taillePoliceValeur ?? 11}
                      onChange={(e) => setCv({ ...cv, taillePoliceValeur: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={4}
                      max={30}
                      value={cv.taillePoliceValeur ?? 11}
                      onChange={(e) => {
                        const val = Math.max(4, Math.min(30, parseInt(e.target.value) || 11));
                        setCv({ ...cv, taillePoliceValeur: val });
                      }}
                      className="w-16 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                    />
                  </div>
                </div>

                {/* Line Height Slider & Numeric Input (0.5 to 2.0) */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Hauteur d'Interligne (de 0.5 à 2.0) :
                    </label>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border">
                      {cv.hauteurLigneValeur ?? 1.3}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={cv.hauteurLigneValeur ?? 1.3}
                      onChange={(e) => setCv({ ...cv, hauteurLigneValeur: parseFloat(e.target.value) })}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={cv.hauteurLigneValeur ?? 1.3}
                      onChange={(e) => {
                        const val = Math.max(0.5, Math.min(2.0, parseFloat(e.target.value) || 1.3));
                        setCv({ ...cv, hauteurLigneValeur: val });
                      }}
                      className="w-16 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                    />
                  </div>
                </div>

                {/* Column Layout & Margin Settings */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-2">
                  Largeur & Marges des Colonnes
                </h3>

                {/* Left Column Width Slider (20% to 50%) */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Largeur Colonne Gauche (Partie gauche) :
                    </label>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border">
                      {cv.largeurColonneGauche ?? 33}% / {100 - (cv.largeurColonneGauche ?? 33)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={20}
                      max={50}
                      step={1}
                      value={cv.largeurColonneGauche ?? 33}
                      onChange={(e) => setCv({ ...cv, largeurColonneGauche: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">{cv.largeurColonneGauche ?? 33}%</span>
                  </div>
                </div>

                {/* Left & Right Column Margins / Padding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Marge Partie Gauche : <span className="text-blue-600">{cv.margeColonneGauche ?? 20} px</span>
                    </label>
                    <input
                      type="range"
                      min={4}
                      max={40}
                      step={1}
                      value={cv.margeColonneGauche ?? 20}
                      onChange={(e) => setCv({ ...cv, margeColonneGauche: parseInt(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Marge Partie Droite : <span className="text-blue-600">{cv.margeColonneDroite ?? 20} px</span>
                    </label>
                    <input
                      type="range"
                      min={4}
                      max={40}
                      step={1}
                      value={cv.margeColonneDroite ?? 20}
                      onChange={(e) => setCv({ ...cv, margeColonneDroite: parseInt(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Form Content Panel */}
          {activeTab !== 'style' && (
            <div className="space-y-4">
              
              {/* Photo Upload & Crop Controls */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {cv.photoUrl ? (
                      <img src={cv.photoUrl} alt="Profil" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{t('profilePhoto')}</h3>
                      <p className="text-[11px] text-slate-400">Importez, zoomez et cadrez votre photo</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 cursor-pointer transition-colors">
                      <span>{t('changePhoto')}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    </label>
                    {cv.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setCv({ ...cv, photoUrl: undefined })}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo Visibility Toggle & Options */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cv.afficherPhoto !== false}
                        onChange={(e) => setCv(prev => ({ ...prev, afficherPhoto: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Afficher la photo sur le CV</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {cv.afficherPhoto !== false ? 'Photo visible' : 'Photo masquée'}
                    </span>
                  </div>

                  {cv.afficherPhoto !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Forme de la photo</label>
                        <select
                          value={cv.photoForme || 'ronde'}
                          onChange={(e) => setCv(prev => ({ ...prev, photoForme: e.target.value as any }))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
                        >
                          <option value="ronde">⭕ Ronde (Cercle)</option>
                          <option value="carree">🟩 Carrée (Angles droits)</option>
                          <option value="arrondie">🔲 Arrondie (Angles doux)</option>
                          <option value="hexagone">⬢ Hexagone</option>
                          <option value="arche">🏛️ Arche (Sommet arrondi)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Taille de la photo ({cv.photoTaille || 96}px)</label>
                        <input
                          type="range"
                          min="60"
                          max="180"
                          step="5"
                          value={cv.photoTaille || 96}
                          onChange={(e) => setCv(prev => ({ ...prev, photoTaille: parseInt(e.target.value) }))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Expand/Collapse Toolbar */}
              <div className="flex items-center justify-between px-1 py-1 text-xs font-bold text-slate-500">
                <span>Sections du CV ({cv.sections.length})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allExpanded: Record<string, boolean> = {};
                      cv.sections.forEach(s => { allExpanded[s.id] = true; });
                      setExpandedSectionIds(allExpanded);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Déplier tout
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const allCollapsed: Record<string, boolean> = {};
                      cv.sections.forEach(s => { allCollapsed[s.id] = false; });
                      setExpandedSectionIds(allCollapsed);
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Replier tout
                  </button>
                </div>
              </div>

              {/* DnD Sections Context */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={cv.sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {cv.sections.map(sec => (
                    <SortableSectionItem
                      key={sec.id}
                      section={sec}
                      isExpanded={expandedSectionIds[sec.id] !== false}
                      onToggleExpand={() => toggleExpandSection(sec.id)}
                      onToggleVisibility={() => toggleSectionVisibility(sec.id)}
                      onDuplicate={() => duplicateSection(sec.id)}
                      onDelete={() => deleteSection(sec.id)}
                      onUpdateTitle={(title) => updateSectionTitle(sec.id, title)}
                      onUpdateColonne={(colonne) => {
                        setCv(prev => ({
                          ...prev,
                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, colonne } : s)
                        }));
                      }}
                    >
                      
                      {/* SECTION 1: PROFIL */}
                      {sec.type === 'profil' && (
                        <div className="space-y-4">
                          {/* Grand Title Selection */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-700">
                              Grand titre affiché en haut du CV
                            </label>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="grandTitreMode"
                                  value="nom"
                                  checked={cv.grandTitreMode !== 'poste'}
                                  onChange={() => setCv(prev => ({ ...prev, grandTitreMode: 'nom' }))}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span>Nom complet (ex: JEAN DUPONT)</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="grandTitreMode"
                                  value="poste"
                                  checked={cv.grandTitreMode === 'poste'}
                                  onChange={() => setCv(prev => ({ ...prev, grandTitreMode: 'poste' }))}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span>Intitulé du poste (ex: DÉVELOPPEUR FULL STACK)</span>
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SpellCheckField
                              label={t('fullName')}
                              value={sec.contenu?.nomComplet || ''}
                              onChange={(val) => setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, nomComplet: val } } : s)
                              }))}
                              langue={langue}
                            />
                            <SpellCheckField
                              label={t('jobTitle')}
                              value={sec.contenu?.titreProfessionnel || ''}
                              onChange={(val) => setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, titreProfessionnel: val } } : s)
                              }))}
                              langue={langue}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <SpellCheckField
                              label={t('email')}
                              value={sec.contenu?.email || ''}
                              onChange={(val) => setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, email: val } } : s)
                              }))}
                              langue={langue}
                            />
                            <SpellCheckField
                              label={t('phone')}
                              value={sec.contenu?.telephone || ''}
                              onChange={(val) => setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, telephone: val } } : s)
                              }))}
                              langue={langue}
                            />
                            <SpellCheckField
                              label={t('address')}
                              value={sec.contenu?.adresse || ''}
                              onChange={(val) => setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, adresse: val } } : s)
                              }))}
                              langue={langue}
                            />
                          </div>

                          <SpellCheckField
                            label={t('summary')}
                            multiline
                            rows={3}
                            value={sec.contenu?.resume || ''}
                            onChange={(val) => setCv(prev => ({
                              ...prev,
                              sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, resume: val } } : s)
                            }))}
                            langue={langue}
                          />
                        </div>
                      )}

                      {/* SECTION 2: EXPERIENCE */}
                      {sec.type === 'experience' && (
                        <div className="space-y-4">
                          {(sec.contenu as ExperienceItem[])?.map((exp, expIdx) => (
                            <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-500">Expérience #{expIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (sec.contenu as ExperienceItem[]).filter((_, i) => i !== expIdx);
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Supprimer cette expérience"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <SpellCheckField
                                  label={t('position')}
                                  value={exp.poste}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as ExperienceItem[])];
                                    list[expIdx].poste = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                                <SpellCheckField
                                  label={t('company')}
                                  value={exp.entreprise}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as ExperienceItem[])];
                                    list[expIdx].entreprise = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <SpellCheckField
                                  label="Date de début"
                                  value={exp.dateDebut || ''}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as ExperienceItem[])];
                                    list[expIdx].dateDebut = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                                <SpellCheckField
                                  label="Date de fin"
                                  value={exp.dateFin || ''}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as ExperienceItem[])];
                                    list[expIdx].dateFin = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                              </div>

                              <SpellCheckField
                                label={t('jobDescription')}
                                multiline
                                rows={2}
                                value={exp.description}
                                onChange={(val) => {
                                  const list = [...(sec.contenu as ExperienceItem[])];
                                  list[expIdx].description = val;
                                  setCv(prev => ({
                                    ...prev,
                                    sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                  }));
                                }}
                                langue={langue}
                              />
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(sec.contenu as ExperienceItem[] || [])];
                              list.push({
                                id: `exp-${Date.now()}`,
                                poste: 'Nouveau Poste',
                                entreprise: 'Entreprise',
                                ville: '',
                                dateDebut: '2022',
                                dateFin: 'Présent',
                                actuel: true,
                                description: 'Description des responsabilités.'
                              });
                              setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                              }));
                            }}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{t('addExperience')}</span>
                          </button>
                        </div>
                      )}

                      {/* SECTION 3: FORMATION */}
                      {sec.type === 'formation' && (
                        <div className="space-y-4">
                          {(sec.contenu as FormationItem[])?.map((edu, eduIdx) => (
                            <div key={edu.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-500">Formation #{eduIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (sec.contenu as FormationItem[]).filter((_, i) => i !== eduIdx);
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Supprimer cette formation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <SpellCheckField
                                  label={t('degree')}
                                  value={edu.diplome}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as FormationItem[])];
                                    list[eduIdx].diplome = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                                <SpellCheckField
                                  label={t('school')}
                                  value={edu.etablissement}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as FormationItem[])];
                                    list[eduIdx].etablissement = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <SpellCheckField
                                  label="Date début"
                                  value={edu.dateDebut || ''}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as FormationItem[])];
                                    list[eduIdx].dateDebut = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                                <SpellCheckField
                                  label="Date fin"
                                  value={edu.dateFin || ''}
                                  onChange={(val) => {
                                    const list = [...(sec.contenu as FormationItem[])];
                                    list[eduIdx].dateFin = val;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  langue={langue}
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(sec.contenu as FormationItem[] || [])];
                              list.push({
                                id: `edu-${Date.now()}`,
                                diplome: 'Nouveau Diplôme',
                                etablissement: 'Université / École',
                                ville: '',
                                dateDebut: '2019',
                                dateFin: '2022'
                              });
                              setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                              }));
                            }}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{t('addEducation')}</span>
                          </button>
                        </div>
                      )}

                      {/* SECTION 4: COMPETENCES */}
                      {sec.type === 'competences' && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 italic">
                            Organisez vos compétences par domaines (ex: Développement Web, Marketing) et listez les technologies/sous-compétences avec le style de votre choix (badges, puces, tirets, texte).
                          </p>
                          <div className="space-y-3">
                            {(sec.contenu as CompetenceItem[])?.map((sk, skIdx) => (
                              <div key={sk.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                                {/* Top Row: Nom + Level + Delete */}
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={sk.nom}
                                    placeholder="Domaine / Compétence principale (ex: Développement Web)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].nom = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="flex-1 px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-hidden"
                                  />
                                  <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={sk.niveau || 4}
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].niveau = Number(e.target.value);
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    title={`Niveau : ${sk.niveau || 4}/5`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = (sec.contenu as CompetenceItem[]).filter((_, i) => i !== skIdx);
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    title="Supprimer la compétence"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Sub-category title */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">Sous-titre / Catégorie :</span>
                                  <input
                                    type="text"
                                    value={sk.categorie || ''}
                                    placeholder="ex: Frameworks, Langages, Outils (Optionnel)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].categorie = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="flex-1 px-2 py-0.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-hidden text-slate-700 dark:text-slate-300"
                                  />
                                </div>

                                {/* Sous-compétences Manager & Formatting */}
                                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                  <div className="flex items-center justify-between flex-wrap gap-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                      Sous-compétences avec notes (sur 10) :
                                    </label>

                                    {/* Style selection buttons */}
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] text-slate-400 mr-1">Style :</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.contenu as CompetenceItem[])];
                                          list[skIdx].styleSousCompetences = 'barres';
                                          setCv(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                          }));
                                        }}
                                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${sk.styleSousCompetences === 'barres' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                        title="Barres de progression avec note /10"
                                      >
                                        📊 Barres
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.contenu as CompetenceItem[])];
                                          list[skIdx].styleSousCompetences = 'badges';
                                          setCv(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                          }));
                                        }}
                                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${(!sk.styleSousCompetences || sk.styleSousCompetences === 'badges') ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                        title="Format Badges / Tags"
                                      >
                                        🏷️ Badges
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.contenu as CompetenceItem[])];
                                          list[skIdx].styleSousCompetences = 'puces';
                                          setCv(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                          }));
                                        }}
                                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${sk.styleSousCompetences === 'puces' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                        title="Format Puces"
                                      >
                                        • Puces
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.contenu as CompetenceItem[])];
                                          list[skIdx].styleSousCompetences = 'texte_libre';
                                          setCv(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                          }));
                                        }}
                                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${sk.styleSousCompetences === 'texte_libre' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                        title="Texte libre"
                                      >
                                        🔤 Texte
                                      </button>
                                    </div>
                                  </div>

                                  {/* List of individual sub-competences */}
                                  <div className="space-y-1.5">
                                    {(sk.listSousCompetences || []).map((sub, subIdx) => (
                                      <div key={sub.id || subIdx} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                        <input
                                          type="text"
                                          value={sub.nom}
                                          placeholder="Nom de la sous-compétence (ex: Flutter)"
                                          onChange={(e) => {
                                            const list = [...(sec.contenu as CompetenceItem[])];
                                            const subList = [...(list[skIdx].listSousCompetences || [])];
                                            subList[subIdx] = { ...subList[subIdx], nom: e.target.value };
                                            list[skIdx].listSousCompetences = subList;
                                            setCv(prev => ({
                                              ...prev,
                                              sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                            }));
                                          }}
                                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                                        />

                                        {/* Score / Note out of 10 */}
                                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-bold">
                                          <span className="text-[10px] text-slate-400">Note:</span>
                                          <select
                                            value={sub.note || 8}
                                            onChange={(e) => {
                                              const list = [...(sec.contenu as CompetenceItem[])];
                                              const subList = [...(list[skIdx].listSousCompetences || [])];
                                              subList[subIdx] = { ...subList[subIdx], note: parseInt(e.target.value) };
                                              list[skIdx].listSousCompetences = subList;
                                              setCv(prev => ({
                                                ...prev,
                                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                              }));
                                            }}
                                            className="bg-transparent font-extrabold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
                                          >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                              <option key={n} value={n}>{n}/10</option>
                                            ))}
                                          </select>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const list = [...(sec.contenu as CompetenceItem[])];
                                            const subList = (list[skIdx].listSousCompetences || []).filter((_, i) => i !== subIdx);
                                            list[skIdx].listSousCompetences = subList;
                                            setCv(prev => ({
                                              ...prev,
                                              sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                            }));
                                          }}
                                          className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                                          title="Supprimer la sous-compétence"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = [...(sec.contenu as CompetenceItem[])];
                                        const subList = [...(list[skIdx].listSousCompetences || [])];
                                        subList.push({ id: `sub-${Date.now()}`, nom: '', note: 8 });
                                        list[skIdx].listSousCompetences = subList;
                                        list[skIdx].styleSousCompetences = 'barres';
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="px-2.5 py-1 text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Ajouter une sous-compétence (avec note /10)</span>
                                    </button>
                                  </div>

                                  {/* Raw text fallback input if needed */}
                                  <div className="pt-1">
                                    <textarea
                                      rows={1}
                                      value={sk.sousCompetences || ''}
                                      placeholder="Ou saisissez en texte brut (ex: Flutter, React, JS...)"
                                      onChange={(e) => {
                                        const list = [...(sec.contenu as CompetenceItem[])];
                                        list[skIdx].sousCompetences = e.target.value;
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-hidden font-sans"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(sec.contenu as CompetenceItem[] || [])];
                              list.push({ id: `sk-${Date.now()}`, nom: 'Nouvelle compétence', niveau: 4 });
                              setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                              }));
                            }}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{t('addSkill')}</span>
                          </button>
                        </div>
                      )}

                      {/* SECTION 5: LANGUES */}
                      {sec.type === 'langues' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(sec.contenu as LangueItem[])?.map((lg, lgIdx) => (
                              <div key={lg.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={lg.langue}
                                  placeholder="Langue (ex: Français)"
                                  onChange={(e) => {
                                    const list = [...(sec.contenu as LangueItem[])];
                                    list[lgIdx].langue = e.target.value;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  className="flex-1 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-hidden"
                                />
                                <input
                                  type="text"
                                  value={lg.niveau}
                                  placeholder="Niveau (ex: Courant)"
                                  onChange={(e) => {
                                    const list = [...(sec.contenu as LangueItem[])];
                                    list[lgIdx].niveau = e.target.value;
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  className="w-24 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (sec.contenu as LangueItem[]).filter((_, i) => i !== lgIdx);
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                    }));
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Supprimer la langue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(sec.contenu as LangueItem[] || [])];
                              list.push({ id: `lg-${Date.now()}`, langue: 'Nouveau langage', niveau: 'Intermédiaire' });
                              setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                              }));
                            }}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter une langue</span>
                          </button>
                        </div>
                      )}

                      {/* SECTION 5: CUSTOM / PERSONNALISEE */}
                      {sec.type === 'personnalisee' && (
                        <div className="space-y-3">
                          <SpellCheckField
                            label="Contenu texte libre de la section"
                            multiline
                            rows={4}
                            value={(sec.contenu as PersonnaliseeContenu)?.texteLibre || ''}
                            onChange={(val) => {
                              setCv(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, texteLibre: val } } : s)
                              }));
                            }}
                            langue={langue}
                          />
                        </div>
                      )}

                    </SortableSectionItem>
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add Custom Section Button */}
              <button
                type="button"
                onClick={addCustomSection}
                className="w-full py-3 bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addSection')}</span>
              </button>

            </div>
          )}

        </div>

        {/* RIGHT PANEL: Real-time CV Preview (Cols 7-12) */}
        <div className={`md:col-span-6 sticky top-28 self-start ${activeTab === 'content' ? 'hidden md:block' : 'block'}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-bold">
              <span>Aperçu A4 interactif</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Format d'impression officiel</span>
            </div>
            
            <CVPreview
              cv={cv}
              onMoveSectionUp={handleMoveSectionUp}
              onMoveSectionDown={handleMoveSectionDown}
              onUpdateColor={(color) => setCv(prev => ({ ...prev, couleurAccent: color }))}
              onUpdatePhotoShape={(shape) => setCv(prev => ({ ...prev, photoForme: shape }))}
              onUpdatePhotoSize={(size) => setCv(prev => ({ ...prev, photoTaille: size }))}
              interactivePreview={true}
            />
          </div>
        </div>

      </div>

      {/* Photo Cropper Modal */}
      {cropperImageSrc && (
        <PhotoCropper
          imageSrc={cropperImageSrc}
          onCropComplete={(croppedUrl) => {
            setCv(prev => ({ ...prev, photoUrl: croppedUrl }));
            setCropperImageSrc(null);
          }}
          onCancel={() => setCropperImageSrc(null)}
        />
      )}

    </div>
  );
};
