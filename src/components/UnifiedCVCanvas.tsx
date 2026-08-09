import React, { useRef, useState, useLayoutEffect } from 'react';
import { CV, CVTemplate, Section, ProfilContenu } from '../types';
import { SectionSlot } from './SectionSlot';
import { FONT_OPTIONS } from '../data/templates';
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
  isReorderActive?: boolean;
  onSectionsReorder?: (newSections: Section[]) => void;
  onUpdateSectionZone?: (sectionId: string, newZone: 'gauche' | 'droite' | 'principale') => void;
  watermarkContent?: React.ReactNode;
  interactiveToolbar?: React.ReactNode;
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
      style={style}
      className={`transition-shadow ${isDragging ? 'z-40 ring-4 ring-blue-500/80 rounded-2xl shadow-2xl bg-blue-50/20' : ''}`}
    >
      <SectionSlot
        {...props}
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

  return (
    <SortableContext items={sectionsList.map(s => s.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`flex flex-col transition-all duration-150 min-h-[100px] ${
          isOver && isReorderActive
            ? 'bg-blue-100/70 border-2 border-dashed border-blue-600 rounded-2xl p-3 shadow-inner'
            : ''
        }`}
        style={{ gap: `${sectionGapPx}px` }}
      >
        {sectionsList.map((sec) => (
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
              🎯 {isOver ? 'Relâchez pour déposer dans la' : 'Déposez une section ici ('} Zone{' '}
              {zoneName === 'gauche' ? 'Gauche' : zoneName === 'droite' ? 'Droite' : 'Principale'}
              {!isOver && ')'}
            </span>
          </div>
        )}
      </div>
    </SortableContext>
  );
};

// COMPACTNESS LEVEL PRESETS (Level 0 = Crisp Vector Standard to Level 3 = Strict Ultra-Compact Floor)
const COMPACTNESS_LEVELS = [
  { fontSize: 8.50, lineHeight: 1.00, sectionGap: 3, itemGap: 2, padding: 6, titleSize: 9.00 },
  { fontSize: 8.00, lineHeight: 0.90, sectionGap: 2, itemGap: 1, padding: 4, titleSize: 8.50 },
  { fontSize: 7.50, lineHeight: 0.82, sectionGap: 1.5, itemGap: 1, padding: 3, titleSize: 8.00 },
  { fontSize: 7.00, lineHeight: 0.75, sectionGap: 1, itemGap: 0.5, padding: 2, titleSize: 7.50 } // Ultra-Compact Vector PDF Floor
];

export const UnifiedCVCanvas: React.FC<UnifiedCVCanvasProps> = ({
  id = 'cv-preview-container',
  cv,
  template,
  isReorderActive = false,
  onSectionsReorder,
  onUpdateSectionZone,
  watermarkContent,
  interactiveToolbar
}) => {
  // Layout setup
  const templateTheme = template.themeConfig || {};
  const isTwoColumn = (cv.nombreColonnes ?? (template.layoutFamily === 'single-column' ? 1 : 2)) === 2;
  const sidebarPosition = cv.positionSidebar || (template.layoutFamily === 'two-column-right' ? 'droite' : 'gauche');
  const leftColWidth = cv.largeurColonneGauche || templateTheme.defaultLeftWidth || 34; // %
  const rightColWidth = 100 - leftColWidth;

  // Colors
  const primaryAccent = cv.couleurAccent || templateTheme.primaryColor || '#006666';
  const secondaryAccent = cv.couleurAccentSecondaire || templateTheme.secondaryColor || '#E2E8F0';
  const mainBgColor = cv.couleurFond || templateTheme.backgroundColor || '#FFFFFF';
  const sidebarBgColor = cv.couleurFondSidebar || templateTheme.sidebarBackgroundColor || secondaryAccent || '#F8FAFC';
  const mainTextColor = cv.couleurTexte || templateTheme.textColor || '#1E293B';
  const sidebarTextColor = cv.couleurTexteSidebar || templateTheme.sidebarTextColor || '#0F172A';
  const mainHeadingColor = cv.couleurTitreSection || templateTheme.headingColor || primaryAccent;
  const sidebarHeadingColor = cv.couleurTitreSectionSidebar || templateTheme.sidebarHeadingColor || primaryAccent;

  // Styles & Typography
  const headerStyle = cv.styleEnTete || templateTheme.headerStyle || 'banner';
  const sectionHeaderStyle = cv.styleEnTeteSection || templateTheme.sectionHeaderStyle || 'underline';
  const skillsDisplayMode = cv.styleCompetences || templateTheme.skillsDisplayMode || 'grid';
  const datesAlignment = cv.alignementDatesExperience || templateTheme.experienceDatesAlignment || 'left';

  const fontObj = FONT_OPTIONS.find(f => f.id === cv.police) || FONT_OPTIONS.find(f => f.id === template.defaultFont) || FONT_OPTIONS[0];
  const fontCss = fontObj ? fontObj.family : 'Inter, sans-serif';

  // Compactness & Scaling State
  const [compactnessLevel, setCompactnessLevel] = useState<number>(0);
  const cvInnerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [measuredHeightPx, setMeasuredHeightPx] = useState<number>(0);

  const isStrict1Page = cv.pageCibleMode === '1_page' || cv.pageCibleMode === 'compact';
  const is2Pages = cv.pageCibleMode === '2_pages';

  const activeLevel = COMPACTNESS_LEVELS[compactnessLevel] || COMPACTNESS_LEVELS[0];

  const fontSizePx = cv.taillePoliceValeur ?? activeLevel.fontSize;
  const lineHeightVal = cv.hauteurLigneValeur ?? activeLevel.lineHeight;
  const sectionGapPx = cv.espacementSectionsPx ?? activeLevel.sectionGap;
  const titleFontSizePt = cv.tailleTitreSectionValeur ?? activeLevel.titleSize;
  const pagePaddingPx = cv.margeGlobalePage ?? activeLevel.padding;

  const dynamicTextStyle: React.CSSProperties = {
    fontSize: `${fontSizePx}pt`,
    lineHeight: lineHeightVal
  };

  const bulletStyle = cv.stylePucesListes || 'disc';
  const titleCase = cv.casseTitreSection || 'uppercase';
  const titleAlign = cv.alignementTitreSection || 'left';

  // Adaptive Auto-Compacting Layout Effect
  useLayoutEffect(() => {
    if (!cvInnerRef.current) return;

    const SINGLE_PAGE_PX = 1122; // Standard A4 page height @ 96 DPI
    const currentHeight = cvInnerRef.current.scrollHeight;
    setMeasuredHeightPx(currentHeight);

    let maxTargetPx = SINGLE_PAGE_PX;
    if (is2Pages) {
      maxTargetPx = SINGLE_PAGE_PX * 2;
    }

    if (currentHeight > maxTargetPx) {
      if (compactnessLevel < COMPACTNESS_LEVELS.length - 1) {
        // Increment compactness level
        setCompactnessLevel(prev => prev + 1);
        setScaleFactor(1);
      } else {
        // At Level 3 Floor
        if (is2Pages) {
          setScaleFactor(1);
        } else {
          // In 1_page, compact or auto mode: strictly scale to fit 1 page
          const computedScale = Math.max(0.65, maxTargetPx / currentHeight);
          setScaleFactor(computedScale);
        }
      }
    } else {
      // Content fits within budget
      if (compactnessLevel > 0 && currentHeight < maxTargetPx * 0.82) {
        setCompactnessLevel(prev => Math.max(0, prev - 1));
      }
      setScaleFactor(1);
    }
  }, [cv, isTwoColumn, leftColWidth, isStrict1Page, is2Pages, compactnessLevel]);

  // Section grouping by zones
  const leftZoneSections: Section[] = [];
  const rightZoneSections: Section[] = [];
  const mainZoneSections: Section[] = [];

  cv.sections.forEach(sec => {
    if (!sec.visible) return;
    const targetZone = sec.colonne || 'principale';

    if (!isTwoColumn) {
      mainZoneSections.push(sec);
    } else {
      if (targetZone === 'gauche') {
        leftZoneSections.push(sec);
      } else if (targetZone === 'droite') {
        rightZoneSections.push(sec);
      } else {
        if (sec.type === 'experience' || sec.type === 'formation') {
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

  // Candidate profil info
  const profilSection = cv.sections.find(s => s.type === 'profil');
  const profilContenu = (profilSection?.contenu || {}) as ProfilContenu;
  const nomComplet = profilContenu.nomComplet || 'PRÉNOM NOM';
  const titrePro = profilContenu.titreProfessionnel || 'POSTE OCCUPÉ/RECHERCHÉ';

  const showPhoto = cv.afficherPhoto !== false && Boolean(cv.photoUrl);
  const photoShape = cv.photoForme || templateTheme.photoFrameStyle || 'ronde';
  const photoSize = cv.photoTaille ?? (isStrict1Page ? 64 : 96);
  const photoPos = templateTheme.photoPosition || (headerStyle === 'sidebar-top' ? 'in-sidebar' : 'in-header');
  const showHeaderPhoto = showPhoto && photoPos === 'in-header';
  const showSidebarPhoto = showPhoto && photoPos === 'in-sidebar';
  const decorativeShape = templateTheme.decorativeShapes || 'none';

  let photoShapeClass = 'rounded-full';
  if (photoShape === 'carree') photoShapeClass = 'rounded-none';
  if (photoShape === 'arrondie') photoShapeClass = 'rounded-2xl';
  if (photoShape === 'arche') photoShapeClass = 'rounded-t-full rounded-b-lg';
  if (photoShape === 'hexagone') photoShapeClass = 'rounded-xl border-2';
  if (photoShape === 'galet') photoShapeClass = 'rounded-[2rem] aspect-[3/4] object-cover';

  // Render Top Header
  const renderTopHeader = () => {
    if (headerStyle === 'diagonal-split') {
      return (
        <div
          className="w-full relative overflow-hidden px-4 py-2 sm:px-5 sm:py-2.5 border-b flex justify-between items-center shrink-0 shadow-xs"
          style={{ backgroundColor: primaryAccent, color: '#FFFFFF', minHeight: '60px' }}
        >
          <div
            className="absolute -right-8 -bottom-10 w-1/2 h-36 transform -skew-x-12 opacity-80 pointer-events-none"
            style={{ backgroundColor: secondaryAccent && secondaryAccent !== '#FFFFFF' ? secondaryAccent : '#0F172A' }}
          />
          <div className="relative z-10 space-y-0.5">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight leading-tight">{nomComplet}</h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90">{titrePro}</p>
          </div>
          {showHeaderPhoto && (
            <div
              className={`relative z-10 overflow-hidden border-2 border-white shadow-md ${photoShapeClass}`}
              style={{ width: `${photoSize}px`, height: photoShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px` }}
            >
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
        </div>
      );
    }

    if (headerStyle === 'banner' || headerStyle === 'modern-split') {
      return (
        <div
          className="w-full relative overflow-hidden flex items-center px-3.5 py-2 sm:px-4 sm:py-2.5 border-b transition-all shrink-0"
          style={{ backgroundColor: primaryAccent, color: '#FFFFFF', minHeight: '60px' }}
        >
          {decorativeShape === 'circle-photo' && (
            <div
              className="absolute -top-8 -right-8 rounded-full opacity-80 pointer-events-none"
              style={{
                width: `${photoSize * 1.8}px`,
                height: `${photoSize * 1.8}px`,
                backgroundColor: secondaryAccent && secondaryAccent !== '#FFFFFF' ? secondaryAccent : '#003366'
              }}
            />
          )}
          {showHeaderPhoto && (
            <div className="shrink-0 mr-3 relative z-10">
              <div
                className={`overflow-hidden border-2 bg-white/20 shadow-md ${photoShapeClass}`}
                style={{
                  width: `${photoSize}px`,
                  height: photoShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px`,
                  borderColor: cv.photoBordureCouleur || '#FFFFFF',
                  borderWidth: cv.photoBordureEpaisseur ? `${cv.photoBordureEpaisseur}px` : undefined
                }}
              >
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            </div>
          )}
          <div className="flex-1 space-y-0.5 relative z-10">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight leading-tight">
              {nomComplet}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90">
              {titrePro}
            </p>
          </div>
        </div>
      );
    }

    if (headerStyle === 'arch') {
      return (
        <div className="w-full px-3 py-2 text-center bg-slate-900 text-white rounded-b-xl shadow-xs mb-1 shrink-0" style={{ backgroundColor: primaryAccent }}>
          {showHeaderPhoto && (
            <div className="mx-auto mb-1.5 flex justify-center">
              <div
                className={`overflow-hidden border-2 border-white shadow-md ${photoShapeClass}`}
                style={{ width: `${photoSize}px`, height: photoShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px` }}
              >
                <img src={cv.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <h1 className="text-base sm:text-lg font-black uppercase tracking-wide">{nomComplet}</h1>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest opacity-80 mt-0.5">{titrePro}</p>
        </div>
      );
    }

    if (headerStyle === 'sidebar-top') {
      return null; // Header info will render directly in the sidebar column
    }

    // Default header
    return (
      <div className="w-full px-3.5 py-1.5 sm:px-4 sm:py-2 border-b flex justify-between items-center" style={{ borderColor: secondaryAccent }}>
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight" style={{ color: mainHeadingColor }}>
            {nomComplet}
          </h1>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: primaryAccent }}>
            {titrePro}
          </p>
        </div>
        {showHeaderPhoto && (
          <div
            className={`overflow-hidden border-2 border-slate-200 shadow-xs ${photoShapeClass}`}
            style={{ width: `${photoSize}px`, height: photoShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px` }}
          >
            <img src={cv.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  };

  // Status Badge Indicators
  const calculatedPages = Math.ceil((measuredHeightPx * scaleFactor) / 1122);
  let statusBadgeColor = 'bg-emerald-900 border-emerald-700 text-emerald-100';
  let statusText = '✓ Calibré sur 1 Page (Compactage auto optimal)';

  if (calculatedPages === 2) {
    statusBadgeColor = 'bg-blue-900 border-blue-700 text-blue-100';
    statusText = '📄 Calibré sur 2 Pages (Format aéré & lisible)';
  } else if (calculatedPages >= 3) {
    statusBadgeColor = 'bg-amber-900 border-amber-700 text-amber-100';
    statusText = '⚠️ Contenu très volumineux (3 pages) — Pensez à synthétiser certains descriptifs';
  }

  return (
    <DndContext sensors={sensors} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="relative w-full overflow-hidden">
        {/* Real-time Page Budget Status Banner */}
        <div className={`mb-2 p-2.5 rounded-xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md border print:hidden transition-all ${statusBadgeColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span>{statusText}</span>
            {compactnessLevel > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-mono">
                Niv. compactage {compactnessLevel}/3
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            {scaleFactor < 1 && (
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                Ajustement 1-page: {Math.round(scaleFactor * 100)}%
              </span>
            )}
            <span className="bg-black/30 px-2.5 py-1 rounded-md border border-white/20">
              {calculatedPages} Page(s) au total
            </span>
          </div>
        </div>

        {/* CANVAS A4 CONTAINER */}
        <div
          id={id}
          ref={cvInnerRef}
          className="bg-white text-slate-900 w-full min-h-[297mm] h-auto shadow-2xl rounded-none sm:rounded-lg border border-slate-300 relative select-none flex flex-col overflow-hidden transition-all duration-200"
          style={{
            fontFamily: fontCss,
            backgroundColor: mainBgColor,
            color: mainTextColor,
            padding: `${pagePaddingPx}px`,
            transform: scaleFactor < 1 ? `scale(${scaleFactor})` : undefined,
            transformOrigin: 'top center',
            maxHeight: scaleFactor < 1 ? `${isStrict1Page ? 1122 : 2244}px` : undefined
          }}
        >
          {watermarkContent}
          {interactiveToolbar}

          {renderTopHeader()}

          {/* PAGE BREAK VISUAL INDICATORS AT 1122PX AND 2244PX */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-red-400 z-30 pointer-events-none opacity-50 print:hidden flex items-center justify-end px-3 text-[9px] font-black uppercase text-red-600 bg-red-50/20"
            style={{ top: '1122px' }}
          >
            --- Fin de la Page 1 (A4 297mm) ---
          </div>
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-red-400 z-30 pointer-events-none opacity-50 print:hidden flex items-center justify-end px-3 text-[9px] font-black uppercase text-red-600 bg-red-50/20"
            style={{ top: '2244px' }}
          >
            --- Fin de la Page 2 (A4 594mm) ---
          </div>

          {/* CANVAS BODY: 1 OR 2 COLUMNS WITH DROPPABLE ZONES */}
          <div className="flex-1 flex flex-col w-full min-h-0">
            {!isTwoColumn ? (
              /* SINGLE COLUMN LAYOUT */
              <div className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2">
                <DroppableZone
                  id="zone-droppable-principale"
                  zoneName="principale"
                  sectionsList={mainZoneSections}
                  isSidebar={false}
                  isReorderActive={isReorderActive}
                  sectionGapPx={sectionGapPx}
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
                  fontCss={fontCss}
                  dynamicTextStyle={dynamicTextStyle}
                />
              </div>
            ) : (
              /* TWO COLUMN LAYOUT */
              <div className={`flex-1 flex flex-row w-full min-h-0 ${sidebarPosition === 'droite' ? 'flex-row-reverse' : ''}`}>
                {/* COLUMN 1: SIDEBAR / LATÉRAL */}
                <div
                  className="px-2 py-1.5 sm:px-2.5 sm:py-2 shrink-0 transition-all border-r border-slate-200/80"
                  style={{
                    width: `${leftColWidth}%`,
                    backgroundColor: sidebarBgColor,
                    color: sidebarTextColor,
                    borderColor: secondaryAccent
                  }}
                >
                  {showSidebarPhoto && (
                    <div className="mb-2 flex justify-center">
                      <div
                        className={`overflow-hidden border-2 shadow-md ${photoShapeClass}`}
                        style={{
                          width: `${photoSize}px`,
                          height: photoShape === 'galet' ? `${photoSize * 1.3}px` : `${photoSize}px`,
                          borderColor: cv.photoBordureCouleur || primaryAccent
                        }}
                      >
                        <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
                      </div>
                    </div>
                  )}
                  {headerStyle === 'sidebar-top' && (
                    <div className="mb-2 text-center space-y-0.5 pb-1 border-b border-current opacity-90">
                      <h1 className="text-xs font-black uppercase tracking-tight">{nomComplet}</h1>
                      <p className="text-[9px] font-bold uppercase opacity-80">{titrePro}</p>
                    </div>
                  )}
                  <DroppableZone
                    id="zone-droppable-gauche"
                    zoneName="gauche"
                    sectionsList={leftZoneSections}
                    isSidebar={true}
                    isReorderActive={isReorderActive}
                    sectionGapPx={sectionGapPx}
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
                    fontCss={fontCss}
                    dynamicTextStyle={dynamicTextStyle}
                  />
                </div>

                {/* COLUMN 2: MAIN / PRINCIPALE */}
                <div
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 flex-1 transition-all"
                  style={{
                    width: `${rightColWidth}%`,
                    backgroundColor: mainBgColor,
                    color: mainTextColor
                  }}
                >
                  <DroppableZone
                    id="zone-droppable-droite"
                    zoneName="droite"
                    sectionsList={rightZoneSections}
                    isSidebar={false}
                    isReorderActive={isReorderActive}
                    sectionGapPx={sectionGapPx}
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
                    fontCss={fontCss}
                    dynamicTextStyle={dynamicTextStyle}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};
