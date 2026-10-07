import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { CV, CVTemplate, Section, ProfilContenu, SubscriptionTier, User } from '../types';
import { SectionSlot } from './SectionSlot';
import { DecorativeLayerRenderer } from './DecorativeLayerRenderer';
import { FONT_OPTIONS, canUseDecorativeWave } from '../data/templates';
import { getPresetForTemplate } from '../data/templatePresets';
import { getBackgroundStyle } from '../utils/backgroundHelpers';
import { getTranslation } from '../i18n/translations';
import { detectPaidFeaturesInCV } from '../utils/paidUsageDetector';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { getLuminance, getContrastRatio, getContrastText, resolveSubtitleColor } from '../utils/colorUtils';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UnifiedCVCanvasProps {
  id?: string;
  cv: CV;
  template: CVTemplate;
  userTier?: SubscriptionTier;
  user?: User | null;
  isReorderActive?: boolean;
  onSectionsReorder?: (newSections: Section[]) => void;
  onUpdateSectionZone?: (sectionId: string, newZone: 'gauche' | 'droite' | 'principale') => void;
  onUpdateCV?: (updated: Partial<CV>) => void;
  watermarkContent?: React.ReactNode;
  interactiveToolbar?: React.ReactNode;
  hideStatusBanner?: boolean;
}

