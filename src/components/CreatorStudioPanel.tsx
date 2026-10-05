import React, { useState, useEffect } from 'react';
import { CV, CVTemplate, CustomPreset, Language, SubscriptionTier, Section } from '../types';
import { CV_TEMPLATES, FONT_OPTIONS, canUseDecorativeWave } from '../data/templates';
import { remapContentToTemplate, toggleColumnLayout } from '../state/cvActions';
import { HeaderProfileModal } from '../editor/HeaderProfileModal';
import { getTranslation, getLocalizedTemplateName, getLocalizedSectionTitle } from '../i18n/translations';
import { FREE_TEMPLATE_IDS } from '../utils/subscriptionGates';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import {
  Palette,
  Layout,
  Type,
  RotateCcw,
  Save,
  Check,
  Grid,
  User,
  Columns,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Lock,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  SlidersHorizontal,
  Paintbrush,
  CircleDot,
  List,
  Contact,
  Box,
  Frame,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Crown
} from 'lucide-react';

interface CreatorStudioPanelProps {
  cv: CV;
  onChangeCV: (updatedCV: CV) => void;
  template: CVTemplate;
  langue?: Language;
  userTier?: SubscriptionTier;
  onOpenUpgradeModal?: (tier?: 'classique' | 'premium') => void;
}

