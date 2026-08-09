import React, { useState, useEffect } from 'react';
import {
  DndContext,
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
import { CV_TEMPLATES } from '../data/templates';
import { getTranslation } from '../i18n/translations';
import { SortableSectionItem } from '../components/SortableSectionItem';
import { SpellCheckField } from '../components/SpellCheckField';
import { PhotoCropper } from '../components/PhotoCropper';
import { CVPreview } from '../components/CVPreview';
import { CreatorStudioPanel } from '../components/CreatorStudioPanel';
import { VisualCVEditor } from '../editor/VisualCVEditor';
import { exportCVToPDF, exportCVToImage } from '../utils/pdfExport';

import {
  ArrowLeft,
  Save,
  Download,
  CreditCard,
  Plus,
  Palette,
  Eye,
  Trash2,
  AlertCircle,
  Sliders,
  FileText,
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FolderClosed,
  FolderOpen,
  Columns
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
  const [editorMode, setEditorMode] = useState<'visual' | 'form'>('visual');
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'preview'>('content');
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [columnFilter, setColumnFilter] = useState<'toutes' | 'gauche' | 'droite'>('toutes');
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState<boolean>(false);

  // Collapse or Expand All Sections
  const collapseAllSections = () => {
    const map: Record<string, boolean> = {};
    cv.sections.forEach(s => { map[s.id] = false; });
    setExpandedSectionIds(map);
  };

  const expandAllSections = () => {
    const map: Record<string, boolean> = {};
    cv.sections.forEach(s => { map[s.id] = true; });
    setExpandedSectionIds(map);
  };

  // Reorder Sub-items inside a Section Array
  const moveSubItem = (secId: string, fromIndex: number, toIndex: number) => {
    setCv(prev => {
      const updatedSections = prev.sections.map(s => {
        if (s.id !== secId || !Array.isArray(s.contenu)) return s;
        const list = [...s.contenu];
        if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return s;
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);
        return { ...s, contenu: list };
      });
      return { ...prev, sections: updatedSections };
    });
  };

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

  // Direct Reorder from Preview Canvas
  const handleSectionsReorder = (newSections: Section[]) => {
    setCv(prev => ({ ...prev, sections: newSections }));
  };

  const handleUpdateSectionZone = (secId: string, newZone: 'gauche' | 'droite' | 'principale') => {
    setCv(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === secId ? { ...s, colonne: newZone } : s)
    }));
  };

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

  // PDF Export Action
  const handleExportPDF = async () => {
    setExportNotice({ type: 'loading', message: 'Génération du PDF HD en cours...' });
    setShowExportMenu(false);

    const result = await exportCVToPDF('cv-preview-container', `${cv.titreCV || 'CV'}.pdf`);

    if (result.success) {
      setExportNotice({ type: 'success', message: 'PDF téléchargé avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: `Échec de l'export PDF : ${result.message || 'Erreur inconnue'}` });
    }
  };

  // Image Export Action
  const handleExportImage = async () => {
    setExportNotice({ type: 'loading', message: "Génération de l'image haute définition..." });
    setShowExportMenu(false);

    const result = await exportCVToImage('cv-preview-container', `${cv.titreCV || 'CV'}.png`);

    if (result.success) {
      setExportNotice({ type: 'success', message: 'Image téléchargée avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: `Échec de l'export image : ${result.message || 'Erreur inconnue'}` });
    }
  };

  const templateObj = CV_TEMPLATES.find(t => t.id === cv.templateId) || CV_TEMPLATES[0];

  if (editorMode === 'visual') {
    return (
      <VisualCVEditor
        cv={cv}
        langue={langue}
        onSaveCV={async (updatedCV) => {
          setCv(updatedCV);
          await onSaveCV(updatedCV);
        }}
        onToggleViewMode={(mode) => setEditorMode(mode)}
        viewMode={editorMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 md:pb-12 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Back & Document Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              style={{ minWidth: '44px', minHeight: '44px' }}
              title="Retour aux mes CV"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={cv.titreCV}
                onChange={(e) => setCv(prev => ({ ...prev, titreCV: e.target.value }))}
                className="font-black text-sm sm:text-base bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 outline-none px-1 py-0.5 text-slate-900 dark:text-white"
                placeholder="Titre de votre document CV"
              />
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold px-1">
                <span>{templateObj.name}</span>
                <span>•</span>
                <span className={autoSaveStatus === 'saving' ? 'text-amber-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}>
                  {autoSaveStatus === 'saving' ? 'Enregistrement...' : 'Sauvegardé'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Actions: Tabs + Download */}
          <div className="flex items-center space-x-2">
            
            {/* Desktop Tabs */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setEditorMode('visual')}
                className="px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer bg-blue-600 text-white shadow-xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Éditeur Visuel (Canva)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Formulaire</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'style'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Thème 🎨</span>
              </button>
            </div>

            {/* Download Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Télécharger le CV</span>
              </button>

              {/* Export Menu Dropdown */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Télécharger en PDF (A4 HD)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Impression officielle garantie</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportImage}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Télécharger en Image (PNG)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Format image haute résolution</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Payment Button if not paid */}
            {cv.statutPaiement !== 'PAYE' && (
              <button
                type="button"
                onClick={() => onOpenPayment(cv)}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden md:inline">Valider & Retirer Filigrane (1,99 €)</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* EXPORT / NOTIFICATION TOAST BANNER */}
      {exportNotice && (
        <div className={`max-w-7xl mx-auto px-4 mt-3`}>
          <div className={`p-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg border ${
            exportNotice.type === 'loading'
              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 animate-pulse'
              : exportNotice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportNotice.message}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: CONTENT EDITOR OR CREATOR STUDIO TAB (Cols 1-6) */}
          <div className={`md:col-span-6 space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
            
            {/* STYLE TAB / MODE CRÉATEUR LIBRE */}
            {activeTab === 'style' ? (
              <CreatorStudioPanel
                cv={cv}
                onChangeCV={setCv}
                template={templateObj}
              />
            ) : (
              /* CONTENT TAB */
              <div className="space-y-4">
                
                {/* PHOTO UPLOAD & PHOTO SHAPE SECTION */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>Photo de profil</span>
                  </label>

                  <div className="flex items-center gap-4">
                    {cv.photoUrl ? (
                      <div className="relative group">
                        <img
                          src={cv.photoUrl}
                          alt="Profil"
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setCv(prev => ({ ...prev, photoUrl: undefined }))}
                          className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700"
                          title="Supprimer la photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                        <CameraIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <label className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors">
                        <span>{cv.photoUrl ? 'Changer la photo' : 'Ajouter une photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* SECTIONS LIST WITH DND & CONTROLS */}
                <div className="bg-slate-100/80 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={collapseAllSections}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      title="Réduire toutes les sections"
                    >
                      <FolderClosed className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tout réduire</span>
                    </button>
                    <button
                      type="button"
                      onClick={expandAllSections}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      title="Déplier toutes les sections"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span>Tout déplier</span>
                    </button>
                  </div>

                  {(cv.nombreColonnes || 2) === 2 && (
                    <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setColumnFilter('toutes')}
                        className={`px-2 py-0.5 rounded-lg transition-colors ${
                          columnFilter === 'toutes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Toutes ({cv.sections.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setColumnFilter('gauche')}
                        className={`px-2 py-0.5 rounded-lg transition-colors ${
                          columnFilter === 'gauche' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        ◀ Col. Gauche ({cv.sections.filter(s => (s.colonne || 'principale') === 'gauche').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setColumnFilter('droite')}
                        className={`px-2 py-0.5 rounded-lg transition-colors ${
                          columnFilter === 'droite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        ▶ Col. Droite ({cv.sections.filter(s => (s.colonne || 'principale') === 'droite' || (s.colonne || 'principale') === 'principale').length})
                      </button>
                    </div>
                  )}
                </div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <SortableContext items={cv.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {cv.sections
                      .filter(s => {
                        if (columnFilter === 'gauche') return (s.colonne || 'principale') === 'gauche';
                        if (columnFilter === 'droite') return (s.colonne || 'principale') === 'droite' || (s.colonne || 'principale') === 'principale';
                        return true;
                      })
                      .map((sec, secIdx, arr) => (
                      <SortableSectionItem
                        key={sec.id}
                        section={sec}
                        isExpanded={expandedSectionIds[sec.id] !== false}
                        onToggleExpand={() => toggleExpandSection(sec.id)}
                        onToggleVisibility={() => toggleSectionVisibility(sec.id)}
                        onDuplicate={() => duplicateSection(sec.id)}
                        onDelete={() => deleteSection(sec.id)}
                        onUpdateTitle={(title) => updateSectionTitle(sec.id, title)}
                        onMoveUp={() => handleMoveSectionUp(sec.id)}
                        onMoveDown={() => handleMoveSectionDown(sec.id)}
                        isFirst={secIdx === 0}
                        isLast={secIdx === arr.length - 1}
                        isTwoColumnMode={(cv.nombreColonnes || 2) === 2}
                        onUpdateColonne={(col) => {
                          const updated = cv.sections.map(s => s.id === sec.id ? { ...s, colonne: col } : s);
                          setCv(prev => ({ ...prev, sections: updated }));
                        }}
                      >
                        {/* SECTION 1: PROFIL / CONTACT */}
                        {sec.type === 'profil' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Nom & Prénom :</label>
                                <input
                                  type="text"
                                  value={(sec.contenu as any)?.nomComplet || ''}
                                  onChange={(e) => {
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, nomComplet: e.target.value } } : s)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                                  placeholder="ex: Jean Dupont"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Titre professionnel :</label>
                                <input
                                  type="text"
                                  value={(sec.contenu as any)?.titreProfessionnel || ''}
                                  onChange={(e) => {
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, titreProfessionnel: e.target.value } } : s)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                                  placeholder="ex: Développeur Full-Stack"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Email :</label>
                                <input
                                  type="email"
                                  value={(sec.contenu as any)?.email || ''}
                                  onChange={(e) => {
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, email: e.target.value } } : s)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                                  placeholder="ex: jean.dupont@email.com"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Téléphone :</label>
                                <input
                                  type="tel"
                                  value={(sec.contenu as any)?.telephone || ''}
                                  onChange={(e) => {
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, telephone: e.target.value } } : s)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                                  placeholder="ex: +33 6 12 34 56 78"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Adresse / Ville :</label>
                                <input
                                  type="text"
                                  value={(sec.contenu as any)?.adresse || ''}
                                  onChange={(e) => {
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, adresse: e.target.value } } : s)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                                  placeholder="ex: Paris, France"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Site Web / LinkedIn :</label>
                                <input
                                  type="text"
                                  value={(sec.contenu as any)?.linkedin || ''}
                                  onChange={(e) => {
                                    setCv(prev => ({
                                      ...prev,
                                      sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, linkedin: e.target.value } } : s)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                                  placeholder="ex: linkedin.com/in/jeandupont"
                                />
                              </div>
                            </div>

                            <SpellCheckField
                              label="Résumé / Profil Professionnel"
                              multiline
                              rows={3}
                              value={(sec.contenu as any)?.resume || ''}
                              onChange={(val) => {
                                setCv(prev => ({
                                  ...prev,
                                  sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: { ...s.contenu, resume: val } } : s)
                                }));
                              }}
                              langue={langue}
                            />
                          </div>
                        )}

                        {/* SECTION 2: EXPERIENCES */}
                        {sec.type === 'experience' && (
                          <div className="space-y-4">
                            {(sec.contenu as ExperienceItem[])?.map((exp, expIdx) => (
                              <div key={exp.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase text-blue-600">Expérience #{expIdx + 1}</span>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      disabled={expIdx === 0}
                                      onClick={() => moveSubItem(sec.id, expIdx, expIdx - 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Monter cet élément"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={expIdx === (sec.contenu as ExperienceItem[]).length - 1}
                                      onClick={() => moveSubItem(sec.id, expIdx, expIdx + 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Descendre cet élément"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = (sec.contenu as ExperienceItem[]).filter((_, i) => i !== expIdx);
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg cursor-pointer ml-1"
                                      title="Supprimer cet élément"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={exp.poste}
                                    placeholder="Intitulé du poste (ex: Chef de Projet)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as ExperienceItem[])];
                                      list[expIdx].poste = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                  <input
                                    type="text"
                                    value={exp.entreprise}
                                    placeholder="Entreprise / Organisation"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as ExperienceItem[])];
                                      list[expIdx].entreprise = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                  <input
                                    type="text"
                                    value={exp.dateDebut}
                                    placeholder="Date début (ex: Jan 2020)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as ExperienceItem[])];
                                      list[expIdx].dateDebut = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                  <input
                                    type="text"
                                    value={exp.dateFin}
                                    placeholder="Date fin (ex: Présent)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as ExperienceItem[])];
                                      list[expIdx].dateFin = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                </div>

                                <SpellCheckField
                                  label="Missions & Réalisations"
                                  multiline
                                  rows={3}
                                  value={exp.description || ''}
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
                                  poste: 'Nouvelle expérience',
                                  entreprise: 'Entreprise',
                                  ville: 'Paris',
                                  dateDebut: '2022',
                                  dateFin: 'Présent',
                                  actuel: true,
                                  description: 'Description des tâches et réalisations...'
                                });
                                setCv(prev => ({
                                  ...prev,
                                  sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                }));
                              }}
                              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter une expérience</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 3: FORMATION */}
                        {sec.type === 'formation' && (
                          <div className="space-y-4">
                            {(sec.contenu as FormationItem[])?.map((edu, eduIdx) => (
                              <div key={edu.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase text-blue-600">Formation #{eduIdx + 1}</span>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      disabled={eduIdx === 0}
                                      onClick={() => moveSubItem(sec.id, eduIdx, eduIdx - 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Monter cette formation"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={eduIdx === (sec.contenu as FormationItem[]).length - 1}
                                      onClick={() => moveSubItem(sec.id, eduIdx, eduIdx + 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Descendre cette formation"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = (sec.contenu as FormationItem[]).filter((_, i) => i !== eduIdx);
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg cursor-pointer ml-1"
                                      title="Supprimer cette formation"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={edu.diplome}
                                    placeholder="Diplôme / Intitulé"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as FormationItem[])];
                                      list[eduIdx].diplome = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                  <input
                                    type="text"
                                    value={edu.etablissement}
                                    placeholder="École / Université"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as FormationItem[])];
                                      list[eduIdx].etablissement = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                  <input
                                    type="text"
                                    value={edu.dateDebut}
                                    placeholder="Date début (ex: 2018)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as FormationItem[])];
                                      list[eduIdx].dateDebut = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                  <input
                                    type="text"
                                    value={edu.dateFin}
                                    placeholder="Date fin (ex: 2021)"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as FormationItem[])];
                                      list[eduIdx].dateFin = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
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
                                  diplome: 'Nouveau diplôme',
                                  etablissement: 'Université / École',
                                  ville: 'Paris',
                                  dateDebut: '2019',
                                  dateFin: '2022'
                                });
                                setCv(prev => ({
                                  ...prev,
                                  sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                }));
                              }}
                              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter une formation</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 4: COMPETENCES */}
                        {sec.type === 'competences' && (
                          <div className="space-y-3">
                            {(sec.contenu as CompetenceItem[])?.map((sk, skIdx) => (
                              <div key={sk.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={sk.nom}
                                    placeholder="Nom de la compétence"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].nom = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="flex-1 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
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
                                    className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                  />
                                  <div className="flex items-center space-x-0.5">
                                    <button
                                      type="button"
                                      disabled={skIdx === 0}
                                      onClick={() => moveSubItem(sec.id, skIdx, skIdx - 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Monter cette compétence"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={skIdx === (sec.contenu as CompetenceItem[]).length - 1}
                                      onClick={() => moveSubItem(sec.id, skIdx, skIdx + 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Descendre cette compétence"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = (sec.contenu as CompetenceItem[]).filter((_, i) => i !== skIdx);
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg cursor-pointer"
                                      title="Supprimer cette compétence"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}

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
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter une compétence</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 5: LANGUES */}
                        {sec.type === 'langues' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(sec.contenu as LangueItem[])?.map((lg, lgIdx) => (
                                <div key={lg.id} className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={lg.langue}
                                    placeholder="Langue"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as LangueItem[])];
                                      list[lgIdx].langue = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="flex-1 px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={lg.niveau}
                                    placeholder="Niveau"
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as LangueItem[])];
                                      list[lgIdx].niveau = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                  />
                                  <div className="flex items-center space-x-0.5">
                                    <button
                                      type="button"
                                      disabled={lgIdx === 0}
                                      onClick={() => moveSubItem(sec.id, lgIdx, lgIdx - 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Monter cette langue"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={lgIdx === (sec.contenu as LangueItem[]).length - 1}
                                      onClick={() => moveSubItem(sec.id, lgIdx, lgIdx + 1)}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer"
                                      title="Descendre cette langue"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = (sec.contenu as LangueItem[]).filter((_, i) => i !== lgIdx);
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg cursor-pointer"
                                      title="Supprimer cette langue"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter une langue</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 6: PERSONNALISEE */}
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
                  className="w-full py-3 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une nouvelle section personnalisée</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: LIVE CV PREVIEW (Cols 7-12) */}
          <div className={`md:col-span-6 sticky top-24 self-start ${activeTab === 'content' ? 'hidden md:block' : 'block'}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                <span>Rendu A4 Temps Réel</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">Format d'impression officiel A4</span>
              </div>

              <CVPreview
                cv={cv}
                onMoveSectionUp={handleMoveSectionUp}
                onMoveSectionDown={handleMoveSectionDown}
                onUpdateColor={(color) => setCv(prev => ({ ...prev, couleurAccent: color }))}
                onUpdatePhotoShape={(shape) => setCv(prev => ({ ...prev, photoForme: shape }))}
                onUpdatePhotoSize={(size) => setCv(prev => ({ ...prev, photoTaille: size }))}
                onSectionsReorder={handleSectionsReorder}
                onUpdateSectionZone={handleUpdateSectionZone}
                interactivePreview={true}
              />
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE BOTTOM TOOLBAR (ICON ONLY AS REQUESTED BY USER) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-3 flex items-center justify-around md:hidden shadow-2xl">
        {/* Eye Icon for Mobile Preview */}
        <button
          type="button"
          onClick={() => setShowMobilePreviewModal(true)}
          className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
          style={{ width: '48px', height: '48px' }}
          title="Aperçu visuel"
        >
          <Eye className="w-6 h-6" />
        </button>

        {/* Palette Icon for Style / Creator Studio */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'style' ? 'content' : 'style')}
          className={`p-3 rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer flex items-center justify-center ${
            activeTab === 'style' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
          }`}
          style={{ width: '48px', height: '48px' }}
          title="Style et personnalisation"
        >
          <Palette className="w-6 h-6" />
        </button>

        {/* Download Icon */}
        <button
          type="button"
          onClick={handleExportPDF}
          className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
          style={{ width: '48px', height: '48px' }}
          title="Télécharger"
        >
          <Download className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE PREVIEW MODAL */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col items-center justify-center overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-4 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-black uppercase text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span>Aperçu Mobile A4</span>
              </span>
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer"
                style={{ width: '44px', height: '44px' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CVPreview
              cv={cv}
              onSectionsReorder={handleSectionsReorder}
              onUpdateSectionZone={handleUpdateSectionZone}
              interactivePreview={true}
            />
          </div>
        </div>
      )}

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

const CameraIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