// Draggable Wrapper Component for Section Slot inside preview
const SortablePreviewSection: React.FC<{
  section: Section;
  isSidebar: boolean;
  accentColor: string;
  secondaryAccentColor: string;
  textColor: string;
  headingColor: string;
  headerStyle: any;
  skillsDisplayMode: any;
  experienceDatesAlignment: any;
  bulletStyle: any;
  titleFontSizePt?: number;
  titleCase?: any;
  titleAlign?: any;
  fontCss: string;
  dynamicTextStyle: React.CSSProperties;
  isReorderActive: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onUpdateSection?: (updatedSection: Section) => void;
  onUpdateSectionStyle?: (sectionId: string, stylePatch: Partial<any>) => void;
}> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1
  };

  return (
    <div
      ref={setNodeRef}
      data-section-id={props.section.id}
      style={style}
      className={`cv-preview-section transition-shadow ${isDragging ? 'z-40 ring-4 ring-blue-500/80 rounded-2xl shadow-2xl bg-blue-50/20' : ''}`}
    >
      <SectionSlot
        {...props}
        isSelected={props.selectedSectionId === props.section.id}
        onSelect={props.onSelectSection}
        onUpdateSection={props.onUpdateSection}
        onUpdateSectionStyle={props.onUpdateSectionStyle}
        isReorderActive={props.isReorderActive}
        dragHandleProps={props.isReorderActive ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
};

// Droppable Column Wrapper Component for Cross-Column DnD
const DroppableZone: React.FC<{
  id: string;
  zoneName: 'gauche' | 'droite' | 'principale';
  sectionsList: Section[];
  isSidebar: boolean;
  isReorderActive: boolean;
  sectionGapPx: number;
  [key: string]: any;
}> = ({ id, zoneName, sectionsList, isSidebar, isReorderActive, sectionGapPx, ...props }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const safeSections = sectionsList.map((sec, idx) => ({
    ...sec,
    id: sec.id || `zone-${id}-sec-${sec.type || 'type'}-${idx}`
  }));

  return (
    <SortableContext items={safeSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`droppable-zone flex flex-col transition-all duration-150 min-h-[100px] ${
          isOver && isReorderActive
            ? 'bg-blue-100/70 border-2 border-dashed border-blue-600 rounded-2xl p-3 shadow-inner'
            : ''
        }`}
        style={{ gap: `${sectionGapPx}px` }}
      >
        {safeSections.map((sec) => (
          <SortablePreviewSection
            key={sec.id}
            section={sec}
            isSidebar={isSidebar}
            isReorderActive={isReorderActive}
            {...props}
          />
        ))}

        {/* Drop target indicator when empty or hovered during reorder mode */}
        {(sectionsList.length === 0 || (isOver && isReorderActive)) && isReorderActive && (
          <div
            className={`border-2 border-dashed p-3 rounded-2xl text-center text-xs font-black transition-all ${
              isOver
                ? 'border-blue-600 bg-blue-500 text-white shadow-lg scale-[1.02]'
                : 'border-blue-400/80 bg-blue-50/60 text-blue-700 hover:bg-blue-100/80'
            }`}
          >
            <span>
              {isOver ? 'Relâchez pour déposer dans la' : 'Déposez une section ici ('} Zone{' '}
              {zoneName === 'gauche' ? 'Gauche' : zoneName === 'droite' ? 'Droite' : 'Principale'}
              {!isOver && ')'}
            </span>
          </div>
        )}
      </div>
    </SortableContext>
  );
};

// COMPACTNESS LEVEL PRESETS (Default font 9pt, titles 11pt, line height 1.5)
const COMPACTNESS_LEVELS = [
  { fontSize: 9.00, lineHeight: 1.50, sectionGap: 10, itemGap: 3.5, padding: 10, titleSize: 11.00 },
  { fontSize: 8.50, lineHeight: 1.35, sectionGap: 8, itemGap: 3.0, padding: 8, titleSize: 10.50 },
  { fontSize: 8.00, lineHeight: 1.25, sectionGap: 6, itemGap: 2.5, padding: 7, titleSize: 10.00 },
  { fontSize: 7.50, lineHeight: 1.15, sectionGap: 5, itemGap: 2.0, padding: 6, titleSize: 9.50 }
];

export const UnifiedCVCanvas: React.FC<UnifiedCVCanvasProps> = ({
  id = 'cv-preview-container',
  cv,
  template,
  userTier,
  user,
  isReorderActive = false,
  onSectionsReorder,
  onUpdateSectionZone,
  onUpdateCV,
  watermarkContent,
  interactiveToolbar,
  hideStatusBanner = false
}) => {
  // Compute effective tier and admin status
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cv_builder_user') : null;
  let resolvedUserRole = user?.role;
  let resolvedUserTier = userTier || user?.subscriptionTier;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'ADMIN') resolvedUserRole = 'ADMIN';
      if (!resolvedUserTier) resolvedUserTier = (parsed.role === 'ADMIN' || parsed.subscriptionTier === 'premium') ? 'premium' : parsed.subscriptionTier;
    } catch (_) {}
  }
  if (resolvedUserRole === 'ADMIN') {
    resolvedUserTier = 'premium';
  }
  const effectiveTier: SubscriptionTier = (resolvedUserTier === 'premium' || resolvedUserTier === 'classique' || resolvedUserTier === 'decouverte') ? (resolvedUserTier as SubscriptionTier) : 'freemium';
  // Layout setup
  const templateTheme = template?.themeConfig || {};
  const preset = getPresetForTemplate(cv.templateId || template?.id || 'modele-1', cv.langue || 'fr');

  const isTwoColumn = (cv.nombreColonnes ?? preset?.nombreColonnes ?? (template?.layoutFamily === 'single-column' ? 1 : 2)) === 2;
  const sidebarPosition = cv.positionSidebar || preset?.positionSidebar || (template?.layoutFamily === 'two-column-right' ? 'droite' : 'gauche');
  const leftColWidth = cv.largeurColonneGauche || preset?.largeurColonneGauche || templateTheme.defaultLeftWidth || 34; // %
  const rightColWidth = 100 - leftColWidth;

  // Colors & Backgrounds - Faithfully resolve template accent and custom colors
  const fallbackTemplateAccent = preset?.couleurAccent || template?.defaultAccent || templateTheme.primaryColor || '#2563EB';
  const primaryAccent = (cv.couleurAccent && cv.couleurAccent !== '#000000')
    ? cv.couleurAccent
    : (fallbackTemplateAccent || '#2563EB');

  const fallbackTemplateSecondary = preset?.couleurAccentSecondaire || template?.defaultSecondaryAccent || templateTheme.secondaryColor || '#60A5FA';
  const secondaryAccent = (cv.couleurAccentSecondaire && cv.couleurAccentSecondaire !== '#000000')
    ? cv.couleurAccentSecondaire
    : (fallbackTemplateSecondary || '#60A5FA');

  // Luminance calculation for strict contrast enforcement
  const getLuminance = (colorStr?: string): number => {
    if (!colorStr || typeof colorStr !== 'string') return 1.0;
    const str = colorStr.trim().toLowerCase();
    if (str === 'transparent' || str === 'none') return 1.0;
    if (str.startsWith('#')) {
      const hex = str.replace('#', '');
      let r = 0, g = 0, b = 0;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255;
        g = parseInt(hex[1] + hex[1], 16) / 255;
        b = parseInt(hex[2] + hex[2], 16) / 255;
      } else if (hex.length >= 6) {
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
      } else {
        return 0.5;
      }
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    if (str.startsWith('rgb')) {
      const parts = str.match(/\d+/g);
      if (parts && parts.length >= 3) {
        const r = parseInt(parts[0], 10) / 255;
        const g = parseInt(parts[1], 10) / 255;
        const b = parseInt(parts[2], 10) / 255;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
    }
    return 0.5;
  };

  const defaultSidebarBg = isTwoColumn ? (templateTheme.sidebarBackgroundColor || '#F4F4F5') : '#FFFFFF';
  const effectiveSidebarColor = cv.couleurFondSidebar || defaultSidebarBg;

  const rawSidebarBg = cv.sidebarBackgroundType === 'gradient' && cv.sidebarBackgroundColorStart
    ? cv.sidebarBackgroundColorStart
    : effectiveSidebarColor;

  const isDarkBg = (bgStr?: string): boolean => {
    if (!bgStr || bgStr === 'transparent') return false;
    const lum = getLuminance(bgStr);
    return lum < 0.45;
  };

  const isNearWhite = (colorStr?: string): boolean => {
    if (!colorStr) return false;
    const s = colorStr.trim().toLowerCase();
    if (s === '#fff' || s === '#ffffff' || s === '#f8fafc' || s === '#f1f5f9' || s === '#fafafa' || s === 'white') return true;
    return getLuminance(colorStr) > 0.92;
  };

  const isSidebarDark = isDarkBg(rawSidebarBg);
  const isMainDark = isDarkBg(cv.couleurFond || templateTheme.backgroundColor || '#FFFFFF');

  // Auto-enforce readable high-contrast text color for dark/light sidebars & main canvas
  let sidebarTextColor = cv.couleurTexteSidebar;
  if (!sidebarTextColor) {
    sidebarTextColor = isSidebarDark ? '#FFFFFF' : '#1E293B';
  } else if (isSidebarDark && isDarkBg(sidebarTextColor)) {
    sidebarTextColor = '#FFFFFF';
  } else if (!isSidebarDark && !isDarkBg(sidebarTextColor) && isNearWhite(sidebarTextColor)) {
    sidebarTextColor = '#1E293B';
  }

  let sidebarHeadingColor = (cv.couleurTitreSectionSidebar && cv.couleurTitreSectionSidebar !== '#000000')
    ? cv.couleurTitreSectionSidebar
    : (preset?.couleurTitreSectionSidebar || (isSidebarDark ? '#FFFFFF' : primaryAccent));

  if (isSidebarDark) {
    if (isDarkBg(sidebarHeadingColor)) sidebarHeadingColor = '#FFFFFF';
  } else {
    if (isNearWhite(sidebarHeadingColor)) {
      sidebarHeadingColor = primaryAccent;
    }
  }

  let mainTextColor = cv.couleurTexte;
  if (!mainTextColor) {
    mainTextColor = isMainDark ? '#FFFFFF' : '#1E293B';
  } else if (isMainDark && isDarkBg(mainTextColor)) {
    mainTextColor = '#FFFFFF';
  } else if (!isMainDark && !isDarkBg(mainTextColor) && isNearWhite(mainTextColor)) {
    mainTextColor = '#1E293B';
  }

  let mainHeadingColor = (cv.couleurTitreSection && cv.couleurTitreSection !== '#000000')
    ? cv.couleurTitreSection
    : (preset?.couleurTitreSection || (isMainDark ? '#FFFFFF' : primaryAccent));

  if (isMainDark) {
    if (isDarkBg(mainHeadingColor)) mainHeadingColor = '#FFFFFF';
  } else {
    if (isNearWhite(mainHeadingColor)) {
      mainHeadingColor = primaryAccent;
    }
  }

  const mainBgStyle = getBackgroundStyle({
    backgroundType: cv.backgroundType,
    colorSolid: cv.couleurFond || preset?.couleurFond,
    opacity: cv.backgroundOpacity,
    colorStart: cv.backgroundColorStart,
    colorEnd: cv.backgroundColorEnd,
    patternName: cv.backgroundPattern,
    imageUrl: cv.backgroundImage,
    fallbackColor: cv.couleurFond || preset?.couleurFond || templateTheme.backgroundColor || '#FFFFFF'
  });

  const sidebarBgStyle = getBackgroundStyle({
    backgroundType: cv.sidebarBackgroundType,
    colorSolid: effectiveSidebarColor,
    opacity: cv.sidebarBackgroundOpacity,
    colorStart: cv.sidebarBackgroundColorStart,
    colorEnd: cv.sidebarBackgroundColorEnd,
    patternName: cv.sidebarBackgroundPattern,
    imageUrl: cv.sidebarBackgroundImage,
    fallbackColor: effectiveSidebarColor
  });

  // Styles & Typography Normalization
  const rawHeaderStyle = cv.styleEnTete || preset?.styleEnTete || templateTheme.headerStyle || 'banner';
  const headerStyle =
    rawHeaderStyle === 'diagonal' ? 'baxter-diagonal' :
    rawHeaderStyle === 'arc' ? 'ocean-wave' :
    rawHeaderStyle === 'split-profile' ? 'modern-split' :
    rawHeaderStyle;

  const rawSectionHeaderStyle = cv.styleEnTeteSection || preset?.styleEnTeteSection || templateTheme.sectionHeaderStyle || 'underline';
  const sectionHeaderStyle =
    rawSectionHeaderStyle === 'pill' ? 'underline' :
    rawSectionHeaderStyle === 'architect' ? 'double-line' :
    rawSectionHeaderStyle === 'dynamic-badge' ? 'badge-line' :
    rawSectionHeaderStyle;

  const rawSidebarDecor = cv.formeSidebarDecor || preset?.formeSidebarDecor || templateTheme.formeSidebarDecor || 'straight';
  const sidebarDecor =
    rawSidebarDecor === 'standard' ? 'straight' :
    rawSidebarDecor === 'vague' ? 'wave-cut' :
    rawSidebarDecor === 'arche' ? 'arch-top' :
    rawSidebarDecor === 'diagonale' ? 'diagonal-cut' :
    rawSidebarDecor === 'carte-flottante' ? 'card-float' :
    rawSidebarDecor;
  const formeSidebarDecor = sidebarDecor;
  const skillsDisplayMode = cv.styleCompetences || preset?.styleCompetences || templateTheme.skillsDisplayMode || 'badges';
  const datesAlignment = cv.alignementDatesExperience || preset?.alignementDatesExperience || templateTheme.experienceDatesAlignment || 'left';
  const effectiveDecorativeLayers = cv.decorativeLayers || preset?.decorativeLayers || templateTheme.decorativeLayers || [];
  const timelineStyle = cv.timelineStyle || preset?.timelineStyle || templateTheme.timelineStyle || 'none';
  const photoRing = cv.cadrePhotoRing || preset?.cadrePhotoRing || templateTheme.cadrePhotoRing || 'none';
  const badgesContactStyle = cv.styleBadgesCoordonnees || preset?.styleBadgesCoordonnees || (templateTheme as any)?.styleBadgesCoordonnees || 'none';

  const fontObj = FONT_OPTIONS.find(f => f.id === cv.police) || FONT_OPTIONS.find(f => f.id === template.defaultFont) || FONT_OPTIONS[0];
  const fontCss = fontObj ? fontObj.family : 'Inter, sans-serif';

  // Compactness & Scaling State
  const [compactnessLevel, setCompactnessLevel] = useState<number>(0);
  const cvInnerRef = useRef<HTMLDivElement>(null);
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [measuredHeightPx, setMeasuredHeightPx] = useState<number>(0);

  // Dynamically calibrate scaleFactor so the 794px A4 canvas fits perfectly on smaller screens/columns without distortion
  useLayoutEffect(() => {
    const updateScale = () => {
      if (hideStatusBanner) {
        setScaleFactor(1);
        return;
      }
      if (!outerWrapperRef.current) return;
      const availableW = outerWrapperRef.current.clientWidth;
      if (availableW && availableW > 0) {
        // Leave a small buffer for borders and shadows
        const effectiveAvailableW = Math.max(280, availableW - 12);
        const computedScale = effectiveAvailableW < 794 ? effectiveAvailableW / 794 : 1;
        setScaleFactor(computedScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && outerWrapperRef.current) {
      observer = new ResizeObserver(() => updateScale());
      observer.observe(outerWrapperRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScale);
      if (observer) observer.disconnect();
    };
  }, [hideStatusBanner]);

  // 1-page vs 2-pages auto detection
  const SINGLE_PAGE_PX = 1122;
  const is2Pages = cv.pageCibleMode === '2_pages';
  const hasExplicitPageBreak = (cv.sections || []).some(s => s.pageBreakBefore);
  const isForcedCompact = cv.pageCibleMode === 'compact';
  const isStrict1Page = cv.pageCibleMode === '1_page' || cv.pageCibleMode === 'compact';
  
  const activeLevel = COMPACTNESS_LEVELS[compactnessLevel] || COMPACTNESS_LEVELS[0];

  const fontSizePx = cv.taillePoliceValeur ?? activeLevel.fontSize;
  const lineHeightVal = cv.hauteurLigneValeur ?? activeLevel.lineHeight;
  const sectionGapPx = cv.espacementSectionsPx ?? cv.espacementSections ?? activeLevel.sectionGap;
  const itemGapPx = cv.espacementItemsPx ?? cv.espacementElements ?? activeLevel.itemGap;
  const titleFontSizePt = cv.tailleTitreSectionValeur ?? cv.tailleTitreSection ?? activeLevel.titleSize;
  const pagePaddingPx = cv.margeGlobalePage ?? activeLevel.padding;
  const hasContactFooter = cv.afficherFooterContact !== false;
  const hasCustomFooter = cv.afficherPiedDePage !== false || Boolean(cv.textePiedDePage) || Boolean(cv.afficherNumPagePiedDePage);

  let requiredFooterHeight = 0;
  if (hasContactFooter) requiredFooterHeight += 65;
  if (hasCustomFooter) requiredFooterHeight += 35;

  const baseUserFooterMargin = cv.margePiedDePagePx !== undefined ? cv.margePiedDePagePx : 35;
  const effectiveFooterPadding = requiredFooterHeight + baseUserFooterMargin;
  const footerMarginPx = effectiveFooterPadding;
  const margePiedDePagePx = cv.margePiedDePagePx ?? 35;

  // Header height estimation for single page calculation
  const topHeaderEstimatedH = (() => {
    if (cv.hauteurEnTetePx || cv.hauteurEnTete) {
      return Number(cv.hauteurEnTetePx || cv.hauteurEnTete);
    }
    if (isTwoColumn && (headerStyle === 'sidebar-top' || headerStyle === 'sylvie-wave' || headerStyle === 'sylvie-loiseau')) {
      return 0; // Integrated into sidebar
    }
    if (headerStyle === 'wave-bottom' || headerStyle === 'wave-top' || headerStyle === 'wave-double' || headerStyle === 'ocean-wave' || headerStyle === 'curved-wave-badge') {
      return 145;
    }
    if (headerStyle === 'two-tone-split' || headerStyle === 'two-tone-stripe' || headerStyle === 'baxter-diagonal' || headerStyle === 'diagonal-split' || headerStyle === 'modern-split') {
      return 130;
    }
    if (headerStyle === 'clean' || headerStyle === 'minimal' || headerStyle === 'simple-minimal' || headerStyle === 'centered-clean' || headerStyle === 'executive-stripe') {
      return 95;
    }
    if (headerStyle === 'banner' || headerStyle === 'student-geometric' || headerStyle === 'wave' || headerStyle === 'lime-ribbon') {
      return 150;
    }
    if (headerStyle === 'card' || headerStyle === 'luxury-gold') {
      return 130;
    }
    return 115;
  })();

  const rawProfilSec = (cv.sections || []).find(s => s.type === 'profil');
  const resumeFullWidthEstimatedH = (cv.profilDansEnTete || cv.afficherResumeSeulFullWidth || cv.resumeFullWidth) && rawProfilSec?.contenu?.resume ? 65 : 0;

  // Realistic item height estimator for precise pagination calibration
  const estimateItemHeight = (secType: string, it: any): number => {
    const charsPerLine = isTwoColumn ? 50 : 80;
    if (secType === 'experiences' || secType === 'experience') {
      const descLen = (it?.description || '').length;
      const tasksCount = Array.isArray(it?.taches) ? it.taches.length : 0;
      const descH = descLen > 0 ? Math.ceil(descLen / charsPerLine) * 16 : 0;
      const tasksH = tasksCount * 18;
      // 46px base covers dates, poste title, entreprise/ville line, and bottom border/margin
      return 46 + descH + tasksH + Math.min(8, itemGapPx);
    }
    if (secType === 'formations' || secType === 'formation') {
      const descLen = (it?.description || '').length;
      const descH = descLen > 0 ? Math.ceil(descLen / charsPerLine) * 16 : 0;
      // 48px base covers diploma title, institution, ville, dates, and bottom border/margin
      return 48 + descH + Math.min(8, itemGapPx);
    }
    if (secType === 'competences') {
      return isTwoColumn ? 26 : 22;
    }
    if (secType === 'langues' || secType === 'interets') {
      return 22;
    }
    return 28;
  };

  // Realistic section height estimator
  const estimateSectionHeight = (sec: Section): number => {
    const headerH = Math.max(26, Math.round((titleFontSizePt || 11) * 1.4)) + 10 + Math.min(10, sectionGapPx);
    if (sec.type === 'profil') {
      const resumeLen = (sec.contenu?.resume || sec.contenu?.texte || '').length;
      const resumeH = resumeLen > 0 ? Math.ceil(resumeLen / (isTwoColumn ? 50 : 80)) * 16 : 0;
      const contactKeys = ['email', 'telephone', 'adresse', 'siteWeb', 'linkedin', 'permis'].filter(k => Boolean(sec.contenu?.[k]));
      const contactH = contactKeys.length * 24;
      return headerH + resumeH + contactH + 12;
    }
    if ((sec.type as string) === 'experiences' || sec.type === 'experience') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const itemsH = items.reduce((acc: number, it: any) => acc + estimateItemHeight(sec.type, it), 0);
      return headerH + itemsH;
    }
    if ((sec.type as string) === 'formations' || sec.type === 'formation') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const itemsH = items.reduce((acc: number, it: any) => acc + estimateItemHeight(sec.type, it), 0);
      return headerH + itemsH;
    }
    if (sec.type === 'competences') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      return headerH + Math.max(24, Math.ceil(items.length / (isTwoColumn ? 2 : 4)) * 26);
    }
    if (sec.type === 'langues' || sec.type === 'interets') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      return headerH + Math.max(20, Math.ceil(items.length / 2) * 22);
    }
    const items = Array.isArray(sec.contenu) ? sec.contenu : [];
    return headerH + Math.max(24, items.length * 24);
  };

  // Single page capacity threshold with footer deduction (to check if content exceeds 1 page)
  const singlePageCapacity = Math.max(480, SINGLE_PAGE_PX - (pagePaddingPx * 2) - topHeaderEstimatedH - resumeFullWidthEstimatedH - requiredFooterHeight - 16);
  const totalEstimatedContentH = (cv.sections || []).reduce((sum, s) => sum + estimateSectionHeight(s), 0);
  const autoPageOverflow = measuredHeightPx > (SINGLE_PAGE_PX - requiredFooterHeight - 5) || totalEstimatedContentH > singlePageCapacity;

  // Render multi-page discrete sheets when:
  // 1) Explicitly in 2_pages mode
  // 2) OR explicit page break placed
  // 3) OR CV content fills Page 1
  const shouldRender2Pages = !isForcedCompact && (
    is2Pages || 
    hasExplicitPageBreak || 
    autoPageOverflow
  );

  // CRITICAL RULE: Page 1, Page 2 and all continuous sheets MUST have a dedicated bottom safety margin
  // calibrated finely so text is never cut off, while avoiding large unnatural bottom white voids
  const pageSafetyBottomMarginPx = Math.max(8, Math.round(pagePaddingPx * 0.4));
  const effectiveBottomSafetyMargin = Math.max(8, pageSafetyBottomMarginPx, requiredFooterHeight + 8);
  const p1FooterDeduction = shouldRender2Pages ? pageSafetyBottomMarginPx : effectiveBottomSafetyMargin;
  const safeContentCapacity = Math.max(390, SINGLE_PAGE_PX - (pagePaddingPx * 2) - topHeaderEstimatedH - resumeFullWidthEstimatedH - effectiveBottomSafetyMargin - 24);

  const dynamicTextStyle: React.CSSProperties = {
    fontSize: `${fontSizePx}pt`,
    lineHeight: lineHeightVal
  };

  const bulletStyle = cv.stylePucesListes || preset?.stylePucesListes || templateTheme.stylePucesListes || 'disc';
  const titleCase = cv.casseTitreSection || preset?.casseTitreSection || 'uppercase';
  const titleAlign = cv.alignementTitreSection || preset?.alignementTitreSection || (templateTheme as any)?.titleAlign || (templateTheme as any)?.alignementTitreSection || 'left';

  // Adaptive Auto-Compacting Layout Effect & Auto Page 2 Creation
  useLayoutEffect(() => {
    if (!cvInnerRef.current) return;

    // If 2 pages are rendered, measure only sheet 1 so scrollHeight is not trapped at 2244px
    const firstSheet = cvInnerRef.current.querySelector<HTMLElement>('[data-page-index="1"]');
    const currentHeight = firstSheet ? firstSheet.scrollHeight : cvInnerRef.current.scrollHeight;
    setMeasuredHeightPx(currentHeight);

    if (isStrict1Page) {
      // User wants 1 page: automatically adapt compactness if content slightly overflows
      if (currentHeight > SINGLE_PAGE_PX && compactnessLevel < 3) {
        setCompactnessLevel(prev => Math.min(3, prev + 1));
      } else if (currentHeight < SINGLE_PAGE_PX * 0.82 && compactnessLevel > 0) {
        setCompactnessLevel(prev => Math.max(0, prev - 1));
      }
    } else {
      if (compactnessLevel > 0 && currentHeight < SINGLE_PAGE_PX * 0.82) {
        setCompactnessLevel(prev => Math.max(0, prev - 1));
      }
    }
  }, [cv, isTwoColumn, leftColWidth, isStrict1Page, is2Pages, compactnessLevel]);

  // Section Selection & Quick Styling State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const handleUpdateSection = (updatedSec: Section) => {
    if (!onUpdateCV) return;
    const targetId = (updatedSec as any)._originalId || updatedSec.id.replace(/-part[12]$/, '');
    const newSections = (cv.sections || []).map(s => {
      if (s.id === targetId) {
        if (Array.isArray(s.contenu) && Array.isArray(updatedSec.contenu) && updatedSec.id.includes('-part')) {
          const isPart1 = updatedSec.id.endsWith('-part1');
          const otherItems = isPart1
            ? s.contenu.slice(updatedSec.contenu.length)
            : s.contenu.slice(0, Math.max(0, s.contenu.length - updatedSec.contenu.length));
          const mergedContenu = isPart1
            ? [...updatedSec.contenu, ...otherItems]
            : [...otherItems, ...updatedSec.contenu];
          return { ...s, ...updatedSec, id: targetId, titre: s.titre, contenu: mergedContenu };
        }
        return { ...s, ...updatedSec, id: targetId, titre: s.titre };
      }
      return s;
    });
    onUpdateCV({ sections: newSections });
  };

  const handleUpdateSectionStyle = (secId: string, stylePatch: Partial<any>) => {
    if (!onUpdateCV) return;
    const targetId = secId.replace(/-part[12]$/, '');
    const newSections = (cv.sections || []).map(s => {
      if (s.id === targetId) {
        return {
          ...s,
          styleSection: {
            ...(s.styleSection || {}),
            ...stylePatch
          }
        };
      }
      return s;
    });
    onUpdateCV({ sections: newSections });
  };

  // Section grouping by zones
  const leftZoneSections: Section[] = [];
  const rightZoneSections: Section[] = [];
  const mainZoneSections: Section[] = [];

  cv.sections.forEach(sec => {
    if (sec.visible === false) return;
    // When profilDansEnTete is active, profile is displayed in header/sub-header, so skip in body columns
    if (cv.profilDansEnTete && sec.type === 'profil') return;
    const targetZone = sec.colonne || 'principale';

    if (!isTwoColumn) {
      mainZoneSections.push(sec);
    } else {
      if (targetZone === 'gauche') {
        leftZoneSections.push(sec);
      } else if (targetZone === 'droite') {
        rightZoneSections.push(sec);
      } else {
        if (sec.type === 'experience' || sec.type === 'formation' || sec.type === 'projets' || sec.type === 'profil') {
          rightZoneSections.push(sec);
        } else {
          leftZoneSections.push(sec);
        }
      }
    }
  });

  // dnd sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // Live Cross-Column Drag Over Handler
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let targetZone: 'gauche' | 'droite' | 'principale' | null = null;
    if (over.id === 'zone-droppable-gauche') targetZone = 'gauche';
    else if (over.id === 'zone-droppable-droite') targetZone = 'droite';
    else if (over.id === 'zone-droppable-principale') targetZone = 'principale';
    else {
      const overSec = cv.sections.find(s => s.id === over.id);
      if (overSec) {
        targetZone =
          overSec.colonne ||
          (isTwoColumn
            ? overSec.type === 'experience' || overSec.type === 'formation'
              ? 'droite'
              : 'gauche'
            : 'principale');
      }
    }

    if (targetZone && onUpdateSectionZone) {
      const activeSec = cv.sections.find(s => s.id === active.id);
      if (activeSec && activeSec.colonne !== targetZone) {
        onUpdateSectionZone(activeSec.id, targetZone);
      }
    }
  };

  // Cross-Column Drag End Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onSectionsReorder) return;

    let targetZone: 'gauche' | 'droite' | 'principale' = 'principale';
    if (over.id === 'zone-droppable-gauche') targetZone = 'gauche';
    else if (over.id === 'zone-droppable-droite') targetZone = 'droite';
    else if (over.id === 'zone-droppable-principale') targetZone = 'principale';
    else {
      const overSec = cv.sections.find(s => s.id === over.id);
      if (overSec) {
        targetZone =
          overSec.colonne ||
          (isTwoColumn
            ? overSec.type === 'experience' || overSec.type === 'formation'
              ? 'droite'
              : 'gauche'
            : 'principale');
      }
    }

    const updated = cv.sections.map(s => {
      if (s.id === active.id) {
        return { ...s, colonne: targetZone };
      }
      return s;
    });

    const activeIdx = updated.findIndex(s => s.id === active.id);
    const overIdx = updated.findIndex(s => s.id === over.id);

    if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
      const [moved] = updated.splice(activeIdx, 1);
      updated.splice(overIdx, 0, moved);
    }

    updated.forEach((s, idx) => {
      s.ordre = idx + 1;
    });

    onSectionsReorder(updated);
  };

  // Ribbon state & padding calculation for 1-column layouts
  const isDecorativeWaveAllowed = canUseDecorativeWave(cv.templateId || template?.id);
  const hasRibbon = isDecorativeWaveAllowed && Boolean(cv.templateId === 'modele-2' || (cv.templateId || '').startsWith('ribbon-') || template?.layoutType === 'lime-ribbon' || template?.layoutType === 'ribbon' || cv.typeVague);
  const ribbonPaddingClass = hasRibbon ? (cv.rubanPosition === 'droite' ? 'pr-20 sm:pr-24' : 'pl-20 sm:pl-24') : '';

  // Candidate profil info
  const lang = cv.langue || 'fr';
  const profilSection = cv.sections.find(s => s.type === 'profil');
  const profilContenu = (profilSection?.contenu || {}) as ProfilContenu;
  const nomComplet = profilContenu.nomComplet || getTranslation(lang, 'firstNameLastName');
  const titrePro = profilContenu.titreProfessionnel || getTranslation(lang, 'jobTitlePlaceholder');

  let displayedMainTitle = nomComplet;
  let displayedSubTitle = titrePro;

  if (cv.grandTitreMode === 'poste' || cv.grandTitreMode === 'titre') {
    displayedMainTitle = titrePro;
    displayedSubTitle = nomComplet;
  } else if (cv.grandTitreMode === 'custom' || cv.grandTitreMode === 'surmesure') {
    displayedMainTitle = cv.grandTitreTexte || nomComplet;
    displayedSubTitle = `${nomComplet} • ${titrePro}`;
  }

  const mainTitleStyle: React.CSSProperties = {
    color: cv.couleurTitrePrincipal || undefined,
    fontSize: cv.tailleTitrePrincipal ? `${cv.tailleTitrePrincipal}pt` : undefined
  };

  const subTitleStyle: React.CSSProperties = {
    color: cv.couleurSousTitrePrincipal || undefined,
    fontSize: cv.tailleSousTitrePrincipal ? `${cv.tailleSousTitrePrincipal}pt` : undefined
  };

  const DEFAULT_AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const activePhotoUrl = cv.photoUrl || preset?.photoUrl || DEFAULT_AVATAR_FALLBACK;
  const showPhoto = cv.afficherPhoto !== false;
  const rawShape = cv.formePhoto || cv.photoForme || preset?.photoForme || templateTheme.photoFrameStyle || 'ronde';
  const photoSize = cv.photoSize ?? cv.photoTaillePx ?? cv.photoTaille ?? (isStrict1Page ? 64 : 96);
  const photoPos = cv.photoPosition || preset?.photoPosition || templateTheme.photoPosition || (headerStyle === 'sidebar-top' ? 'in-sidebar' : 'in-header');
  const effectivePhotoPos = !isTwoColumn ? 'in-header' : photoPos;
  const showHeaderPhoto = showPhoto && (effectivePhotoPos === 'in-header' || !isTwoColumn);
  const showSidebarPhoto = showPhoto && isTwoColumn && effectivePhotoPos === 'in-sidebar';
  const decorativeShape = templateTheme.decorativeShapes || 'none';

  // Photo mouse & touch drag handler
  const isDraggingPhotoRef = useRef(false);

  const handlePhotoMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cvInnerRef.current || !onUpdateCV) return;
    e.stopPropagation();
    isDraggingPhotoRef.current = true;

    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    const rect = cvInnerRef.current.getBoundingClientRect();
    const updatePosition = (moveX: number, moveY: number) => {
      const relX = Math.min(92, Math.max(0, Math.round(((moveX - rect.left) / rect.width) * 100)));
      const relY = Math.min(95, Math.max(0, Math.round(((moveY - rect.top) / rect.height) * 100)));
      onUpdateCV({ photoX: relX, photoY: relY, photoPosition: 'free' });
    };

    updatePosition(clientX, clientY);

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDraggingPhotoRef.current) return;
      const mX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      updatePosition(mX, mY);
    };

    const onEnd = () => {
      isDraggingPhotoRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  let photoShapeClass = 'rounded-full';
  let photoInlineStyle: React.CSSProperties = {};
  if (rawShape === 'carree' || rawShape === 'square') {
    photoShapeClass = 'rounded-none';
  } else if (rawShape === 'carree-doree') {
    photoShapeClass = 'rounded-sm shadow-xl';
    photoInlineStyle = {
      boxShadow: `0 0 0 3px #FFFFFF, 0 0 0 6px ${cv.photoBordureCouleur || primaryAccent || '#D97706'}, 0 10px 25px rgba(0,0,0,0.15)`
    };
  } else if (rawShape === 'cameo') {
    photoShapeClass = 'rounded-[50%/60%] shadow-2xl';
    photoInlineStyle = {
      boxShadow: `0 0 0 3px #FFFFFF, 0 0 0 5px ${cv.photoBordureCouleur || primaryAccent || '#B45309'}, 0 12px 30px rgba(0,0,0,0.2)`
    };
  } else if (rawShape === 'passe-partout') {
    photoShapeClass = 'rounded-none shadow-xl';
    photoInlineStyle = {
      padding: '4px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.1)'
    };
  } else if (rawShape === 'arrondie' || rawShape === 'rounded') {
    photoShapeClass = 'rounded-2xl';
  } else if (rawShape === 'arche' || rawShape === 'arch') {
    photoShapeClass = 'rounded-t-full rounded-b-md shadow-md';
  } else if (rawShape === 'hexagone') {
    photoShapeClass = 'rounded-none';
    photoInlineStyle = { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
  } else if (rawShape === 'galet' || rawShape === 'squircle') {
    photoShapeClass = 'rounded-[40%_60%_70%_30%_/_40%_40%_60%_60%] shadow-lg';
  } else {
    photoShapeClass = 'rounded-full';
  }

  const isCameo = rawShape === 'cameo';
  const customPhotoStyle: React.CSSProperties = {
    width: `${photoSize}px`,
    height: (rawShape === 'galet' || rawShape === 'squircle') ? `${photoSize * 1.25}px` : isCameo ? `${photoSize * 1.3}px` : `${photoSize}px`,
    borderColor: cv.photoBordureCouleur || primaryAccent || '#FFFFFF',
    borderWidth: cv.photoBordureEpaisseur !== undefined ? `${cv.photoBordureEpaisseur}px` : '2px',
    borderStyle: 'solid',
    borderRadius: cv.photoRayon !== undefined ? `${cv.photoRayon}px` : undefined,
    ...photoInlineStyle,
    ...(photoRing === 'double-ring' ? {
      outline: `3px solid ${primaryAccent}`,
      outlineOffset: '3px',
      boxShadow: `0 0 0 5px ${secondaryAccent || '#FFFFFF'}`
    } : photoRing === 'gold-ring' ? {
      outline: '3px solid #D97706',
      outlineOffset: '3px',
      boxShadow: '0 0 0 5px #FDE68A'
    } : photoRing === 'accent-ring' ? {
      outline: `3px solid ${primaryAccent}`,
      outlineOffset: '3px'
    } : {})
  };

  // Compute active ribbon state and alignment dynamically
  const isRibbonActiveNow = isDecorativeWaveAllowed && cv.afficherVagues !== false && (
    cv.afficherVagues === true ||
    (cv.templateId || '').startsWith('ribbon-') ||
    cv.templateId === 'modele-2' ||
    template?.layoutType === 'ribbon' ||
    template?.layoutType === 'lime-ribbon' ||
    (cv.formeSidebarDecor && cv.formeSidebarDecor !== 'straight') ||
    Boolean(cv.typeVague)
  );
  const ribbonSidePos = cv.positionSidebar || preset?.positionSidebar || 'gauche';
  const wavePos = cv.positionVagues || 'sidebar';
  const effectiveWaveSide = (wavePos === 'droite' || (wavePos === 'sidebar' && ribbonSidePos === 'droite')) ? 'droite' : 'gauche';
  const isLateralWave = wavePos === 'sidebar' || wavePos === 'gauche' || wavePos === 'droite';
  const ribbonContentPadding = isRibbonActiveNow && isLateralWave
    ? (effectiveWaveSide === 'droite' ? 'pr-20 sm:pr-24 pl-0' : 'pl-20 sm:pl-24 pr-0')
    : (isRibbonActiveNow && wavePos === 'haut' ? 'pt-6' : isRibbonActiveNow && wavePos === 'bas' ? 'pb-8' : '');

  // Render Wave Decorative SVG Flow (supporting haut, bas, fond, gauche, droite, sidebar)
  const renderRibbonLeftMargin = () => {
    if (!isRibbonActiveNow) return null;

    const shape = cv.typeVague || cv.formeSidebarDecor || preset?.formeSidebarDecor || 'wave-cut';
    const pColor = cv.couleurVague1 || cv.couleurAccent || primaryAccent || '#84CC16';
    const sColor = cv.couleurVague2 || cv.couleurAccentSecondaire || secondaryAccent || '#065F46';
    const tColor = cv.couleurVague3 || cv.decorBanniereCouleur2 || secondaryAccent || '#38BDF8';
    const opac = Math.max(0.92, cv.opaciteVagues ?? cv.ribbonOpacite ?? 0.95);

    // 1. POSITION: TOP (En-tête / Haut de page)
    if (wavePos === 'haut') {
      return (
        <div className="absolute top-0 left-0 right-0 w-full h-16 sm:h-20 pointer-events-none z-0 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 L1200,0 L1200,50 C920,95 700,25 400,75 C200,105 100,50 0,80 Z" fill={pColor} opacity={opac} />
            <path d="M0,0 L1200,0 L1200,30 C960,70 720,20 480,55 C240,80 120,40 0,55 Z" fill={sColor} opacity={opac * 0.8} />
            <path d="M0,0 L1200,0 L1200,18 C1020,45 780,10 540,35 C300,55 150,25 0,32 Z" fill={tColor} opacity={opac * 0.5} />
          </svg>
        </div>
      );
    }

    // 2. POSITION: BOTTOM (Pied de page / Bas de page)
    if (wavePos === 'bas') {
      return (
        <div className="absolute bottom-0 left-0 right-0 w-full h-16 sm:h-20 pointer-events-none z-0 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120 L1200,120 L1200,70 C920,25 700,95 400,45 C200,15 100,70 0,40 Z" fill={pColor} opacity={opac} />
            <path d="M0,120 L1200,120 L1200,90 C960,50 720,100 480,65 C240,40 120,80 0,65 Z" fill={sColor} opacity={opac * 0.8} />
            <path d="M0,120 L1200,120 L1200,102 C1020,75 780,110 540,85 C300,65 150,95 0,88 Z" fill={tColor} opacity={opac * 0.5} />
          </svg>
        </div>
      );
    }

    // 3. POSITION: BACKGROUND (Arrière-plan global de page)
    if (wavePos === 'fond') {
      return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
          <svg className="w-full h-full" viewBox="0 0 800 1122" preserveAspectRatio="none">
            <path d="M 0 0 C 400 200, 100 500, 500 700 C 700 850, 200 950, 400 1122 L 0 1122 Z" fill={pColor} opacity={opac * 0.4} />
            <path d="M 800 0 C 500 200, 700 450, 400 700 C 200 900, 600 1000, 500 1122 L 800 1122 Z" fill={sColor} opacity={opac * 0.3} />
          </svg>
        </div>
      );
    }

    // 4. POSITION: LATERAL / SIDEBAR (Gauche ou Droite) - Opaque et en arrière-plan (z-0) pour ne jamais masquer les écrits
    const posClass = effectiveWaveSide === 'droite' ? 'right-0 scale-x-[-1]' : 'left-0';

    if (shape === 'minimal-lines' || shape === 'minimal-stripes' || cv.templateId === 'ribbon-minimal') {
      return (
        <div className={`absolute top-0 bottom-0 ${posClass} w-16 sm:w-20 h-full pointer-events-none z-0 overflow-hidden`}>
          <svg className="w-full h-full" viewBox="0 0 100 1122" preserveAspectRatio="none">
            <path d="M 12 0 C 45 300, 5 600, 35 1122" fill="none" stroke={pColor} strokeWidth="3" opacity={opac} />
            <path d="M 22 0 C 55 300, 15 600, 45 1122" fill="none" stroke={sColor} strokeWidth="2" opacity={opac * 0.75} />
            <path d="M 32 0 C 65 300, 25 600, 55 1122" fill="none" stroke={tColor} strokeWidth="1" opacity={opac * 0.5} />
          </svg>
        </div>
      );
    }

    if (shape === 'hex-grid') {
      return (
        <div className={`absolute top-0 bottom-0 ${posClass} w-20 sm:w-24 h-full pointer-events-none z-0 overflow-hidden`}>
          <svg className="w-full h-full" viewBox="0 0 100 1122" preserveAspectRatio="none">
            <defs>
              <pattern id="ribbonHexPattern" width="30" height="52" patternUnits="userSpaceOnUse">
                <path d="M15 0 L30 8.6 L30 26 L15 34.6 L0 26 L0 8.6 Z" fill="none" stroke={pColor} strokeWidth="1.5" opacity={opac * 0.4} />
                <path d="M15 52 L30 43.4 L30 26 L15 17.4 L0 26 L0 43.4 Z" fill="none" stroke={sColor} strokeWidth="1.5" opacity={opac * 0.3} />
              </pattern>
            </defs>
            <rect x="0" y="0" width="80" height="1122" fill="url(#ribbonHexPattern)" />
            <line x1="80" y1="0" x2="80" y2="1122" stroke={pColor} strokeWidth="2" opacity={opac} />
          </svg>
        </div>
      );
    }

    if (shape === 'wave-double') {
      return (
        <div className={`absolute top-0 bottom-0 ${posClass} w-20 sm:w-28 h-full pointer-events-none z-0 overflow-hidden`}>
          <svg className="w-full h-full" viewBox="0 0 100 1122" preserveAspectRatio="none">
            <path d="M 0 0 C 80 200, 20 400, 70 600 C 110 800, 20 950, 50 1122 L 0 1122 Z" fill={pColor} opacity={opac} />
            <path d="M 0 0 C 60 220, 10 420, 50 620 C 90 820, 10 970, 35 1122 L 0 1122 Z" fill={sColor} opacity={opac * 0.8} />
          </svg>
        </div>
      );
    }

    if (shape === 'diagonal-cut') {
      return (
        <div className={`absolute top-0 bottom-0 ${posClass} w-20 sm:w-24 h-full pointer-events-none z-0 overflow-hidden`}>
          <svg className="w-full h-full" viewBox="0 0 100 1122" preserveAspectRatio="none">
            <polygon points="0,0 80,0 20,400 0,400" fill={pColor} opacity={opac} />
            <polygon points="0,350 90,350 30,800 0,800" fill={sColor} opacity={opac * 0.85} />
            <polygon points="0,750 100,750 40,1122 0,1122" fill={tColor} opacity={opac * 0.7} />
          </svg>
        </div>
      );
    }

    if (shape === 'arch-top') {
      return (
        <div className={`absolute top-0 bottom-0 ${posClass} w-20 sm:w-24 h-full pointer-events-none z-0 overflow-hidden`}>
          <svg className="w-full h-full" viewBox="0 0 100 1122" preserveAspectRatio="none">
            <path d="M 0 0 C 90 0, 90 200, 60 400 C 30 600, 80 800, 40 1122 L 0 1122 Z" fill={pColor} opacity={opac} />
            <path d="M 0 0 C 110 0, 110 180, 80 380 C 40 580, 100 780, 60 1122 L 40 1122 Z" fill={sColor} opacity={opac * 0.75} />
          </svg>
        </div>
      );
    }

    // Default Wave Cut (Multi-Color Flowing Waves - Opaque et z-0)
    return (
      <div className={`absolute top-0 bottom-0 ${posClass} w-20 sm:w-24 h-full pointer-events-none z-0 overflow-hidden`}>
        <svg className="w-full h-full" viewBox="0 0 100 1122" preserveAspectRatio="none">
          {/* Main outer wave ribbon (Primary Accent) */}
          <path d="M 0 0 C 55 260, 95 440, 35 720 C -5 900, 60 1020, 20 1122 L 0 1122 Z" fill={pColor} opacity={opac} />
          {/* Secondary inner wave ribbon (Secondary Accent) */}
          <path d="M 0 0 C 75 240, 115 420, 55 700 C 20 860, 80 980, 35 1122 L 20 1122 C 60 980, 5 860, 40 700 C 95 420, 55 240, 0 0 Z" fill={sColor} opacity={opac * 0.85} />
          {/* Third accent highlight wave (Color 3) */}
          <path d="M 0 0 C 90 220, 130 400, 70 680 C 35 840, 95 960, 50 1122 L 40 1122 C 80 960, 25 840, 60 680 C 115 400, 75 220, 0 0 Z" fill={tColor} opacity={opac * 0.45} />
        </svg>
      </div>
    );
  };

  // Render Top Header
  const renderTopHeader = () => {
    const customHeaderHeight = (cv.hauteurEnTetePx || cv.hauteurEnTete) ? `${cv.hauteurEnTetePx || cv.hauteurEnTete}px` : undefined;
    const defaultBg = cv.couleurFondProfil || profilSection?.styleSection?.couleurFond;
    const profileBgColor = defaultBg || primaryAccent;
    const isHeaderBgDark = isDarkBg(profileBgColor);
    const profileTextColor = cv.couleurTexteProfil || profilSection?.styleSection?.couleurTexte || (isHeaderBgDark ? '#FFFFFF' : '#0F172A');

    // Student Geometric Angular Header (Exact replica of Image 24.jpeg - Aurélie Legrand)
    if (headerStyle === 'student-geometric' || (cv.templateId || '').startsWith('student-geometric-') || template?.layoutType === 'student-geometric') {
      const parts = (displayedMainTitle || '').trim().split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');
      const resumeText = profilSection?.contenu?.resume;

      return (
        <div
          className="w-full relative overflow-hidden bg-slate-50 flex flex-col shrink-0 border-b border-slate-200/80 pb-4"
          style={{ minHeight: customHeaderHeight || '160px' }}
        >
          {/* Geometric Polygon Overlay SVG (Image 24.jpeg) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Top-Right Large Accent Polygon */}
              <polygon points="180,0 800,0 800,120 220,170" fill={primaryAccent || '#E08D69'} opacity={cv.ribbonOpacite ?? 0.95} />
              {/* Top-Left Dark Navy Triangle */}
              <polygon points="0,0 340,0 130,170 0,170" fill={secondaryAccent || '#0B2545'} opacity={cv.ribbonOpacite ?? 1} />
            </svg>
          </div>

          <div className="relative z-10 w-full px-6 pt-5 flex items-start justify-between gap-6">
            {/* Left Photo Overlapping Dark Triangle */}
            {showHeaderPhoto && (
              <div className="shrink-0 mt-2 ml-2 sm:ml-4">
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    width: `${photoSize || 110}px`,
                    height: `${photoSize || 110}px`,
                    borderColor: '#FFFFFF',
                    borderWidth: '4px',
                    boxShadow: '0 12px 30px -5px rgba(0,0,0,0.3)'
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              </div>
            )}

            {/* Right Main Text & Subtitle & Intro */}
            <div className="flex-1 space-y-1.5 pt-2 pl-4">
              <h1
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                    });
                  }
                }}
                style={mainTitleStyle}
                className="text-2xl sm:text-3xl font-black uppercase tracking-wide leading-tight outline-none cursor-text flex items-center gap-2 flex-wrap"
              >
                <span style={{ color: cv.couleurTitrePrincipal || primaryAccent || '#E08D69' }}>{firstName}</span>
                {lastName && <span style={{ color: cv.couleurTitrePrincipal || primaryAccent || '#E08D69' }}>{lastName}</span>}
              </h1>

              {/* Subtitle Accent Line & Text */}
              <div className="space-y-1">
                <div className="w-10 h-0.5" style={{ backgroundColor: primaryAccent }} />
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: '#334155' }}
                  className="text-xs font-black uppercase tracking-widest outline-none cursor-text opacity-90"
                >
                  {displayedSubTitle}
                </p>
              </div>

              {/* Brief Resume Intro text if available */}
              {resumeText && (
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), resume: e.currentTarget.innerText }
                      });
                    }
                  }}
                  className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-normal line-clamp-3 pt-1 outline-none cursor-text max-w-lg"
                >
                  {resumeText}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Ribbon Family Header
    if (headerStyle === 'ribbon-header' || (cv.templateId || '').startsWith('ribbon-') || template?.layoutType === 'ribbon') {
      const ribbonHeaderBg = isMainDark ? '#0F172A' : '#FFFFFF';
      const parts = (displayedMainTitle || '').trim().split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');

      return (
        <div
          className="w-full relative overflow-hidden px-6 pt-5 pb-4 flex items-center justify-between shrink-0 bg-white border-b border-slate-100"
          style={{ backgroundColor: ribbonHeaderBg, minHeight: customHeaderHeight || '120px' }}
        >
          {/* Main Title & Subtitle */}
          <div className="relative z-10 space-y-1 max-w-xl pl-16 sm:pl-20">
            <h1
              contentEditable={Boolean(profilSection && onUpdateCV)}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (profilSection) {
                  handleUpdateSection({
                    ...profilSection,
                    contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                  });
                }
              }}
              style={mainTitleStyle}
              className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-2 flex-wrap leading-tight outline-none cursor-text"
            >
              <span style={{ color: cv.couleurTitrePrincipal || primaryAccent }}>{firstName}</span>
              {lastName && <span style={{ color: cv.couleurTitrePrincipal || secondaryAccent || '#0F172A' }}>{lastName}</span>}
            </h1>
            <p
              contentEditable={Boolean(profilSection && onUpdateCV)}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (profilSection) {
                  handleUpdateSection({
                    ...profilSection,
                    contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                  });
                }
              }}
              style={{ ...subTitleStyle, color: resolveSubtitleColor(ribbonHeaderBg, cv.couleurSousTitrePrincipal, secondaryAccent, primaryAccent) }}
              className="text-xs font-bold uppercase tracking-widest outline-none cursor-text opacity-90"
            >
              {displayedSubTitle}
            </p>
          </div>

          {/* Photo */}
          {showHeaderPhoto && (
            <div className="relative z-10 mr-2 sm:mr-4 shrink-0">
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  borderColor: '#FFFFFF',
                  borderWidth: '3px',
                  outline: `3px solid ${primaryAccent}`,
                  outlineOffset: '2px',
                  boxShadow: `0 8px 25px -4px ${primaryAccent}40`
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // 10 NEW DIVERSE NON-DEVELOPER HEADERS:

    // 1. EXECUTIVE-CENTERED (Haute Direction, Présidence, Conseil d'Administration)
    if (headerStyle === 'executive-centered') {
      return (
        <div
          className="w-full relative py-6 px-6 sm:px-10 shrink-0 text-center border-b-2 select-none"
          style={{
            backgroundColor: profileBgColor || '#FFFFFF',
            borderColor: `${primaryAccent}30`,
            minHeight: customHeaderHeight || '160px'
          }}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  borderColor: primaryAccent,
                  boxShadow: `0 8px 25px -4px ${primaryAccent}33`
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}

            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-10 sm:w-16" style={{ backgroundColor: `${primaryAccent}40` }} />
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}
                  className="text-2xl sm:text-3xl font-serif font-black tracking-widest uppercase outline-none cursor-text"
                >
                  {displayedMainTitle}
                </h1>
                <span className="h-px w-10 sm:w-16" style={{ backgroundColor: `${primaryAccent}40` }} />
              </div>

              <p
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                    });
                  }
                }}
                style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || secondaryAccent || '#475569' }}
                className="text-xs sm:text-sm font-serif font-semibold tracking-wider uppercase opacity-90 outline-none cursor-text"
              >
                {displayedSubTitle}
              </p>

              {profilContenu?.resume && (
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), resume: e.currentTarget.innerText }
                      });
                    }
                  }}
                  className="text-[11px] leading-relaxed max-w-xl mx-auto opacity-80 pt-1 outline-none cursor-text italic font-serif"
                  style={{ color: profileTextColor }}
                >
                  « {profilContenu.resume} »
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2. NOTARIAL-CREST (Études Notariales, Magistrature, Droit des Affaires)
    if (headerStyle === 'notarial-crest') {
      return (
        <div
          className="w-full relative p-6 shrink-0 border-b select-none"
          style={{
            backgroundColor: profileBgColor || '#FBFBFA',
            borderColor: `${primaryAccent}40`,
            borderBottomWidth: '3px',
            minHeight: customHeaderHeight || '140px'
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {showHeaderPhoto && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    borderColor: primaryAccent,
                    borderWidth: '2px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
                  <span>⚖️</span> Cabinet & Notariat
                </div>
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}
                  className="text-xl sm:text-2xl font-serif font-black tracking-wider uppercase outline-none cursor-text"
                >
                  {displayedMainTitle}
                </h1>
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || secondaryAccent || '#78350F' }}
                  className="text-xs font-serif font-bold uppercase tracking-widest outline-none cursor-text"
                >
                  {displayedSubTitle}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end border-l pl-4 text-right opacity-85" style={{ borderColor: `${primaryAccent}25` }}>
              <span className="text-[10px] font-serif font-bold tracking-wider uppercase" style={{ color: primaryAccent }}>
                Assermenté • Cour d'Appel
              </span>
              <span className="text-[9px] text-neutral-500 font-mono">Déontologie & Confidentialité</span>
            </div>
          </div>
        </div>
      );
    }

    // 3. MEDICAL-CLINIC (Médecins Spécialistes, Chirurgiens, Cadres de Santé)
    if (headerStyle === 'medical-clinic') {
      return (
        <div
          className="w-full relative px-6 py-5 shrink-0 border-b select-none bg-gradient-to-r from-teal-50/40 via-white to-sky-50/40"
          style={{
            borderColor: `${primaryAccent}30`,
            borderBottomWidth: '2px',
            minHeight: customHeaderHeight || '130px'
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {showHeaderPhoto && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    borderColor: primaryAccent,
                    borderWidth: '2px',
                    boxShadow: `0 4px 14px ${primaryAccent}25`
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                  Praticien Hospitalier & Clinique
                </div>
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}
                  className="text-xl sm:text-2xl font-bold tracking-tight outline-none cursor-text"
                >
                  {displayedMainTitle}
                </h1>
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || secondaryAccent || '#0D9488' }}
                  className="text-xs font-semibold uppercase tracking-wider outline-none cursor-text"
                >
                  {displayedSubTitle}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-1 text-[10px] opacity-80">
              <span className="font-semibold text-teal-900">RPPS / Inscription Ordre</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-teal-200 shadow-2xs font-bold text-teal-700">
                FR-75014-MED
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 4. LUXURY-MENU (Chefs Étoilés, Grands Palaces, Maîtres Sommeliers)
    if (headerStyle === 'luxury-menu') {
      return (
        <div
          className="w-full relative px-6 py-6 shrink-0 border-b-2 select-none text-center"
          style={{
            backgroundColor: profileBgColor || '#0C0A09',
            borderColor: cv.couleurAccentSecondaire || '#D97706',
            color: '#FFFFFF',
            minHeight: customHeaderHeight || '160px'
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-amber-400 text-xs tracking-[0.3em] font-serif uppercase">★ ★ ★ HAUTE GASTRONOMIE ★ ★ ★</span>
            <div className="flex items-center gap-5 justify-center">
              {showHeaderPhoto && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    borderColor: '#D97706',
                    borderWidth: '2px',
                    boxShadow: '0 0 15px rgba(217, 119, 6, 0.4)'
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              <div className="space-y-1">
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}
                  className="text-2xl sm:text-3xl font-serif font-black tracking-widest uppercase outline-none cursor-text text-amber-50"
                >
                  {displayedMainTitle}
                </h1>
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || '#FBBF24' }}
                  className="text-xs sm:text-sm font-serif italic tracking-widest uppercase outline-none cursor-text"
                >
                  {displayedSubTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 5. ASYMMETRIC-BLUEPRINT (Architectes DPLG, Urbanistes, BTP & Scénographes)
    if (headerStyle === 'asymmetric-blueprint') {
      return (
        <div
          className="w-full relative px-6 py-5 shrink-0 border-b select-none bg-slate-900 text-slate-100 font-mono"
          style={{
            borderColor: primaryAccent || '#38BDF8',
            borderBottomWidth: '3px',
            minHeight: customHeaderHeight || '140px'
          }}
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {showHeaderPhoto && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    borderColor: '#38BDF8',
                    borderWidth: '2px',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)'
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-widest text-sky-400 font-bold flex items-center gap-2">
                  <span>📐 CAD_REF // SPEC_2026</span>
                  <span className="text-slate-500">•</span>
                  <span>ORDRE DES ARCHITECTES</span>
                </div>
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}
                  className="text-xl sm:text-2xl font-black uppercase tracking-tight outline-none cursor-text"
                >
                  {displayedMainTitle}
                </h1>
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || '#38BDF8' }}
                  className="text-xs font-bold uppercase tracking-wider outline-none cursor-text"
                >
                  {displayedSubTitle}
                </p>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 border border-slate-700 p-2 rounded bg-slate-800/60 hidden sm:block">
              <div>ÉCHELLE : 1/100</div>
              <div>HOMOLOGATION HQE / BREEAM</div>
            </div>
          </div>
        </div>
      );
    }

    // 6. ACADEMIC-JOURNAL (Professeurs d'Université, Chercheurs, Doyens)
    if (headerStyle === 'academic-journal') {
      return (
        <div
          className="w-full relative px-8 py-5 shrink-0 border-y select-none bg-stone-50/70 border-stone-300"
          style={{
            borderColor: `${primaryAccent}50`,
            borderTopWidth: '3px',
            borderBottomWidth: '1px',
            minHeight: customHeaderHeight || '140px'
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[9px] font-serif font-bold uppercase tracking-widest text-neutral-500">
                CURRICULUM VITÆ ACADÉMIQUE • CHAIRE D'ENSEIGNEMENT SUPÉRIEUR
              </div>
              <h1
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                    });
                  }
                }}
                style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}
                className="text-2xl font-serif font-black tracking-wide outline-none cursor-text"
              >
                {displayedMainTitle}
              </h1>
              <p
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                    });
                  }
                }}
                style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || secondaryAccent || '#44403C' }}
                className="text-xs font-serif italic tracking-wider outline-none cursor-text"
              >
                {displayedSubTitle}
              </p>
            </div>

            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  borderColor: primaryAccent,
                  borderWidth: '2px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 7. SOFT-ORGANIC (Psychologues, Éducateurs, Ressources Humaines & Talents)
    if (headerStyle === 'soft-organic') {
      return (
        <div
          className="w-full relative p-5 shrink-0 rounded-2xl select-none mb-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-lime-50 border border-emerald-200/80 shadow-2xs"
          style={{ minHeight: customHeaderHeight || '130px' }}
        >
          <div className="flex items-center gap-5">
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  borderColor: '#059669',
                  borderWidth: '2px',
                  boxShadow: '0 6px 16px rgba(5, 150, 105, 0.2)'
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}

            <div className="space-y-1 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                Relations Humaines & Bienveillance
              </span>
              <h1
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                    });
                  }
                }}
                style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#065F46' }}
                className="text-xl sm:text-2xl font-bold tracking-tight outline-none cursor-text text-emerald-950"
              >
                {displayedMainTitle}
              </h1>
              <p
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                    });
                  }
                }}
                style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || '#059669' }}
                className="text-xs font-medium tracking-wide outline-none cursor-text text-emerald-800"
              >
                {displayedSubTitle}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 8. HORLOGERIE-GUILLOCHE (Maîtres Artisans, Horlogerie & Joaillerie de Précision)
    if (headerStyle === 'horlogerie-guilloche') {
      return (
        <div
          className="w-full relative px-6 py-5 shrink-0 border-b select-none bg-stone-900 text-stone-100"
          style={{
            borderColor: '#D97706',
            borderBottomWidth: '2px',
            minHeight: customHeaderHeight || '140px'
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {showHeaderPhoto && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    borderColor: '#D97706',
                    borderWidth: '2px',
                    boxShadow: '0 0 12px rgba(217, 119, 6, 0.3)'
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-[0.25em] text-amber-400 font-serif">
                  MANUFACTURE D'EXCEPTION • PRÉCISION
                </div>
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}
                  className="text-xl sm:text-2xl font-serif font-black tracking-widest uppercase outline-none cursor-text"
                >
                  {displayedMainTitle}
                </h1>
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || '#FBBF24' }}
                  className="text-xs font-serif tracking-widest uppercase outline-none cursor-text opacity-90"
                >
                  {displayedSubTitle}
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right border-l border-stone-700 pl-4 text-[9px] font-mono text-stone-400">
              <div>TOLÉRANCE : ± 0.002 mm</div>
              <div>GENEVA SEAL STANDARD</div>
            </div>
          </div>
        </div>
      );
    }

    // 9. NEWSPAPER-HEADLINE (Journalistes, Rédacteurs en Chef, Directeurs de Publication)
    if (headerStyle === 'newspaper-headline') {
      return (
        <div
          className="w-full relative px-6 py-5 shrink-0 border-y-2 border-black select-none text-center bg-white"
          style={{ minHeight: customHeaderHeight || '140px' }}
        >
          <div className="flex items-center justify-between text-[9px] font-serif border-b border-black pb-1 mb-2 uppercase tracking-widest">
            <span>Édition Spéciale</span>
            <span>CARRIÈRE & INVESTIGATION</span>
            <span>Paris, {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shrink-0 ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  borderColor: '#000000',
                  borderWidth: '2px'
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none filter grayscale ${photoShapeClass}`} />
              </div>
            )}

            <div className="space-y-0.5">
              <h1
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                    });
                  }
                }}
                style={mainTitleStyle}
                className="text-2xl sm:text-3xl font-serif font-black tracking-tight uppercase outline-none cursor-text leading-tight"
              >
                {displayedMainTitle}
              </h1>
              <p
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (profilSection) {
                    handleUpdateSection({
                      ...profilSection,
                      contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                    });
                  }
                }}
                style={subTitleStyle}
                className="text-xs font-serif font-bold italic tracking-wide outline-none cursor-text text-neutral-800"
              >
                {displayedSubTitle}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 10. EVENT-MARQUEE (Directeurs Artistiques, Événementiel, Scènes Nationales)
    if (headerStyle === 'event-marquee') {
      return (
        <div
          className="w-full relative px-6 py-5 shrink-0 select-none bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 text-white rounded-b-xl shadow-md"
          style={{ minHeight: customHeaderHeight || '135px' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {showHeaderPhoto && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    ...customPhotoStyle,
                    borderColor: '#A855F7',
                    borderWidth: '2px',
                    boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              <div className="space-y-1 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 bg-purple-800/60 px-2 py-0.5 rounded">
                  ★ PRODUCTION & SPECTACLE VIVANT
                </span>
                <h1
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}
                  className="text-xl sm:text-2xl font-black tracking-wider uppercase outline-none cursor-text"
                >
                  {displayedMainTitle}
                </h1>
                <p
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (profilSection) {
                      handleUpdateSection({
                        ...profilSection,
                        contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                      });
                    }
                  }}
                  style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || '#C084FC' }}
                  className="text-xs font-bold uppercase tracking-wider outline-none cursor-text"
                >
                  {displayedSubTitle}
                </p>
              </div>
            </div>

            <div className="text-[9px] font-mono text-purple-200 border border-purple-500/40 px-3 py-1.5 rounded-full bg-purple-950/50">
              PROGRAMMATION CULTURELLE
            </div>
          </div>
        </div>
      );
    }

    // 0. Sylvie Loiseau Header Style (Integrated in Top Sidebar for 2-col, or Top Banner for 1-col)
    if (headerStyle === 'sylvie-wave' || headerStyle === 'sylvie-loiseau') {
      if (isTwoColumn) return null;
      return (
        <div
          className="w-full relative overflow-hidden px-6 py-5 rounded-b-2xl shadow-xs mb-3 flex items-center justify-between text-white shrink-0"
          style={{ backgroundColor: primaryAccent || '#0284C7', minHeight: customHeaderHeight || '120px' }}
        >
          <div className="space-y-1 z-10">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white" style={mainTitleStyle}>
              {displayedMainTitle}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/90" style={subTitleStyle}>
              {displayedSubTitle}
            </p>
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform z-10 ${photoShapeClass}`}
              style={{ ...customPhotoStyle, borderColor: cv.photoBordureCouleur || '#FFFFFF' }}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // Thomas Durant Header Style (Deep Navy Corner Arc + Circle Photo Right + Clean First/Last Name Left)
    if (headerStyle === 'thomas-durant' || headerStyle === 'arch-corner') {
      const parts = (displayedMainTitle || '').trim().split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');
      const headerNavy = primaryAccent || '#0A2540';

      return (
        <div
          className="w-full relative overflow-hidden px-6 pt-5 pb-3 flex justify-between items-center shrink-0 bg-white"
          style={{ minHeight: customHeaderHeight || '115px' }}
        >
          {/* Top-Right Navy Corner Quarter-Circle Arc */}
          <div
            className="absolute top-0 right-0 w-36 sm:w-44 h-36 sm:h-44 rounded-bl-full pointer-events-none z-0"
            style={{ backgroundColor: headerNavy }}
          />

          {/* Left Title Area */}
          <div className="relative z-10 space-y-1 max-w-md sm:max-w-xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tight leading-none" style={mainTitleStyle}>
              <span className="font-light block text-slate-800" style={{ color: cv.couleurTitrePrincipal || '#0F172A' }}>
                {firstName}
              </span>
              {lastName && (
                <span className="font-black uppercase block tracking-wider text-slate-900" style={{ color: cv.couleurTitrePrincipal || '#0A2540' }}>
                  {lastName}
                </span>
              )}
            </h1>
            <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] pt-0.5" style={{ ...subTitleStyle, color: resolveSubtitleColor('#FFFFFF', cv.couleurSousTitrePrincipal, secondaryAccent, '#334155') }}>
              {displayedSubTitle}
            </p>
          </div>

          {/* Right Circle Portrait Photo */}
          {showHeaderPhoto && (
            <div className="relative z-10 mr-1 sm:mr-3">
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  width: `${photoSize || 100}px`,
                  height: `${photoSize || 100}px`,
                  borderColor: '#FFFFFF',
                  borderWidth: '3px',
                  boxShadow: '0 8px 20px -3px rgba(10, 37, 64, 0.3)'
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // 1. High-Tech Developer Terminal Header
    if (headerStyle === 'tech-arches' || headerStyle === 'dark-tech' || template?.layoutType === 'yann-landy-tech') {
      const techSubtitleColor = resolveSubtitleColor('#020617', cv.couleurSousTitrePrincipal, '#38BDF8', '#34D399');
      return (
        <div
          className="w-full relative overflow-hidden p-5 bg-slate-950 text-emerald-400 font-mono border-b-2 border-emerald-500/40 shrink-0 shadow-lg select-none"
          style={{ minHeight: customHeaderHeight || '140px' }}
        >
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2 mb-3 text-[10px] text-emerald-500/70">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-slate-400 font-semibold">~/candidate/profile.sh</span>
            </div>
            <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 font-bold text-[9px]">
              [STATUS: AVAILABLE]
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[10px] text-emerald-500 font-bold tracking-wider">
                &gt; USER_NAME:
              </div>
              <h1 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}>
                {displayedMainTitle}
              </h1>
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ ...subTitleStyle, color: techSubtitleColor }}>
                // {displayedSubTitle}
              </p>
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
                title="Glissez à la souris pour déplacer la photo !"
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. Luxury Gold & Executive Framed Header (Larry Tibbetts Style)
    if (headerStyle === 'luxury-gold' || headerStyle === 'executive') {
      const execBg = profileBgColor || primaryAccent || '#133842';
      const ribbonColor = secondaryAccent || primaryAccent || '#D97706';
      const execSubtitleColor = resolveSubtitleColor(execBg, cv.couleurSousTitrePrincipal, ribbonColor, '#F59E0B');
      const resumeText = profilSection?.contenu?.resume;

      // Dynamic ribbon shades calculation based on secondaryAccent color (no hardcoded gold!)
      const parseHex = (hexStr: string) => {
        let clean = (hexStr || '').replace('#', '').trim();
        if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
        if (clean.length !== 6) clean = 'D97706';
        return {
          r: parseInt(clean.substring(0, 2), 16),
          g: parseInt(clean.substring(2, 4), 16),
          b: parseInt(clean.substring(4, 6), 16)
        };
      };
      const { r, g, b } = parseHex(ribbonColor);
      const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
      const ribbonDark = `rgb(${clamp(r * 0.65)}, ${clamp(g * 0.65)}, ${clamp(b * 0.65)})`;
      const ribbonMid = `rgb(${r}, ${g}, ${b})`;
      const ribbonLight = `rgb(${clamp(r + (255 - r) * 0.55)}, ${clamp(g + (255 - g) * 0.55)}, ${clamp(b + (255 - b) * 0.55)})`;

      return (
        <div
          className="w-full relative overflow-hidden shrink-0 shadow-md select-none"
          style={{ backgroundColor: execBg, color: profileTextColor, minHeight: customHeaderHeight || '150px' }}
        >
          {/* Header Top Content: Photo Left, Title & Bio Right */}
          <div className="p-5 sm:p-6 flex items-start gap-5 relative z-10">
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-2xl shrink-0 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{
                  ...customPhotoStyle,
                  borderColor: ribbonColor,
                  outline: `3px solid ${ribbonColor}`,
                  outlineOffset: '3px',
                  boxShadow: `0 0 15px ${ribbonColor}66`
                }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}

            <div className="flex-1 space-y-1.5 text-left">
              <h1 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-wider" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-serif font-bold uppercase tracking-widest" style={{ ...subTitleStyle, color: execSubtitleColor }}>
                {displayedSubTitle}
              </p>
              {resumeText && (
                <p className="text-[10px] leading-relaxed opacity-85 max-w-2xl line-clamp-3 pt-1 text-slate-200">
                  {resumeText}
                </p>
              )}
            </div>
          </div>

          {/* 3D Ribbon Banner Wave (Color dynamically controlled by secondaryAccent) */}
          <div className="w-full relative h-7 overflow-hidden z-20 -mt-2">
            <svg className="w-full h-full fill-current" viewBox="0 0 1200 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dynamicRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={ribbonDark} />
                  <stop offset="35%" stopColor={ribbonMid} />
                  <stop offset="70%" stopColor={ribbonLight} />
                  <stop offset="100%" stopColor={ribbonMid} />
                </linearGradient>
              </defs>
              <path
                d="M0,0 Q300,50 600,15 T1200,0 L1200,60 L0,60 Z"
                fill="url(#dynamicRibbonGrad)"
              />
            </svg>
            <div className="absolute inset-0 shadow-inner pointer-events-none opacity-30 bg-gradient-to-b from-transparent to-black/20" />
          </div>
        </div>
      );
    }

    // 3. Floating Card Header (Modern Card Overlay)
    if (headerStyle === 'card' || headerStyle === 'floating-card') {
      const isCardDark = isDarkBg(profileBgColor);
      const pillBg = secondaryAccent && getContrastRatio(secondaryAccent, profileBgColor) >= 1.8
        ? secondaryAccent
        : (isCardDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.08)');
      const pillTextColor = pillBg.startsWith('rgba')
        ? (isCardDark ? '#FFFFFF' : '#0F172A')
        : getContrastText(pillBg);

      return (
        <div className="w-full p-3 shrink-0 select-none">
          <div
            className="w-full p-5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center justify-between gap-4 transition-all"
            style={{ backgroundColor: profileBgColor, color: profileTextColor, minHeight: customHeaderHeight || '120px' }}
          >
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shrink-0 ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || profileTextColor }}>
                {displayedMainTitle}
              </h1>
              <span
                className="inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs"
                style={{ ...subTitleStyle, backgroundColor: pillBg, color: cv.couleurSousTitrePrincipal || pillTextColor }}
              >
                {displayedSubTitle}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 4. Ocean Wave / Organic Arch Header
    if (headerStyle === 'ocean-wave' || headerStyle === 'organic-arch') {
      const waveSubtitleColor = resolveSubtitleColor(profileBgColor, cv.couleurSousTitrePrincipal, secondaryAccent, isHeaderBgDark ? '#E2E8F0' : '#334155');
      return (
        <div
          className="w-full relative overflow-hidden pt-6 pb-10 px-6 shrink-0 flex items-center justify-between select-none"
          style={{ backgroundColor: profileBgColor, color: profileTextColor, minHeight: customHeaderHeight || '140px' }}
        >
          {/* Bottom Organic Wave Path */}
          <svg className="absolute bottom-0 left-0 right-0 w-full h-8 text-white fill-current pointer-events-none" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
          </svg>

          <div className="relative z-10 space-y-1">
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || profileTextColor }}>
              {displayedMainTitle}
            </h1>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider opacity-90" style={{ ...subTitleStyle, color: waveSubtitleColor }}>
              {displayedSubTitle}
            </p>
          </div>

          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`relative z-10 overflow-hidden shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={{ ...customPhotoStyle, borderColor: cv.photoBordureCouleur || '#FFFFFF' }}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 5. Clean & Editorial Typographic Header
    if (headerStyle === 'clean') {
      const cleanBg = isMainDark ? '#0F172A' : '#FFFFFF';
      const cleanSubtitleColor = resolveSubtitleColor(cleanBg, cv.couleurSousTitrePrincipal, primaryAccent, secondaryAccent);
      return (
        <div
          className="w-full relative overflow-hidden px-6 py-6 border-b-2 flex justify-between items-center shrink-0 bg-white dark:bg-slate-900"
          style={{ borderColor: primaryAccent, minHeight: customHeaderHeight || '110px' }}
        >
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}>
              {displayedMainTitle}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: primaryAccent }} />
              <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ ...subTitleStyle, color: cleanSubtitleColor }}>
                {displayedSubTitle}
              </p>
            </div>
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={customPhotoStyle}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 6. Brian R. Baxter Geometric Diagonal Style (Orange/Amber & Dark Anthracite)
    if (headerStyle === 'baxter-diagonal' || headerStyle === 'brian-baxter' || headerStyle === 'diagonal-split') {
      const baxterBg = isMainDark ? '#18181B' : (cv.couleurFondProfil || '#FFFFFF');
      const parts = (displayedMainTitle || '').trim().split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');
      const accentColorHex = secondaryAccent || primaryAccent || '#F5A623';

      return (
        <div
          className="w-full relative overflow-hidden px-6 py-6 shrink-0 flex items-center justify-between select-none border-b border-slate-200/50"
          style={{ backgroundColor: baxterBg, minHeight: customHeaderHeight || '130px' }}
        >
          {/* Decorative Diagonal Polygon Shape Top Right */}
          <div className="absolute top-0 right-0 w-72 h-full pointer-events-none overflow-hidden z-0 opacity-95">
            <svg className="w-full h-full fill-current block" style={{ color: accentColorHex }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="35,0 100,0 100,100 0,100" />
            </svg>
          </div>

          <div className="relative z-10 space-y-1.5 max-w-xl">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex flex-wrap items-center gap-x-2" style={mainTitleStyle}>
              <span style={{ color: cv.couleurTitrePrincipal || (isMainDark ? '#FFFFFF' : '#1E293B') }}>{firstName}</span>
              {lastName && (
                <span style={{ color: accentColorHex }}>{lastName}</span>
              )}
            </h1>
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ ...subTitleStyle, color: resolveSubtitleColor(baxterBg, cv.couleurSousTitrePrincipal, primaryAccent, '#64748B') }}>
              {displayedSubTitle}
            </p>
          </div>

          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`relative z-10 overflow-hidden shadow-2xl border-4 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={{ ...customPhotoStyle, borderColor: '#FFFFFF', outline: `3px solid ${accentColorHex}`, outlineOffset: '2px' }}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 6. Minimalist Header
    if (headerStyle === 'minimal') {
      const minimalSubtitleColor = resolveSubtitleColor('#FFFFFF', cv.couleurSousTitrePrincipal, primaryAccent, secondaryAccent);
      return (
        <div
          className="w-full relative overflow-hidden py-6 px-4 text-center border-t-2 border-b-2 shrink-0 bg-white"
          style={{ borderColor: primaryAccent, minHeight: customHeaderHeight || '110px' }}
        >
          {showHeaderPhoto && (
            <div className="mx-auto mb-2 flex justify-center">
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-xs cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em]" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#000000' }}>
            {displayedMainTitle}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-1" style={{ ...subTitleStyle, color: minimalSubtitleColor }}>
            {displayedSubTitle}
          </p>
        </div>
      );
    }

    // 7. Arc-Contour / Generic Decorative Layers Header
    if (headerStyle === 'arc-contour' || effectiveDecorativeLayers.some(l => l.zone === 'header')) {
      const words = (displayedMainTitle || '').trim().split(' ');
      const halfIndex = Math.ceil(words.length / 2);
      const firstPart = words.slice(0, halfIndex).join(' ');
      const secondPart = words.slice(halfIndex).join(' ');

      const headerLayers = effectiveDecorativeLayers.some(l => l.zone === 'header')
        ? effectiveDecorativeLayers
        : [
            {
              id: 'def-arc-top-left',
              zone: 'header' as const,
              shape: 'arc-concentric' as const,
              value: { rings: 4, radius: 120, position: { align: 'top-left' as const } },
              colors: [primaryAccent, secondaryAccent, '#BAE6FD', '#E0F2FE']
            }
          ];

      const arcSubtitleColor = resolveSubtitleColor('#FFFFFF', cv.couleurSousTitrePrincipal, primaryAccent, secondaryAccent);

      return (
        <div
          className="w-full relative overflow-hidden pt-8 pb-6 px-6 bg-white shrink-0 flex flex-col items-center justify-center text-center select-none"
          style={{ minHeight: customHeaderHeight || '180px' }}
        >
          <DecorativeLayerRenderer
            layers={headerLayers}
            zone="header"
            primaryAccent={primaryAccent}
            secondaryAccent={secondaryAccent}
          />

          <div className="relative z-10 max-w-xl mx-auto space-y-1">
            <h1
              contentEditable={Boolean(profilSection && onUpdateCV)}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (profilSection) {
                  handleUpdateSection({
                    ...profilSection,
                    contenu: { ...(profilContenu || {}), nomComplet: e.currentTarget.innerText }
                  });
                }
              }}
              style={mainTitleStyle}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2 flex-wrap leading-tight outline-none cursor-text"
            >
              <span style={{ color: cv.couleurTitrePrincipal || primaryAccent }}>{firstPart}</span>
              {secondPart && <span style={{ color: cv.couleurTitrePrincipal || secondaryAccent }}>{secondPart}</span>}
            </h1>
            <p
              contentEditable={Boolean(profilSection && onUpdateCV)}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (profilSection) {
                  handleUpdateSection({
                    ...profilSection,
                    contenu: { ...(profilContenu || {}), titreProfessionnel: e.currentTarget.innerText }
                  });
                }
              }}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider opacity-90 outline-none cursor-text"
              style={{ ...subTitleStyle, color: arcSubtitleColor }}
            >
              {displayedSubTitle}
            </p>
          </div>

          {showHeaderPhoto && (
            <div className="absolute top-3 right-6 z-10">
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{ ...customPhotoStyle, borderColor: primaryAccent, borderWidth: '2px' }}
                title="Glissez à la souris pour déplacer la photo n'importe où !"
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // 8. Diagonal Split Header
    if (headerStyle === 'diagonal-split') {
      const diagSubtitleColor = resolveSubtitleColor(profileBgColor, cv.couleurSousTitrePrincipal, secondaryAccent, isHeaderBgDark ? '#E2E8F0' : '#0F172A');
      return (
        <div
          className="w-full relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6 border-b flex justify-between items-center shrink-0 shadow-xs"
          style={{ backgroundColor: profileBgColor, color: profileTextColor, minHeight: customHeaderHeight || '120px' }}
        >
          <div
            className="absolute -right-8 -bottom-10 w-1/2 h-36 transform -skew-x-12 opacity-80 pointer-events-none"
            style={{ backgroundColor: secondaryAccent && secondaryAccent !== '#FFFFFF' ? secondaryAccent : '#0F172A' }}
          />
          <div className="relative z-10 space-y-0.5">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight leading-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || profileTextColor }}>{displayedMainTitle}</h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90" style={{ ...subTitleStyle, color: diagSubtitleColor }}>{displayedSubTitle}</p>
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`relative z-10 overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={{ ...customPhotoStyle, borderColor: cv.photoBordureCouleur || '#FFFFFF' }}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 9. Modern Split Header (Vertical Dual-Tone)
    if (headerStyle === 'modern-split') {
      const rightBg = secondaryAccent || '#F1F5F9';
      const rightSubtitleColor = resolveSubtitleColor(rightBg, cv.couleurSousTitrePrincipal, primaryAccent, '#475569');
      const rightMainTitleColor = cv.couleurTitrePrincipal || (isDarkBg(rightBg) ? '#FFFFFF' : primaryAccent);

      return (
        <div
          className="w-full relative overflow-hidden flex items-stretch border-b shrink-0 shadow-xs"
          style={{ minHeight: customHeaderHeight || '120px' }}
        >
          <div
            className="w-5/12 p-4 flex flex-col justify-center text-white"
            style={{ backgroundColor: primaryAccent }}
          >
            {showHeaderPhoto ? (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            ) : (
              <h1 className="text-base font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: '#FFFFFF' }}>{displayedMainTitle}</h1>
            )}
          </div>
          <div
            className="w-7/12 p-4 flex flex-col justify-center"
            style={{ backgroundColor: rightBg, color: rightMainTitleColor }}
          >
            {showHeaderPhoto && (
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight mb-0.5" style={{ ...mainTitleStyle, color: rightMainTitleColor }}>
                {displayedMainTitle}
              </h1>
            )}
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90" style={{ ...subTitleStyle, color: rightSubtitleColor }}>
              {displayedSubTitle}
            </p>
          </div>
        </div>
      );
    }

    // 10. Arch Header
    if (headerStyle === 'arch') {
      const archSubtitleColor = resolveSubtitleColor(profileBgColor, cv.couleurSousTitrePrincipal, secondaryAccent, isHeaderBgDark ? '#E2E8F0' : '#0F172A');
      return (
        <div
          className="w-full px-4 py-5 sm:py-6 text-center bg-slate-900 text-white rounded-b-xl shadow-xs mb-1 shrink-0 flex flex-col justify-center items-center"
          style={{ backgroundColor: profileBgColor, color: profileTextColor, minHeight: customHeaderHeight || '140px' }}
        >
          {showHeaderPhoto && (
            <div className="mx-auto mb-1.5 flex justify-center">
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={{ ...customPhotoStyle, borderColor: cv.photoBordureCouleur || '#FFFFFF' }}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            </div>
          )}
          <h1 className="text-base sm:text-lg font-black uppercase tracking-wide" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || profileTextColor }}>{displayedMainTitle}</h1>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest opacity-90 mt-0.5" style={{ ...subTitleStyle, color: archSubtitleColor }}>{displayedSubTitle}</p>
        </div>
      );
    }

    // 11. Sidebar-Top Header
    if (headerStyle === 'sidebar-top' || headerStyle === 'sidebar-integrated') {
      if (isTwoColumn) return null; // Header info will render directly in the sidebar column
      return (
        <div
          className="w-full px-6 py-5 border-b flex justify-between items-center shrink-0 mb-3"
          style={{
            backgroundColor: profileBgColor,
            borderColor: secondaryAccent,
            color: profileTextColor,
            minHeight: customHeaderHeight || '120px'
          }}
        >
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || profileTextColor }}>
              {displayedMainTitle}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={subTitleStyle}>
              {displayedSubTitle}
            </p>
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden shadow-xs cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={customPhotoStyle}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 12. Wave Bottom Header (Vague fluide en bas du bandeau)
    if (headerStyle === 'wave-bottom') {
      const waveBg = profileBgColor || primaryAccent;
      const waveCanvasBg = cv.couleurFond || '#FFFFFF';
      return (
        <div
          className="w-full relative overflow-hidden shrink-0 mb-3 text-white select-none"
          style={{
            backgroundColor: waveBg,
            minHeight: customHeaderHeight || '145px'
          }}
        >
          <div className="px-6 pt-5 pb-9 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1 max-w-xl">
              <h1 className="text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: '#FFFFFF' }}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] leading-relaxed text-slate-100/90 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-lg border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
          {/* Subtle Secondary Wave Accent Layer */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 opacity-30">
            <svg className="w-full h-8 sm:h-9 fill-current" style={{ color: secondaryAccent }} viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,25 C180,85 380,-20 540,65 C720,135 950,15 1200,45 L1200,120 L0,120 Z" />
            </svg>
          </div>
          {/* Smooth Bottom Wave merging into canvas */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0">
            <svg className="w-full h-6 sm:h-7 fill-current" style={{ color: waveCanvasBg }} viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,90 350,-40 500,60 C650,140 900,10 1200,40 L1200,120 L0,120 Z" />
            </svg>
          </div>
        </div>
      );
    }

    // 13. Wave Top Header (Vague en haut en arche)
    if (headerStyle === 'wave-top') {
      const waveCanvasBg = cv.couleurFond || '#FFFFFF';
      return (
        <div
          className="w-full relative overflow-hidden shrink-0 mb-3 text-white pt-2 select-none"
          style={{
            backgroundColor: profileBgColor || primaryAccent,
            minHeight: customHeaderHeight || '140px'
          }}
        >
          {/* Wave Top crest SVG */}
          <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-0 rotate-180">
            <svg className="w-full h-5 fill-current" style={{ color: waveCanvasBg }} viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C200,80 400,-20 600,60 C800,120 1000,20 1200,50 L1200,120 L0,120 Z" />
            </svg>
          </div>
          <div className="px-6 py-4 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1 max-w-xl">
              <h1 className="text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: '#FFFFFF' }}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] leading-relaxed text-slate-100/90 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-lg border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 13.b Wave Double Header (Double vague bicolore fluide superposée)
    if (headerStyle === 'wave-double') {
      const waveBg = profileBgColor || primaryAccent;
      const waveCanvasBg = cv.couleurFond || '#FFFFFF';
      return (
        <div
          className="w-full relative overflow-hidden shrink-0 mb-3 text-white select-none"
          style={{
            backgroundColor: waveBg,
            minHeight: customHeaderHeight || '155px'
          }}
        >
          <div className="px-6 pt-5 pb-10 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1 max-w-xl">
              <h1 className="text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: '#FFFFFF' }}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] leading-relaxed text-slate-100/90 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-lg border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
          {/* Back Wave Layer in Secondary Accent */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 opacity-45">
            <svg className="w-full h-8 sm:h-10 fill-current" style={{ color: secondaryAccent }} viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,25 C220,85 460,-30 710,55 C960,135 1100,20 1200,45 L1200,120 L0,120 Z" />
            </svg>
          </div>
          {/* Front Wave Layer merging into page canvas */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0">
            <svg className="w-full h-6 sm:h-7 fill-current" style={{ color: waveCanvasBg }} viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,90 350,-40 500,60 C650,140 900,10 1200,40 L1200,120 L0,120 Z" />
            </svg>
          </div>
        </div>
      );
    }

    // 14. Two-Tone Split Header (En-tête à deux couleurs - Séparation nette)
    if (headerStyle === 'two-tone-split') {
      return (
        <div
          className="w-full relative overflow-hidden shrink-0 mb-3 flex flex-col sm:flex-row border-b border-slate-200/80 select-none shadow-xs"
          style={{ minHeight: customHeaderHeight || '130px' }}
        >
          {/* Bloc Primaire Gauche */}
          <div
            className="flex-1 px-6 py-5 flex items-center text-white"
            style={{ backgroundColor: primaryAccent }}
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white" style={mainTitleStyle}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] text-white/90 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
          </div>
          {/* Bloc Secondaire Droit (Photo ou Monogramme) */}
          <div
            className="w-full sm:w-1/3 px-5 py-4 flex items-center justify-center text-white"
            style={{ backgroundColor: secondaryAccent }}
          >
            {showHeaderPhoto ? (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-lg border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            ) : (
              <div className="text-center px-2 py-1">
                <div className="w-11 h-11 rounded-full border-2 border-white/70 mx-auto flex items-center justify-center mb-1 text-sm font-black text-white">
                  {(displayedMainTitle || 'CV').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/85 block">Candidat Vérifié</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 14.b Two-Tone Stripe Header (En-tête bicolore à bandeau supérieur d'accent contrasté)
    if (headerStyle === 'two-tone-stripe') {
      return (
        <div
          className="w-full relative overflow-hidden shrink-0 mb-3 text-white flex flex-col select-none shadow-xs"
          style={{ minHeight: customHeaderHeight || '125px' }}
        >
          {/* Bandeau d'accent supérieur secondaire (2-couleurs) */}
          <div
            className="w-full px-6 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white shadow-xs"
            style={{ backgroundColor: secondaryAccent }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/90" />
              <span>Dossier de Candidature</span>
            </div>
            <div className="flex items-center gap-2 opacity-95">
              <span>{displayedSubTitle}</span>
            </div>
          </div>
          {/* Corps principal primaire */}
          <div
            className="flex-1 px-6 py-4 flex items-center justify-between gap-4"
            style={{ backgroundColor: primaryAccent }}
          >
            <div className="space-y-1 max-w-xl">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white" style={mainTitleStyle}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] leading-relaxed text-white/90 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-lg border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 15. Simple-Minimal Header (En-tête épuré moderne)
    if (headerStyle === 'simple-minimal') {
      return (
        <div
          className="w-full px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 mb-2 bg-transparent"
          style={{ minHeight: customHeaderHeight || '100px' }}
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}>
              {displayedMainTitle}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300" style={subTitleStyle}>
              {displayedSubTitle}
            </p>
            {cv.profilDansEnTete && profilContenu?.resume && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 line-clamp-2 max-w-xl">
                {profilContenu.resume}
              </p>
            )}
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={customPhotoStyle}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 16. Centered-Clean Header (Titres & éléments centrés)
    if (headerStyle === 'centered-clean') {
      return (
        <div
          className="w-full px-6 py-5 border-b border-slate-200 flex flex-col items-center text-center shrink-0 mb-3"
          style={{ minHeight: customHeaderHeight || '130px' }}
        >
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden shadow-md border-2 mb-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={{ ...customPhotoStyle, borderColor: primaryAccent }}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}>
            {displayedMainTitle}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mt-1" style={subTitleStyle}>
            {displayedSubTitle}
          </p>
          {cv.profilDansEnTete && profilContenu?.resume && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 max-w-xl line-clamp-3">
              {profilContenu.resume}
            </p>
          )}
        </div>
      );
    }

    // 17. Executive Stripe Header
    if (headerStyle === 'executive-stripe') {
      return (
        <div
          className="w-full px-6 py-5 border-b-2 shrink-0 mb-3 flex items-center justify-between"
          style={{ borderColor: primaryAccent, minHeight: customHeaderHeight || '115px' }}
        >
          <div className="space-y-1">
            <div className="w-12 h-1 mb-1" style={{ backgroundColor: primaryAccent }} />
            <h1 className="text-2xl font-serif font-black uppercase tracking-widest" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#0F172A' }}>
              {displayedMainTitle}
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500" style={subTitleStyle}>
              {displayedSubTitle}
            </p>
            {cv.profilDansEnTete && profilContenu?.resume && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 line-clamp-2 max-w-xl font-serif">
                {profilContenu.resume}
              </p>
            )}
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden shadow-md border-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={{ ...customPhotoStyle, borderColor: primaryAccent }}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // 18. Badge-Framed Header
    if (headerStyle === 'badge-framed') {
      return (
        <div
          className="w-full p-4 shrink-0 mb-3"
          style={{ minHeight: customHeaderHeight || '120px' }}
        >
          <div
            className="w-full p-4 rounded-xl border-2 flex items-center justify-between gap-4"
            style={{ borderColor: primaryAccent, backgroundColor: `${primaryAccent}0A` }}
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || primaryAccent }}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 19. Curved Wave Badge Header (Vague courbe autour du portrait)
    if (headerStyle === 'curved-wave-badge') {
      return (
        <div
          className="w-full relative overflow-hidden shrink-0 mb-3 px-6 py-5 text-white"
          style={{ backgroundColor: primaryAccent, minHeight: customHeaderHeight || '140px' }}
        >
          <div className="flex items-center justify-between relative z-10 gap-4">
            <div className="space-y-1 max-w-xl">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white" style={mainTitleStyle}>
                {displayedMainTitle}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200" style={subTitleStyle}>
                {displayedSubTitle}
              </p>
              {cv.profilDansEnTete && profilContenu?.resume && (
                <p className="text-[11px] text-slate-100/90 pt-1 line-clamp-2">
                  {profilContenu.resume}
                </p>
              )}
            </div>
            {showHeaderPhoto && (
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoMouseDown}
                className={`overflow-hidden shadow-xl border-4 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                style={customPhotoStyle}
              >
                <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
              </div>
            )}
          </div>
          {/* Subtle wavy background overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <path d="M0,100 C300,20 600,180 1000,80 L1000,200 L0,200 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      );
    }

    // 20. Tech Dark Band Header
    if (headerStyle === 'tech-dark-band') {
      return (
        <div
          className="w-full px-6 py-4 bg-slate-900 text-white shrink-0 mb-3 flex items-center justify-between font-mono"
          style={{ minHeight: customHeaderHeight || '110px' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white" style={mainTitleStyle}>
                {displayedMainTitle}
              </h1>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400" style={subTitleStyle}>
              {displayedSubTitle}
            </p>
            {cv.profilDansEnTete && profilContenu?.resume && (
              <p className="text-[11px] text-slate-300 font-sans pt-1 line-clamp-2 max-w-xl">
                {profilContenu.resume}
              </p>
            )}
          </div>
          {showHeaderPhoto && (
            <div
              onMouseDown={handlePhotoMouseDown}
              onTouchStart={handlePhotoMouseDown}
              className={`overflow-hidden border-2 border-emerald-400 shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
              style={customPhotoStyle}
            >
              <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    // Default / Banner Header
    const bannerSubtitleColor = resolveSubtitleColor(
      profileBgColor,
      cv.couleurSousTitrePrincipal,
      secondaryAccent,
      isHeaderBgDark ? '#E2E8F0' : '#475569'
    );

    return (
      <div
        className="w-full px-4 py-5 sm:px-6 sm:py-6 border-b flex justify-between items-center shrink-0"
        style={{
          backgroundColor: profileBgColor,
          borderColor: secondaryAccent,
          color: profileTextColor,
          minHeight: customHeaderHeight || '120px'
        }}
      >
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || profileTextColor }}>
            {displayedMainTitle}
          </h1>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ ...subTitleStyle, color: bannerSubtitleColor }}>
            {displayedSubTitle}
          </p>
        </div>
        {showHeaderPhoto && (
          <div
            onMouseDown={handlePhotoMouseDown}
            onTouchStart={handlePhotoMouseDown}
            className={`overflow-hidden shadow-xs cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
            style={customPhotoStyle}
          >
            <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
          </div>
        )}
      </div>
    );
  };

  // Detached Full-Width Resume / Summary Section Renderer
  const renderFullWidthResumeBlock = () => {
    const resumeText = profilSection?.contenu?.resume;
    if (!resumeText) return null;

    // Check if full-width resume mode or profilDansEnTete is requested or active
    const isFullWidthEnabled = cv.profilDansEnTete || (cv.afficherResumeSeulFullWidth ?? cv.resumeFullWidth);
    if (!isFullWidthEnabled) return null;

    return (
      <div className="w-full my-2 px-3 py-2.5 rounded-lg bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryAccent }} />
          <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: primaryAccent }}>
            Résumé Professionnel
          </h3>
        </div>
        <p
          contentEditable={Boolean(profilSection && onUpdateCV)}
          suppressContentEditableWarning
          onBlur={(e) => {
            if (profilSection) {
              handleUpdateSection({
                ...profilSection,
                contenu: { ...(profilContenu || {}), resume: e.currentTarget.innerText }
              });
            }
          }}
          className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line outline-none cursor-text font-normal"
        >
          {resumeText}
        </p>
      </div>
    );
  };

  // CV Contact Footer Bar (Customizable Footer with Multiple Models & Editable Data)
  const renderCVContactFooter = () => {
    // If explicitly disabled by user
    if (cv.afficherFooterContact === false) {
      return null;
    }

    const pContenu = profilSection?.contenu as ProfilContenu | undefined;
    const email = pContenu?.email || 'john.doe@email.com';
    const telephone = pContenu?.telephone || '+237 6 98 95 83 57';
    const adresse = pContenu?.adresse || 'Douala, Yassa – Cameroun';
    const dispo = cv.disponibiliteTexte || 'Immédiate';
    const siteWeb = pContenu?.siteWeb || (pContenu as any)?.portfolio || 'www.monportfolio.pro';
    const linkedin = (pContenu as any)?.linkedin || 'linkedin.com/in/profil';

    const showAdresse = cv.afficherAdresseFooterContact ?? true;
    const showTel = cv.afficherTelephoneFooterContact ?? true;
    const showEmail = cv.afficherEmailFooterContact ?? true;
    const showDispo = cv.afficherDisponibiliteFooterContact ?? true;
    const showSiteWeb = cv.afficherSiteWebFooterContact ?? (template?.layoutType === 'yann-landy-tech' ? true : false);
    const showLinkedin = cv.afficherLinkedinFooterContact ?? false;

    const footerModel = cv.styleFooterContact || 'banner-solid';
    const bgColor = cv.couleurFondFooterContact || primaryAccent || '#0F172A';
    const textColor = cv.couleurTexteFooterContact || '#FFFFFF';
    const accentColor = cv.couleurAccentFooterContact || secondaryAccent || '#38BDF8';

    const contactItems: { id: string; label: string; value: string; onSave: (val: string) => void; show: boolean }[] = [
      {
        id: 'adresse',
        label: 'Localisation',
        value: adresse,
        show: showAdresse,
        onSave: (val) => {
          if (profilSection) {
            handleUpdateSection({
              ...profilSection,
              contenu: { ...(pContenu || {}), adresse: val }
            });
          }
        }
      },
      {
        id: 'telephone',
        label: 'Téléphone',
        value: telephone,
        show: showTel,
        onSave: (val) => {
          if (profilSection) {
            handleUpdateSection({
              ...profilSection,
              contenu: { ...(pContenu || {}), telephone: val }
            });
          }
        }
      },
      {
        id: 'email',
        label: 'Email',
        value: email,
        show: showEmail,
        onSave: (val) => {
          if (profilSection) {
            handleUpdateSection({
              ...profilSection,
              contenu: { ...(pContenu || {}), email: val }
            });
          }
        }
      },
      {
        id: 'dispo',
        label: 'Disponibilité',
        value: dispo,
        show: showDispo,
        onSave: (val) => {
          if (onUpdateCV) {
            onUpdateCV({ ...cv, disponibiliteTexte: val });
          }
        }
      },
      {
        id: 'siteWeb',
        label: 'Site Web',
        value: siteWeb,
        show: showSiteWeb,
        onSave: (val) => {
          if (profilSection) {
            handleUpdateSection({
              ...profilSection,
              contenu: { ...(pContenu || {}), siteWeb: val }
            });
          }
        }
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        value: linkedin,
        show: showLinkedin,
        onSave: (val) => {
          if (profilSection) {
            handleUpdateSection({
              ...profilSection,
              contenu: { ...(pContenu || {}), linkedin: val }
            });
          }
        }
      }
    ].filter(item => item.show);

    if (contactItems.length === 0) return null;

    // Model 1: CARDS GRID (Modern distinct tiles)
    if (footerModel === 'cards-grid') {
      return (
        <div className="w-full mt-auto py-2.5 px-2 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 select-none text-[10px]">
          {contactItems.map(item => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center p-2 rounded-lg border shadow-xs transition-all text-center"
              style={{
                backgroundColor: bgColor === 'transparent' ? '#F8FAFC' : bgColor,
                color: textColor,
                borderColor: `${accentColor}44`
              }}
            >
              <span className="font-extrabold uppercase tracking-wider text-[8.5px] opacity-80" style={{ color: accentColor }}>
                {item.label}
              </span>
              <span
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                className="font-semibold truncate max-w-full outline-none cursor-text mt-0.5"
                style={{ color: textColor }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Model 2: MINIMAL INLINE (Single sleek horizontal row with separators)
    if (footerModel === 'minimal-inline') {
      return (
        <div
          className="w-full mt-auto py-2 px-4 shrink-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 select-none text-[10px] border-t"
          style={{ borderColor: `${accentColor}55`, color: textColor === '#FFFFFF' ? '#334155' : textColor }}
        >
          {contactItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider text-[8.5px]" style={{ color: accentColor }}>
                {item.label}:
              </span>
              <span
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                className="font-medium outline-none cursor-text"
              >
                {item.value}
              </span>
              {idx < contactItems.length - 1 && <span className="opacity-30 mx-1">•</span>}
            </div>
          ))}
        </div>
      );
    }

    // Model 3: PILL FLOATING (Capsule container)
    if (footerModel === 'pill-floating') {
      return (
        <div className="w-full mt-auto py-2 px-3 shrink-0 flex justify-center select-none text-[10px]">
          <div
            className="w-full max-w-3xl py-2 px-5 rounded-full shadow-md flex flex-wrap items-center justify-around gap-2 border"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              borderColor: accentColor
            }}
          >
            {contactItems.map(item => (
              <div key={item.id} className="flex flex-col items-center text-center px-1">
                <span className="font-extrabold uppercase tracking-wider text-[8.5px] opacity-80" style={{ color: accentColor }}>
                  {item.label}
                </span>
                <span
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                  className="font-semibold truncate max-w-[160px] outline-none cursor-text"
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Model 4: MODERN SPLIT (Two-tone split bar)
    if (footerModel === 'modern-split') {
      return (
        <div
          className="w-full mt-auto shrink-0 flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-md select-none text-[10px]"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="p-2 sm:px-4 flex items-center justify-center font-black uppercase tracking-wider text-xs"
            style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
          >
            Contact
          </div>
          <div className="flex-1 p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center text-center">
            {contactItems.map(item => (
              <div key={item.id} className="flex flex-col items-center">
                <span className="font-extrabold uppercase tracking-wider text-[8.5px] opacity-80" style={{ color: accentColor }}>
                  {item.label}
                </span>
                <span
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                  className="font-semibold truncate max-w-full outline-none cursor-text"
                  style={{ color: textColor }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Model 5: DARK TECH (High-tech developer style)
    if (footerModel === 'dark-tech') {
      return (
        <div
          className="w-full mt-auto py-2.5 px-4 bg-slate-950 text-emerald-400 font-mono shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-emerald-500/30 shadow-lg select-none text-[10px]"
        >
          {contactItems.map(item => (
            <div key={item.id} className="flex flex-col items-center text-center">
              <span className="font-bold text-[8.5px] uppercase tracking-wider text-emerald-500/70">
                &gt; {item.label}
              </span>
              <span
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                className="font-bold text-white truncate max-w-full outline-none cursor-text"
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Model 6: NEON BORDER (Crisp top accent line with transparent canvas)
    if (footerModel === 'neon-border') {
      return (
        <div
          className="w-full mt-auto pt-2.5 pb-1 px-4 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 select-none text-[10px]"
          style={{ borderTop: `2.5px solid ${accentColor}` }}
        >
          {contactItems.map(item => (
            <div key={item.id} className="flex flex-col items-center text-center">
              <span className="font-extrabold uppercase tracking-wider text-[8.5px]" style={{ color: accentColor }}>
                {item.label}
              </span>
              <span
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                className="font-bold truncate max-w-full outline-none cursor-text"
                style={{ color: textColor === '#FFFFFF' ? '#1E293B' : textColor }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Model 7: CLASSIC DIVIDER (Double fine borders, centered)
    if (footerModel === 'classic-divider') {
      return (
        <div
          className="w-full mt-auto py-2.5 px-4 shrink-0 flex flex-wrap justify-around items-center gap-3 select-none text-[10px] border-t-2 border-b-2"
          style={{ borderColor: accentColor }}
        >
          {contactItems.map(item => (
            <div key={item.id} className="flex flex-col items-center text-center">
              <span className="font-black uppercase tracking-widest text-[8px]" style={{ color: accentColor }}>
                {item.label}
              </span>
              <span
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                className="font-semibold outline-none cursor-text"
                style={{ color: textColor === '#FFFFFF' ? '#1E293B' : textColor }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Model 8: EXECUTIVE SIGNATURE (Signature line, verification stamp, 3 balanced columns)
    if (footerModel === 'executive-signature') {
      return (
        <div
          className="w-full mt-auto pt-3 pb-2 px-6 shrink-0 border-t-2 select-none text-[10px]"
          style={{ borderColor: `${accentColor}44`, backgroundColor: bgColor === 'transparent' ? '#FAFAF9' : bgColor }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-left">
              {contactItems.map(item => (
                <div key={item.id} className="flex flex-col">
                  <span className="font-bold uppercase tracking-wider text-[8px]" style={{ color: accentColor }}>
                    {item.label}
                  </span>
                  <span
                    contentEditable={Boolean(profilSection && onUpdateCV)}
                    suppressContentEditableWarning
                    onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                    className="font-medium outline-none cursor-text"
                    style={{ color: textColor === '#FFFFFF' ? '#1E293B' : textColor }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 border-l pl-4 shrink-0 text-right opacity-80" style={{ borderColor: `${accentColor}33` }}>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-neutral-400">Certification de Conformité</span>
                <span className="font-serif italic text-xs font-semibold" style={{ color: accentColor }}>
                  {profilContenu?.nomComplet || 'Signature électronique'}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full border border-dashed flex items-center justify-center text-[9px] font-mono opacity-60" style={{ borderColor: accentColor }}>
                ✓
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Model 9: LEGAL SEAL (Official ministerial bar with wax seal look and disclaimer)
    if (footerModel === 'legal-seal') {
      return (
        <div
          className="w-full mt-auto py-2 px-5 shrink-0 border-t border-b select-none text-[9.5px] bg-amber-50/40"
          style={{ borderColor: `${accentColor}55`, color: textColor === '#FFFFFF' ? '#292524' : textColor }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚖️</span>
              <span className="font-serif uppercase font-bold text-[9px] tracking-wider" style={{ color: accentColor }}>
                Actes & Déontologie
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {contactItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-1">
                  <span className="font-bold text-[8.5px] uppercase" style={{ color: accentColor }}>{item.label}:</span>
                  <span
                    contentEditable={Boolean(profilSection && onUpdateCV)}
                    suppressContentEditableWarning
                    onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                    className="font-semibold outline-none cursor-text"
                  >
                    {item.value}
                  </span>
                  {idx < contactItems.length - 1 && <span className="opacity-40 ml-2">|</span>}
                </div>
              ))}
            </div>
            <span className="text-[8px] text-neutral-400 font-mono hidden sm:inline">REF_ORDRE_2026</span>
          </div>
        </div>
      );
    }

    // Model 10: ARCHITECT METRIC (Technical CAD scale footer)
    if (footerModel === 'architect-metric') {
      return (
        <div
          className="w-full mt-auto pt-2 pb-1.5 px-4 font-mono select-none text-[9px] bg-slate-900 text-slate-200 border-t-2"
          style={{ borderColor: accentColor }}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5 opacity-80 text-[8px] tracking-widest uppercase">
            <span>COORD_REF // EPSG:4326</span>
            <span>SYSTEME METRIQUE : 1:100</span>
            <span>DOCUMENT PROVISOIRE & CONFIDENTIEL</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {contactItems.map(item => (
              <div key={item.id} className="flex flex-col items-center">
                <span className="text-[8px] uppercase font-bold" style={{ color: accentColor }}>{item.label}</span>
                <span
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                  className="font-mono truncate max-w-full outline-none cursor-text text-slate-100"
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Model 11: SOFT PILLS (Floating gentle rounded pills with icons)
    if (footerModel === 'soft-pills') {
      return (
        <div className="w-full mt-auto py-2.5 px-2 shrink-0 flex flex-wrap items-center justify-center gap-2 select-none text-[10px]">
          {contactItems.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-2xs transition-all"
              style={{
                backgroundColor: bgColor === 'transparent' ? '#F0FDF4' : bgColor,
                borderColor: `${accentColor}33`,
                color: textColor === '#FFFFFF' ? '#14532D' : textColor
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="font-bold text-[8.5px] uppercase opacity-75" style={{ color: accentColor }}>{item.label}:</span>
              <span
                contentEditable={Boolean(profilSection && onUpdateCV)}
                suppressContentEditableWarning
                onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                className="font-medium outline-none cursor-text truncate max-w-[150px]"
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Model 12: CORPORATE MODERN (Refined dual-tone bar with accent edge)
    if (footerModel === 'corporate-modern') {
      return (
        <div
          className="w-full mt-auto py-2 px-4 shrink-0 rounded-t-lg shadow-sm border-t-2 select-none text-[10px]"
          style={{
            borderTopColor: accentColor,
            backgroundColor: bgColor === 'transparent' ? '#F8FAFC' : bgColor,
            color: textColor === '#FFFFFF' ? '#1E293B' : textColor
          }}
        >
          <div className="flex flex-wrap items-center justify-around gap-2 text-center">
            {contactItems.map(item => (
              <div key={item.id} className="flex flex-col items-center px-2">
                <span className="font-extrabold uppercase tracking-widest text-[8px]" style={{ color: accentColor }}>
                  {item.label}
                </span>
                <span
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                  className="font-semibold truncate max-w-[180px] outline-none cursor-text mt-0.5"
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Model 13: MINIMALIST LINE (Subtle hairline with tracked out uppercase keys)
    if (footerModel === 'minimalist-line') {
      return (
        <div
          className="w-full mt-auto pt-2 pb-1 px-4 shrink-0 border-t flex flex-wrap items-center justify-between gap-2 select-none text-[9.5px]"
          style={{ borderColor: `${accentColor}33`, color: textColor === '#FFFFFF' ? '#475569' : textColor }}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {contactItems.map(item => (
              <div key={item.id} className="flex items-center gap-1.5">
                <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-400">{item.label} /</span>
                <span
                  contentEditable={Boolean(profilSection && onUpdateCV)}
                  suppressContentEditableWarning
                  onBlur={(e) => item.onSave(e.currentTarget.innerText)}
                  className="font-medium outline-none cursor-text"
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <span className="text-[8px] text-neutral-400 font-mono tracking-widest uppercase hidden sm:inline">VERIFIED</span>
        </div>
      );
    }

    // Default / Model 0: BANNER SOLID (Solid filled colored bar)
    return (
      <div
        className="w-full mt-auto py-2.5 px-4 text-center shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xs shadow-md select-none text-[10px]"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {contactItems.map(item => (
          <div key={item.id} className="flex flex-col items-center">
            <span className="font-extrabold uppercase tracking-wider text-[9px] opacity-80" style={{ color: accentColor }}>
              {item.label}
            </span>
            <span
              contentEditable={Boolean(profilSection && onUpdateCV)}
              suppressContentEditableWarning
              onBlur={(e) => item.onSave(e.currentTarget.innerText)}
              className="font-semibold text-white/95 truncate max-w-full outline-none cursor-text"
              style={{ color: textColor }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Page 2 Header (Only rendered when explicitly enabled to prevent disturbing tiny text on PDF)
  const renderPage2Header = () => {
    if (!cv.afficherEnTetePage2) return null;
    return (
      <div
        className="w-full relative overflow-hidden py-2 px-4 mb-2 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: primaryAccent + '44' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 rounded-full" style={{ backgroundColor: primaryAccent }} />
          <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: primaryAccent }}>
            {displayedMainTitle} <span className="opacity-40 font-normal mx-1">|</span> <span className="font-bold opacity-80" style={{ color: secondaryAccent }}>{displayedSubTitle}</span>
          </h2>
        </div>
        <div className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded text-white shadow-2xs" style={{ backgroundColor: primaryAccent }}>
          Page 2
        </div>
      </div>
    );
  };

  // Customizable Footer Renderer & Mandatory Freemium Branding
  const renderCustomFooter = (currentPage: number = 1, totalPagesCount: number = 1) => {
    const isFreemiumUser = cv.statutPaiement !== 'PAYE'; // Tous les CV non payés affichent la mention
    const showCustom = cv.afficherPiedDePage === true || Boolean(cv.textePiedDePage);

    if (!showCustom && !isFreemiumUser) {
      return null;
    }

    const customText = cv.textePiedDePage !== undefined ? cv.textePiedDePage : `${displayedMainTitle} — CV`;
    const showPageNum = cv.afficherNumPagePiedDePage ?? true;
    const align = cv.alignementPiedDePage || 'between';
    const style = cv.stylePiedDePage || 'top-line';
    const textColor = cv.couleurTextePiedDePage || '#64748B';
    const bgColor = cv.couleurFondPiedDePage || 'transparent';
    const borderColor = cv.couleurBordurePiedDePage || primaryAccent || '#CBD5E1';
    const borderThickness = cv.epaisseurBordurePiedDePage ?? 1;
    const fontSize = cv.taillePolicePiedDePage ?? 10;

    let justifyClass = 'justify-between';
    if (align === 'gauche') justifyClass = 'justify-start gap-4';
    if (align === 'centre') justifyClass = 'justify-center text-center gap-4';
    if (align === 'droite') justifyClass = 'justify-end gap-4';

    const baseContainerStyle: React.CSSProperties = {
      color: textColor,
      backgroundColor: bgColor,
      fontSize: `${fontSize}px`,
      width: '100%',
      marginTop: 'auto',
      flexShrink: 0
    };

    if (style === 'top-line') {
      baseContainerStyle.borderTop = `${borderThickness}px solid ${borderColor}`;
      baseContainerStyle.paddingTop = '8px';
      baseContainerStyle.paddingBottom = '4px';
    } else if (style === 'boxed') {
      baseContainerStyle.border = `${borderThickness}px solid ${borderColor}`;
      baseContainerStyle.borderRadius = '8px';
      baseContainerStyle.padding = '8px 12px';
    } else if (style === 'pill') {
      baseContainerStyle.border = `${borderThickness}px solid ${borderColor}`;
      baseContainerStyle.borderRadius = '9999px';
      baseContainerStyle.padding = '6px 16px';
    } else if (style === 'banner') {
      baseContainerStyle.backgroundColor = bgColor !== 'transparent' ? bgColor : (primaryAccent || '#1E293B');
      baseContainerStyle.color = cv.couleurTextePiedDePage || '#FFFFFF';
      baseContainerStyle.padding = '10px 16px';
      baseContainerStyle.borderRadius = '4px';
    } else {
      // minimal
      baseContainerStyle.paddingTop = '6px';
      baseContainerStyle.paddingBottom = '4px';
    }

    return (
      <div className="w-full flex flex-col items-center mt-auto shrink-0 select-none z-20">
        {showCustom && (
          <div
            className={`cv-custom-footer w-full flex items-center ${justifyClass} select-none transition-all duration-150 shrink-0`}
            style={baseContainerStyle}
          >
            {customText ? (
              <span className="font-medium tracking-tight truncate max-w-[75%]">
                {customText}
              </span>
            ) : <span />}
            {showPageNum && (
              <span className="font-semibold text-[0.9em] opacity-80 shrink-0">
                Page {currentPage} / {totalPagesCount}
              </span>
            )}
          </div>
        )}
        {isFreemiumUser && (
          <div className="w-full pt-1 pb-0.5 text-center text-[8.5px] font-medium tracking-wide text-slate-600 dark:text-slate-400 select-none print:text-slate-700">
            <span>Fait avec <span className="underline font-bold text-slate-700 dark:text-slate-300">MyCVBuilder</span></span>
          </div>
        )}
      </div>
    );
  };

  // Page 2 Footer
  const renderPage2Footer = () => {
    return (
      <div className="w-full mt-auto pt-2 flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-200 shrink-0">
        <span className="uppercase tracking-widest">{displayedMainTitle}</span>
        <div className="h-1 w-20 rounded-full" style={{ backgroundColor: primaryAccent }} />
        <span>Page 2 / 2</span>
      </div>
    );
  };

  // Smart dynamic section splitting for 2-page discrete sheet rendering:
  // Fills Page 1 up to 5px above the footer. A section is never completely rejected when it can partially enter:
  // its initial content enters Page 1 and only the overflowing excess flows neatly to Page 2!
  const getPageSplits = (sections: Section[], columnCapacity?: number) => {
    const p1: Section[] = [];
    const p2: Section[] = [];
    let explicitBreakFound = false;

    sections.forEach((sec) => {
      if (sec.pageBreakBefore && p1.length > 0) {
        explicitBreakFound = true;
      }
      if (!explicitBreakFound) {
        p1.push(sec);
      } else {
        p2.push(sec);
      }
    });

    if (explicitBreakFound) {
      return { p1, p2 };
    }

    const targetCapacity = columnCapacity || safeContentCapacity;

    // Auto-split: Fill Page 1 cleanly up to 5px above the footer
    if (!isForcedCompact && sections.length > 0) {
      let accumulatedHeight = 0;
      const autoP1: Section[] = [];
      const autoP2: Section[] = [];
      let isSplittingCompleted = false;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];

        if (isSplittingCompleted) {
          autoP2.push(sec);
          continue;
        }

        const secH = estimateSectionHeight(sec);

        if (accumulatedHeight + secH <= targetCapacity) {
          autoP1.push(sec);
          accumulatedHeight += secH;
        } else {
          // Section sec exceeds the remaining space on Page 1!
          const remainingSpace = targetCapacity - accumulatedHeight;
          const headerOverhead = sectionGapPx + 32;

          // SUB-CASE A: ARRAY-BASED CONTENT (experiences, formations, competences, projets, langues, etc.)
          if (Array.isArray(sec.contenu) && sec.contenu.length > 0 && remainingSpace >= headerOverhead + 30) {
            const allItems = sec.contenu as any[];
            let fittedItemsCount = 0;
            let itemsUsedHeight = headerOverhead;

            for (let k = 0; k < allItems.length; k++) {
              const itemH = estimateItemHeight(sec.type, allItems[k]);
              if (itemsUsedHeight + itemH <= remainingSpace) {
                fittedItemsCount++;
                itemsUsedHeight += itemH;
              } else {
                break;
              }
            }

            // At least 1 whole item fits cleanly on Page 1
            if (fittedItemsCount > 0 && fittedItemsCount < allItems.length) {
              autoP1.push({
                ...sec,
                id: `${sec.id}-part1`,
                contenu: allItems.slice(0, fittedItemsCount),
                _originalId: sec.id,
                _splitPart: 1,
              } as any);

              const contSuffix = lang === 'en' ? ' (cont.)' : lang === 'ar' ? ' (تابع)' : ' (suite)';
              autoP2.push({
                ...sec,
                id: `${sec.id}-part2`,
                titre: `${sec.titre}${contSuffix}`,
                contenu: allItems.slice(fittedItemsCount),
                _originalId: sec.id,
                _splitPart: 2,
              } as any);

              isSplittingCompleted = true;
              continue;
            }
          }

          // SUB-CASE B: TEXT-BASED CONTENT (profil, texte libre, personnalisee, etc.)
          const rawText = (typeof sec.contenu === 'string'
            ? sec.contenu
            : (sec.contenu?.resume || sec.contenu?.texteLibre || sec.contenu?.texte || '')) as string;

          if (rawText && typeof rawText === 'string' && rawText.length > 60 && remainingSpace >= headerOverhead + 25) {
            const availLines = Math.max(1, Math.floor((remainingSpace - headerOverhead) / 16));
            const targetChars = availLines * 65;
            let splitPos = rawText.lastIndexOf('.', targetChars);
            if (splitPos < targetChars * 0.4 || splitPos > targetChars + 40) {
              splitPos = rawText.lastIndexOf(' ', targetChars);
            }
            if (splitPos > 25 && splitPos < rawText.length - 25) {
              const textP1 = rawText.slice(0, splitPos + 1).trim();
              const textP2 = rawText.slice(splitPos + 1).trim();
              autoP1.push({
                ...sec,
                id: `${sec.id}-part1`,
                contenu: typeof sec.contenu === 'string' ? textP1 : { ...(sec.contenu || {}), resume: textP1, texte: textP1, texteLibre: textP1 },
                _originalId: sec.id,
                _splitPart: 1,
              } as any);
              const contSuffix = lang === 'en' ? ' (cont.)' : lang === 'ar' ? ' (تابع)' : ' (suite)';
              autoP2.push({
                ...sec,
                id: `${sec.id}-part2`,
                titre: `${sec.titre}${contSuffix}`,
                contenu: typeof sec.contenu === 'string' ? textP2 : { ...(sec.contenu || {}), resume: textP2, texte: textP2, texteLibre: textP2 },
                _originalId: sec.id,
                _splitPart: 2,
              } as any);
              isSplittingCompleted = true;
              continue;
            }
          }

          // Fallback: If section cannot be split and at least one section is already on Page 1
          if (autoP1.length > 0) {
            autoP2.push(sec);
            isSplittingCompleted = true;
          } else {
            // First section must remain on Page 1
            autoP1.push(sec);
            accumulatedHeight += secH;
          }
        }
      }

      if (autoP2.length > 0) {
        return { p1: autoP1, p2: autoP2 };
      }
    }

    // All sections fit cleanly within available space
    return { p1: sections, p2: [] };
  };

  const sidebarHeaderOffset = (headerStyle === 'sidebar-top' || headerStyle === 'sylvie-wave' || headerStyle === 'sylvie-loiseau') ? 140 : 0;
  // Multi-page Page 1 MUST reserve a safety bottom margin so text is NEVER cut off at the bottom edge!
  const leftColumnCapacity = Math.max(420, SINGLE_PAGE_PX - (pagePaddingPx * 2) - sidebarHeaderOffset - pageSafetyBottomMarginPx - 20);
  const rightColumnCapacity = Math.max(420, SINGLE_PAGE_PX - (pagePaddingPx * 2) - topHeaderEstimatedH - resumeFullWidthEstimatedH - pageSafetyBottomMarginPx - 20);

  const { p1: page1MainSections, p2: page2MainSections } = getPageSplits(mainZoneSections, safeContentCapacity);
  const { p1: page1RightSections, p2: page2RightSections } = getPageSplits(rightZoneSections, rightColumnCapacity);
  const { p1: page1LeftSections, p2: page2LeftSections } = getPageSplits(leftZoneSections, leftColumnCapacity);

  const hasPage2Content = 
    page2MainSections.length > 0 || 
    page2RightSections.length > 0 || 
    page2LeftSections.length > 0 || 
    hasExplicitPageBreak;

  const actualRender2Pages = shouldRender2Pages && (is2Pages ? true : hasPage2Content);

  // Paid Feature Detection for Live Red Highlight
  const isUserExempt = !isPaymentActive() || resolvedUserRole === 'ADMIN' || effectiveTier === 'premium' || effectiveTier === 'classique' || effectiveTier === 'decouverte';
  const detectedPaidFeatures = isUserExempt ? [] : detectPaidFeaturesInCV(cv, effectiveTier);
  const hasPaidFeaturesWithoutPlan = isPaymentActive() && !isUserExempt && detectedPaidFeatures.length > 0 && cv.statutPaiement !== 'PAYE';

  // Status Badge Indicators
  const calculatedPages = actualRender2Pages ? 2 : 1;
  let statusBadgeColor = 'bg-neutral-900 border-neutral-700 text-white';
  let statusText = getTranslation(lang, 'calibrated1Page');

  if (actualRender2Pages) {
    statusBadgeColor = 'bg-black border-neutral-700 text-white';
    statusText = is2Pages
      ? getTranslation(lang, 'calibrated2Pages')
      : '📄 Page 2 créée automatiquement (Contenu > 1 page A4)';
  }

  const paidHighlightClass = hasPaidFeaturesWithoutPlan
    ? 'border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-2 ring-red-500/40'
    : 'border border-slate-300 shadow-2xl';

  return (
    <DndContext sensors={sensors} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div ref={outerWrapperRef} className={`relative overflow-hidden flex flex-col ${hideStatusBanner ? 'w-[794px] items-start' : 'w-full items-center'}`}>
        {/* Paid Features Active Warning Notice */}
        {hasPaidFeaturesWithoutPlan && (
          <div className="mb-2 p-2.5 rounded-xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md border-2 border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 print:hidden transition-all animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>
                Fonctionnalité(s) payante(s) appliquée(s) : {detectedPaidFeatures.map(u => u.name).join(', ')}
              </span>
            </div>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
              Aperçu Actif • Souscription requise pour export
            </span>
          </div>
        )}

        {/* Real-time Page Budget Status Banner */}
        {!hideStatusBanner && (
          <div className={`mb-2 p-2.5 rounded-xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md border print:hidden transition-all ${statusBadgeColor}`}>
            <div className="flex items-center gap-2">
              <span>{statusText}</span>
              {compactnessLevel > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-mono">
                  {getTranslation(lang, 'compactLevel')} {compactnessLevel}/3
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              {scaleFactor < 1 && (
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                  {getTranslation(lang, 'pageFit1')}: {Math.round(scaleFactor * 100)}%
                </span>
              )}
              <span className="bg-black/30 px-2.5 py-1 rounded-md border border-white/20">
                {calculatedPages} {getTranslation(lang, 'pagesTotal')}
              </span>
            </div>
          </div>
        )}

        {/* CANVAS A4 CONTAINER */}
        <div
          id={id}
          ref={cvInnerRef}
          className="relative select-none flex flex-col gap-6 items-center shrink-0"
          style={{
            fontFamily: fontCss,
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            transform: (!hideStatusBanner && scaleFactor < 1) ? `scale(${scaleFactor})` : undefined,
            transformOrigin: 'top center',
            marginBottom: (!hideStatusBanner && scaleFactor < 1) ? `${(scaleFactor - 1) * (actualRender2Pages ? (1122 * 2 + 24) : (measuredHeightPx || 1122))}px` : undefined
          }}
        >
          {actualRender2Pages ? (
            /* 2-PAGE DISCRETE SHEETS (Guarantees zero page cuts and exact 2 pages output) */
            <>
              {/* SHEET 1 */}
              <div
                data-page-index="1"
                className={`cv-page-sheet bg-white text-slate-900 rounded-none sm:rounded-lg relative select-none flex flex-col justify-start overflow-hidden transition-all duration-200 ${paidHighlightClass}`}
                style={{
                  fontFamily: fontCss,
                  ...mainBgStyle,
                  color: mainTextColor,
                  width: '794px',
                  minWidth: '794px',
                  maxWidth: '794px',
                  paddingTop: `${pagePaddingPx}px`,
                  paddingLeft: `${pagePaddingPx}px`,
                  paddingRight: `${pagePaddingPx}px`,
                  paddingBottom: `${pageSafetyBottomMarginPx}px`,
                  boxSizing: 'border-box',
                  minHeight: '1122px',
                  height: '1122px',
                  maxHeight: '1122px'
                }}
              >
                {watermarkContent}
                {interactiveToolbar}
                {renderRibbonLeftMargin()}

                {renderTopHeader()}
                {renderFullWidthResumeBlock()}

                {showPhoto && photoPos === 'free' && (
                  <div
                    onMouseDown={handlePhotoMouseDown}
                    onTouchStart={handlePhotoMouseDown}
                    className={`absolute z-45 overflow-hidden border-2 shadow-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                    style={{
                      left: `${cv.photoX ?? 10}%`,
                      top: `${cv.photoY ?? 5}%`,
                      width: `${photoSize}px`,
                      height: rawShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px`,
                      borderColor: cv.photoBordureCouleur || primaryAccent,
                      borderWidth: cv.photoBordureEpaisseur !== undefined ? `${cv.photoBordureEpaisseur}px` : '2px',
                      borderRadius: cv.photoRayon !== undefined ? `${cv.photoRayon}px` : undefined,
                      ...photoInlineStyle
                    }}
                  >
                    <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                  </div>
                )}

                <div className={`flex-1 flex flex-col w-full py-0 min-h-0 ${ribbonPaddingClass}`} style={{ flex: '1 1 0%', height: '100%', minHeight: '100%', paddingBottom: `${Math.max(20, Math.round(pageSafetyBottomMarginPx / 2))}px` }}>
                  {!isTwoColumn ? (
                    <DroppableZone
                      id="zone-droppable-page1"
                      zoneName="principale"
                      sectionsList={page1MainSections}
                      isSidebar={false}
                      isReorderActive={isReorderActive}
                      sectionGapPx={sectionGapPx}
                      cv={cv}
                      accentColor={primaryAccent}
                      secondaryAccentColor={secondaryAccent}
                      textColor={mainTextColor}
                      headingColor={mainHeadingColor}
                      headerStyle={sectionHeaderStyle}
                      skillsDisplayMode={skillsDisplayMode}
                      experienceDatesAlignment={datesAlignment}
                      bulletStyle={bulletStyle}
                      titleFontSizePt={titleFontSizePt}
                      titleCase={titleCase}
                      titleAlign={titleAlign}
                      timelineStyle={timelineStyle}
                      badgesContactStyle={badgesContactStyle}
                      afficherBadgesIcones={cv.afficherBadgesIcones}
                      fontCss={fontCss}
                      dynamicTextStyle={dynamicTextStyle}
                      selectedSectionId={selectedSectionId}
                      onSelectSection={setSelectedSectionId}
                      onUpdateSection={handleUpdateSection}
                      onUpdateSectionStyle={handleUpdateSectionStyle}
                    />
                  ) : (
                    <div className={`flex-1 flex flex-row w-full min-h-0 h-full ${sidebarPosition === 'droite' ? 'flex-row-reverse' : ''}`} style={{ flex: '1 1 0%', height: '100%', minHeight: '100%' }}>
                      <div
                        className={`px-2 py-1.5 sm:px-2.5 sm:py-2 shrink-0 transition-all relative ${
                          sidebarPosition === 'droite' ? 'border-l' : 'border-r'
                        } border-slate-200/80 ${formeSidebarDecor === 'arch-top' ? 'rounded-t-[32px] sm:rounded-t-[44px] overflow-hidden' : ''}`}
                        style={{
                          width: `${leftColWidth}%`,
                          ...sidebarBgStyle,
                          color: sidebarTextColor,
                          borderColor: secondaryAccent,
                          paddingBottom: `${pageSafetyBottomMarginPx}px`,
                          alignSelf: 'stretch',
                          minHeight: '100%'
                        }}
                      >
                        {(headerStyle === 'sylvie-wave' || headerStyle === 'sylvie-loiseau') ? (
                          <div className="-mx-2 -mt-1.5 mb-3 text-center text-white relative shadow-xs overflow-hidden rounded-b-xl" style={{ backgroundColor: cv.couleurFondProfil || primaryAccent }}>
                            <div className="pt-3.5 pb-1 px-2 relative z-10 space-y-1">
                              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white drop-shadow-xs" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || '#FFFFFF' }}>
                                {displayedMainTitle}
                              </h1>
                              {displayedSubTitle && (
                                <p className="text-[9px] font-bold uppercase tracking-widest text-teal-100 opacity-90" style={{ ...subTitleStyle, color: cv.couleurSousTitrePrincipal || '#E0F2F1' }}>
                                  {displayedSubTitle}
                                </p>
                              )}
                              {showHeaderPhoto && (
                                <div className="mt-2 flex justify-center -mb-6 relative z-20">
                                  <div
                                    onMouseDown={handlePhotoMouseDown}
                                    onTouchStart={handlePhotoMouseDown}
                                    className={`overflow-hidden shadow-xl border-2 border-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                                    style={{ ...customPhotoStyle, borderColor: '#FFFFFF', width: '92px', height: '92px' }}
                                  >
                                    <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Bottom Wave Arc filled with sidebar background color */}
                            <div className="w-full h-6 overflow-hidden relative z-10">
                              <svg className="w-full h-full fill-current block" style={{ color: rawSidebarBg || '#F0FDFA' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
                                <path d="M0,120 L1440,120 L1440,0 C1020,100 800,100 420,40 C200,0 0,0 0,0 Z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <>
                            {showSidebarPhoto && (
                              <div className="mb-2 flex justify-center">
                                <div
                                  onMouseDown={handlePhotoMouseDown}
                                  onTouchStart={handlePhotoMouseDown}
                                  className={`overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                                  style={customPhotoStyle}
                                >
                                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                                </div>
                              </div>
                            )}
                            {headerStyle === 'sidebar-top' && (
                              <div className="mb-2 text-center space-y-0.5 pb-1 border-b border-current opacity-90">
                                <h1 className="text-xs font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || sidebarHeadingColor }}>{displayedMainTitle}</h1>
                                <p className="text-[9px] font-bold uppercase" style={{ ...subTitleStyle, color: resolveSubtitleColor(rawSidebarBg, cv.couleurSousTitrePrincipal, secondaryAccent, isSidebarDark ? '#E2E8F0' : '#475569') }}>{displayedSubTitle}</p>
                              </div>
                            )}
                          </>
                        )}
                        <DroppableZone
                          id="zone-droppable-page1-gauche"
                          zoneName="gauche"
                          sectionsList={page1LeftSections.length > 0 ? page1LeftSections : leftZoneSections}
                          isSidebar={true}
                          isReorderActive={isReorderActive}
                          sectionGapPx={sectionGapPx}
                          cv={cv}
                          accentColor={primaryAccent}
                          secondaryAccentColor={secondaryAccent}
                          textColor={sidebarTextColor}
                          headingColor={sidebarHeadingColor}
                          headerStyle={sectionHeaderStyle}
                          skillsDisplayMode={skillsDisplayMode}
                          experienceDatesAlignment={datesAlignment}
                          bulletStyle={bulletStyle}
                          titleFontSizePt={titleFontSizePt}
                          titleCase={titleCase}
                          titleAlign={titleAlign}
                          timelineStyle={timelineStyle}
                          badgesContactStyle={badgesContactStyle}
                          afficherBadgesIcones={cv.afficherBadgesIcones}
                          fontCss={fontCss}
                          dynamicTextStyle={dynamicTextStyle}
                          selectedSectionId={selectedSectionId}
                          onSelectSection={setSelectedSectionId}
                          onUpdateSection={handleUpdateSection}
                          onUpdateSectionStyle={handleUpdateSectionStyle}
                        />
                        {(formeSidebarDecor === 'wave-cut' || headerStyle === 'sylvie-wave' || headerStyle === 'sylvie-loiseau') && (
                          <div className="w-full h-6 overflow-hidden -mx-2 -mb-1.5 mt-auto pointer-events-none relative z-10 shrink-0">
                            <svg className="w-full h-full fill-current block" style={{ color: primaryAccent }} viewBox="0 0 1440 120" preserveAspectRatio="none">
                              <path d="M0,120 L1440,120 L1440,0 C1160,80 1020,80 720,40 C420,0 280,0 0,60 Z" />
                            </svg>
                          </div>
                        )}
                        {(formeSidebarDecor === 'diagonal-cut' || headerStyle === 'baxter-diagonal' || headerStyle === 'diagonal-split') && (
                          <div className="w-full h-8 overflow-hidden -mx-2 -mb-1.5 mt-auto pointer-events-none relative z-10 shrink-0">
                            <svg className="w-full h-full fill-current block" style={{ color: secondaryAccent || primaryAccent }} viewBox="0 0 100 100" preserveAspectRatio="none">
                              <polygon points="0,100 100,100 100,0" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 flex flex-col" style={{ flex: '1 1 0%', height: '100%', minHeight: '100%', alignSelf: 'stretch', paddingBottom: `${pageSafetyBottomMarginPx}px` }}>
                        <DroppableZone
                          id="zone-droppable-page1-droite"
                          zoneName="droite"
                          sectionsList={page1RightSections.length > 0 ? page1RightSections : page1MainSections}
                          isSidebar={false}
                          isReorderActive={isReorderActive}
                          sectionGapPx={sectionGapPx}
                          cv={cv}
                          accentColor={primaryAccent}
                          secondaryAccentColor={secondaryAccent}
                          textColor={mainTextColor}
                          headingColor={mainHeadingColor}
                          headerStyle={sectionHeaderStyle}
                          skillsDisplayMode={skillsDisplayMode}
                          experienceDatesAlignment={datesAlignment}
                          bulletStyle={bulletStyle}
                          titleFontSizePt={titleFontSizePt}
                          titleCase={titleCase}
                          titleAlign={titleAlign}
                          timelineStyle={timelineStyle}
                          badgesContactStyle={badgesContactStyle}
                          afficherBadgesIcones={cv.afficherBadgesIcones}
                          fontCss={fontCss}
                          dynamicTextStyle={dynamicTextStyle}
                          selectedSectionId={selectedSectionId}
                          onSelectSection={setSelectedSectionId}
                          onUpdateSection={handleUpdateSection}
                          onUpdateSectionStyle={handleUpdateSectionStyle}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* NO FOOTER ON PAGE 1: The footer is strictly and exclusively rendered on the last page (Sheet 2) */}

                {(formeSidebarDecor === 'diagonal-cut' || headerStyle === 'baxter-diagonal') && (
                  <div 
                    className="absolute bottom-0 right-0 w-0 h-0 pointer-events-none z-10" 
                    style={{
                      borderStyle: 'solid',
                      borderWidth: '0 0 80px 80px',
                      borderColor: `transparent transparent ${secondaryAccent || primaryAccent} transparent`,
                      opacity: 0.95
                    }} 
                  />
                )}
              </div>

              {/* SHEET 2 */}
              <div
                data-page-index="2"
                className={`cv-page-sheet bg-white text-slate-900 rounded-none sm:rounded-lg relative select-none flex flex-col justify-between overflow-hidden transition-all duration-200 ${paidHighlightClass}`}
                style={{
                  fontFamily: fontCss,
                  ...mainBgStyle,
                  color: mainTextColor,
                  width: '794px',
                  minWidth: '794px',
                  maxWidth: '794px',
                  paddingTop: `${pagePaddingPx}px`,
                  paddingLeft: `${pagePaddingPx}px`,
                  paddingRight: `${pagePaddingPx}px`,
                  paddingBottom: `${pageSafetyBottomMarginPx}px`,
                  boxSizing: 'border-box',
                  minHeight: '1122px',
                  height: '1122px',
                  maxHeight: '1122px'
                }}
              >
                {watermarkContent}
                {renderRibbonLeftMargin()}
                {renderPage2Header()}

                <div className={`flex-1 flex flex-col w-full py-0 min-h-0 ${ribbonPaddingClass}`} style={{ flex: '1 1 0%', height: '100%', minHeight: '100%', paddingBottom: '14px' }}>
                  {isTwoColumn ? (
                    <div className={`flex-1 flex flex-row w-full min-h-0 h-full ${sidebarPosition === 'droite' ? 'flex-row-reverse' : ''}`} style={{ flex: '1 1 0%', height: '100%', minHeight: '100%' }}>
                      <div
                        className={`px-2 py-1.5 sm:px-2.5 sm:py-2 shrink-0 transition-all relative ${
                          sidebarPosition === 'droite' ? 'border-l' : 'border-r'
                        } border-slate-200/80 ${formeSidebarDecor === 'arch-top' ? 'rounded-t-[32px] sm:rounded-t-[44px] overflow-hidden' : ''}`}
                        style={{
                          width: `${leftColWidth}%`,
                          ...sidebarBgStyle,
                          color: sidebarTextColor,
                          borderColor: secondaryAccent,
                          paddingBottom: '16px',
                          alignSelf: 'stretch',
                          minHeight: '100%'
                        }}
                      >
                        {page2LeftSections.length > 0 ? (
                          <DroppableZone
                            id="zone-droppable-page2-gauche"
                            zoneName="gauche"
                            sectionsList={page2LeftSections}
                            isSidebar={true}
                            isReorderActive={isReorderActive}
                            sectionGapPx={sectionGapPx}
                            cv={cv}
                            accentColor={primaryAccent}
                            secondaryAccentColor={secondaryAccent}
                            textColor={sidebarTextColor}
                            headingColor={sidebarHeadingColor}
                            headerStyle={sectionHeaderStyle}
                            skillsDisplayMode={skillsDisplayMode}
                            experienceDatesAlignment={datesAlignment}
                            bulletStyle={bulletStyle}
                            titleFontSizePt={titleFontSizePt}
                            titleCase={titleCase}
                            titleAlign={titleAlign}
                            timelineStyle={timelineStyle}
                            badgesContactStyle={badgesContactStyle}
                            afficherBadgesIcones={cv.afficherBadgesIcones}
                            fontCss={fontCss}
                            dynamicTextStyle={dynamicTextStyle}
                            selectedSectionId={selectedSectionId}
                            onSelectSection={setSelectedSectionId}
                            onUpdateSection={handleUpdateSection}
                            onUpdateSectionStyle={handleUpdateSectionStyle}
                          />
                        ) : (
                          <div className="flex flex-col h-full opacity-80 pt-2 space-y-3 select-none">
                            <div className="pb-2 border-b border-current/20">
                              <p className="text-[10px] font-black uppercase tracking-wider">{displayedMainTitle}</p>
                              {displayedSubTitle && <p className="text-[8px] uppercase tracking-wide opacity-75">{displayedSubTitle}</p>}
                            </div>
                            {(profilContenu.email || profilContenu.telephone) && (
                              <div className="text-[9px] space-y-1 opacity-70">
                                {profilContenu.email && <p className="truncate">✉ {profilContenu.email}</p>}
                                {profilContenu.telephone && <p>📞 {profilContenu.telephone}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 flex flex-col" style={{ flex: '1 1 0%', height: '100%', minHeight: '100%', alignSelf: 'stretch', paddingBottom: '16px' }}>
                        <DroppableZone
                          id="zone-droppable-page2-droite"
                          zoneName="droite"
                          sectionsList={page2RightSections.length > 0 ? page2RightSections : page2MainSections}
                          isSidebar={false}
                          isReorderActive={isReorderActive}
                          sectionGapPx={sectionGapPx}
                          cv={cv}
                          accentColor={primaryAccent}
                          secondaryAccentColor={secondaryAccent}
                          textColor={mainTextColor}
                          headingColor={mainHeadingColor}
                          headerStyle={sectionHeaderStyle}
                          skillsDisplayMode={skillsDisplayMode}
                          experienceDatesAlignment={datesAlignment}
                          bulletStyle={bulletStyle}
                          titleFontSizePt={titleFontSizePt}
                          titleCase={titleCase}
                          titleAlign={titleAlign}
                          timelineStyle={timelineStyle}
                          badgesContactStyle={badgesContactStyle}
                          afficherBadgesIcones={cv.afficherBadgesIcones}
                          fontCss={fontCss}
                          dynamicTextStyle={dynamicTextStyle}
                          selectedSectionId={selectedSectionId}
                          onSelectSection={setSelectedSectionId}
                          onUpdateSection={handleUpdateSection}
                          onUpdateSectionStyle={handleUpdateSectionStyle}
                        />
                      </div>
                    </div>
                  ) : (
                    <DroppableZone
                      id="zone-droppable-page2"
                      zoneName="principale"
                      sectionsList={page2MainSections.length > 0 ? page2MainSections : page2RightSections}
                      isSidebar={false}
                      isReorderActive={isReorderActive}
                      sectionGapPx={sectionGapPx}
                      cv={cv}
                      accentColor={primaryAccent}
                      secondaryAccentColor={secondaryAccent}
                      textColor={mainTextColor}
                      headingColor={mainHeadingColor}
                      headerStyle={sectionHeaderStyle}
                      skillsDisplayMode={skillsDisplayMode}
                      experienceDatesAlignment={datesAlignment}
                      bulletStyle={bulletStyle}
                      titleFontSizePt={titleFontSizePt}
                      titleCase={titleCase}
                      titleAlign={titleAlign}
                      timelineStyle={timelineStyle}
                      badgesContactStyle={badgesContactStyle}
                      afficherBadgesIcones={cv.afficherBadgesIcones}
                      fontCss={fontCss}
                      dynamicTextStyle={dynamicTextStyle}
                      selectedSectionId={selectedSectionId}
                      onSelectSection={setSelectedSectionId}
                      onUpdateSection={handleUpdateSection}
                      onUpdateSectionStyle={handleUpdateSectionStyle}
                    />
                  )}
                </div>

                <div className="mt-auto shrink-0 flex flex-col gap-1 w-full z-20 relative pt-0" style={{ marginTop: '5px' }}>
                  {renderCVContactFooter()}
                  {renderCustomFooter(2, calculatedPages)}
                </div>
              </div>
            </>
          ) : (
            /* SINGLE CONTINUOUS PAGE SHEET */
            <div
              data-page-index="1"
              className={`cv-page-sheet bg-white text-slate-900 rounded-none sm:rounded-lg relative select-none flex flex-col transition-all duration-200 ${paidHighlightClass}`}
              style={{
                fontFamily: fontCss,
                ...mainBgStyle,
                color: mainTextColor,
                width: '794px',
                minWidth: '794px',
                maxWidth: '794px',
                paddingTop: `${pagePaddingPx}px`,
                paddingLeft: `${pagePaddingPx}px`,
                paddingRight: `${pagePaddingPx}px`,
                paddingBottom: `${pageSafetyBottomMarginPx}px`,
                boxSizing: 'border-box',
                minHeight: '1122px',
                height: 'auto'
              }}
            >
              {watermarkContent}
              {interactiveToolbar}
              {renderRibbonLeftMargin()}

              {renderTopHeader()}
              {renderFullWidthResumeBlock()}

              {/* FLOATING FREE PHOTO ELEMENT (DRAGGABLE ANYWHERE ON CANVAS WITH MOUSE OR TOUCH) */}
              {showPhoto && photoPos === 'free' && (
                <div
                  onMouseDown={handlePhotoMouseDown}
                  onTouchStart={handlePhotoMouseDown}
                  className={`absolute z-45 overflow-hidden border-2 shadow-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                  style={{
                    left: `${cv.photoX ?? 10}%`,
                    top: `${cv.photoY ?? 5}%`,
                    width: `${photoSize}px`,
                    height: rawShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px`,
                    borderColor: cv.photoBordureCouleur || primaryAccent,
                    borderWidth: cv.photoBordureEpaisseur !== undefined ? `${cv.photoBordureEpaisseur}px` : '2px',
                    borderRadius: cv.photoRayon !== undefined ? `${cv.photoRayon}px` : undefined,
                    ...(photoRing === 'double-ring' ? {
                      outline: `3px solid ${primaryAccent}`,
                      outlineOffset: '3px',
                      boxShadow: `0 0 0 5px ${secondaryAccent || '#FFFFFF'}`
                    } : photoRing === 'gold-ring' ? {
                      outline: '3px solid #D97706',
                      outlineOffset: '3px',
                      boxShadow: '0 0 0 5px #FDE68A'
                    } : photoRing === 'accent-ring' ? {
                      outline: `3px solid ${primaryAccent}`,
                      outlineOffset: '3px'
                    } : {})
                  }}
                  title={lang === 'en' ? "Drag photo freely anywhere!" : lang === 'ar' ? "اسحب الصورة بحرية إلى أي مكان!" : "Déplacez la photo librement à la souris n'importe où !"}
                >
                  <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                </div>
              )}

              {/* PAGE BREAK VISUAL INDICATORS AT 1122PX ONLY IF MULTI-PAGE WITHOUT STRICT 2-PAGE SHEETS */}
              {calculatedPages > 1 && !is2Pages && (
                <div
                  className="absolute left-0 right-0 border-b-2 border-dashed border-red-400 z-30 pointer-events-none opacity-50 print:hidden flex items-center justify-end px-3 text-[9px] font-black uppercase text-red-600 bg-red-50/20"
                  style={{ top: '1122px' }}
                >
                  {getTranslation(lang, 'endOfPage1')}
                </div>
              )}

              {/* CANVAS BODY: 1 OR 2 COLUMNS WITH DROPPABLE ZONES */}
              <div className={`flex-1 flex flex-col w-full min-h-0 h-full ${ribbonPaddingClass}`}>
                {!isTwoColumn ? (
                  /* SINGLE COLUMN LAYOUT */
                  <div className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 flex flex-col justify-between" style={{ paddingBottom: `${Math.max(16, footerMarginPx)}px` }}>
                    <DroppableZone
                      id="zone-droppable-principale"
                      zoneName="principale"
                      sectionsList={mainZoneSections}
                      isSidebar={false}
                      isReorderActive={isReorderActive}
                      sectionGapPx={sectionGapPx}
                      cv={cv}
                      accentColor={primaryAccent}
                      secondaryAccentColor={secondaryAccent}
                      textColor={mainTextColor}
                      headingColor={mainHeadingColor}
                      headerStyle={sectionHeaderStyle}
                      skillsDisplayMode={skillsDisplayMode}
                      experienceDatesAlignment={datesAlignment}
                      bulletStyle={bulletStyle}
                      titleFontSizePt={titleFontSizePt}
                      titleCase={titleCase}
                      titleAlign={titleAlign}
                      timelineStyle={timelineStyle}
                      badgesContactStyle={badgesContactStyle}
                      afficherBadgesIcones={cv.afficherBadgesIcones}
                      fontCss={fontCss}
                      dynamicTextStyle={dynamicTextStyle}
                      selectedSectionId={selectedSectionId}
                      onSelectSection={setSelectedSectionId}
                      onUpdateSection={handleUpdateSection}
                      onUpdateSectionStyle={handleUpdateSectionStyle}
                    />
                    {effectiveDecorativeLayers.some(l => l.zone === 'page-footer') && (
                      <DecorativeLayerRenderer
                        layers={effectiveDecorativeLayers}
                        zone="page-footer"
                        primaryAccent={primaryAccent}
                        secondaryAccent={secondaryAccent}
                        defaultContactData={{
                          email: profilContenu.email,
                          telephone: profilContenu.telephone,
                          adresse: profilContenu.adresse,
                          dispo: cv.disponibiliteTexte || 'Immédiate',
                          siteWeb: profilContenu.siteWeb
                        }}
                      />
                    )}
                  </div>
                ) : (
                  /* TWO COLUMN LAYOUT */
                  <div className={`flex-1 flex flex-row w-full min-h-0 h-full ${sidebarPosition === 'droite' ? 'flex-row-reverse' : ''}`}>
                    {/* COLUMN 1: SIDEBAR / LATÉRAL */}
                    <div
                      className={`px-2 py-1.5 sm:px-2.5 sm:py-2 shrink-0 transition-all relative ${
                        sidebarPosition === 'droite' ? 'border-l' : 'border-r'
                      } border-slate-200/80 ${
                        sidebarDecor === 'arch-top'
                          ? 'rounded-t-[60px] sm:rounded-t-[90px] shadow-lg mt-1'
                          : sidebarDecor === 'wave-cut'
                          ? sidebarPosition === 'droite'
                            ? 'rounded-l-3xl sm:rounded-bl-[80px] shadow-md'
                            : 'rounded-r-3xl sm:rounded-br-[80px] shadow-md'
                          : sidebarDecor === 'diagonal-cut'
                          ? sidebarPosition === 'droite'
                            ? '[clip-path:polygon(0_15px,100%_0,100%_100%,0_100%)]'
                            : '[clip-path:polygon(0_0,100%_15px,100%_100%,0_100%)]'
                          : sidebarDecor === 'card-float'
                          ? sidebarPosition === 'droite'
                            ? 'rounded-2xl shadow-xl my-2 mr-1 border border-slate-200/60'
                            : 'rounded-2xl shadow-xl my-2 ml-1 border border-slate-200/60'
                          : ''
                      }`}
                      style={{
                        width: `${leftColWidth}%`,
                        ...sidebarBgStyle,
                        color: sidebarTextColor,
                        borderColor: secondaryAccent,
                        paddingBottom: '16px'
                      }}
                    >
                      {showSidebarPhoto && (
                        <div className="mb-2 flex justify-center">
                          <div
                            onMouseDown={handlePhotoMouseDown}
                            onTouchStart={handlePhotoMouseDown}
                            className={`overflow-hidden shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${photoShapeClass}`}
                            style={customPhotoStyle}
                            title="Glissez à la souris pour déplacer la photo n'importe où !"
                          >
                            <img src={activePhotoUrl} alt="Portrait" className={`w-full h-full object-cover pointer-events-none ${photoShapeClass}`} />
                          </div>
                        </div>
                      )}
                      {headerStyle === 'sidebar-top' && (
                        <div className="mb-2 text-center space-y-0.5 pb-1 border-b border-current opacity-90">
                          <h1 className="text-xs font-black uppercase tracking-tight" style={{ ...mainTitleStyle, color: cv.couleurTitrePrincipal || sidebarHeadingColor }}>{displayedMainTitle}</h1>
                          <p className="text-[9px] font-bold uppercase" style={{ ...subTitleStyle, color: resolveSubtitleColor(rawSidebarBg, cv.couleurSousTitrePrincipal, secondaryAccent, isSidebarDark ? '#E2E8F0' : '#475569') }}>{displayedSubTitle}</p>
                        </div>
                      )}
                      <DroppableZone
                        id="zone-droppable-gauche"
                        zoneName="gauche"
                        sectionsList={leftZoneSections}
                        isSidebar={true}
                        isReorderActive={isReorderActive}
                        sectionGapPx={sectionGapPx}
                        cv={cv}
                        accentColor={primaryAccent}
                        secondaryAccentColor={secondaryAccent}
                        textColor={sidebarTextColor}
                        headingColor={sidebarHeadingColor}
                        headerStyle={sectionHeaderStyle}
                        skillsDisplayMode={skillsDisplayMode}
                        experienceDatesAlignment={datesAlignment}
                        bulletStyle={bulletStyle}
                        titleFontSizePt={titleFontSizePt}
                        titleCase={titleCase}
                        titleAlign={titleAlign}
                        timelineStyle={timelineStyle}
                        badgesContactStyle={badgesContactStyle}
                        afficherBadgesIcones={cv.afficherBadgesIcones}
                        fontCss={fontCss}
                        dynamicTextStyle={dynamicTextStyle}
                        selectedSectionId={selectedSectionId}
                        onSelectSection={setSelectedSectionId}
                        onUpdateSection={handleUpdateSection}
                        onUpdateSectionStyle={handleUpdateSectionStyle}
                      />
                    </div>

                    {/* COLUMN 2: MAIN / PRINCIPALE */}
                    <div
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 flex-1 transition-all"
                      style={{
                        width: `${rightColWidth}%`,
                        ...mainBgStyle,
                        color: mainTextColor,
                        paddingBottom: `${Math.max(16, footerMarginPx)}px`
                      }}
                    >
                      <DroppableZone
                        id="zone-droppable-droite"
                        zoneName="droite"
                        sectionsList={rightZoneSections}
                        isSidebar={false}
                        isReorderActive={isReorderActive}
                        sectionGapPx={sectionGapPx}
                        cv={cv}
                        accentColor={primaryAccent}
                        secondaryAccentColor={secondaryAccent}
                        textColor={mainTextColor}
                        headingColor={mainHeadingColor}
                        headerStyle={sectionHeaderStyle}
                        skillsDisplayMode={skillsDisplayMode}
                        experienceDatesAlignment={datesAlignment}
                        bulletStyle={bulletStyle}
                        titleFontSizePt={titleFontSizePt}
                        titleCase={titleCase}
                        titleAlign={titleAlign}
                        timelineStyle={timelineStyle}
                        badgesContactStyle={badgesContactStyle}
                        afficherBadgesIcones={cv.afficherBadgesIcones}
                        fontCss={fontCss}
                        dynamicTextStyle={dynamicTextStyle}
                        selectedSectionId={selectedSectionId}
                        onSelectSection={setSelectedSectionId}
                        onUpdateSection={handleUpdateSection}
                        onUpdateSectionStyle={handleUpdateSectionStyle}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-auto shrink-0 flex flex-col gap-1 w-full z-20 relative pt-1" style={{ marginTop: '8px', paddingBottom: '10px' }}>
                  {renderCVContactFooter()}
                  {renderCustomFooter(1, calculatedPages)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};
