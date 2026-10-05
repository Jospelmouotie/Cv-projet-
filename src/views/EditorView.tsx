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

import { CV, Section, Language, User, ExperienceItem, FormationItem, CompetenceItem, LangueItem, PersonnaliseeContenu, SubscriptionTier } from '../types';
import { CV_TEMPLATES, readAdminCustomTemplates, syncAdminCustomTemplates } from '../data/templates';
import { getTranslation, getLocalizedTemplateName } from '../i18n/translations';
import { SortableSectionItem } from '../components/SortableSectionItem';
import { SpellCheckField } from '../components/SpellCheckField';
import { ClearableInput, ClearableTextarea } from '../components/ClearableInput';
import { PhotoCropper } from '../components/PhotoCropper';
import { CVPreview } from '../components/CVPreview';
import { CreatorStudioPanel } from '../components/CreatorStudioPanel';
import { FormWizard } from '../components/FormWizard';
import { VisualCVEditor } from '../editor/VisualCVEditor';
import { CareerToolsModal } from '../components/CareerToolsModal';
import { toggleColumnLayout } from '../state/cvActions';
import { exportCVToPDF, exportCVToImage, exportCVToWord, exportCVToJSON, exportCVToPlainText } from '../utils/pdfExport';
import { detectPaidFeaturesInCV, PaidFeatureUsage } from '../utils/paidUsageDetector';
import { PaidUsageExportModal } from '../components/PaidUsageExportModal';
import { isSubOptionPaidByAdmin, isStudioMenuPaidByAdmin, isPaymentActive } from '../utils/adminPaidMatrix';
import { saveActiveCVDraft, getLastSavedTime, formatSavedTimeAgo } from '../utils/cvDraftStorage';
import { translateCV } from '../utils/cvTranslator';

import { SubCompetenceManager } from '../components/SubCompetenceManager';

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
  Columns,
  Loader2,
  Layers,
  Target,
  Linkedin,
  Laptop,
  Lock,
  Globe,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileCode,
  FileSpreadsheet,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Star,
  Tag,
  Award
} from 'lucide-react';