export const CreatorStudioPanel: React.FC<CreatorStudioPanelProps> = ({
  cv,
  onChangeCV,
  template,
  langue = 'fr' as Language,
  userTier = 'freemium',
  onOpenUpgradeModal
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue as Language, key);
  const isEn = langue === 'en';
  const isAr = langue === 'ar';

  const [selectedSectionId, setSelectedSectionId] = useState<string>(cv.sections[0]?.id || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [menuCategory, setMenuCategory] = useState<'all' | 'structure' | 'colors' | 'typography' | 'elements' | 'sections'>('all');
  
  // Section Accordion State - Chronological CV order
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    photo: true,
    header: true,
    template: false,
    sidebar: false,
    individualSection: false,
    experiences: false,
    formations: false,
    skills: false,
    sectionHeaders: false,
    bullets: false,
    contactBadges: false,
    timeline: false,
    typography: false,
    titlesCase: false,
    background: false,
    shadows: false,
    footerContact: false,
    footer: false,
    pageCalibration: false
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSectionVisible = (key: string) => {
    if (menuCategory === 'all') return true;
    if (menuCategory === 'structure') {
      return ['photo', 'header', 'template', 'sidebar', 'pageCalibration'].includes(key);
    }
    if (menuCategory === 'sections') {
      return ['individualSection', 'experiences', 'formations', 'skills'].includes(key);
    }
    if (menuCategory === 'typography') {
      return ['sectionHeaders', 'bullets', 'typography', 'titlesCase'].includes(key);
    }
    if (menuCategory === 'colors') {
      return ['background', 'shadows'].includes(key);
    }
    if (menuCategory === 'elements') {
      return ['contactBadges', 'timeline', 'footerContact', 'footer'].includes(key);
    }
    return true;
  };

  const normTier = (userTier || '').toString().toLowerCase();
  const isFreemium = normTier !== 'premium' && normTier !== 'admin' && normTier !== 'classique' && normTier !== 'decouverte';

  const isUserRestrictedCustomTemplate = Boolean(template?.id && template.id.startsWith('custom-') && normTier !== 'admin');
  const canCustomizeDecorativeWaves = canUseDecorativeWave(cv.templateId || template?.id);
  const FREE_STUDIO_MENU_IDS = new Set(['template', 'timeline', 'sectionHeaders', 'footer']);
  const restrictedCustomMenuIds = new Set(['background', 'header', 'sectionHeaders', 'photo', 'footer', 'footerContact', 'sidebar']);
  const restrictedCustomSubOptions = new Set([
    'sectionHeaders:underline',
    'sectionHeaders:color',
    'sectionHeaders:font_size',
    'header:bg_color',
    'header:title_color',
    'header:subtitle_color',
    'photo:shapes',
    'footer:style',
    'footerContact:style'
  ]);

  // Helper to check if a menu or sub-option is locked for current user
  const checkIsLocked = (menuId: string, subOptionId?: string): boolean => {
    if (!isPaymentActive()) return false;
    if (isUserRestrictedCustomTemplate) {
      const isAllowedMenu = restrictedCustomMenuIds.has(menuId);
      const isAllowedSubOption = subOptionId ? restrictedCustomSubOptions.has(subOptionId) : false;
      return !(isAllowedMenu || isAllowedSubOption);
    }
    if (!isFreemium) return false;
    return !FREE_STUDIO_MENU_IDS.has(menuId);
  };

  // Helper for label rendering with padlock badge
  const OptionLabel: React.FC<{ label: string; isLocked?: boolean; isFreeBadge?: boolean; isCurrentlyActiveAndLocked?: boolean }> = ({ label, isLocked, isFreeBadge, isCurrentlyActiveAndLocked }) => (
    <div className="flex items-center justify-between gap-1 mb-1">
      <span className={`text-xs font-bold flex items-center gap-1.5 ${isCurrentlyActiveAndLocked ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-black dark:text-white'}`}>
        <span>{label}</span>
        {isLocked && <Lock className={`w-3.5 h-3.5 shrink-0 ${isCurrentlyActiveAndLocked ? 'text-red-500' : 'text-purple-600 dark:text-purple-400'}`} />}
      </span>
      {isCurrentlyActiveAndLocked ? (
        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white flex items-center gap-1 shrink-0 shadow-2xs">
          ⚠️ PAYANT ACTIF (SANS FORFAIT)
        </span>
      ) : isLocked ? (
        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-400/50 flex items-center gap-1 shrink-0 shadow-2xs">
          <Crown className="w-2.5 h-2.5 fill-current" />
        </span>
      ) : isFreeBadge ? (
        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">
          Gratuit
        </span>
      ) : null}
    </div>
  );

  // Helper to determine styling for option buttons & cards (RED highlight if selected & locked without paid tier)
  const getOptionStyleClass = (isSelected: boolean, isLocked: boolean, isSecondaryButton: boolean = false) => {
    if (isSelected && isLocked) {
      return 'border-2 border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 font-extrabold shadow-[0_0_14px_rgba(239,68,68,0.4)] ring-2 ring-red-500/50';
    }
    if (isSelected) {
      return 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs';
    }
    if (isLocked) {
      return isSecondaryButton
        ? 'border-purple-300/80 dark:border-purple-800/60 bg-purple-50/20 dark:bg-purple-950/20 text-neutral-800 dark:text-neutral-200 hover:border-purple-500'
        : 'border-purple-300/80 dark:border-purple-800/60 bg-purple-50/10 dark:bg-purple-950/10 text-neutral-800 dark:text-neutral-200 hover:border-purple-500';
    }
    return isSecondaryButton
      ? 'border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white hover:border-black/30'
      : 'border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white hover:border-black/30';
  };

  // Helper to intercept click/change on locked inputs (always executes action so user sees real-time CV effect, and shows toast notification)
  const triggerUpgradeIfLocked = (isLocked: boolean, action: () => void) => {
    action();
    if (isLocked) {
      setSaveSuccessMsg("Option payante appliquée sur le CV (Aperçu visible • Souscription requise pour l'export).");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const isRestrictedCustomTemplate = Boolean(template?.id && template.id.startsWith('custom-'));
  const allowedCustomTemplateFields = new Set<keyof CV>([
    'couleurAccent',
    'couleurAccentSecondaire',
    'couleurFond',
    'couleurTexte',
    'couleurFondSidebar',
    'couleurTexteSidebar',
    'couleurTitreSection',
    'styleEnTeteSection',
    'footerStyle',
    'footerBackgroundColor',
    'footerTextColor',
    'photoFrameStyle',
    'cadrePhotoRing',
    'formeSidebarDecor',
    'sidebarBackgroundType',
    'positionSidebar',
    'largeurColonneGauche'
  ]);

  // Helper to update CV root properties
  const updateCvProp = (key: keyof CV, value: any) => {
    if (isRestrictedCustomTemplate && normTier !== 'admin' && !allowedCustomTemplateFields.has(key)) {
      setSaveSuccessMsg('Ce modèle est gratuit et limité aux changements de couleur, photo, titres de section et pied de page.');
      setTimeout(() => setSaveSuccessMsg(null), 2600);
      return;
    }
    onChangeCV({ ...cv, [key]: value });
  };

  // Helper to update a section's custom style
  const updateSectionStyle = (secId: string, patch: any) => {
    if (isRestrictedCustomTemplate && normTier !== 'admin') {
      const allowedPatchKeys = ['couleurFond', 'couleurTexte', 'couleurTitre', 'alignementTitre', 'tailleTitre', 'casseTitre', 'styleEntete'];
      const hasDisallowedPatch = Object.keys(patch).some((key) => !allowedPatchKeys.includes(key));
      if (hasDisallowedPatch) {
        setSaveSuccessMsg('Ce modèle personnalisé est limité aux couleurs, aux titres et au pied de page.');
        setTimeout(() => setSaveSuccessMsg(null), 2600);
        return;
      }
    }

    const updatedSections = cv.sections.map((sec) => {
      if (sec.id !== secId) return sec;
      const currentStyle = sec.styleSection || {};
      return {
        ...sec,
        styleSection: {
          ...currentStyle,
          ...patch
        }
      };
    });
    onChangeCV({ ...cv, sections: updatedSections });
  };

  // Switch Template without losing data
  const handleSelectTemplate = (targetTmpl: CVTemplate) => {
    if (cv.templateId === targetTmpl.id) return;
    const remappedCV = remapContentToTemplate(cv, targetTmpl);
    onChangeCV(remappedCV);
    const locName = getLocalizedTemplateName(targetTmpl, langue as Language);
    setSaveSuccessMsg(`Modèle appliqué : "${locName.split('—')[0]}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Toggle Column Layout
  const handleToggleColumns = (targetCols: 1 | 2) => {
    const updated = toggleColumnLayout(cv, targetCols);
    onChangeCV(updated);
  };

  // Reset custom studio styles to default template theme
  const handleResetToTemplateDefault = () => {
    const theme = template.themeConfig || {};
    onChangeCV({
      ...cv,
      couleurAccent: template.defaultAccent || theme.primaryColor || '#18181B',
      couleurAccentSecondaire: template.defaultSecondaryAccent || theme.secondaryColor || '#F4F4F5',
      couleurFond: theme.backgroundColor || '#FFFFFF',
      couleurFondSidebar: undefined,
      couleurFondProfil: undefined,
      couleurTexteProfil: undefined,
      couleurTexte: theme.textColor || '#18181B',
      couleurTexteSidebar: theme.sidebarTextColor || '#18181B',
      couleurTitreSection: theme.headingColor || template.defaultAccent || '#18181B',
      police: template.defaultFont || 'Inter',
      alignementTitresSection: 'left',
      alignementTitreSection: 'left',
      casseTitresSection: 'uppercase',
      casseTitreSection: 'uppercase',
      taillePoliceValeur: 9,
      hauteurLigneValeur: 1.5,
      tailleTitreSectionValeur: 11,
      largeurColonneGauche: theme.defaultLeftWidth || 34,
      margeGlobalePage: 0,
      styleEnTete: theme.headerStyle || 'banner',
      styleEnTeteSection: theme.sectionHeaderStyle || 'underline',
      arrierePlanPattern: 'none',
      calqueDecoratif: 'none',
      timelineStyle: 'none',
      stylePucesListes: 'disc',
      photoForme: 'ronde',
      cadrePhotoRing: 'none',
      styleBadgesCoordonnees: 'none'
    });
    setSaveSuccessMsg('Styles réinitialisés aux valeurs par défaut');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Save current style as Custom Preset in localStorage
  const handleSaveCustomPreset = () => {
    const presetName = prompt('Nom de votre style sur-mesure') || 'Mon Style';
    const newPreset: CustomPreset = {
      id: `preset-custom-${Date.now()}`,
      name: presetName,
      updatedAt: new Date().toISOString(),
      cvData: {
        couleurAccent: cv.couleurAccent,
        couleurAccentSecondaire: cv.couleurAccentSecondaire,
        couleurFond: cv.couleurFond,
        couleurFondSidebar: cv.couleurFondSidebar,
        couleurFondProfil: cv.couleurFondProfil,
        couleurTexteProfil: cv.couleurTexteProfil,
        couleurTexte: cv.couleurTexte,
        couleurTexteSidebar: cv.couleurTexteSidebar,
        couleurTitreSection: cv.couleurTitreSection,
        police: cv.police,
        alignementTitreSection: cv.alignementTitreSection,
        casseTitreSection: cv.casseTitreSection,
        styleEnTete: cv.styleEnTete,
        styleEnTeteSection: cv.styleEnTeteSection
      }
    };

    try {
      const existingPresetsRaw = localStorage.getItem('cv_custom_presets');
      const existingPresets: CustomPreset[] = existingPresetsRaw ? JSON.parse(existingPresetsRaw) : [];
      existingPresets.push(newPreset);
      localStorage.setItem('cv_custom_presets', JSON.stringify(existingPresets));
      setSaveSuccessMsg(`Style "${presetName}" sauvegardé !`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save preset', err);
    }
  };

  const selectedSection = cv.sections.find((s) => s.id === selectedSectionId) || cv.sections[0];

  return (
    <div className="space-y-4 text-black dark:text-white bg-neutral-50 dark:bg-neutral-950 p-2 sm:p-3 rounded-2xl">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold flex items-center justify-between border border-black/20 dark:border-white/20 shadow-md transition-all">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="p-4 bg-black text-white dark:bg-white dark:text-black rounded-xl border border-black/20 dark:border-white/20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black flex items-center justify-center border border-white/20 dark:border-black/20">
            <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">Studio & Style du CV</h3>
            <p className="text-[11px] opacity-80">15+ Outils d'édition, typographies gratuites & personnalisation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToTemplateDefault}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 dark:border-black/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={handleSaveCustomPreset}
            className="px-3 py-1.5 bg-white text-black dark:bg-black dark:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-black/20 dark:border-white/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>

      {/* CATEGORY QUICK FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar select-none">
        <button
          type="button"
          onClick={() => setMenuCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
            menuCategory === 'all'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100'
          }`}
        >
          {isEn ? 'All (19 Menus)' : isAr ? 'الكل (19 قائمة)' : 'Tous (19 Menus)'}
        </button>
        <button
          type="button"
          onClick={() => setMenuCategory('structure')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
            menuCategory === 'structure'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100'
          }`}
        >
          📐 {isEn ? 'Structure' : isAr ? 'الهيكل' : 'Structure'}
        </button>
        <button
          type="button"
          onClick={() => setMenuCategory('colors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
            menuCategory === 'colors'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100'
          }`}
        >
          🎨 {isEn ? 'Themes & Colors' : isAr ? 'الثيمات والألوان' : 'Thèmes & Couleurs'}
        </button>
        <button
          type="button"
          onClick={() => setMenuCategory('typography')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
            menuCategory === 'typography'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100'
          }`}
        >
          📝 {isEn ? 'Fonts & Titles' : isAr ? 'الخطوط والعناوين' : 'Polices & Titres'}
        </button>
        <button
          type="button"
          onClick={() => setMenuCategory('elements')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
            menuCategory === 'elements'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100'
          }`}
        >
          📌 {isEn ? 'Elements & Footers' : isAr ? 'العناصر والتذييل' : 'Éléments & Footers'}
        </button>
        <button
          type="button"
          onClick={() => setMenuCategory('sections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
            menuCategory === 'sections'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100'
          }`}
        >
          💼 {isEn ? 'Sections' : isAr ? 'الأقسام' : 'Sections'}
        </button>
      </div>

      {/* 1. SÉLECTION DU MODÈLE & CADENAS */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('template')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Grid className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '3. CV Template Choice & Presets' : isAr ? '3. اختيار نموذج السيرة الذاتية والإعدادات' : '3. Choix du Modèle de CV & Préréglages'}</span>
            {checkIsLocked('template') && (
              <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 bg-purple-600 text-white rounded">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </label>
          {openSections.template ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.template && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
              {CV_TEMPLATES.map((tmpl) => {
                const isSelected = cv.templateId === tmpl.id;
                const isLocked = isPaymentActive() && isFreemium && tmpl.requiredTier !== 'freemium';
                const localizedName = getLocalizedTemplateName(tmpl, langue as Language);
                const buttonClass = getOptionStyleClass(isSelected, isLocked);

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      handleSelectTemplate(tmpl);
                      if (isLocked) {
                        setSaveSuccessMsg(`Modèle payant "${localizedName.split('—')[0]}" appliqué sur le CV ! Entouré de rouge (Souscription requise pour l'export).`);
                        setTimeout(() => setSaveSuccessMsg(null), 4000);
                      }
                    }}
                    className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer relative flex flex-col justify-between ${buttonClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <span className="text-[10px] uppercase font-black truncate">
                          {localizedName.split('—')[0]}
                        </span>
                        {isSelected && isLocked ? (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                        ) : isSelected ? (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-black/30 dark:border-white/30" style={{ backgroundColor: tmpl.defaultAccent }} />
                        {tmpl.defaultSecondaryAccent && (
                          <div className="w-3 h-3 rounded-full border border-black/30 dark:border-white/30" style={{ backgroundColor: tmpl.defaultSecondaryAccent }} />
                        )}
                      </div>
                      {isSelected && isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase px-1.5 py-0.5 bg-red-600 text-white rounded shadow-2xs">
                          ⚠️ ACTIF SANS FORFAIT
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 bg-purple-600 text-white rounded">
                          <Lock className="w-2.5 h-2.5" />
                          <span>PRO</span>
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Structure Colonnes & Position Sidebar */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <OptionLabel 
                    label="Disposition 1 / 2 Colonnes" 
                    isLocked={checkIsLocked('template', 'template:column_layout')}
                    isCurrentlyActiveAndLocked={checkIsLocked('template', 'template:column_layout') && cv.nombreColonnes === 1}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const isLocked = checkIsLocked('template', 'template:column_layout');
                        triggerUpgradeIfLocked(isLocked, () => handleToggleColumns(1));
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        getOptionStyleClass(cv.nombreColonnes === 1, checkIsLocked('template', 'template:column_layout'), true)
                      }`}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      <span>1 Colonne</span>
                      {checkIsLocked('template', 'template:column_layout') && <Lock className="w-3 h-3 text-purple-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const isLocked = checkIsLocked('template', 'template:column_layout');
                        triggerUpgradeIfLocked(isLocked, () => handleToggleColumns(2));
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        getOptionStyleClass(cv.nombreColonnes !== 1, checkIsLocked('template', 'template:column_layout'), true)
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>2 Colonnes</span>
                      {checkIsLocked('template', 'template:column_layout') && <Lock className="w-3 h-3 text-purple-400" />}
                    </button>
                  </div>
                </div>

                {cv.nombreColonnes !== 1 && (
                  <div className="space-y-1.5">
                    <OptionLabel 
                      label="Position de la Sidebar" 
                      isLocked={checkIsLocked('template', 'template:sidebar_position')}
                      isCurrentlyActiveAndLocked={checkIsLocked('template', 'template:sidebar_position') && cv.positionSidebar === 'droite'}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const isLocked = checkIsLocked('template', 'template:sidebar_position');
                          triggerUpgradeIfLocked(isLocked, () => updateCvProp('positionSidebar', 'gauche'));
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          getOptionStyleClass((cv.positionSidebar || 'gauche') === 'gauche', checkIsLocked('template', 'template:sidebar_position'), true)
                        }`}
                      >
                        <span>À Gauche</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const isLocked = checkIsLocked('template', 'template:sidebar_position');
                          triggerUpgradeIfLocked(isLocked, () => updateCvProp('positionSidebar', 'droite'));
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          getOptionStyleClass(cv.positionSidebar === 'droite', checkIsLocked('template', 'template:sidebar_position'), true)
                        }`}
                      >
                        <span>À Droite</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {cv.nombreColonnes !== 1 && (
                <div className="space-y-1.5 pt-1">
                  <OptionLabel 
                    label={`Largeur de la Sidebar (${cv.largeurColonneGauche || 34}%)`} 
                    isLocked={checkIsLocked('template', 'template:sidebar_width')} 
                  />
                  <input
                    type="range"
                    min="20"
                    max="50"
                    value={cv.largeurColonneGauche || 34}
                    onChange={(e) => {
                      updateCvProp('largeurColonneGauche', Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 2. PERSONNALISATION COMPLÈTE DE LA SIDEBAR */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('sidebar')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Columns className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '4. Column Structure & Layout' : isAr ? '4. هيكل وتنسيق الأعمدة' : '4. Structure & Disposition des Colonnes'}</span>
          </label>
          {openSections.sidebar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.sidebar && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Type d'arrière-plan Sidebar</span>
                <select
                  value={cv.sidebarBackgroundType || 'solid'}
                  onChange={(e) => updateCvProp('sidebarBackgroundType', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="solid">Couleur Unie</option>
                  <option value="gradient">Dégradé moderne</option>
                  <option value="transparent">Transparent (Sans fond)</option>
                  <option value="pattern">Motif texturé</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Forme & Découpe Sidebar</span>
                <select
                  value={cv.formeSidebarDecor || 'standard'}
                  onChange={(e) => updateCvProp('formeSidebarDecor', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="standard">Standard rectangulaire</option>
                  <option value="arch-top">Arche arrondie supérieure</option>
                  <option value="wave-cut">Vague incurvée (Wave Cut)</option>
                  <option value="diagonal-cut">Découpe biseautée diagonale</option>
                  <option value="card-float">Carte flottante avec marge</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur de fond Sidebar</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurFondSidebar || cv.couleurAccent || '#0F2744'}
                    onChange={(e) => updateCvProp('couleurFondSidebar', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurFondSidebar || ''}
                    onChange={(e) => updateCvProp('couleurFondSidebar', e.target.value)}
                    placeholder="#0F2744 ou transparent"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>

              {cv.sidebarBackgroundType === 'gradient' ? (
                <div className="space-y-1">
                  <span className="text-xs font-bold block">Couleur Fin de Dégradé</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.sidebarBackgroundColorEnd || '#1E293B'}
                      onChange={(e) => updateCvProp('sidebarBackgroundColorEnd', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.sidebarBackgroundColorEnd || ''}
                      onChange={(e) => updateCvProp('sidebarBackgroundColorEnd', e.target.value)}
                      placeholder="#1E293B"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs font-bold block">Motif texturé Sidebar</span>
                  <select
                    value={cv.sidebarBackgroundPattern || 'none'}
                    onChange={(e) => updateCvProp('sidebarBackgroundPattern', e.target.value)}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                  >
                    <option value="none">Aucun motif</option>
                    <option value="dots">Points fins (Dots)</option>
                    <option value="grid">Grille millimétrée</option>
                    <option value="lines">Lignes diagonales</option>
                    <option value="waves">Vagues douces</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur de texte Sidebar</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurTexteSidebar || '#FFFFFF'}
                    onChange={(e) => updateCvProp('couleurTexteSidebar', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurTexteSidebar || ''}
                    onChange={(e) => updateCvProp('couleurTexteSidebar', e.target.value)}
                    placeholder="Auto selon contraste"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Opacité Sidebar</span>
                  <span>{Math.round((cv.sidebarBackgroundOpacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={cv.sidebarBackgroundOpacity ?? 1}
                  onChange={(e) => updateCvProp('sidebarBackgroundOpacity', Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. LIGNES TEMPORELLES & RELIANCE DES DATES (TIMELINE) */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('timeline')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <CircleDot className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '12. Chronological Timeline' : isAr ? '12. الخط الزمني للخبرات' : '12. Frise Chronologique / Timeline'}</span>
          </label>
          {openSections.timeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.timeline && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Style de ligne temporelle</span>
                <select
                  value={cv.timelineStyle || 'none'}
                  onChange={(e) => updateCvProp('timelineStyle', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="none">Aucune ligne (Standard)</option>
                  <option value="line-dots">Ligne continue avec pastilles reliées</option>
                  <option value="left-bar">Barre latérale d'accentuation</option>
                  <option value="accent-pills">Capsules / Pills d'étiquettes</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Disposition et Alignement des Dates</span>
                <select
                  value={cv.alignementDatesExperience || 'left'}
                  onChange={(e) => {
                    updateCvProp('alignementDatesExperience', e.target.value);
                    updateCvProp('alignementDatesFormation', e.target.value);
                  }}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="left">Sous le poste (Aligné à gauche)</option>
                  <option value="inline">À droite sur la même ligne avec badge</option>
                  <option value="top">Au-dessus de l'entreprise</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-black/10 dark:border-white/10">
              <span className="text-xs font-bold block">Couleur de la ligne temporelle et des points</span>
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                <input
                  type="color"
                  value={cv.timelineColor || cv.couleurLigneTemps || cv.couleurAccent || '#18181B'}
                  onChange={(e) => {
                    updateCvProp('timelineColor', e.target.value);
                    updateCvProp('couleurLigneTemps', e.target.value);
                    updateCvProp('timelineDotColor', e.target.value);
                    updateCvProp('couleurPointLigneTemps', e.target.value);
                  }}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={cv.timelineColor || cv.couleurLigneTemps || ''}
                  onChange={(e) => {
                    updateCvProp('timelineColor', e.target.value);
                    updateCvProp('couleurLigneTemps', e.target.value);
                    updateCvProp('timelineDotColor', e.target.value);
                    updateCvProp('couleurPointLigneTemps', e.target.value);
                  }}
                  placeholder="Couleur d'accent par défaut"
                  className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. STYLE DES PUCES DE LISTES (BULLET POINTS) */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('bullets')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <List className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '10. List Bullet Points & Numbering' : isAr ? '10. نقاط القوائم والترقيم' : '10. Puces de Liste & Numérotation'}</span>
          </label>
          {openSections.bullets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.bullets && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-xs font-bold block">Forme des puces de description</span>
              <select
                value={cv.stylePucesListes || cv.bulletStyle || 'disc'}
                onChange={(e) => {
                  updateCvProp('stylePucesListes', e.target.value);
                  updateCvProp('bulletStyle', e.target.value);
                }}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              >
                <option value="disc">• Disque rond classique</option>
                <option value="square">■ Carré plein géométrique</option>
                <option value="arrow">▸ Flèche d'action moderne</option>
                <option value="check">✓ Coche de validation</option>
                <option value="star">★ Étoile d'impact</option>
                <option value="dash">— Tiret discret</option>
                <option value="numeric">1. 2. 3. Numéroté</option>
                <option value="none">Sans puce (Texte direct)</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold block">Couleur d'accent des puces</span>
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                <input
                  type="color"
                  value={cv.bulletColor || cv.couleurPuces || cv.couleurAccent || '#18181B'}
                  onChange={(e) => {
                    updateCvProp('bulletColor', e.target.value);
                    updateCvProp('couleurPuces', e.target.value);
                  }}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={cv.bulletColor || cv.couleurPuces || ''}
                  onChange={(e) => {
                    updateCvProp('bulletColor', e.target.value);
                    updateCvProp('couleurPuces', e.target.value);
                  }}
                  placeholder="Couleur d'accent"
                  className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. STYLE DU BANDEAU & EN-TÊTE PRINCIPAL DE CV */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('header')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Layout className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '2. Main CV Header (Name, Title, Style)' : isAr ? '2. الترويسة الرئيسية (الاسم، العنوان، النمط)' : '2. En-tête Principal du CV (Nom, Titre, Style)'}</span>
          </label>
          {openSections.header ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.header && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Format & Découpe du bandeau</span>
                <select
                  value={cv.styleEnTete || 'banner'}
                  onChange={(e) => updateCvProp('styleEnTete', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <optgroup label="🎨 En-têtes à 2 Couleurs (Bicolores)">
                    <option value="two-tone-split">Deux Couleurs — Séparation Nette (Split)</option>
                    <option value="two-tone-stripe">Deux Couleurs — Bandeau Supérieur & Accent</option>
                    <option value="baxter-diagonal">Deux Couleurs — Découpe Diagonale Graphique</option>
                    <option value="modern-split">Deux Couleurs — Profil Latéral Asymétrique</option>
                    <option value="diagonal-split">Deux Couleurs — Biseau Contemporain</option>
                  </optgroup>
                  <optgroup label="🌊 En-têtes avec Vagues (Wave & Organique)">
                    <option value="wave-bottom">Vague Inférieure Fluide (Wave Bottom)</option>
                    <option value="wave-top">Vague Supérieure Incurvée (Wave Top)</option>
                    <option value="wave-double">Double Vague Bicolore Fluide</option>
                    <option value="ocean-wave">Vague Aquatique / Océan</option>
                    <option value="curved-wave-badge">Onde Organique & Badge Portrait</option>
                    <option value="sylvie-wave">Sylvie Loiseau (Wave Arc & Portrait)</option>
                  </optgroup>
                  <optgroup label="✨ En-têtes Normaux & Simples (Épurés & Classiques)">
                    <option value="clean">Normal & Épuré Editorial (Clean avec Filet)</option>
                    <option value="simple-minimal">Normal & Simple Aéré (Ligne Fine Moderne)</option>
                    <option value="centered-clean">Normal & Centré Équilibré</option>
                    <option value="minimal">Minimaliste Pur Sans Fond (ATS Standard)</option>
                    <option value="executive-stripe">Exécutif Sobre avec Liseré Raffiné</option>
                  </optgroup>
                  <optgroup label="🏛️ Autres Formats & Thématiques">
                    <option value="banner">Bannière pleine classique</option>
                    <option value="card">Carte En-tête Encadrée (Floating Card)</option>
                    <option value="arch">Arche Supérieure Incurvée</option>
                    <option value="tech-dark-band">Bande Sombre High-Tech</option>
                    <option value="tech-arches">Terminal Développeur High-Tech</option>
                    <option value="luxury-gold">Ruban Or & Prestige Executive</option>
                    <option value="sidebar-top">Intégré Tout-en-un dans la Sidebar</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Hauteur du bandeau d'en-tête</span>
                  <span>{cv.hauteurEnTete || cv.hauteurEnTetePx || 120}px</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="220"
                  value={cv.hauteurEnTete || cv.hauteurEnTetePx || 120}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateCvProp('hauteurEnTete', val);
                    updateCvProp('hauteurEnTetePx', val);
                  }}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Mode d'affichage du Grand Titre</span>
                <select
                  value={cv.grandTitreMode || 'nom'}
                  onChange={(e) => updateCvProp('grandTitreMode', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="nom">Nom & Prénom en grand</option>
                  <option value="titre">Titre du poste / Métier en grand</option>
                  <option value="surmesure">Texte sur-mesure personnalisé</option>
                </select>
              </div>

              {cv.grandTitreMode === 'surmesure' && (
                <div className="space-y-1">
                  <span className="text-xs font-bold block">Texte du Grand Titre sur-mesure</span>
                  <input
                    type="text"
                    value={cv.grandTitreTexte || ''}
                    onChange={(e) => updateCvProp('grandTitreTexte', e.target.value)}
                    placeholder="Ex: EXPERT ARCHITECTE CLOUD"
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Detached Full Width Resume Toggle */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-500/20">
              <div>
                <span className="text-xs font-extrabold block text-black dark:text-white">
                  Détacher le Résumé Professionnel (100% Largeur)
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 block">
                  Affiche le résumé sur toute la largeur sous le bandeau, même sur un CV 2 colonnes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(cv.afficherResumeSeulFullWidth ?? cv.resumeFullWidth ?? false)}
                onChange={(e) => {
                  updateCvProp('afficherResumeSeulFullWidth', e.target.checked);
                  updateCvProp('resumeFullWidth', e.target.checked);
                }}
                className="w-4 h-4 rounded border-black/30 dark:border-white/30 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
            </div>

            {/* Option to place professional profile inside the header */}
            <div className="flex items-center justify-between gap-2 p-2 bg-neutral-100/70 dark:bg-neutral-900/70 rounded-lg border border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-bold text-black dark:text-white block">
                  Intégrer le Profil Pro dans l'En-tête
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 block">
                  Place le paragraphe de présentation directement dans l'en-tête du CV.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(cv.profilDansEnTete ?? false)}
                onChange={(e) => {
                  updateCvProp('profilDansEnTete', e.target.checked);
                }}
                className="w-4 h-4 rounded border-black/30 dark:border-white/30 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
            </div>

            {/* Granular Multi-Color Header Colors Control */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
              <span className="text-xs font-extrabold block text-black dark:text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-500" />
                <span>Personnalisation des Couleurs de l'En-tête Multi-Couleurs</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Header Bg Color 1 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold block text-neutral-700 dark:text-neutral-300">Couleur de Fond 1 (Bloc Principal)</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurHeader1 || cv.couleurFondProfil || cv.couleurAccent || '#0A2540'}
                      onChange={(e) => {
                        updateCvProp('couleurHeader1', e.target.value);
                        updateCvProp('couleurFondProfil', e.target.value);
                      }}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurHeader1 || cv.couleurFondProfil || ''}
                      onChange={(e) => {
                        updateCvProp('couleurHeader1', e.target.value);
                        updateCvProp('couleurFondProfil', e.target.value);
                      }}
                      placeholder="#0A2540"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Header Secondary Color 2 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold block text-neutral-700 dark:text-neutral-300">Couleur Secondaire (Bloc 2 / Split)</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurHeader2 || cv.decorBanniereCouleur2 || cv.couleurAccentSecondaire || '#F59E0B'}
                      onChange={(e) => {
                        updateCvProp('couleurHeader2', e.target.value);
                        updateCvProp('decorBanniereCouleur2', e.target.value);
                      }}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurHeader2 || cv.decorBanniereCouleur2 || ''}
                      onChange={(e) => {
                        updateCvProp('couleurHeader2', e.target.value);
                        updateCvProp('decorBanniereCouleur2', e.target.value);
                      }}
                      placeholder="#F59E0B"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Header Accent Highlight 3 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold block text-neutral-700 dark:text-neutral-300">Couleur Ligne / Surbrillance</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurHeader3 || cv.couleurHeaderAccent || cv.couleurAccentSecondaire || '#38BDF8'}
                      onChange={(e) => {
                        updateCvProp('couleurHeader3', e.target.value);
                        updateCvProp('couleurHeaderAccent', e.target.value);
                      }}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurHeader3 || cv.couleurHeaderAccent || ''}
                      onChange={(e) => {
                        updateCvProp('couleurHeader3', e.target.value);
                        updateCvProp('couleurHeaderAccent', e.target.value);
                      }}
                      placeholder="#38BDF8"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Header Title Color */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold block text-neutral-700 dark:text-neutral-300">Couleur du Nom / Grand Titre</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurTitrePrincipal || cv.couleurTexteProfil || '#FFFFFF'}
                      onChange={(e) => updateCvProp('couleurTitrePrincipal', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurTitrePrincipal || ''}
                      onChange={(e) => updateCvProp('couleurTitrePrincipal', e.target.value)}
                      placeholder="#FFFFFF"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Header Subtitle Color */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-bold block text-neutral-700 dark:text-neutral-300">Couleur du Sous-titre / Métier</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurSousTitrePrincipal || cv.couleurAccentSecondaire || '#38BDF8'}
                      onChange={(e) => updateCvProp('couleurSousTitrePrincipal', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurSousTitrePrincipal || ''}
                      onChange={(e) => updateCvProp('couleurSousTitrePrincipal', e.target.value)}
                      placeholder="#38BDF8"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2.B PERSONNALISATION DES VAGUES, DÉCORATIONS & RUBANS */}
      {canCustomizeDecorativeWaves && (
        <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
          <div 
            onClick={() => toggleSection('waves')}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>🌊 Personnalisation des Vagues, Décorations & Rubans</span>
            </label>
            {openSections.waves ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {openSections.waves && (
            <div className="space-y-3.5 pt-1">
            {/* Toggle Afficher / Masquer les Vagues */}
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-900/80 rounded-lg border border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-extrabold block text-black dark:text-white">Afficher les Vagues & Rubans Décoratifs</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Active ou masque l'arrière-plan de vagues stylisées sur le CV</span>
              </div>
              <input
                type="checkbox"
                checked={cv.afficherVagues !== false}
                onChange={(e) => updateCvProp('afficherVagues', e.target.checked)}
                className="w-4 h-4 rounded border-black/30 dark:border-white/30 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
            </div>

            {/* Selection Forme / Type de Vague */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Style & Forme des Vagues</span>
                <select
                  value={cv.typeVague || cv.formeSidebarDecor || 'wave-cut'}
                  onChange={(e) => {
                    updateCvProp('typeVague', e.target.value);
                    updateCvProp('formeSidebarDecor', e.target.value);
                  }}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="wave-cut">🌊 Ondulation Incurvée Fluid Flow</option>
                  <option value="wave-double">🌊🌊 Vagues Doubles Superposées</option>
                  <option value="diagonal-cut">📐 Découpe Biseautée Diagonale</option>
                  <option value="arch-top">🏛️ Arche / Dôme Architecte</option>
                  <option value="hex-grid">⬡ Grille Hexagones High-Tech</option>
                  <option value="minimal-lines">⚡ Lignes Épurées Néo-Minimales</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Position des Vagues sur la Page</span>
                <select
                  value={cv.positionVagues || 'sidebar'}
                  onChange={(e) => updateCvProp('positionVagues', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="sidebar">Sidebar / Marge Latérale Gauche</option>
                  <option value="droite">Sidebar / Marge Latérale Droite</option>
                  <option value="haut">En-tête (Haut de page)</option>
                  <option value="bas">Pied de Page (Bas de page)</option>
                  <option value="fond">Arrière-plan Global de Page</option>
                </select>
              </div>
            </div>

            {/* Colors for 3 Wave Layers */}
            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
              <span className="text-xs font-extrabold block text-black dark:text-white">Couleurs des 3 Couches de Vagues (Granulaire)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Wave 1 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold block text-neutral-600 dark:text-neutral-400">Couche 1 (Principale)</span>
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurVague1 || cv.couleurAccent || '#84CC16'}
                      onChange={(e) => updateCvProp('couleurVague1', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurVague1 || cv.couleurAccent || ''}
                      onChange={(e) => updateCvProp('couleurVague1', e.target.value)}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Wave 2 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold block text-neutral-600 dark:text-neutral-400">Couche 2 (Intermédiaire)</span>
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurVague2 || cv.couleurAccentSecondaire || '#065F46'}
                      onChange={(e) => updateCvProp('couleurVague2', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurVague2 || cv.couleurAccentSecondaire || ''}
                      onChange={(e) => updateCvProp('couleurVague2', e.target.value)}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Wave 3 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold block text-neutral-600 dark:text-neutral-400">Couche 3 (Surlignage)</span>
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.couleurVague3 || cv.decorBanniereCouleur2 || '#38BDF8'}
                      onChange={(e) => updateCvProp('couleurVague3', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.couleurVague3 || cv.decorBanniereCouleur2 || ''}
                      onChange={(e) => updateCvProp('couleurVague3', e.target.value)}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Wave Opacity Slider */}
            <div className="space-y-1 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex justify-between text-xs font-bold">
                <span>Opacité des vagues décoratives</span>
                <span>{Math.round((cv.opaciteVagues ?? cv.ribbonOpacite ?? 0.85) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={cv.opaciteVagues ?? cv.ribbonOpacite ?? 0.85}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateCvProp('opaciteVagues', val);
                  updateCvProp('ribbonOpacite', val);
                }}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. STYLE D'EN-TÊTE DE SECTION & DESIGN DES TITRES */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('sectionHeaders')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <SlidersHorizontal className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '9. Section Header Style (Design, Size & Color)' : isAr ? '9. نمط عناوين الأقسام (التصميم، الحجم واللون)' : '9. Style des En-têtes de Section (Design, Taille & Couleur)'}</span>
            {checkIsLocked('sectionHeaders') && (
              <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 bg-purple-600 text-white rounded">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </label>
          {openSections.sectionHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.sectionHeaders && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <OptionLabel 
                label="Type de soulignement et mise en valeur des titres" 
                isLocked={checkIsLocked('sectionHeaders', 'sectionHeaders:underline')}
                isCurrentlyActiveAndLocked={checkIsLocked('sectionHeaders', 'sectionHeaders:underline') && Boolean(cv.styleEnTeteSection && cv.styleEnTeteSection !== 'underline')}
              />
              <select
                value={cv.styleEnTeteSection || 'underline'}
                onChange={(e) => {
                  const isLocked = checkIsLocked('sectionHeaders', 'sectionHeaders:underline');
                  triggerUpgradeIfLocked(isLocked, () => updateCvProp('styleEnTeteSection', e.target.value));
                }}
                className={`w-full p-2.5 bg-neutral-100 dark:bg-neutral-900 border rounded-lg text-xs font-bold text-black dark:text-white cursor-pointer ${
                  checkIsLocked('sectionHeaders', 'sectionHeaders:underline') && cv.styleEnTeteSection && cv.styleEnTeteSection !== 'underline'
                    ? 'border-2 border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                    : 'border-black/20 dark:border-white/20'
                }`}
              >
                <option value="underline">Ligne continue classique d'accent</option>
                <option value="banner">Bannière pleine foncée</option>
                <option value="left-border">Bordure verticale à gauche</option>
                <option value="boxed">Encadré fermé complet (Boxed)</option>
                <option value="stars">Étoiles de prestige décoratives</option>
                <option value="architect">Double ligne fine d'architecte</option>
                <option value="dynamic-badge">Badge avec ligne dynamique</option>
                <option value="arch-block">Bloc avec coin supérieur en arche</option>
                <option value="minimal">Minimaliste sans ligne</option>
              </select>
            </div>

            {/* NEW: Taille des Titres de Section */}
            <div className="space-y-1.5 pt-2 border-t border-black/10 dark:border-white/10">
              <OptionLabel 
                label={`Taille d'affichage des titres de section (${cv.tailleTitreSectionValeur || cv.tailleTitreSection || 11}pt)`} 
                isLocked={checkIsLocked('sectionHeaders', 'sectionHeaders:font_size')} 
              />
              <input
                type="range"
                min="8"
                max="22"
                step="0.5"
                value={cv.tailleTitreSectionValeur || cv.tailleTitreSection || 11}
                onChange={(e) => {
                  const isLocked = checkIsLocked('sectionHeaders', 'sectionHeaders:font_size');
                  const val = Number(e.target.value);
                  triggerUpgradeIfLocked(isLocked, () => {
                    updateCvProp('tailleTitreSectionValeur', val);
                    updateCvProp('tailleTitreSection', val);
                  });
                }}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            {/* NEW: Couleur des Titres de Section */}
            <div className="space-y-1.5 pt-2 border-t border-black/10 dark:border-white/10">
              <OptionLabel 
                label="Couleur d'affichage des titres de section" 
                isLocked={checkIsLocked('sectionHeaders', 'sectionHeaders:color')} 
              />
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                <input
                  type="color"
                  value={cv.couleurTitreSection || cv.couleurAccent || '#18181B'}
                  onChange={(e) => {
                    const isLocked = checkIsLocked('sectionHeaders', 'sectionHeaders:color');
                    triggerUpgradeIfLocked(isLocked, () => updateCvProp('couleurTitreSection', e.target.value));
                  }}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={cv.couleurTitreSection || cv.couleurAccent || '#18181B'}
                  onChange={(e) => {
                    const isLocked = checkIsLocked('sectionHeaders', 'sectionHeaders:color');
                    triggerUpgradeIfLocked(isLocked, () => updateCvProp('couleurTitreSection', e.target.value));
                  }}
                  placeholder="Couleur du modèle"
                  className="w-full text-xs font-mono font-bold bg-transparent outline-none text-black dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. CADRE, ANNEAUX & DÉCOUPE PHOTO DE PROFIL */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('photo')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <User className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '1. Profile Photo, Frame, Rings & Background' : isAr ? '1. صورة الملف الشخصي والإطار والخلفية' : '1. Photo de Profil, Cadre, Anneaux & Fond'}</span>
          </label>
          {openSections.photo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.photo && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Afficher la photo de profil</span>
              <button
                type="button"
                onClick={() => updateCvProp('afficherPhoto', cv.afficherPhoto === false ? true : false)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                  cv.afficherPhoto !== false
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-black/10 dark:border-white/10'
                }`}
              >
                {cv.afficherPhoto !== false ? 'OUI' : 'NON'}
              </button>
            </div>

            {cv.afficherPhoto !== false && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="space-y-1">
                    <span className="text-xs font-bold block">Découpe & Forme de la photo</span>
                    <select
                      value={cv.photoForme || 'ronde'}
                      onChange={(e) => updateCvProp('photoForme', e.target.value)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                    >
                      <option value="ronde">Ronde classique (Cercle)</option>
                      <option value="carree">Carré net géométrique</option>
                      <option value="arrondie">Coins arrondis (Squircle)</option>
                      <option value="arche">Arche élégante supérieure</option>
                      <option value="hexagone">Hexagone contemporain</option>
                      <option value="galet">Galet Designer asymétrique</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold block">Anneau Décoratif Photo</span>
                    <select
                      value={cv.cadrePhotoRing || 'none'}
                      onChange={(e) => updateCvProp('cadrePhotoRing', e.target.value)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                    >
                      <option value="none">Simple bordure (Standard)</option>
                      <option value="double-ring">Double anneau stylisé</option>
                      <option value="gold-ring">Anneau Prestige Doré</option>
                      <option value="border-only">Bordure fine épurée</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Épaisseur de bordure</span>
                      <span>{cv.cadrePhotoBorderWidth || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={cv.cadrePhotoBorderWidth || 0}
                      onChange={(e) => updateCvProp('cadrePhotoBorderWidth', Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Taille de la photo</span>
                      <span>{cv.photoSize || 80}px</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={cv.photoSize || 80}
                      onChange={(e) => updateCvProp('photoSize', Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-black/10 dark:border-white/10">
                  <span className="text-xs font-bold block">Couleur de bordure photo</span>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                    <input
                      type="color"
                      value={cv.cadrePhotoBorderColor || '#FFFFFF'}
                      onChange={(e) => updateCvProp('cadrePhotoBorderColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={cv.cadrePhotoBorderColor || ''}
                      onChange={(e) => updateCvProp('cadrePhotoBorderColor', e.target.value)}
                      placeholder="#FFFFFF ou couleur d'accent"
                      className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Background color of profile header is 100% free */}
            <div className="space-y-1.5 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold block">Couleur de fond du bloc photo / profil (Gratuit)</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-300">
                  Gratuit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cv.couleurFondProfil || cv.couleurAccent || '#18181B'}
                  onChange={(e) => updateCvProp('couleurFondProfil', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={cv.couleurFondProfil || ''}
                  onChange={(e) => updateCvProp('couleurFondProfil', e.target.value)}
                  placeholder="Transparente / Couleur du modèle"
                  className="w-full text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 p-2 rounded-lg text-black dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. BADGES DE CONTACT & COORDONNÉES */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('contactBadges')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Contact className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '8. Contact Badges & Coordinate Styling' : isAr ? '8. شارات الاتصال وتزيين البيانات' : '8. Badges de Contact & Décorations de Coordonnées'}</span>
          </label>
          {openSections.contactBadges ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.contactBadges && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <span className="text-xs font-bold block">Style des badges de coordonnées</span>
              <select
                value={cv.styleBadgesCoordonnees || 'none'}
                onChange={(e) => updateCvProp('styleBadgesCoordonnees', e.target.value)}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              >
                <option value="none">Texte simple avec icône (Standard)</option>
                <option value="accent-filled">Pleine couleur d'accent</option>
                <option value="pastel-soft">Teinte pastel douce</option>
                <option value="outline-thin">Contour fin épuré (Outline)</option>
                <option value="glassmorphism">Effet verre dépoli (Glassmorphism)</option>
                <option value="pill-capsule">Capsules pills compactes</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur de fond du badge</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurFondBadgeContact || cv.couleurAccent || '#18181B'}
                    onChange={(e) => updateCvProp('couleurFondBadgeContact', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurFondBadgeContact || ''}
                    onChange={(e) => updateCvProp('couleurFondBadgeContact', e.target.value)}
                    placeholder="Couleur d'accent"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur du texte du badge</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurTexteBadgeContact || '#FFFFFF'}
                    onChange={(e) => updateCvProp('couleurTexteBadgeContact', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurTexteBadgeContact || ''}
                    onChange={(e) => updateCvProp('couleurTexteBadgeContact', e.target.value)}
                    placeholder="#FFFFFF"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. GESTION DU CALIBRAGE, MARGES & ESPACEMENTS */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('pageCalibration')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Frame className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '9. Page Calibration, Margins & Line Spacing' : isAr ? '9. معايرة الصفحة، الهوامش والتباعد' : '9. Calibrage de Page, Marges & Interlignes'}</span>
          </label>
          {openSections.pageCalibration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.pageCalibration && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Marges globales de la page</span>
                <span>{cv.margeGlobalePage || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={cv.margeGlobalePage || 0}
                onChange={(e) => updateCvProp('margeGlobalePage', Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Espacement entre sections</span>
                <span>{cv.espacementSections || cv.espacementSectionsPx || 12}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="28"
                value={cv.espacementSections || cv.espacementSectionsPx || 12}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateCvProp('espacementSections', val);
                  updateCvProp('espacementSectionsPx', val);
                }}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Espacement entre éléments</span>
                <span>{cv.espacementElements || cv.espacementItemsPx || 6}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={cv.espacementElements || cv.espacementItemsPx || 6}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateCvProp('espacementElements', val);
                  updateCvProp('espacementItemsPx', val);
                }}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Taille des titres de sections</span>
                <span>{cv.tailleTitreSection || cv.tailleTitreSectionValeur || 12}pt</span>
              </div>
              <input
                type="range"
                min="8"
                max="18"
                step="0.5"
                value={cv.tailleTitreSection || cv.tailleTitreSectionValeur || 12}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateCvProp('tailleTitreSection', val);
                  updateCvProp('tailleTitreSectionValeur', val);
                }}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 10. ARRIÈRE-PLAN GLOBAL DE LA PAGE */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('background')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Palette className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '10. Global Page Background & Color Palette' : isAr ? '10. الخلفية العامة ولوحة الألوان' : '10. Arrière-Plan Global & Palette de Couleurs'}</span>
          </label>
          {openSections.background ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.background && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur d'accent principale</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurAccent || '#18181B'}
                    onChange={(e) => updateCvProp('couleurAccent', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurAccent || '#18181B'}
                    onChange={(e) => updateCvProp('couleurAccent', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Arrière-plan global de page</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurFond || '#FFFFFF'}
                    onChange={(e) => updateCvProp('couleurFond', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurFond || '#FFFFFF'}
                    onChange={(e) => updateCvProp('couleurFond', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
              <span className="text-xs font-bold block">Motif d'arrière-plan texturé</span>
              <select
                value={cv.arrierePlanPattern || cv.backgroundPattern || 'none'}
                onChange={(e) => {
                  updateCvProp('arrierePlanPattern', e.target.value);
                  updateCvProp('backgroundPattern', e.target.value);
                }}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              >
                <option value="none">Aucun motif (Uni classique)</option>
                <option value="dots">Points fins (Dots Grid)</option>
                <option value="grid">Quadrillage millimétré (Grid)</option>
                <option value="lines">Lignes diagonales (Stripes)</option>
                <option value="waves">Vagues modernes (Waves)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 11. TYPOGRAPHIES 100% GRATUITES */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('typography')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Type className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '11. Typography & Font Sizes' : isAr ? '11. الخطوط وأحجام الخط' : '11. Typographies Gratuites & Tailles de Police'}</span>
          </label>
          {openSections.typography ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.typography && (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Police du document (100% Gratuites)</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-300">
                  Gratuit & Libre
                </span>
              </div>
              <select
                value={cv.police || 'Inter'}
                onChange={(e) => updateCvProp('police', e.target.value)}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.family}>
                    {f.name} (Gratuit)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Taille du texte du corps</span>
                  <span>{cv.taillePoliceValeur || 10}pt</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="14"
                  step="0.5"
                  value={cv.taillePoliceValeur || 10}
                  onChange={(e) => updateCvProp('taillePoliceValeur', Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Hauteur d'interligne</span>
                  <span>{cv.hauteurLigneValeur || 1.3}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.1"
                  value={cv.hauteurLigneValeur || 1.3}
                  onChange={(e) => updateCvProp('hauteurLigneValeur', Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 12. CASSE ET ALIGNEMENT DES TITRES (GRATUIT) */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('titlesCase')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <AlignLeft className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '12. Section Titles: Alignment, Color, Size & Font' : isAr ? '12. عناوين الأقسام: المحاذاة واللون والحجم والخط' : '12. Titres de Sections : Centrage, Couleur, Taille & Police'}</span>
          </label>
          {openSections.titlesCase ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.titlesCase && (
          <div className="space-y-4 pt-2">
            {/* Ligne 1: Alignement et Casse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs font-bold block">Alignement des titres</span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'left', icon: AlignLeft, label: 'Gauche' },
                    { id: 'center', icon: AlignCenter, label: 'Centre' },
                    { id: 'right', icon: AlignRight, label: 'Droite' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSel = (cv.alignementTitreSection || cv.alignementTitresSection || 'left') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateCvProp('alignementTitreSection', item.id);
                          updateCvProp('alignementTitresSection', item.id);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer flex items-center justify-center gap-1 transition-colors ${
                          isSel
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                            : 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-black/10 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold block">Casse des titres</span>
                <select
                  value={cv.casseTitreSection || cv.casseTitresSection || 'uppercase'}
                  onChange={(e) => {
                    updateCvProp('casseTitreSection', e.target.value);
                    updateCvProp('casseTitresSection', e.target.value);
                  }}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="uppercase">MAJUSCULES (Ex: EXPÉRIENCES)</option>
                  <option value="capitalize">Titre Propre (Ex: Expériences Pro)</option>
                  <option value="normal">Minuscules standard</option>
                </select>
              </div>
            </div>

            {/* Ligne 2: Couleur des titres */}
            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black dark:text-white">Couleur des titres de section</span>
                <button
                  type="button"
                  onClick={() => updateCvProp('couleurTitreSection', cv.couleurAccent || '#0F172A')}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Suivre la couleur d'accent
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cv.couleurTitreSection || cv.couleurAccent || '#0F172A'}
                  onChange={(e) => updateCvProp('couleurTitreSection', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-black/20 dark:border-white/20 cursor-pointer p-0.5 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={cv.couleurTitreSection || ''}
                  placeholder={cv.couleurAccent || '#0F172A'}
                  onChange={(e) => updateCvProp('couleurTitreSection', e.target.value)}
                  className="flex-1 p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-mono font-bold uppercase text-black dark:text-white"
                />
              </div>
              {/* Nuancier rapide */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { color: '#0F172A', label: 'Noir/Bleu Nuit' },
                  { color: '#1E293B', label: 'Ardoise Foncée' },
                  { color: '#2563EB', label: 'Bleu Royal' },
                  { color: '#0D9488', label: 'Sarcelle/Teal' },
                  { color: '#059669', label: 'Émeraude' },
                  { color: '#7C3AED', label: 'Violet Intense' },
                  { color: '#DC2626', label: 'Carmin' },
                  { color: '#D97706', label: 'Ambre Chaud' }
                ].map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    title={preset.label}
                    onClick={() => updateCvProp('couleurTitreSection', preset.color)}
                    style={{ backgroundColor: preset.color }}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                      (cv.couleurTitreSection || '').toLowerCase() === preset.color.toLowerCase()
                        ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
                        : 'border-black/20 dark:border-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Ligne 3: Taille et Police des titres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">Taille des titres</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    {cv.tailleTitreSectionValeur ?? cv.tailleTitreSection ?? 11} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="22"
                  step="0.5"
                  value={cv.tailleTitreSectionValeur ?? cv.tailleTitreSection ?? 11}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateCvProp('tailleTitreSectionValeur', val);
                    updateCvProp('tailleTitreSection', val);
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>8 pt (Compact)</span>
                  <span>14 pt</span>
                  <span>22 pt (Grand)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold block">Police dédiée aux titres</span>
                <select
                  value={cv.policeTitreSection || cv.policeTitre || cv.police || 'Inter'}
                  onChange={(e) => {
                    updateCvProp('policeTitreSection', e.target.value);
                    updateCvProp('policeTitre', e.target.value);
                  }}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="">Identique au texte ({cv.police || 'Inter'})</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne 4: Graisse et Style visuel des titres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1.5">
                <span className="text-xs font-bold block">Épaisseur / Graisse</span>
                <select
                  value={cv.grasTitreSection || 'bold'}
                  onChange={(e) => updateCvProp('grasTitreSection', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="normal">Normal (400)</option>
                  <option value="medium">Médium (500)</option>
                  <option value="bold">Gras (700) - Recommandé</option>
                  <option value="black">Extra-Gras (900)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold block">Style de ligne / Séparateur</span>
                <select
                  value={cv.styleEnTeteSection || 'underline'}
                  onChange={(e) => updateCvProp('styleEnTeteSection', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="underline">Souligné élégant (Underline)</option>
                  <option value="badge-line">Badge moderne avec icône</option>
                  <option value="double-line">Double ligne (Architecte)</option>
                  <option value="minimal">Minimal épuré sans ligne</option>
                  <option value="banner">Bandeau plein coloré</option>
                  <option value="left-border">Barre d'accent latérale</option>
                  <option value="icon-inline">Icône intégrée avec filets</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 13. EFFETS D'OMBRES & PROFONDEUR */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('shadows')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Box className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '13. Shadows & Depth Effects' : isAr ? '13. الظلال وتأثيرات العمق' : '13. Ombres Portées & Effets de Profondeur'}</span>
          </label>
          {openSections.shadows ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.shadows && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <span className="text-xs font-bold block">Ombre des cartes & blocs de section</span>
              <select
                value={cv.ombre || cv.ombreCarte || 'none'}
                onChange={(e) => {
                  updateCvProp('ombre', e.target.value);
                  updateCvProp('ombreCarte', e.target.value);
                }}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              >
                <option value="none">Aucune ombre (Plat classique)</option>
                <option value="sm">Légère (Subtile profondeur)</option>
                <option value="md">Moyenne (Cartes surélevées)</option>
                <option value="lg">Flottante (Effet moderne marqué)</option>
              </select>
            </div>

            <div className="space-y-1 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex justify-between text-xs font-bold">
                <span>Épaisseur de bordure des cartes</span>
                <span>{cv.epaisseurBordure || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={cv.epaisseurBordure || 0}
                onChange={(e) => updateCvProp('epaisseurBordure', Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 14. PIED DE PAGE & MARCHE DE PROTECTION (MARGE ANTI-CHEVAUCHEMENT) */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('footer')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <SlidersHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{isEn ? '18. General Footer & Bottom Margin' : isAr ? '18. التذييل العام وهامش الصفحة' : '18. Pied de Page Général & Marche Anti-Chevauchement'}</span>
          </label>
          {openSections.footer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.footer && (
          <div className="space-y-3 pt-1">
            {/* Activer / Désactiver Pied de page */}
            <div className="flex items-center justify-between p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10">
              <span className="text-xs font-bold text-black dark:text-white">Afficher le pied de page</span>
              <input
                type="checkbox"
                checked={cv.afficherPiedDePage ?? true}
                onChange={(e) => updateCvProp('afficherPiedDePage', e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-purple-600"
              />
            </div>

            {/* Marche de protection / Marge sous le contenu */}
            <div className="space-y-1 p-2.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800/40">
              <div className="flex justify-between items-center text-xs font-bold text-purple-900 dark:text-purple-200">
                <span>Marche de protection (Marge sous le contenu)</span>
                <span className="px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-950 dark:text-purple-100 text-[11px] font-mono">
                  {cv.margePiedDePagePx ?? 35} px
                </span>
              </div>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                Ajuste l'espace entre la dernière section du CV et le pied de page pour éviter tout chevauchement des textes.
              </p>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={cv.margePiedDePagePx ?? 35}
                onChange={(e) => updateCvProp('margePiedDePagePx', Number(e.target.value))}
                className="w-full h-1.5 bg-purple-200 dark:bg-purple-900 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Texte personnalisé */}
            <div className="space-y-1">
              <span className="text-xs font-bold block">Texte personnalisé du pied de page</span>
              <input
                type="text"
                value={cv.textePiedDePage !== undefined ? cv.textePiedDePage : ''}
                onChange={(e) => updateCvProp('textePiedDePage', e.target.value)}
                placeholder="Ex: Confidentiel • CV de Jean Dupont"
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Style du pied de page */}
              <div className="space-y-1">
                <span className="text-xs font-bold block">Style visuel</span>
                <select
                  value={cv.stylePiedDePage || 'top-line'}
                  onChange={(e) => updateCvProp('stylePiedDePage', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="top-line">Ligne supérieure discrète</option>
                  <option value="minimal">Minimaliste épuré</option>
                  <option value="boxed">Encadré à coins arrondis</option>
                  <option value="pill">Capsule Pilule (Pill)</option>
                  <option value="banner">Bannière colorée pleine</option>
                </select>
              </div>

              {/* Alignement */}
              <div className="space-y-1">
                <span className="text-xs font-bold block">Alignement des éléments</span>
                <select
                  value={cv.alignementPiedDePage || 'between'}
                  onChange={(e) => updateCvProp('alignementPiedDePage', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="between">Spacé (Texte à gauche, Page à droite)</option>
                  <option value="gauche">Aligné à Gauche</option>
                  <option value="centre">Centré au milieu</option>
                  <option value="droite">Aligné à Droite</option>
                </select>
              </div>
            </div>

            {/* Numérotation de page & Couleurs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <span className="text-xs font-bold">Numéro de page (Ex: Page 1 / 1)</span>
                <input
                  type="checkbox"
                  checked={cv.afficherNumPagePiedDePage ?? true}
                  onChange={(e) => updateCvProp('afficherNumPagePiedDePage', e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur du texte du pied de page</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurTextePiedDePage || '#64748B'}
                    onChange={(e) => updateCvProp('couleurTextePiedDePage', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurTextePiedDePage || '#64748B'}
                    onChange={(e) => updateCvProp('couleurTextePiedDePage', e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 15. BANDEAU FOOTER DE CONTACT DU CV (INFORMATIONS DE CONTACT & MODÈLES) */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('footerContact')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Contact className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isEn ? '17. Contact Footer Banner & Templates' : isAr ? '17. شريط تذييل بيانات الاتصال' : '17. Bandeau Footer de Contact (Coordonnées & Modèles)'}</span>
          </label>
          {openSections.footerContact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.footerContact && (
          <div className="space-y-4 pt-1">
            {/* Activer / Désactiver le bandeau footer de contact */}
            <div className="flex items-center justify-between p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-bold text-black dark:text-white block">Afficher le bandeau footer de contact</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Intègre vos coordonnées professionnelles en bas de page du CV</span>
              </div>
              <input
                type="checkbox"
                checked={cv.afficherFooterContact ?? true}
                onChange={(e) => updateCvProp('afficherFooterContact', e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Choix du modèle de footer */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold block">Modèle / Style de bandeau de contact</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'banner-solid', label: 'Bandeau Solide', desc: 'Bande pleine colorée' },
                  { id: 'cards-grid', label: 'Grille Cartes', desc: 'Blocs individuels' },
                  { id: 'minimal-inline', label: 'Ligne Épurée', desc: 'Texte horizontal' },
                  { id: 'pill-floating', label: 'Pilule Flottante', desc: 'Capsule moderne' },
                  { id: 'modern-split', label: 'Split Bicolore', desc: 'Deux teintes' },
                  { id: 'dark-tech', label: 'Dark Tech', desc: 'Style développeur' },
                  { id: 'neon-border', label: 'Bordure Précise', desc: 'Ligne supérieure fine' },
                  { id: 'classic-divider', label: 'Double Filet', desc: 'Classique centré' }
                ].map((item) => {
                  const isSel = (cv.styleFooterContact || 'banner-solid') === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateCvProp('styleFooterContact', item.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSel
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-black dark:text-white ring-2 ring-emerald-500'
                          : 'border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Couleurs du Footer de Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-[11px] font-bold block">Couleur de fond</span>
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurFondFooterContact || cv.couleurAccent || '#1E293B'}
                    onChange={(e) => updateCvProp('couleurFondFooterContact', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurFondFooterContact || ''}
                    onChange={(e) => updateCvProp('couleurFondFooterContact', e.target.value)}
                    placeholder="Couleur principale"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold block">Couleur du texte</span>
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurTexteFooterContact || '#FFFFFF'}
                    onChange={(e) => updateCvProp('couleurTexteFooterContact', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurTexteFooterContact || '#FFFFFF'}
                    onChange={(e) => updateCvProp('couleurTexteFooterContact', e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold block">Couleur d'accent / Libellés</span>
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurAccentFooterContact || cv.couleurAccentSecondaire || '#38BDF8'}
                    onChange={(e) => updateCvProp('couleurAccentFooterContact', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurAccentFooterContact || ''}
                    onChange={(e) => updateCvProp('couleurAccentFooterContact', e.target.value)}
                    placeholder="Couleur secondaire"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Éléments de contact à afficher dans le bandeau */}
            <div className="space-y-2">
              <span className="text-xs font-bold block">Éléments de contact à inclure dans le bandeau</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'afficherAdresseFooterContact', label: 'Localisation / Ville', defaultVal: true },
                  { key: 'afficherTelephoneFooterContact', label: 'Téléphone', defaultVal: true },
                  { key: 'afficherEmailFooterContact', label: 'Email', defaultVal: true },
                  { key: 'afficherDisponibiliteFooterContact', label: 'Disponibilité', defaultVal: true },
                  { key: 'afficherSiteWebFooterContact', label: 'Site Web / Portfolio', defaultVal: true },
                  { key: 'afficherLinkedinFooterContact', label: 'Profil LinkedIn', defaultVal: false }
                ].map((item) => {
                  const isChecked = (cv as any)[item.key] ?? item.defaultVal;
                  return (
                    <label key={item.key} className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => updateCvProp(item.key as any, e.target.checked)}
                        className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Texte de disponibilité */}
            <div className="space-y-1 pt-1 border-t border-black/10 dark:border-white/10">
              <span className="text-xs font-bold block">Texte de disponibilité personnalisée</span>
              <input
                type="text"
                value={cv.disponibiliteTexte || 'Immédiate'}
                onChange={(e) => updateCvProp('disponibiliteTexte', e.target.value)}
                placeholder="Ex: Immédiate, Sous 1 mois, Temps partiel..."
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 16. PERSONNALISATION DES EXPÉRIENCES */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('experiences')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Briefcase className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '6. Work Experience Customization' : isAr ? '6. تخصيص الخبرات المهنية' : '16. Personnalisation des Expériences Professionnelles'}</span>
          </label>
          {openSections.experiences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.experiences && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Layout des postes</span>
                <select
                  value={cv.styleExperienceLayout || 'classic'}
                  onChange={(e) => updateCvProp('styleExperienceLayout', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="classic">Classique professionnel</option>
                  <option value="timeline">Ligne temporelle (Timeline)</option>
                  <option value="cards">Cartes modernes distinctes</option>
                  <option value="boxed">Encadrés fins avec bordure</option>
                  <option value="minimal">Minimaliste épuré</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Couleur du titre de poste</span>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <input
                    type="color"
                    value={cv.couleurPosteExperience || cv.couleurAccent || '#18181B'}
                    onChange={(e) => updateCvProp('couleurPosteExperience', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={cv.couleurPosteExperience || ''}
                    onChange={(e) => updateCvProp('couleurPosteExperience', e.target.value)}
                    placeholder="Couleur d'accent"
                    className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 17. PERSONNALISATION DES FORMATIONS */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('formations')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <GraduationCap className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '7. Education & Degrees Customization' : isAr ? '7. تخصيص المؤهلات والشهادات' : '17. Personnalisation des Formations & Diplômes'}</span>
          </label>
          {openSections.formations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.formations && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-xs font-bold block">Layout des diplômes</span>
              <select
                value={cv.styleFormationLayout || 'classic'}
                onChange={(e) => updateCvProp('styleFormationLayout', e.target.value)}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
              >
                <option value="classic">Classique aligné</option>
                <option value="cards">Cartes de diplômes</option>
                <option value="timeline">Ligne temporelle académique</option>
                <option value="boxed">Encadré stylisé</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold block">Couleur d'accent du diplôme</span>
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10">
                <input
                  type="color"
                  value={cv.couleurDiplomeFormation || cv.couleurAccent || '#18181B'}
                  onChange={(e) => updateCvProp('couleurDiplomeFormation', e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={cv.couleurDiplomeFormation || ''}
                  onChange={(e) => updateCvProp('couleurDiplomeFormation', e.target.value)}
                  placeholder="Couleur du modèle"
                  className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 18. PERSONNALISATION COMPÉTENCES, OUTILS & NIVEAUX */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-3">
        <div 
          onClick={() => toggleSection('skills')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Award className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '8. Skills, Tools & Levels Customization' : isAr ? '8. تخصيص المهارات والأدوات والمستويات' : '18. Personnalisation des Compétences, Outils & Niveaux'}</span>
          </label>
          {openSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.skills && (
          <div className="space-y-4 pt-1">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold block">Disposition globale des compétences</span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">15 options</span>
                  </div>
                  <select
                    value={cv.styleCompetences || 'grid'}
                    onChange={(e) => updateCvProp('styleCompetences', e.target.value)}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                  >
                    <optgroup label="⭐ Cartes Pro & Signatures">
                      <option value="tech-cards">🚀 Cartes Tech 3 Colonnes (Style Modèles 51 à 55)</option>
                      <option value="icon-card-grid">🗂️ Cartes avec Icônes Thématiques (Style Modèles 56 à 60)</option>
                      <option value="cards-modern">🎴 Cartes Modernes Ombrées (Bordure d'Accent)</option>
                      <option value="minimal-cards">◻️ Cartes Épurées Minimalistes</option>
                    </optgroup>
                    <optgroup label="⊞ Grilles & Colonnes">
                      <option value="grid">⊞ Grille Moderne (2 colonnes)</option>
                      <option value="grid-3">▦ Grille Compacte (3 colonnes - Idéal 1 page)</option>
                    </optgroup>
                    <optgroup label="🏷️ Badges & Pilules">
                      <option value="badges">🏷️ Badges / Pilules Flottantes</option>
                      <option value="pill-bars">💊 Pilules avec Jauge de Niveau Intégrée</option>
                      <option value="badges-multicolor">🎨 Badges Bicolores Alternés</option>
                      <option value="tags">#️⃣ Tags / Hashtags (#React #Python)</option>
                    </optgroup>
                    <optgroup label="📊 Jauges, Notes & Listes">
                      <option value="progress">📊 Liste avec Barres de Progression (%)</option>
                      <option value="stars">⭐ Liste avec Étoiles d'Évaluation (1 à 5 ★)</option>
                      <option value="circular-progress">🍩 Jauges Circulaires (% Donut)</option>
                      <option value="striped-table">📑 Lignes Stylisées Zébrées</option>
                      <option value="list">📋 Liste Épurée avec Puces</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold block">Style de note / niveau des compétences (8 choix)</span>
                  <select
                    value={cv.styleNiveauCompetence || 'progress'}
                    onChange={(e) => updateCvProp('styleNiveauCompetence', e.target.value)}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                  >
                    <option value="progress">📊 Barres de progression (%)</option>
                    <option value="stars">⭐ Étoiles d'évaluation (1 à 5 ★)</option>
                    <option value="numeric">🔢 Note en chiffre / Score (ex: 8/10)</option>
                    <option value="percentage">💯 Pourcentage seul (ex: 80%)</option>
                    <option value="dots">⚪ Pastilles / Points (●●●●○)</option>
                    <option value="segmented">📶 Jauges segmentées (5 barrettes)</option>
                    <option value="badge-text">🏷️ Badges textuels (Débutant, Avancé, Expert)</option>
                    <option value="none">🚫 Masquer la note (Nom seul, épuré)</option>
                  </select>
                </div>
              </div>

              {/* Raccourcis visuels rapides pour styles phares */}
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-900/60 rounded-lg border border-black/10 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Styles en 1 clic :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'tech-cards', label: '🚀 Modèles 51-55 (Cartes Tech)', highlight: true },
                    { id: 'icon-card-grid', label: '🗂️ Modèles 56-60 (Icônes)' },
                    { id: 'cards-modern', label: '🎴 Cartes Modernes' },
                    { id: 'grid', label: '⊞ Grille 2 Col.' },
                    { id: 'grid-3', label: '▦ Grille 3 Col.' },
                    { id: 'pill-bars', label: '💊 Pilules & Jauges' },
                    { id: 'badges', label: '🏷️ Badges' },
                    { id: 'progress', label: '📊 Barres' },
                    { id: 'stars', label: '⭐ Étoiles' },
                    { id: 'circular-progress', label: '🍩 Donut' },
                    { id: 'striped-table', label: '📑 Zébré' }
                  ].map((styleOption) => {
                    const isCurrent = (cv.styleCompetences || 'grid') === styleOption.id;
                    return (
                      <button
                        key={styleOption.id}
                        type="button"
                        onClick={() => updateCvProp('styleCompetences', styleOption.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border ${
                          isCurrent
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                            : styleOption.highlight
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-white text-neutral-700 border-black/10 hover:bg-neutral-100 dark:bg-black dark:text-neutral-300 dark:border-white/10'
                        }`}
                      >
                        {styleOption.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Style des outils & sous-compétences</span>
                <select
                  value={cv.styleOutilsCompetences || 'badges'}
                  onChange={(e) => updateCvProp('styleOutilsCompetences', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="badges">Pilules / Badges teintés</option>
                  <option value="outline">Badges encadrés (Contours fins)</option>
                  <option value="solid">Badges pleins avec accent</option>
                  <option value="tags">Hashtags (#React #Python)</option>
                  <option value="dots">Puces colorées (Dots minimalistes)</option>
                  <option value="text">Texte continu avec séparateurs</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block">Format d'affichage de la note des outils</span>
                <select
                  value={cv.styleNiveauOutilsCompetences || 'etoiles'}
                  onChange={(e) => updateCvProp('styleNiveauOutilsCompetences', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="etoiles">⭐ Étoiles dorées (★★★☆☆)</option>
                  <option value="note">🔢 Score chiffré (4/5)</option>
                  <option value="pourcentage">💯 Pourcentage (80%)</option>
                  <option value="pastilles">⚪ Pastilles (●●●○○)</option>
                  <option value="barre">📊 Mini jauge de progression</option>
                  <option value="badge-text">🏷️ Badge textuel (Avancé, Expert)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold block">Visibilité du niveau / note des outils</span>
                <select
                  value={cv.afficherNiveauOutilsCompetences || 'si_renseigne'}
                  onChange={(e) => updateCvProp('afficherNiveauOutilsCompetences', e.target.value)}
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                >
                  <option value="si_renseigne">Si renseigné uniquement (Optionnel)</option>
                  <option value="toujours">Toujours afficher les notes</option>
                  <option value="masquer">Masquer tous les niveaux</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold block text-black dark:text-white">Couleurs personnalisées des Outils & Compétences</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex flex-col items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 text-[10px] font-bold cursor-pointer" title="Fond des badges d'outils">
                  <span>Fond Badges</span>
                  <input
                    type="color"
                    value={cv.couleurFondOutils || '#F4F4F5'}
                    onChange={(e) => updateCvProp('couleurFondOutils', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <label className="flex flex-col items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 text-[10px] font-bold cursor-pointer" title="Texte des outils">
                  <span>Texte Outils</span>
                  <input
                    type="color"
                    value={cv.couleurOutils || '#18181B'}
                    onChange={(e) => updateCvProp('couleurOutils', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <label className="flex flex-col items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 text-[10px] font-bold cursor-pointer" title="Bordure des outils">
                  <span>Bordure</span>
                  <input
                    type="color"
                    value={cv.couleurBordureOutils || cv.couleurAccent || '#18181B'}
                    onChange={(e) => updateCvProp('couleurBordureOutils', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <label className="flex flex-col items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 text-[10px] font-bold cursor-pointer" title="Couleur des jauges ou étoiles">
                  <span>Jauge / Note</span>
                  <input
                    type="color"
                    value={cv.couleurJaugeNiveau || cv.couleurAccent || '#18181B'}
                    onChange={(e) => updateCvProp('couleurJaugeNiveau', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 19. PERSONNALISATION INDIVIDUELLE PAR SECTION (LISTE DÉROULANTE) */}
      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 space-y-4">
        <div 
          onClick={() => toggleSection('individualSection')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white pointer-events-none">
            <Layers className="w-4 h-4 text-black dark:text-white" />
            <span>{isEn ? '5. CV Sections & Block Customization' : isAr ? '5. أقسام السيرة الذاتية وتنسيق الكتل' : '5. Sections du CV & Réorganisation des Blocs'}</span>
          </label>
          {openSections.individualSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {openSections.individualSection && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black dark:text-white block">Sélectionner la section à personnaliser :</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white outline-none"
              >
                {cv.sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {getLocalizedSectionTitle(sec.type, sec.titre, langue)} ({sec.colonne === 'gauche' ? 'Sidebar' : 'Principale'})
                  </option>
                ))}
              </select>
            </div>

            {selectedSection && (
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
                  <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                    <Paintbrush className="w-3.5 h-3.5" />
                    <span>Options sur-mesure pour "{getLocalizedSectionTitle(selectedSection.type, selectedSection.titre, langue)}"</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Arrière-plan de la section */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold block">Couleur d'arrière-plan</span>
                    <div className="flex items-center gap-2 bg-white dark:bg-black p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                      <input
                        type="color"
                        value={selectedSection.styleSection?.couleurFond || '#FFFFFF'}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { couleurFond: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={selectedSection.styleSection?.couleurFond || ''}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { couleurFond: e.target.value })}
                        placeholder="Transparent"
                        className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Opacité de l'arrière-plan */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Opacité de l'arrière-plan</span>
                      <span>{Math.round((selectedSection.styleSection?.backgroundOpacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedSection.styleSection?.backgroundOpacity ?? 1}
                      onChange={(e) => updateSectionStyle(selectedSection.id, { backgroundOpacity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                  {/* Couleur spécifique du titre */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold block">Couleur spécifique du titre</span>
                    <div className="flex items-center gap-2 bg-white dark:bg-black p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                      <input
                        type="color"
                        value={selectedSection.styleSection?.couleurTitre || cv.couleurAccent || '#18181B'}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { couleurTitre: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={selectedSection.styleSection?.couleurTitre || ''}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { couleurTitre: e.target.value })}
                        placeholder="Par défaut"
                        className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Couleur spécifique du texte */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold block">Couleur spécifique du texte</span>
                    <div className="flex items-center gap-2 bg-white dark:bg-black p-1.5 rounded-lg border border-black/10 dark:border-white/10">
                      <input
                        type="color"
                        value={selectedSection.styleSection?.couleurTexte || cv.couleurTexte || '#18181B'}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { couleurTexte: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={selectedSection.styleSection?.couleurTexte || ''}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { couleurTexte: e.target.value })}
                        placeholder="Par défaut"
                        className="w-full text-xs font-mono font-bold bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Motifs & Textures spécifiques */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                  <span className="text-xs font-bold block">Motif d'arrière-plan texturé spécifique</span>
                  <select
                    value={selectedSection.styleSection?.backgroundPattern || 'none'}
                    onChange={(e) => updateSectionStyle(selectedSection.id, { backgroundPattern: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                  >
                    <option value="none">Aucun motif (Fond uni)</option>
                    <option value="dots">Points fins (Dots Grid)</option>
                    <option value="grid">Grille quadrillée (Mesh Grid)</option>
                    <option value="lines">Lignes diagonales (Diagonal Lines)</option>
                    <option value="waves">Vagues douces (Soft Waves)</option>
                  </select>
                </div>

                {/* Disposition spécifique si section compétences */}
                {selectedSection.type === 'competences' && (
                  <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                    <span className="text-xs font-bold block">Disposition spécifique des compétences pour cette section</span>
                    <select
                      value={selectedSection.styleSection?.styleCompetences || ''}
                      onChange={(e) => updateSectionStyle(selectedSection.id, { styleCompetences: (e.target.value || undefined) as any })}
                      className="w-full p-2 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-lg text-xs font-bold text-black dark:text-white"
                    >
                      <option value="">Hériter de la disposition globale ({cv.styleCompetences || 'grid'})</option>
                      <option value="tech-cards">🚀 Cartes Tech 3 Colonnes (Style Modèles 51 à 55)</option>
                      <option value="icon-card-grid">🗂️ Cartes avec Icônes (Style Modèles 56 à 60)</option>
                      <option value="cards-modern">🎴 Cartes Modernes Ombrées (Bordure d'Accent)</option>
                      <option value="minimal-cards">◻️ Cartes Épurées Minimalistes</option>
                      <option value="grid">⊞ Grille Moderne (2 colonnes)</option>
                      <option value="grid-3">▦ Grille Compacte (3 colonnes - Idéal 1 page)</option>
                      <option value="badges">🏷️ Badges / Pilules Flottantes</option>
                      <option value="pill-bars">💊 Pilules avec Jauge Intégrée</option>
                      <option value="tags">#️⃣ Tags / Hashtags (#React #Python)</option>
                      <option value="progress">📊 Liste avec Barres de Progression (%)</option>
                      <option value="stars">⭐ Liste avec Étoiles d'Évaluation (★)</option>
                      <option value="circular-progress">🍩 Jauges Circulaires (% Donut)</option>
                      <option value="badges-multicolor">🎨 Badges Bicolores Alternés</option>
                      <option value="striped-table">📑 Lignes Stylisées Zébrées</option>
                      <option value="list">📋 Liste Épurée avec Puces</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Profile Info Editor */}
      {showProfileModal && (
        <HeaderProfileModal
          cv={cv}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSaveCV={(updated) => {
            onChangeCV(updated);
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
};
