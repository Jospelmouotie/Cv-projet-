import React from 'react';
import { CV, CVTemplate, Section, ProfilContenu } from '../types';
import { SectionSlot } from './SectionSlot';
import { FONT_OPTIONS } from '../data/templates';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
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
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'z-30 ring-2 ring-blue-500 rounded-lg' : ''}>
      <SectionSlot
        {...props}
        isReorderActive={props.isReorderActive}
        dragHandleProps={props.isReorderActive ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
};

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
  // Determine layout settings
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

  // Header & Section Styles
  const headerStyle = cv.styleEnTete || templateTheme.headerStyle || 'banner';
  const sectionHeaderStyle = cv.styleEnTeteSection || templateTheme.sectionHeaderStyle || 'underline';
  const skillsDisplayMode = cv.styleCompetences || templateTheme.skillsDisplayMode || 'grid';
  const datesAlignment = cv.alignementDatesExperience || templateTheme.experienceDatesAlignment || 'left';

  // Typography
  const fontObj = FONT_OPTIONS.find(f => f.id === cv.police) || FONT_OPTIONS.find(f => f.id === template.defaultFont) || FONT_OPTIONS[0];
  const fontCss = fontObj ? fontObj.family : 'Inter, sans-serif';

  // Mode Page Cible & Dynamic Font/Spacing Sizing
  const isStrict1Page = cv.pageCibleMode === '1_page' || cv.pageCibleMode === 'compact';
  const fontSizePx = cv.taillePoliceValeur ?? (isStrict1Page ? 9 : 10);
  const lineHeightVal = cv.hauteurLigneValeur ?? (isStrict1Page ? 1.15 : 1.3);
  const dynamicTextStyle: React.CSSProperties = {
    fontSize: `${fontSizePx}pt`,
    lineHeight: lineHeightVal
  };

  const sectionGapPx = cv.espacementSectionsPx ?? (isStrict1Page ? 8 : 16);
  const bulletStyle = cv.stylePucesListes || 'disc';
  const titleFontSizePt = cv.tailleTitreSectionValeur;
  const titleCase = cv.casseTitreSection || 'uppercase';
  const titleAlign = cv.alignementTitreSection || 'left';

  // Find Profil section for Candidate Name and Photo
  const profilSection = cv.sections.find(s => s.type === 'profil');
  const profilContenu = (profilSection?.contenu || {}) as ProfilContenu;
  const nomComplet = profilContenu.nomComplet || 'PRÉNOM NOM';
  const titrePro = profilContenu.titreProfessionnel || 'POSTE OCCUPÉ/RECHERCHÉ';

  // Photo settings
  const showPhoto = cv.afficherPhoto !== false && Boolean(cv.photoUrl);
  const photoShape = cv.photoForme || templateTheme.photoFrameStyle || 'ronde';
  const photoSize = cv.photoTaille ?? (isStrict1Page ? 72 : 96);

  let photoShapeClass = 'rounded-full';
  if (photoShape === 'carree') photoShapeClass = 'rounded-none';
  if (photoShape === 'arrondie') photoShapeClass = 'rounded-2xl';
  if (photoShape === 'arche') photoShapeClass = 'rounded-t-full rounded-b-lg';
  if (photoShape === 'hexagone') photoShapeClass = 'rounded-xl border-2';

  // Sort sections into zones
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
        // Default assignment for two-column
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onSectionsReorder) return;

    const oldIndex = cv.sections.findIndex(s => s.id === active.id);
    const newIndex = cv.sections.findIndex(s => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = [...cv.sections];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      // Preserve ordre
      updated.forEach((s, idx) => { s.ordre = idx + 1; });
      onSectionsReorder(updated);
    }
  };

  // Render Section Column
  const renderSectionColumn = (
    sectionsList: Section[],
    isSidebar: boolean,
    zoneName: 'gauche' | 'droite' | 'principale'
  ) => {
    return (
      <SortableContext items={sectionsList.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col" style={{ gap: `${sectionGapPx}px` }}>
          {sectionsList.map((sec) => (
            <SortablePreviewSection
              key={sec.id}
              section={sec}
              isSidebar={isSidebar}
              accentColor={primaryAccent}
              secondaryAccentColor={secondaryAccent}
              textColor={isSidebar ? sidebarTextColor : mainTextColor}
              headingColor={isSidebar ? sidebarHeadingColor : mainHeadingColor}
              headerStyle={sectionHeaderStyle}
              skillsDisplayMode={skillsDisplayMode}
              experienceDatesAlignment={datesAlignment}
              bulletStyle={bulletStyle}
              titleFontSizePt={titleFontSizePt}
              titleCase={titleCase}
              titleAlign={titleAlign}
              fontCss={fontCss}
              dynamicTextStyle={dynamicTextStyle}
              isReorderActive={isReorderActive}
            />
          ))}
          {sectionsList.length === 0 && isReorderActive && (
            <div className="border-2 border-dashed border-blue-400 p-4 rounded-xl text-center text-xs font-bold text-blue-600 bg-blue-50/50">
              Déposez une section ici (Zone {zoneName})
            </div>
          )}
        </div>
      </SortableContext>
    );
  };

  // Header Banner Rendering
  const renderTopHeader = () => {
    if (headerStyle === 'banner' || headerStyle === 'modern-split') {
      return (
        <div
          className="w-full relative flex items-center p-6 border-b transition-all shrink-0"
          style={{ backgroundColor: primaryAccent, color: '#FFFFFF', minHeight: '110px' }}
        >
          {showPhoto && (
            <div className="shrink-0 mr-5">
              <div
                className={`overflow-hidden border-4 bg-white/20 shadow-lg ${photoShapeClass}`}
                style={{
                  width: `${photoSize}px`,
                  height: `${photoSize}px`,
                  borderColor: cv.photoBordureCouleur || '#FFFFFF',
                  borderWidth: cv.photoBordureEpaisseur ? `${cv.photoBordureEpaisseur}px` : undefined
                }}
              >
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight">
              {nomComplet}
            </h1>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-90">
              {titrePro}
            </p>
          </div>
        </div>
      );
    }

    if (headerStyle === 'arch') {
      return (
        <div className="w-full p-6 text-center bg-slate-900 text-white rounded-b-3xl shadow-md mb-4 shrink-0" style={{ backgroundColor: primaryAccent }}>
          {showPhoto && (
            <div className="mx-auto mb-3 flex justify-center">
              <div
                className={`overflow-hidden border-4 border-white shadow-lg ${photoShapeClass}`}
                style={{ width: `${photoSize}px`, height: `${photoSize}px` }}
              >
                <img src={cv.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">{nomComplet}</h1>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mt-1">{titrePro}</p>
        </div>
      );
    }

    // Default clean header
    return (
      <div className="w-full p-6 border-b flex justify-between items-center" style={{ borderColor: secondaryAccent }}>
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: mainHeadingColor }}>
            {nomComplet}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryAccent }}>
            {titrePro}
          </p>
        </div>
        {showPhoto && (
          <div
            className={`overflow-hidden border-2 border-slate-200 shadow-sm ${photoShapeClass}`}
            style={{ width: `${photoSize}px`, height: `${photoSize}px` }}
          >
            <img src={cv.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        id={id}
        className="bg-white text-slate-900 w-full min-h-[297mm] h-auto shadow-2xl rounded-none sm:rounded-lg border border-slate-300 relative select-none flex flex-col overflow-hidden"
        style={{
          fontFamily: fontCss,
          backgroundColor: mainBgColor,
          color: mainTextColor,
          padding: cv.margeGlobalePage ? `${cv.margeGlobalePage}px` : undefined
        }}
      >
        {watermarkContent}
        {interactiveToolbar}

        {renderTopHeader()}

        {/* CANVAS BODY: 1 OR 2 COLUMNS */}
        <div className="flex-1 flex flex-col w-full min-h-0">
          {!isTwoColumn ? (
            /* SINGLE COLUMN LAYOUT */
            <div className="flex-1 p-6 space-y-4">
              {renderSectionColumn(mainZoneSections, false, 'principale')}
            </div>
          ) : (
            /* TWO COLUMN LAYOUT - ALWAYS SIDE-BY-SIDE IN DOCUMENT */
            <div className={`flex-1 flex flex-row w-full min-h-0 ${sidebarPosition === 'droite' ? 'flex-row-reverse' : ''}`}>
              {/* COLUMN 1: SIDEBAR / LATÉRAL */}
              <div
                className="p-5 sm:p-6 space-y-4 shrink-0 transition-all border-r border-slate-200/80"
                style={{
                  width: `${leftColWidth}%`,
                  backgroundColor: sidebarBgColor,
                  color: sidebarTextColor,
                  borderColor: secondaryAccent
                }}
              >
                {renderSectionColumn(leftZoneSections, true, 'gauche')}
              </div>

              {/* COLUMN 2: MAIN / PRINCIPALE */}
              <div
                className="p-5 sm:p-6 space-y-4 flex-1 transition-all"
                style={{
                  width: `${rightColWidth}%`,
                  backgroundColor: mainBgColor,
                  color: mainTextColor
                }}
              >
                {renderSectionColumn(rightZoneSections, false, 'droite')}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};