interface EditorViewProps {
  cv: CV;
  user: User | null;
  langue: Language;
  initialMode?: 'visual' | 'form';
  onBack: () => void;
  onSaveCV: (cv: CV) => Promise<void>;
  onOpenPayment: (cv: CV) => void;
  onOpenAuth: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  cv: initialCV,
  user,
  langue,
  initialMode,
  onBack,
  onSaveCV,
  onOpenPayment,
  onOpenAuth
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);
  const isEn = langue === 'en';
  const isAr = langue === 'ar';

  const [cv, setCvState] = useState<CV>(() => ({
    ...initialCV,
    sections: initialCV?.sections || []
  }));

  const [undoStack, setUndoStack] = useState<CV[]>([]);
  const [redoStack, setRedoStack] = useState<CV[]>([]);

  const [lastSavedIso, setLastSavedIso] = useState<string | null>(() => getLastSavedTime(initialCV?.id));

  // Wrapper setCv that records undo history and immediately saves local draft
  const setCv = (action: CV | ((prev: CV) => CV)) => {
    setCvState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack(u => [...u.slice(-30), prev]);
        setRedoStack([]);
        // Immediate synchronous save to local storage
        saveActiveCVDraft(next);
        setLastSavedIso(new Date().toISOString());
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(u => u.slice(0, u.length - 1));
    setRedoStack(r => [cv, ...r]);
    setCvState(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(r => r.slice(1));
    setUndoStack(u => [...u, cv]);
    setCvState(next);
  };

  const saveCurrentCVAsAdminTemplate = () => {
    if (!user || user.role !== 'ADMIN') return;

    const adminTemplates = readAdminCustomTemplates();
    const nextTemplate: any = {
      id: `custom-admin-${Date.now()}`,
      name: cv.titreCV || cv.titre || 'Modèle admin',
      category: 'professionnel',
      description: {
        fr: 'Modèle créé dans l’éditeur par l’admin. Gratuit et entièrement modifiable par l’admin.',
        en: 'Template created in the editor by the admin. Free and fully editable by the admin.',
        ar: 'قالب تم إنشاؤه داخل المحرر بواسطة المدير. مجاني وقابل للتعديل الكامل.'
      },
      layoutType: (cv.nombreColonnes || 1) === 2 ? 'two-column-custom' : 'single-column-custom',
      layoutFamily: (cv.nombreColonnes || 1) === 2 ? 'two-column-left' : 'single-column',
      defaultAccent: cv.couleurAccent || '#0F172A',
      defaultSecondaryAccent: cv.couleurAccentSecondaire || '#E2E8F0',
      defaultFont: cv.police || 'inter',
      badgeText: 'Gratuit',
      previewImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      preview: 'single',
      requiredTier: 'freemium',
      themeConfig: {
        headerStyle: cv.styleEnTete || 'clean',
        sectionHeaderStyle: cv.styleEnTeteSection || 'underline',
        skillsDisplayMode: 'badges',
        sidebarBackgroundColor: cv.couleurFondSidebar || '#F8FAFC',
        photoPosition: cv.afficherPhoto ? ((cv.nombreColonnes || 1) === 2 ? 'in-sidebar' : 'in-header') : 'in-header',
        photoFrameStyle: cv.formePhoto || 'ronde',
        timelineStyle: cv.timelineStyle || 'none',
        footerStyle: cv.stylePiedDePage || 'minimal-inline',
        footerBackgroundColor: cv.couleurFondPiedDePage || '#0F172A',
        footerTextColor: cv.couleurTextePiedDePage || '#FFFFFF',
        backgroundPattern: cv.arrierePlanPattern || 'dots'
      }
    };

    syncAdminCustomTemplates([...adminTemplates, nextTemplate]);
    setExportNotice({ type: 'success', message: 'Modèle admin enregistré comme gratuit dans la galerie.' });
    setTimeout(() => setExportNotice(null), 3500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, cv]);
  const [editorMode, setEditorMode] = useState<'visual' | 'form'>(initialMode || 'form');
  const [activeTab, setActiveTab] = useState<'wizard' | 'sections' | 'style' | 'visual' | 'preview'>(
    initialMode === 'visual' ? 'visual' : 'wizard'
  );

  useEffect(() => {
    if (initialCV) {
      setCv({ ...initialCV, sections: initialCV.sections || [] });
    }
  }, [initialCV]);

  useEffect(() => {
    if (initialMode) {
      setEditorMode(initialMode);
      setActiveTab(initialMode === 'visual' ? 'visual' : 'wizard');
    }
  }, [initialMode]);

  useEffect(() => {
    if (cv && cv.langue !== langue) {
      const translated = translateCV(cv, langue);
      setCv(translated);
    }
  }, [langue]);
  const [useWizardMode, setUseWizardMode] = useState<boolean>(true);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [columnFilter, setColumnFilter] = useState<'toutes' | 'gauche' | 'droite'>('toutes');
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState<boolean>(false);
  
  const getFitZoom = () => {
    if (typeof window === 'undefined') return 0.5;
    return Math.min(1.0, window.innerWidth / 794);
  };
  const [mobileZoom, setMobileZoom] = useState<number>(getFitZoom);
  const [windowWidth, setWindowWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    if (showMobilePreviewModal) {
      setMobileZoom(getFitZoom());
    }
  }, [showMobilePreviewModal]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (showMobilePreviewModal) {
        setMobileZoom(getFitZoom());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobilePreviewModal]);

  // Collapse or Expand All Sections
  const collapseAllSections = () => {
    const map: Record<string, boolean> = {};
    (cv.sections || []).forEach(s => { map[s.id] = false; });
    setExpandedSectionIds(map);
  };

  const expandAllSections = () => {
    const map: Record<string, boolean> = {};
    (cv.sections || []).forEach(s => { map[s.id] = true; });
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
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [careerModalTab, setCareerModalTab] = useState<'lettre' | 'linkedin' | 'offre'>('lettre');
  const [showPaidExportModal, setShowPaidExportModal] = useState(false);
  const [detectedPaidUsages, setDetectedPaidUsages] = useState<PaidFeatureUsage[]>([]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync state if prop updates
  useEffect(() => {
    setCv(initialCV);
  }, [initialCV.id]);

  // Auto-save debounce effect & lifecycle exit listeners (beforeunload, visibilitychange)
  useEffect(() => {
    // Ensure draft is stored immediately
    saveActiveCVDraft(cv);

    const timer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await onSaveCV(cv);
        setLastSavedIso(new Date().toISOString());
      } catch (err) {
        console.warn('Auto-save error:', err);
      } finally {
        setAutoSaveStatus('saved');
      }
    }, 800);

    const handleBeforeUnload = () => {
      saveActiveCVDraft(cv);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveActiveCVDraft(cv);
        onSaveCV(cv);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Flush on unmount
      saveActiveCVDraft(cv);
    };
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
    const target = (cv.sections || []).find(s => s.id === id);
    if (!target) return;

    const newSection: Section = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-dup-${Date.now()}`,
      titre: `${target.titre} (Copie)`,
      ordre: (cv.sections || []).length + 1
    };

    setCv(prev => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
  };

  // Delete Section
  const deleteSection = (id: string) => {
    setCv(prev => ({ ...prev, sections: (prev.sections || []).filter(s => s.id !== id) }));
  };

  // Update Section Title
  const updateSectionTitle = (id: string, title: string) => {
    setCv(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === id ? { ...s, titre: title } : s)
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

  // Reset Paid Features to Free Defaults
  const handleResetToFreeDefaults = () => {
    const paidUsages = detectPaidFeaturesInCV(cv, effectiveUserTier);
    if (paidUsages.length > 0) {
      setDetectedPaidUsages(paidUsages);
      setShowPaidExportModal(true);
      setExportNotice({
        type: 'error',
        message: 'Réinitialisation gratuite bloquée : ce CV utilise des éléments payants.'
      });
      return;
    }

    setCv(prev => ({
      ...prev,
      templateId: 'm51',
      police: 'Inter',
      arrierePlanPattern: 'none',
      calqueDecoratif: 'none',
      couleurFondSidebar: undefined
    }));
    setExportNotice({ type: 'success', message: 'Style réinitialisé en version gratuite. Lancement du téléchargement...' });
    setTimeout(() => {
      exportCVToPDF('cv-preview-container', `${cv.titreCV || 'CV'}.pdf`, cv.pageCibleMode === '2_pages');
    }, 500);
  };

  // Strict Authentication Guard for All Export Formats
  const requireAuthForExport = (): boolean => {
    if (!user) {
      setExportNotice({
        type: 'error',
        message: 'Authentification obligatoire : Veuillez vous connecter ou créer un compte gratuit pour exporter votre CV (PDF, Image, Word, etc.).'
      });
      onOpenAuth();
      return false;
    }
    return true;
  };

  const effectiveUserTier: SubscriptionTier = (user?.role === 'ADMIN' || user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'decouverte' || user?.subscriptionTier === 'classique') ? (user?.role === 'ADMIN' ? 'premium' : (user?.subscriptionTier as SubscriptionTier)) : 'freemium';
  const isAdminTemplateBuilder = Boolean((cv as any)?.asAdminTemplateBuilder);

  // PDF Export Action
  const handleExportPDF = async () => {
    setShowExportMenu(false);
    if (!requireAuthForExport()) return;

    const paidUsages = detectPaidFeaturesInCV(cv, effectiveUserTier);

    if (paidUsages.length > 0) {
      setDetectedPaidUsages(paidUsages);
      setShowPaidExportModal(true);
      return;
    }

    setExportNotice({ type: 'loading', message: 'Génération du PDF HD en cours...' });

    const result = await exportCVToPDF('cv-preview-container', `${cv.titreCV || 'CV'}.pdf`, cv.pageCibleMode === '2_pages');

    if (result.success) {
      setExportNotice({ type: 'success', message: 'PDF téléchargé avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: `Échec de l'export PDF : ${result.message || 'Erreur inconnue'}` });
    }
  };

  // Image PNG Export Action
  const handleExportImage = async () => {
    setShowExportMenu(false);
    if (!requireAuthForExport()) return;

    const paidUsages = detectPaidFeaturesInCV(cv, effectiveUserTier);

    if (paidUsages.length > 0) {
      setDetectedPaidUsages(paidUsages);
      setShowPaidExportModal(true);
      return;
    }

    setExportNotice({ type: 'loading', message: "Génération de l'image haute définition..." });

    const result = await exportCVToImage('cv-preview-container', `${cv.titreCV || 'CV'}.png`);

    if (result.success) {
      setExportNotice({ type: 'success', message: 'Image téléchargée avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: `Échec de l'export image : ${result.message || 'Erreur inconnue'}` });
    }
  };

  // Multi-format: Word Export Action (Premium)
  const handleExportWord = async () => {
    setShowExportMenu(false);
    if (!requireAuthForExport()) return;

    if (effectiveUserTier === 'freemium') {
      setExportNotice({ type: 'error', message: "L'export Word (.doc) est une fonctionnalité du Forfait Premium." });
      onOpenPayment(cv);
      return;
    }

    setExportNotice({ type: 'loading', message: 'Génération du document Word...' });
    const result = await exportCVToWord(cv, `${cv.titreCV || 'CV'}`);
    if (result.success) {
      setExportNotice({ type: 'success', message: 'Document Word (.doc) exporté avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: result.message || "Échec de l'export Word" });
    }
  };

  // Multi-format: JSON Export Action (Premium)
  const handleExportJSON = async () => {
    setShowExportMenu(false);
    if (!requireAuthForExport()) return;

    if (effectiveUserTier === 'freemium') {
      setExportNotice({ type: 'error', message: "L'export JSON structuré est une fonctionnalité du Forfait Premium." });
      onOpenPayment(cv);
      return;
    }

    setExportNotice({ type: 'loading', message: 'Génération du fichier JSON...' });
    const result = await exportCVToJSON(cv, `${cv.titreCV || 'CV'}`);
    if (result.success) {
      setExportNotice({ type: 'success', message: 'Fichier JSON exporté avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: result.message || "Échec de l'export JSON" });
    }
  };

  // Multi-format: Plain Text Export Action (Premium)
  const handleExportPlainText = async () => {
    setShowExportMenu(false);
    if (!requireAuthForExport()) return;

    if (effectiveUserTier === 'freemium') {
      setExportNotice({ type: 'error', message: "L'export Texte Brut (.txt) est une fonctionnalité du Forfait Premium." });
      onOpenPayment(cv);
      return;
    }

    setExportNotice({ type: 'loading', message: 'Génération du fichier texte...' });
    const result = await exportCVToPlainText(cv, `${cv.titreCV || 'CV'}`);
    if (result.success) {
      setExportNotice({ type: 'success', message: 'Fichier Texte (.txt) exporté avec succès !' });
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice({ type: 'error', message: result.message || "Échec de l'export texte" });
    }
  };

  // On mobile/small screen (< 1024px), force form wizard mode (visual Word mode hidden)
  useEffect(() => {
    if (windowWidth < 1024 && (editorMode === 'visual' || activeTab === 'visual')) {
      setEditorMode('form');
      setActiveTab('wizard');
    }
  }, [windowWidth, editorMode, activeTab]);

  const templateObj = CV_TEMPLATES.find(t => t.id === cv.templateId) || CV_TEMPLATES[0];

  if (editorMode === 'visual' || activeTab === 'visual') {
    return (
      <VisualCVEditor
        cv={cv}
        langue={langue}
        onSaveCV={async (updatedCV) => {
          setCv(updatedCV);
          await onSaveCV(updatedCV);
        }}
        onToggleViewMode={(mode) => {
          setEditorMode(mode);
          setActiveTab(mode === 'form' ? 'wizard' : 'visual');
        }}
        viewMode={editorMode}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 md:pb-12 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* TOP NAVIGATION HEADER - ULTRA COMPACT SINGLE ROW */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2 sm:px-3 py-2 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-extrabold text-[11px] sm:text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer border border-slate-300 dark:border-slate-700 shrink-0"
              title={getTranslation(langue, 'backToResumes')}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
              <span className="hidden sm:inline">{getTranslation(langue, 'backToResumes')}</span>
            </button>

            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <input
                type="text"
                value={cv.titreCV}
                onChange={(e) => setCv(prev => ({ ...prev, titreCV: e.target.value }))}
                className="font-black text-xs sm:text-sm bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 outline-none px-1 py-0.5 text-slate-900 dark:text-white w-full max-w-[150px] sm:max-w-[220px] truncate"
                placeholder={getTranslation(langue, 'docTitleLabel')}
              />

              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 select-none shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                <span>{autoSaveStatus === 'saving' ? (langue === 'en' ? 'Saving...' : langue === 'ar' ? 'جاري الحفظ...' : 'Sauvegarde...') : (langue === 'en' ? 'Auto-saved' : langue === 'ar' ? 'حفظ تلقائي' : 'Enregistré')}</span>
              </div>
              <span className={`sm:hidden text-[10px] font-bold shrink-0 ${autoSaveStatus === 'saving' ? 'text-amber-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {autoSaveStatus === 'saving' ? '...' : '✓'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end w-full sm:w-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] sm:text-xs flex items-center gap-1 font-black cursor-pointer shadow-xs shrink-0"
                title={isEn ? 'Undo (Ctrl+Z)' : isAr ? 'تراجع (Ctrl+Z)' : 'Annuler / Retour en arrière (Ctrl+Z)'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEn ? 'Undo' : isAr ? 'تراجع' : 'Annuler'}</span>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] sm:text-xs flex items-center gap-1 font-black cursor-pointer shadow-xs shrink-0"
                title={isEn ? 'Redo (Ctrl+Y)' : isAr ? 'إعادة (Ctrl+Y)' : 'Rétablir (Ctrl+Y)'}
              >
                <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" />
                <span className="hidden sm:inline">{isEn ? 'Redo' : isAr ? 'إعادة' : 'Rétablir'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800 pl-2 ml-1">
                <Globe className="w-3 h-3 text-neutral-400" />
                {(['fr', 'en', 'ar'] as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      const translated = translateCV(cv, l);
                      setCv(translated);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                      (cv.langue || 'fr') === l
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={l === 'en' ? 'Translate CV to English' : l === 'ar' ? 'ترجمة السيرة الذاتية إلى العربية' : 'Traduire le CV en Français'}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700 gap-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => { setEditorMode('form'); setActiveTab('wizard'); }}
                className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'wizard' && editorMode === 'form'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'Assistant' : isAr ? 'المساعد' : 'Assistant'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setEditorMode('form'); setActiveTab('sections'); }}
                className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sections' && editorMode === 'form'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Sections' : isAr ? 'الأقسام' : 'Sections'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setEditorMode('form'); setActiveTab('style'); }}
                className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'style' && editorMode === 'form'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEn ? 'Style & Studio' : isAr ? 'التصميم والاستوديو' : 'Style & Studio'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCareerModalTab('lettre');
                  setShowCareerModal(true);
                }}
                className="px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                title={isEn ? 'Generate cover letter or optimize LinkedIn for this resume' : isAr ? 'إنشاء رسالة تحفيزية أو تحسين لينكد إن' : 'Générer la lettre ou optimiser LinkedIn pour ce CV'}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isEn ? 'Cover Letter & AI' : isAr ? 'الرسالة والذكاء الاصطناعي' : 'Lettre & IA'}</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <div className="flex items-center bg-blue-50 dark:bg-blue-950/40 p-0.5 rounded-lg border border-blue-500/30 gap-0.5">
                <button
                  type="button"
                  onClick={() => setCv(prev => ({ ...prev, nombreColonnes: 1 }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    (cv.nombreColonnes || 2) === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-700 dark:text-neutral-300 hover:bg-white/50 dark:hover:bg-neutral-800'
                  }`}
                  title={isEn ? '1 column' : isAr ? 'عمود 1' : '1 colonne'}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isEn ? '1 Col' : isAr ? 'عمود 1' : '1 Col'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCv(prev => ({ ...prev, nombreColonnes: 2 }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    (cv.nombreColonnes || 2) === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-700 dark:text-neutral-300 hover:bg-white/50 dark:hover:bg-neutral-800'
                  }`}
                  title={isEn ? '2 columns' : isAr ? 'عمودان' : '2 colonnes'}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>{isEn ? '2 Col' : isAr ? 'عمودان' : '2 Col'}</span>
                </button>
              </div>

              {user?.role === 'ADMIN' && (cv as any).asAdminTemplateBuilder && (
                <button
                  type="button"
                  onClick={saveCurrentCVAsAdminTemplate}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:bg-emerald-700"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Save as free model' : isAr ? 'حفظ كنموذج مجاني' : 'Enregistrer comme modèle gratuit'}</span>
                </button>
              )}

              {!isAdminTemplateBuilder && (
                <button
                  type="button"
                  onClick={() => setShowExportMenu(prev => !prev)}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black flex items-center justify-center transition-all shadow-md hover:shadow-lg cursor-pointer border border-emerald-500 shrink-0"
                  title="Télécharger / Exporter"
                  aria-label="Télécharger"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="md:hidden sticky top-[61px] z-20 border-b border-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: 'Assistant', icon: Sparkles, active: activeTab === 'wizard' && editorMode === 'form', onClick: () => { setEditorMode('form'); setActiveTab('wizard'); } },
            { label: 'Sections', icon: Layers, active: activeTab === 'sections' && editorMode === 'form', onClick: () => { setEditorMode('form'); setActiveTab('sections'); } },
            { label: 'Design', icon: Sliders, active: activeTab === 'style' && editorMode === 'form', onClick: () => { setEditorMode('form'); setActiveTab('style'); } },
            { label: '1 Col', icon: FileText, active: (cv.nombreColonnes || 2) === 1, onClick: () => setCv(prev => ({ ...prev, nombreColonnes: 1 })), },
            { label: '2 Col', icon: Columns, active: (cv.nombreColonnes || 2) === 2, onClick: () => setCv(prev => ({ ...prev, nombreColonnes: 2 })), },
          ].map(({ label, icon: Icon, active, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-black whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                active
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}

          {!isAdminTemplateBuilder && (
            <button
              type="button"
              onClick={() => setShowExportMenu(true)}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-emerald-500 bg-emerald-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow-md cursor-pointer shrink-0"
              title="Télécharger le CV"
              aria-label="Télécharger"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Full-screen Loading Overlay for Asynchronous Operations */}
      {exportNotice?.type === 'loading' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Opération en cours...</h3>
              <p className="text-xs text-slate-300 mt-1">{exportNotice.message}</p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* EXPORT / NOTIFICATION TOAST BANNER */}
      {exportNotice && exportNotice.type !== 'loading' && (
        <div className={`max-w-7xl mx-auto px-4 mt-3`}>
          <div className={`p-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg border ${
            exportNotice.type === 'success'
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
            
            {/* 1. STYLE & STUDIO TAB */}
            {activeTab === 'style' && (
              <CreatorStudioPanel
                cv={cv}
                onChangeCV={setCv}
                template={templateObj}
                langue={langue}
                userTier={effectiveUserTier}
                onOpenUpgradeModal={() => onOpenPayment(cv)}
              />
            )}

            {/* 2. ASSISTANT (FORM WIZARD) TAB */}
            {activeTab === 'wizard' && (
              <div className="w-full min-h-[650px] flex flex-col">
                <FormWizard
                  cv={cv}
                  onChangeCV={setCv}
                  langue={langue}
                  userTier={effectiveUserTier}
                  onOpenUpgradeModal={() => onOpenPayment(cv)}
                  onFinishWizard={() => setActiveTab('style')}
                />
              </div>
            )}

            {/* 3. SECTIONS TAB */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                {/* 1 / 2 COLUMNS LAYOUT SELECTOR CARD */}
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                      <Columns className="w-4 h-4 text-black dark:text-white" />
                      <span>Disposition & Colonnes (1 ou 2 Colonnes)</span>
                      {isPaymentActive() && effectiveUserTier === 'freemium' && isSubOptionPaidByAdmin('template:column_layout', 'template') && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white flex items-center gap-1 shrink-0">
                          <Lock className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPaymentActive() && effectiveUserTier === 'freemium' && isSubOptionPaidByAdmin('template:column_layout', 'template')) {
                          onOpenPayment(cv);
                          return;
                        }
                        setCv(prev => toggleColumnLayout(prev, 1));
                      }}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        (cv.nombreColonnes || 2) === 1
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <span>1 Colonne Simple</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isPaymentActive() && effectiveUserTier === 'freemium' && isSubOptionPaidByAdmin('template:column_layout', 'template')) {
                          onOpenPayment(cv);
                          return;
                        }
                        setCv(prev => toggleColumnLayout(prev, 2));
                      }}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        (cv.nombreColonnes || 2) === 2
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <span>2 Colonnes</span>
                    </button>
                  </div>

                  {/* 2-Columns Settings */}
                  {(cv.nombreColonnes || 2) === 2 && (
                    <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCv(prev => ({ ...prev, positionSidebar: 'gauche' }))}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            (cv.positionSidebar || 'gauche') === 'gauche'
                              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                          }`}
                        >
                          Sidebar à Gauche
                        </button>
                        <button
                          type="button"
                          onClick={() => setCv(prev => ({ ...prev, positionSidebar: 'droite' }))}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            (cv.positionSidebar || 'gauche') === 'droite'
                              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                          }`}
                        >
                          Sidebar à Droite
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                          <span>Largeur de la Sidebar :</span>
                          <span className="text-black dark:text-white font-mono">{cv.largeurColonneGauche || 34}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="50"
                          value={cv.largeurColonneGauche || 34}
                          onChange={(e) => setCv(prev => ({ ...prev, largeurColonneGauche: parseInt(e.target.value) }))}
                          className="w-full accent-black dark:accent-white cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 1 / 2 PAGES A4 SELECTOR CARD */}
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-black dark:text-white" />
                      <span>Format d'Exportation & Pages (1 ou 2 Pages A4)</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400">
                      {cv.pageCibleMode === '2_pages' ? '2 Pages' : '1 Page A4'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCv(prev => ({ ...prev, pageCibleMode: '1_page' }))}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        cv.pageCibleMode !== '2_pages'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <span>1 Page A4 (Standard)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCv(prev => ({ ...prev, pageCibleMode: '2_pages' }))}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        cv.pageCibleMode === '2_pages'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <span>2 Pages A4</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    {cv.pageCibleMode === '2_pages'
                      ? 'Votre CV sera structuré et exporté sur 2 pages distinctes complètes.'
                      : 'Votre CV est calibré pour tenir parfaitement sur une seule page A4 sans déborder.'}
                  </p>
                </div>

                {/* DYNAMIC PHOTO CUSTOMIZATION SECTION */}
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                      <CameraIcon className="w-4 h-4 text-black dark:text-white" />
                      <span>Photo de Profil Personnalisée</span>
                    </label>
                    {cv.photoUrl && (
                      <span className="text-[10px] font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                        Totalement Dynamique
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {cv.photoUrl ? (
                      <div className="relative group shrink-0">
                        <img
                          src={cv.photoUrl}
                          alt="Profil"
                          className="object-cover border-2 border-black dark:border-white shadow-md transition-all"
                          style={{
                            width: `${cv.photoTaille || 72}px`,
                            height: `${cv.photoTaille || 72}px`,
                            borderRadius: cv.photoRayon !== undefined ? `${cv.photoRayon}px` : (
                              cv.photoForme === 'carree' ? '0px' :
                              cv.photoForme === 'arrondie' ? '12px' :
                              cv.photoForme === 'arche' ? '999px 999px 8px 8px' : '9999px'
                            )
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setCv(prev => ({ ...prev, photoUrl: undefined }))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110 cursor-pointer"
                          title="Supprimer la photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0">
                        <CameraIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <label className="inline-block px-4 py-2 bg-black hover:opacity-90 dark:bg-white dark:hover:opacity-90 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all">
                        <span>{cv.photoUrl ? 'Changer la photo' : 'Importer une photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Position, taille, forme et bordures 100% configurables en temps réel.
                      </p>
                    </div>
                  </div>

                  {/* ADVANCED DYNAMIC PHOTO CONTROLS (AVAILABLE WHEN PHOTO EXISTS) */}
                  {cv.photoUrl && (
                    <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3.5 animate-fadeIn">
                      
                      {/* 1. Size Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          <span>Taille de la photo :</span>
                          <span className="text-black dark:text-white font-mono">{cv.photoTaille || 80} px</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="220"
                          value={cv.photoTaille || 80}
                          onChange={(e) => setCv(prev => ({ ...prev, photoTaille: parseInt(e.target.value) }))}
                          className="w-full accent-black dark:accent-white cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                        />
                      </div>

                      {/* 2. Position / Emplacement */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Emplacement de la photo :</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCv(prev => ({ ...prev, photoPosition: 'in-header' }))}
                            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              (cv.photoPosition || 'in-header') === 'in-header'
                                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            Dans l'En-tête (Top)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCv(prev => ({ ...prev, photoPosition: 'in-sidebar' }))}
                            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              cv.photoPosition === 'in-sidebar'
                                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            Dans la Sidebar
                          </button>
                        </div>
                      </div>

                      {/* 3. Shape Selector & Custom Border Radius */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Forme de la photo :</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {[
                            { id: 'ronde', label: 'Ronde' },
                            { id: 'carree', label: 'Carrée' },
                            { id: 'arrondie', label: 'Arrondie' },
                            { id: 'arche', label: 'Arche' },
                            { id: 'hexagone', label: 'Hexagone' },
                            { id: 'galet', label: 'Galet' },
                          ].map(shape => (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => setCv(prev => ({ ...prev, photoForme: shape.id as any, photoRayon: undefined }))}
                              className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                                (cv.photoForme || 'ronde') === shape.id && cv.photoRayon === undefined
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                              }`}
                            >
                              {shape.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom Border Radius Slider */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                            <span>Rayon d'arrondi sur-mesure (0px = carré, 100px = rond) :</span>
                            <span className="text-black dark:text-white font-mono">{cv.photoRayon ?? (cv.photoForme === 'carree' ? 0 : 50)} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={cv.photoRayon ?? (cv.photoForme === 'carree' ? 0 : 50)}
                            onChange={(e) => setCv(prev => ({ ...prev, photoRayon: parseInt(e.target.value) }))}
                            className="w-full accent-black dark:accent-white cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* 4. Border Thickness & Color */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                            <span>Épaisseur de bordure :</span>
                            <span className="text-black dark:text-white font-mono">{cv.photoBordureEpaisseur ?? 2} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={cv.photoBordureEpaisseur ?? 2}
                            onChange={(e) => setCv(prev => ({ ...prev, photoBordureEpaisseur: parseInt(e.target.value) }))}
                            className="w-full accent-black dark:accent-white cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Couleur de bordure :</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={cv.photoBordureCouleur || '#FFFFFF'}
                              onChange={(e) => setCv(prev => ({ ...prev, photoBordureCouleur: e.target.value }))}
                              className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0.5 bg-white dark:bg-black"
                            />
                            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 uppercase">
                              {cv.photoBordureCouleur || '#FFFFFF'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* SECTIONS LIST WITH DND & CONTROLS */}
                <div className="bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-xl border border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={collapseAllSections}
                      className="px-2.5 py-1 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Réduire toutes les sections"
                    >
                      <FolderClosed className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Tout réduire</span>
                    </button>
                    <button
                      type="button"
                      onClick={expandAllSections}
                      className="px-2.5 py-1 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Déplier toutes les sections"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>Tout déplier</span>
                    </button>
                  </div>

                  {(cv.nombreColonnes || 2) === 2 && (
                    <div className="flex items-center space-x-1 bg-white dark:bg-black p-0.5 rounded-lg border border-black/10 dark:border-white/10 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setColumnFilter('toutes')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          columnFilter === 'toutes' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        Toutes ({cv.sections.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setColumnFilter('gauche')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          columnFilter === 'gauche' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        ◀ Col. Gauche ({(cv.sections || []).filter(s => (s.colonne || 'principale') === 'gauche').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setColumnFilter('droite')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          columnFilter === 'droite' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        ▶ Col. Droite ({(cv.sections || []).filter(s => (s.colonne || 'principale') === 'droite' || (s.colonne || 'principale') === 'principale').length})
                      </button>
                    </div>
                  )}
                </div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <SortableContext items={(cv.sections || []).map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {(cv.sections || [])
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
                                <ClearableInput
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
                                <ClearableInput
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
                                <ClearableInput
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
                                <ClearableInput
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
                                <ClearableInput
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
                                <ClearableInput
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

                            {/* GRAND TITRE EN-TÊTE & DÉPLACEMENT PHOTO */}
                            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300">Grand Titre de l'En-tête :</label>
                                  <select
                                    value={cv.grandTitreMode || 'nom'}
                                    onChange={(e) => setCv(prev => ({ ...prev, grandTitreMode: e.target.value as any }))}
                                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
                                  >
                                    <option value="nom">Prénom & Nom (Par défaut)</option>
                                    <option value="poste">Intitulé de Poste en grand</option>
                                    <option value="custom">Titre Personnalisé (Libre)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300">Emplacement de la Photo :</label>
                                  <select
                                    value={cv.photoPosition || 'in-header'}
                                    onChange={(e) => setCv(prev => ({ ...prev, photoPosition: e.target.value as any }))}
                                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
                                  >
                                    <option value="in-header">En-tête (Haut)</option>
                                    <option value="in-sidebar">Sidebar (Colonne)</option>
                                    <option value="free">Libre (Déplaçable à la souris)</option>
                                  </select>
                                </div>
                              </div>

                              {cv.grandTitreMode === 'custom' && (
                                <div>
                                  <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Texte du Grand Titre Personnalisé :</label>
                                  <ClearableInput
                                    type="text"
                                    value={cv.grandTitreTexte || ''}
                                    onChange={(e) => setCv(prev => ({ ...prev, grandTitreTexte: e.target.value }))}
                                    className="w-full px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-lg outline-none"
                                    placeholder="ex: ARCHITECTE CLOUD & CONSULTANT DIGITAL"
                                  />
                                </div>
                              )}

                              {/* PHOTO SLIDERS POSITION X & Y */}
                              <div className="pt-2 border-t border-blue-200 dark:border-blue-800/60">
                                <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  <span>Position Horizontale (X) & Verticale (Y)</span>
                                  <span className="font-mono text-blue-600">X: {cv.photoX ?? 10}% | Y: {cv.photoY ?? 5}%</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-[10px] text-slate-500">X ({cv.photoX ?? 10}%)</span>
                                    <input
                                      type="range"
                                      min={0}
                                      max={95}
                                      value={cv.photoX ?? 10}
                                      onChange={(e) => setCv(prev => ({ ...prev, photoX: parseInt(e.target.value, 10), photoPosition: 'free' }))}
                                      className="w-full accent-blue-600 cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500">Y ({cv.photoY ?? 5}%)</span>
                                    <input
                                      type="range"
                                      min={0}
                                      max={95}
                                      value={cv.photoY ?? 5}
                                      onChange={(e) => setCv(prev => ({ ...prev, photoY: parseInt(e.target.value, 10), photoPosition: 'free' }))}
                                      className="w-full accent-blue-600 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                              {/* PROFILE BACKGROUND & TEXT COLOR */}
                              <div className="pt-2 border-t border-blue-200 dark:border-blue-800/60">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Couleur de fond du profil :</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={cv.couleurFondProfil || sec.styleSection?.couleurFond || cv.couleurAccent || '#2563EB'}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCv(prev => ({
                                            ...prev,
                                            couleurFondProfil: val,
                                            sections: prev.sections.map(s => s.id === sec.id ? {
                                              ...s,
                                              styleSection: { ...(s.styleSection || {}), couleurFond: val }
                                            } : s)
                                          }));
                                        }}
                                        className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                                      />
                                      <input
                                        type="text"
                                        value={cv.couleurFondProfil || sec.styleSection?.couleurFond || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCv(prev => ({
                                            ...prev,
                                            couleurFondProfil: val,
                                            sections: prev.sections.map(s => s.id === sec.id ? {
                                              ...s,
                                              styleSection: { ...(s.styleSection || {}), couleurFond: val }
                                            } : s)
                                          }));
                                        }}
                                        placeholder="ex: #2563EB"
                                        className="flex-1 px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                      />
                                      {(cv.couleurFondProfil || sec.styleSection?.couleurFond) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCv(prev => ({
                                              ...prev,
                                              couleurFondProfil: undefined,
                                              sections: prev.sections.map(s => s.id === sec.id ? {
                                                ...s,
                                                styleSection: { ...(s.styleSection || {}), couleurFond: undefined }
                                              } : s)
                                            }));
                                          }}
                                          className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Couleur de texte du profil :</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={cv.couleurTexteProfil || sec.styleSection?.couleurTexte || '#FFFFFF'}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCv(prev => ({
                                            ...prev,
                                            couleurTexteProfil: val,
                                            sections: prev.sections.map(s => s.id === sec.id ? {
                                              ...s,
                                              styleSection: { ...(s.styleSection || {}), couleurTexte: val }
                                            } : s)
                                          }));
                                        }}
                                        className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                                      />
                                      <input
                                        type="text"
                                        value={cv.couleurTexteProfil || sec.styleSection?.couleurTexte || '#FFFFFF'}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCv(prev => ({
                                            ...prev,
                                            couleurTexteProfil: val,
                                            sections: prev.sections.map(s => s.id === sec.id ? {
                                              ...s,
                                              styleSection: { ...(s.styleSection || {}), couleurTexte: val }
                                            } : s)
                                          }));
                                        }}
                                        placeholder="#FFFFFF"
                                        className="flex-1 px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                                  <ClearableInput
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
                              <div key={sk.id || `edit-sk-${skIdx}`} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                                {/* Header bar with index, order, delete */}
                                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center space-x-0.5">
                                      <button
                                        type="button"
                                        disabled={skIdx === 0}
                                        onClick={() => moveSubItem(sec.id, skIdx, skIdx - 1)}
                                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer transition-colors"
                                        title="Monter cette compétence"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={skIdx === (sec.contenu as CompetenceItem[]).length - 1}
                                        onClick={() => moveSubItem(sec.id, skIdx, skIdx + 1)}
                                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded cursor-pointer transition-colors"
                                        title="Descendre cette compétence"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      #{skIdx + 1}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {sk.niveau !== undefined ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                        ⭐ {sk.niveau}/10
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.contenu as CompetenceItem[])];
                                          list[skIdx].niveau = 8;
                                          setCv(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                          }));
                                        }}
                                        className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
                                      >
                                        + Niveau
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = (sec.contenu as CompetenceItem[]).filter((_, i) => i !== skIdx);
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg cursor-pointer transition-colors"
                                      title="Supprimer cette compétence"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Skill Name */}
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Intitulé de la compétence
                                  </label>
                                  <ClearableInput
                                    type="text"
                                    value={sk.nom}
                                    placeholder="Ex: Développement Full-Stack, Gestion de projet..."
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].nom = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  />
                                </div>

                                {/* Optional Subtitle / Specialization */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                    Précision / Spécialisation (optionnel)
                                  </label>
                                  <ClearableInput
                                    type="text"
                                    value={sk.sousTitre || ''}
                                    placeholder="Ex: Scrum, REST APIs, Microservices..."
                                    onChange={(e) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].sousTitre = e.target.value;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    className="w-full px-3 py-1 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg"
                                  />
                                </div>

                                {/* Optional Level Slider */}
                                {sk.niveau !== undefined && (
                                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-bold text-slate-600 dark:text-slate-400">
                                        Niveau de maîtrise: {sk.niveau}/10
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.contenu as CompetenceItem[])];
                                          list[skIdx].niveau = undefined;
                                          setCv(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                          }));
                                        }}
                                        className="text-red-500 hover:underline cursor-pointer"
                                      >
                                        Retirer
                                      </button>
                                    </div>
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={sk.niveau}
                                      onChange={(e) => {
                                        const list = [...(sec.contenu as CompetenceItem[])];
                                        list[skIdx].niveau = Number(e.target.value);
                                        setCv(prev => ({
                                          ...prev,
                                          sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                        }));
                                      }}
                                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                  </div>
                                )}

                                {/* Sub-competences / Tools manager */}
                                <div className="pt-1">
                                  <SubCompetenceManager
                                    items={sk.listSousCompetences || []}
                                    onChange={(newSubs) => {
                                      const list = [...(sec.contenu as CompetenceItem[])];
                                      list[skIdx].listSousCompetences = newSubs;
                                      setCv(prev => ({
                                        ...prev,
                                        sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                      }));
                                    }}
                                    langue={langue}
                                    label="Outils & mots-clés associés"
                                    placeholder="+ Outil..."
                                    allowRating={true}
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const list = [...(sec.contenu as CompetenceItem[] || [])];
                                list.push({
                                  id: `sk-${Date.now()}`,
                                  nom: 'Nouvelle compétence',
                                  niveau: undefined,
                                  categorie: 'technique',
                                  listSousCompetences: []
                                });
                                setCv(prev => ({
                                  ...prev,
                                  sections: prev.sections.map(s => s.id === sec.id ? { ...s, contenu: list } : s)
                                }));
                              }}
                              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                                  <ClearableInput
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
                                  <ClearableInput
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
          <div className={`md:col-span-6 sticky top-24 self-start ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                <span>Rendu A4 Temps Réel</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">Format d'impression officiel A4</span>
              </div>

              <CVPreview
                cv={cv}
                userTier={effectiveUserTier}
                user={user}
                onMoveSectionUp={handleMoveSectionUp}
                onMoveSectionDown={handleMoveSectionDown}
                onUpdateColor={(color) => setCv(prev => ({ ...prev, couleurAccent: color }))}
                onUpdatePhotoShape={(shape) => setCv(prev => ({ ...prev, photoForme: shape }))}
                onUpdatePhotoSize={(size) => setCv(prev => ({ ...prev, photoTaille: size }))}
                onSectionsReorder={handleSectionsReorder}
                onUpdateSectionZone={handleUpdateSectionZone}
                onUpdateCV={(updated) => setCv(prev => ({ ...prev, ...updated }))}
                interactivePreview={true}
              />
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE BOTTOM TOOLBAR (STRICTLY MONOCHROME BLACK & WHITE) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-black/15 dark:border-white/20 px-2 py-2 flex items-center justify-between md:hidden shadow-2xl safe-area-bottom">
        {/* Assistant / Wizard */}
        <button
          type="button"
          onClick={() => { setEditorMode('form'); setActiveTab('wizard'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'wizard' && editorMode === 'form'
              ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-bold">Assistant</span>
        </button>

        {/* Sections */}
        <button
          type="button"
          onClick={() => { setEditorMode('form'); setActiveTab('sections'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sections' && editorMode === 'form'
              ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-bold">Sections</span>
        </button>

        {/* Studio / Design */}
        <button
          type="button"
          onClick={() => { setEditorMode('form'); setActiveTab('style'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'style' && editorMode === 'form'
              ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-bold">Design</span>
        </button>

        {/* Aperçu Plein Écran */}
        <button
          type="button"
          onClick={() => setShowMobilePreviewModal(true)}
          className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-md cursor-pointer active:scale-95 transition-transform"
        >
          <Eye className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-bold">Aperçu</span>
        </button>

        {/* Télécharger / Exporter - Icon Only */}
        <button
          type="button"
          onClick={() => setShowExportMenu(true)}
          className="flex items-center justify-center p-2 rounded-xl bg-white text-black dark:bg-black dark:text-white border-2 border-black dark:border-white shadow-md cursor-pointer active:scale-95 transition-transform"
          title="Télécharger le CV"
          aria-label="Télécharger"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* MOBILE FULLSCREEN PREVIEW MODAL (ZERO PADDING, PROPORTIONAL FIT & ZOOM/DEZOOM) */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-between overflow-hidden animate-fadeIn">
          {/* Header Controls (Black & White) */}
          <div className="w-full bg-white dark:bg-black border-b border-black/15 dark:border-white/20 px-3 py-2 flex items-center justify-between shadow-sm shrink-0">
            <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Aperçu A4</span>
            </span>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/10 dark:border-white/15">
              <button
                type="button"
                onClick={() => setMobileZoom(prev => Math.max(0.25, parseFloat((prev - 0.08).toFixed(2))))}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg text-black dark:text-white cursor-pointer transition-colors"
                title="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-mono font-bold px-1 min-w-9 text-center text-black dark:text-white">
                {Math.round(mobileZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setMobileZoom(prev => Math.min(1.5, parseFloat((prev + 0.08).toFixed(2))))}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg text-black dark:text-white cursor-pointer transition-colors"
                title="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileZoom(getFitZoom())}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg text-black dark:text-white cursor-pointer transition-colors hidden xs:block"
                title="Ajuster à l'écran"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowExportMenu(true)}
                className="p-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer border border-black dark:border-white shadow-xs"
                title="Télécharger le CV"
                aria-label="Télécharger"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
              </button>
              
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="p-1.5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scaled Preview Canvas Body (Zero outer padding to take 100% full screen width proportions) */}
          <div className="w-full flex-1 overflow-auto flex items-start justify-center p-0 bg-white dark:bg-black touch-pan-x touch-pan-y">
            <div
              style={{
                width: '794px',
                transform: `scale(${mobileZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease-out',
                marginBottom: `${(1 - mobileZoom) * -1123}px`
              }}
              className="shrink-0 bg-white shadow-xl overflow-hidden"
            >
              <CVPreview
                cv={cv}
                userTier={effectiveUserTier}
                user={user}
                onSectionsReorder={handleSectionsReorder}
                onUpdateSectionZone={handleUpdateSectionZone}
                onUpdateCV={(updated) => setCv(prev => ({ ...prev, ...updated }))}
                interactivePreview={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* MULTI-FORMAT EXPORT MODAL WITH STRICT AUTHENTICATION */}
      {!isAdminTemplateBuilder && showExportMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-black dark:text-white">Exporter votre CV</h3>
                  <p className="text-[11px] text-neutral-500">Choisissez votre format de téléchargement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportMenu(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth status indicator */}
            {!user ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black">Connexion obligatoire :</span>
                  <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                    Vous devez vous connecter ou créer un compte gratuit pour télécharger votre CV (PDF, PNG ou autres formats).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Connecté ({user.email || user.name})</span>
                </div>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-emerald-600 text-white rounded">
                  {user.role === 'ADMIN' ? 'PREMIUM (ADMIN)' : (effectiveUserTier || 'Freemium').toUpperCase()}
                </span>
              </div>
            )}

            {/* Formats Grid */}
            <div className="space-y-2">
              {/* 1. PDF Standard */}
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:border-black dark:hover:border-white text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-black text-xs">
                    PDF
                  </div>
                  <div>
                    <span className="font-bold text-xs text-black dark:text-white block group-hover:underline">
                      Document PDF Haute Définition (.pdf)
                    </span>
                    <span className="text-[10px] text-neutral-500">Idéal pour l'impression et les candidatures</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
              </button>

              {/* 2. Image PNG */}
              <button
                type="button"
                onClick={handleExportImage}
                className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:border-black dark:hover:border-white text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-black text-xs">
                    PNG
                  </div>
                  <div>
                    <span className="font-bold text-xs text-black dark:text-white block group-hover:underline">
                      Image Haute Résolution (.png)
                    </span>
                    <span className="text-[10px] text-neutral-500">Pour aperçu rapide, web ou réseaux sociaux</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
              </button>

              {/* 3. Word (.doc) Multi-format */}
              <button
                type="button"
                onClick={handleExportWord}
                className="w-full p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/30 hover:border-purple-500 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                    DOC
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-black dark:text-white block group-hover:underline">
                        Microsoft Word (.doc)
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-purple-600 text-white rounded">
                        PRO
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500">Format modifiable sous Word & OpenOffice</span>
                  </div>
                </div>
                {effectiveUserTier === 'freemium' ? (
                  <Lock className="w-4 h-4 text-purple-600" />
                ) : (
                  <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                )}
              </button>

              {/* 4. JSON Structuré */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/30 hover:border-purple-500 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                    JSON
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-black dark:text-white block group-hover:underline">
                        Données JSON Structurées (.json)
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-purple-600 text-white rounded">
                        PRO
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500">Sauvegarde brute & compatibilité ATS</span>
                  </div>
                </div>
                {effectiveUserTier === 'freemium' ? (
                  <Lock className="w-4 h-4 text-purple-600" />
                ) : (
                  <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                )}
              </button>

              {/* 5. Texte Brut */}
              <button
                type="button"
                onClick={handleExportPlainText}
                className="w-full p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/30 hover:border-purple-500 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center font-black text-xs">
                    TXT
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-black dark:text-white block group-hover:underline">
                        Fichier Texte Brut (.txt)
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-purple-600 text-white rounded">
                        PRO
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500">Texte épuré sans mise en forme</span>
                  </div>
                </div>
                {effectiveUserTier === 'freemium' ? (
                  <Lock className="w-4 h-4 text-purple-600" />
                ) : (
                  <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                )}
              </button>
            </div>

            {!user && (
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-90"
              >
                <span>Se connecter / S'inscrire</span>
              </button>
            )}

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

      {/* AI Career Studio Modal */}
      {showCareerModal && (
        <CareerToolsModal
          isOpen={showCareerModal}
          onClose={() => setShowCareerModal(false)}
          cv={cv}
          langue={langue}
          initialTab={careerModalTab}
          onApplyPersonalizedCV={(personalizedCV) => {
            setCv(personalizedCV);
          }}
        />
      )}

      {/* Paid Feature Usage Export Lock Modal */}
      {showPaidExportModal && (
        <PaidUsageExportModal
          isOpen={showPaidExportModal}
          langue={langue}
          paidUsages={detectedPaidUsages}
          onClose={() => setShowPaidExportModal(false)}
          onUpgrade={(tier) => {
            setShowPaidExportModal(false);
            onOpenPayment(cv);
          }}
          onResetToFreeDefaults={handleResetToFreeDefaults}
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
