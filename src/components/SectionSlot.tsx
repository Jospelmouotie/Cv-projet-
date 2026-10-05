import React from 'react';
import {
  CV,
  Section,
  ProfilContenu,
  ExperienceItem,
  FormationItem,
  CompetenceItem,
  SubCompetenceItem,
  LangueItem,
  PersonnaliseeContenu,
  ProjetItem,
  CertificationItem,
  InteretItem,
  ReferenceItem,
  BenevolatItem,
  PublicationItem,
  DistinctionItem,
  QualiteItem
} from '../types';
import { getBackgroundStyle } from '../utils/backgroundHelpers';
import { getLocalizedSectionTitle } from '../i18n/translations';
import { translateTerm } from '../utils/cvTranslator';
import { SkillLevelRenderer } from './SkillLevelRenderer';
import { InlineTagPill } from './InlineTagPill';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Star,
  FolderTree,
  X,
  Palette,
  Type,
  GripVertical,
  Heart,
  Award,
  BookOpen,
  Sparkles,
  Link2,
  ExternalLink,
  Code,
  Server,
  ShieldCheck,
  Cpu,
  Terminal,
  Search,
  Layers,
  Wrench,
  Database,
  Scale,
  Stethoscope,
  Building2,
  Wine,
  Compass,
  Users,
  Clock,
  Newspaper,
  Feather,
  Activity,
  TrendingUp
} from 'lucide-react';

interface SectionSlotProps {
  section: Section;
  cv?: CV;
  isSidebar?: boolean;
  accentColor: string;
  secondaryAccentColor?: string;
  textColor: string;
  headingColor: string;
  headerStyle?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header' | 'badge-line' | 'icon-inline';
  skillsDisplayMode?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags' | 'circular-progress' | 'badges-multicolor' | 'tech-cards' | 'icon-card-grid' | 'cards-modern' | 'grid-3' | 'minimal-cards' | 'pill-bars' | 'striped-table' | 'executive-tags' | 'categorized-pills' | 'stepped-levels' | 'compact-chips' | 'matrix-cards' | string;
  experienceDatesAlignment?: 'left' | 'top' | 'inline';
  bulletStyle?: 'disc' | 'square' | 'arrow' | 'check' | 'star' | 'dash' | 'numbered' | 'none';
  titleFontSizePt?: number;
  titleCase?: 'uppercase' | 'capitalize' | 'normal';
  titleAlign?: 'left' | 'center' | 'right';
  timelineStyle?: 'none' | 'line-dots' | 'accent-pills' | 'left-bar';
  badgesContactStyle?: 'none' | 'outline' | 'pill' | 'solid-accent' | 'soft-tint' | 'glass' | 'rounded';
  afficherBadgesIcones?: boolean;
  fontCss?: string;
  dynamicTextStyle?: React.CSSProperties;
  dragHandleProps?: any;
  isReorderActive?: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  onUpdateSection?: (updatedSection: Section) => void;
  isSelected?: boolean;
  onSelect?: (sectionId: string) => void;
  onUpdateSectionStyle?: (sectionId: string, stylePatch: Partial<any>) => void;
}

export const SectionSlot: React.FC<SectionSlotProps> = ({
  section,
  cv,
  isSidebar = false,
  accentColor,
  secondaryAccentColor = '#F1F5F9',
  textColor,
  headingColor,
  headerStyle = 'underline',
  skillsDisplayMode = 'grid',
  experienceDatesAlignment = 'left',
  bulletStyle = 'disc',
  titleFontSizePt,
  titleCase = 'uppercase',
  titleAlign = 'left',
  timelineStyle = 'none',
  badgesContactStyle = 'none',
  afficherBadgesIcones = false,
  fontCss,
  dynamicTextStyle,
  dragHandleProps,
  isReorderActive = false,
  onToggleExpand,
  isExpanded = true,
  onUpdateSection,
  isSelected = false,
  onSelect,
  onUpdateSectionStyle
}) => {
  if (section.visible === false) return null;

  // Custom Section Overrides
  const secStyle = section.styleSection;
  const effectiveSkillsMode = secStyle?.styleCompetences || skillsDisplayMode;
  const effectiveDatesAlign = secStyle?.alignementDates || experienceDatesAlignment;

  // Helper for luminance / dark background check
  const isColorDark = (hexStr?: string): boolean => {
    if (!hexStr || hexStr === 'transparent' || hexStr === 'none') return false;
    const str = hexStr.trim().toLowerCase();
    if (str.startsWith('#')) {
      let clean = str.replace('#', '').trim();
      if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
      if (clean.length < 6) return false;
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return lum < 0.45;
    }
    if (str.startsWith('rgb')) {
      const parts = str.match(/\d+/g);
      if (parts && parts.length >= 3) {
        const r = parseInt(parts[0], 10) / 255;
        const g = parseInt(parts[1], 10) / 255;
        const b = parseInt(parts[2], 10) / 255;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return lum < 0.45;
      }
    }
    return false;
  };

  // Dynamic high-contrast heading and text colors
  const isCustomSecBg = Boolean(
    secStyle?.couleurFond &&
    secStyle.couleurFond !== 'transparent' &&
    secStyle.backgroundType !== 'transparent'
  );
  
  let isSecBgDark = false;
  if (isCustomSecBg) {
    isSecBgDark = isColorDark(secStyle?.couleurFond);
  } else if (isSidebar) {
    const sbColor = cv?.couleurFondSidebar || (cv as any)?.sidebarBackgroundColor || (cv as any)?.themeConfig?.sidebarBackgroundColor || '#F4F4F5';
    isSecBgDark = isColorDark(sbColor);
  } else {
    const mainColor = cv?.couleurFond || cv?.backgroundColor;
    if (mainColor && mainColor !== 'transparent') {
      isSecBgDark = isColorDark(mainColor);
    } else {
      isSecBgDark = textColor ? !isColorDark(textColor) : false;
    }
  }

  let rawTextColor = secStyle?.couleurTexte || textColor;
  if (!rawTextColor || (isSecBgDark && isColorDark(rawTextColor)) || (!isSecBgDark && !isColorDark(rawTextColor))) {
    rawTextColor = isSecBgDark ? '#FFFFFF' : '#1E293B';
  }
  const effectiveTextColor = rawTextColor;

  const cvHeadingColor = isSidebar ? cv?.couleurTitreSectionSidebar : cv?.couleurTitreSection;
  const preferredHeading = (cvHeadingColor && cvHeadingColor !== '#000000') ? cvHeadingColor : (headingColor || cvHeadingColor);
  let rawHeadingColor = secStyle?.couleurTitre || preferredHeading || accentColor || '#2563EB';
  if (isSecBgDark) {
    if (isColorDark(rawHeadingColor) || rawHeadingColor === '#1E293B' || rawHeadingColor === '#0F172A') {
      rawHeadingColor = '#FFFFFF';
    }
  } else {
    if (rawHeadingColor === '#FFFFFF' || rawHeadingColor === '#F1F5F9' || rawHeadingColor === '#F8FAFC' || rawHeadingColor === '#FAFAFA') {
      rawHeadingColor = (accentColor && accentColor !== '#000000') ? accentColor : '#0F172A';
    }
  }
  const effectiveHeadingColor = rawHeadingColor;

  const rawSectionHeaderStyle = secStyle?.styleEntete || headerStyle || 'underline';
  const effectiveHeaderStyle =
    rawSectionHeaderStyle === 'pill' ? 'underline' :
    rawSectionHeaderStyle === 'architect' ? 'double-line' :
    rawSectionHeaderStyle === 'dynamic-badge' ? 'badge-line' :
    rawSectionHeaderStyle;

  const effectiveAccent = secStyle?.couleurAccent || accentColor || '#0D9488';
  const badgeBg = secStyle?.couleurAccent || secondaryAccentColor || effectiveAccent || '#F5A623';
  const badgeTextColor = '#FFFFFF';
  const effectiveDivider = isSidebar ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';

  const effectiveBgColor = secStyle?.couleurFond;
  const effectiveTitleAlign = secStyle?.alignementTitre || titleAlign || cv?.alignementTitreSection || 'left';
  const effectiveTitleSize = secStyle?.tailleTitre || titleFontSizePt;
  const effectiveTitleCase = secStyle?.casseTitre || titleCase;
  const effectiveTitleFont = secStyle?.policeTitre || cv?.policeTitreSection || cv?.policeTitre;
  const effectiveTitleWeight = cv?.grasTitreSection === 'black' ? 900 : cv?.grasTitreSection === 'bold' ? 700 : cv?.grasTitreSection === 'medium' ? 500 : cv?.grasTitreSection === 'normal' ? 400 : undefined;

  // Formatting Title Text
  const formatTitleText = (rawTitle: string) => {
    if (effectiveTitleCase === 'capitalize') {
      return rawTitle.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }
    if (effectiveTitleCase === 'normal') {
      return rawTitle;
    }
    return rawTitle.toUpperCase();
  };

  const formattedTitle = formatTitleText(getLocalizedSectionTitle(section.type, section.titre, cv?.langue || 'fr'));
  const titleStyleObj: React.CSSProperties = {
    color: effectiveHeadingColor,
    fontSize: effectiveTitleSize ? `${effectiveTitleSize}pt` : '1.1em',
    textAlign: effectiveTitleAlign,
    ...(effectiveTitleFont ? { fontFamily: effectiveTitleFont } : {}),
    ...(effectiveTitleWeight ? { fontWeight: effectiveTitleWeight } : {})
  };

  const titleAlignClass = effectiveTitleAlign === 'center' ? 'text-center justify-center w-full' : effectiveTitleAlign === 'right' ? 'text-right justify-end' : 'text-left justify-start';

  const handleTitleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!onUpdateSection) return;
    const newTitle = e.currentTarget.innerText;
    if (newTitle !== section.titre) {
      onUpdateSection({ ...section, titre: newTitle });
    }
  };

  const handleProfilBlur = (field: string, value: string) => {
    if (!onUpdateSection) return;
    onUpdateSection({
      ...section,
      contenu: {
        ...(section.contenu || {}),
        [field]: value
      }
    });
  };

  const updateExpItem = (idx: number, field: string, val: string) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as ExperienceItem[])] : [];
    if (list[idx]) {
      list[idx] = { ...list[idx], [field]: val };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  const updateEduItem = (idx: number, field: string, val: string) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as FormationItem[])] : [];
    if (list[idx]) {
      list[idx] = { ...list[idx], [field]: val };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  const updateSkillItem = (idx: number, field: string, val: string) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as CompetenceItem[])] : [];
    if (list[idx]) {
      list[idx] = { ...list[idx], [field]: val };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  const updateSubSkillItem = (idx: number, subIdx: number, val: string) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as CompetenceItem[])] : [];
    if (list[idx] && list[idx].listSousCompetences && list[idx].listSousCompetences![subIdx]) {
      const subList = [...list[idx].listSousCompetences!];
      subList[subIdx] = { ...subList[subIdx], nom: val };
      list[idx] = { ...list[idx], listSousCompetences: subList };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  const addSubSkillItem = (idx: number, defaultName = 'Nouvel outil') => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as CompetenceItem[])] : [];
    if (list[idx]) {
      const currentSubs = list[idx].listSousCompetences || [];
      const newSub: SubCompetenceItem = { id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, nom: defaultName };
      list[idx] = { ...list[idx], listSousCompetences: [...currentSubs, newSub] };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  const removeSubSkillItem = (idx: number, subIdx: number) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as CompetenceItem[])] : [];
    if (list[idx] && list[idx].listSousCompetences) {
      const subList = list[idx].listSousCompetences!.filter((_, i) => i !== subIdx);
      list[idx] = { ...list[idx], listSousCompetences: subList };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  const updateLangueItem = (idx: number, field: string, val: string) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as LangueItem[])] : [];
    if (list[idx]) {
      list[idx] = { ...list[idx], [field]: val };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  // Helper to get section icon
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'profil':
      case 'coordonnees':
        return <User className="w-3 h-3" />;
      case 'experience':
        return <Briefcase className="w-3 h-3" />;
      case 'formation':
        return <GraduationCap className="w-3 h-3" />;
      case 'competences':
        return <CheckCircle className="w-3 h-3" />;
      case 'langues':
        return <Globe className="w-3 h-3" />;
      case 'certifications':
        return <Award className="w-3 h-3" />;
      case 'interets':
        return <Heart className="w-3 h-3" />;
      case 'personnalisee':
        return <Sparkles className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  // Helper for Section Titles
  const renderHeader = () => {
    const headerFontSize = effectiveTitleSize ? `${effectiveTitleSize}pt` : '1.1em';

    const renderTitleEditable = (extraClass: string = '') => (
      <span
        contentEditable={Boolean(onUpdateSection)}
        suppressContentEditableWarning
        onBlur={handleTitleBlur}
        className={`outline-none cursor-text ${extraClass}`}
      >
        {formattedTitle}
      </span>
    );

    switch (effectiveHeaderStyle) {
      case 'badge-line':
      case 'dynamic-badge':
        if (effectiveTitleAlign === 'center') {
          return (
            <div className="mb-2 flex items-center gap-2">
              <div className="h-0.5 flex-1 rounded-full opacity-80" style={{ backgroundColor: effectiveDivider }} />
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: badgeBg, color: badgeTextColor }}
                >
                  {getSectionIcon(section.type)}
                </div>
                <h3 className="font-black uppercase tracking-wider shrink-0 text-[12px] sm:text-[13px]" style={titleStyleObj}>
                  {renderTitleEditable()}
                </h3>
              </div>
              <div className="h-0.5 flex-1 rounded-full opacity-80" style={{ backgroundColor: effectiveDivider }} />
            </div>
          );
        }
        if (effectiveTitleAlign === 'right') {
          return (
            <div className="mb-2 flex items-center justify-end gap-2">
              <div className="h-0.5 flex-1 rounded-full opacity-80" style={{ backgroundColor: effectiveDivider }} />
              <h3 className="font-black uppercase tracking-wider shrink-0 text-[12px] sm:text-[13px]" style={titleStyleObj}>
                {renderTitleEditable()}
              </h3>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: badgeBg, color: badgeTextColor }}
              >
                {getSectionIcon(section.type)}
              </div>
            </div>
          );
        }
        return (
          <div className="mb-2 flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: badgeBg, color: badgeTextColor }}
            >
              {getSectionIcon(section.type)}
            </div>
            <h3 className="font-black uppercase tracking-wider shrink-0 text-[12px] sm:text-[13px]" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
            <div className="h-0.5 flex-1 rounded-full opacity-80" style={{ backgroundColor: effectiveDivider }} />
          </div>
        );
      case 'pill':
        const pillBgColor = isSidebar
          ? 'transparent'
          : (secondaryAccentColor && secondaryAccentColor !== '#FFFFFF' ? secondaryAccentColor : (effectiveAccent || '#D97706'));
        const pillBorderColor = secondaryAccentColor && secondaryAccentColor !== '#FFFFFF' ? secondaryAccentColor : (effectiveAccent || '#D97706');
        const pillTextColor = isSidebar
          ? '#FFFFFF'
          : (secStyle?.couleurTexteTitre || '#FFFFFF');

        return (
          <div className={`mb-2.5 flex ${titleAlignClass}`}>
            <span
              className="px-4 py-1.5 font-black uppercase tracking-widest rounded-full inline-block shadow-sm"
              style={{
                backgroundColor: pillBgColor,
                border: isSidebar ? `2px solid ${pillBorderColor}` : 'none',
                color: pillTextColor,
                fontSize: headerFontSize
              }}
            >
              {renderTitleEditable()}
            </span>
          </div>
        );
      case 'banner':
        return (
          <div
            className={`mb-2.5 px-3 py-1.5 rounded-md font-black tracking-wider shadow-2xs flex ${titleAlignClass}`}
            style={{ backgroundColor: badgeBg, color: badgeTextColor, fontSize: headerFontSize }}
          >
            <span>{renderTitleEditable()}</span>
          </div>
        );
      case 'left-border':
        return (
          <div className={`mb-1 flex items-center gap-1.5 ${titleAlignClass}`}>
            {effectiveTitleAlign !== 'right' && (
              <div className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: effectiveAccent }} />
            )}
            <h3 className="font-extrabold tracking-wide" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
            {effectiveTitleAlign === 'right' && (
              <div className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: effectiveAccent }} />
            )}
          </div>
        );
      case 'boxed':
        return (
          <div
            className={`mb-1 p-1 rounded border font-black tracking-wider flex ${titleAlignClass}`}
            style={{ borderColor: effectiveAccent, backgroundColor: 'rgba(0,0,0,0.04)', ...titleStyleObj }}
          >
            <span>{renderTitleEditable()}</span>
          </div>
        );
      case 'stars':
        return (
          <div className={`mb-1 flex items-center ${effectiveTitleAlign === 'center' ? 'justify-center gap-2' : effectiveTitleAlign === 'right' ? 'justify-end gap-2' : 'justify-between'} border-b pb-0.5`} style={{ borderColor: effectiveDivider }}>
            {effectiveTitleAlign === 'right' && (
              <div className="flex items-center space-x-0.5" style={{ color: effectiveAccent }}>
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
            <h3 className="font-black tracking-wider" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
            {effectiveTitleAlign !== 'right' && (
              <div className="flex items-center space-x-0.5" style={{ color: effectiveAccent }}>
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>
        );
      case 'double-line':
        return (
          <div className={`mb-1 border-b border-t py-0.5 flex ${titleAlignClass}`} style={{ borderColor: effectiveDivider }}>
            <h3 className="font-black tracking-widest" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
          </div>
        );
      case 'arch-block':
        return (
          <div
            className={`mb-1 px-2.5 py-1 rounded-t-xl rounded-b-xs font-black tracking-wider flex ${titleAlignClass}`}
            style={{ backgroundColor: badgeBg, color: badgeTextColor, fontSize: headerFontSize }}
          >
            <span>{renderTitleEditable()}</span>
          </div>
        );
      case 'badge-header':
        return (
          <div className={`mb-1 flex ${titleAlignClass}`}>
            <span
              className={`px-2.5 py-0.5 font-black rounded inline-block ${effectiveTitleAlign === 'right' ? 'border-r-2' : 'border-l-2'}`}
              style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderColor: effectiveAccent, color: effectiveHeadingColor, fontSize: headerFontSize }}
            >
              {renderTitleEditable()}
            </span>
          </div>
        );
      case 'minimal':
        return (
          <div className={`mb-1 flex ${titleAlignClass}`}>
            <h3 className="font-extrabold tracking-widest" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
          </div>
        );
      case 'icon-inline':
        return (
          <div className={`mb-2 flex items-center gap-2 ${titleAlignClass} pb-0.5 border-b`} style={{ borderColor: effectiveDivider }}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: badgeBg, color: badgeTextColor }}
            >
              {getSectionIcon(section.type)}
            </div>
            <h3 className="font-black tracking-wider uppercase text-[11.5px] sm:text-[12.5px]" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
            {effectiveTitleAlign !== 'center' && (
              <div className="h-0.5 flex-1 rounded-full opacity-60 ml-1" style={{ backgroundColor: effectiveDivider }} />
            )}
          </div>
        );
      case 'tech-terminal':
        return (
          <div className="mb-2 font-mono flex items-center gap-1.5 border-b border-emerald-500/40 pb-0.5 text-emerald-400">
            <span className="text-emerald-500 font-bold">//</span>
            <h3 className="font-extrabold uppercase tracking-wide text-[11px] sm:text-[12px]" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
            <span className="ml-auto text-[9px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold text-emerald-400">
              [SEC]
            </span>
          </div>
        );
      case 'luxury-gold':
        return (
          <div className={`mb-2 text-center border-b border-amber-400/50 pb-1 ${titleAlignClass}`}>
            <h3 className="font-serif font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 text-[12px] sm:text-[13px] flex items-center justify-center gap-2" style={titleStyleObj}>
              <span className="text-[10px] text-amber-500">◆</span>
              {renderTitleEditable()}
              <span className="text-[10px] text-amber-500">◆</span>
            </h3>
          </div>
        );
      case 'underline':
      default:
        return (
          <div className={`mb-1 border-b pb-0.5 flex ${titleAlignClass}`} style={{ borderColor: effectiveAccent }}>
            <h3 className="font-extrabold tracking-wider" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
          </div>
        );
    }
  };

  // Helper Bullet Prefix
  const getBulletPrefix = (index: number) => {
    switch (bulletStyle) {
      case 'square': return '▪ ';
      case 'arrow': return '▸ ';
      case 'check': return '✓ ';
      case 'star': return '★ ';
      case 'dash': return '— ';
      case 'numbered': return `${index + 1}. `;
      case 'none': return '';
      case 'disc':
      default: return '• ';
    }
  };

  // Helper for multi-line description & bullet lists with Bold/Italic markdown support
  const renderFormattedDescription = (desc: string | undefined, onUpdate?: (val: string) => void) => {
    if (!desc && !onUpdate) return null;
    const textVal = desc || '';

    // If inline editing mode is active, show text for direct edits
    if (onUpdate) {
      // Helper function to render text with markdown bold & italic visually while keeping it clean
      const renderParsedMarkdownText = (raw: string) => {
        const lines = raw.split('\n');
        return lines.map((line, lIdx) => {
          // Parse **bold** and *italic*
          const parts = [];
          let remaining = line;
          let pIdx = 0;

          // Simple regex to parse **bold**, *italic*, and [Pill Tag]
          const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\])/g;
          let match;
          let lastIndex = 0;

          while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
              parts.push(<span key={`${lIdx}-${pIdx++}`}>{line.substring(lastIndex, match.index)}</span>);
            }
            if (match[2]) {
              // Bold **text**
              parts.push(<strong key={`${lIdx}-${pIdx++}`} className="font-extrabold">{match[2]}</strong>);
            } else if (match[3]) {
              // Italic *text*
              parts.push(<em key={`${lIdx}-${pIdx++}`} className="italic font-serif">{match[3]}</em>);
            } else if (match[4]) {
              // Tag Pill [Tag Name]
              parts.push(
                <InlineTagPill
                  key={`${lIdx}-${pIdx++}`}
                  label={match[4]}
                  accentColor={accentColor}
                  secondaryAccentColor={secondaryAccentColor}
                  className="mx-1"
                />
              );
            }
            lastIndex = regex.lastIndex;
          }

          if (lastIndex < line.length) {
            parts.push(<span key={`${lIdx}-${pIdx++}`}>{line.substring(lastIndex)}</span>);
          }

          return (
            <div key={lIdx} className="min-h-[1.2em]">
              {parts.length > 0 ? parts : <span>{line}</span>}
            </div>
          );
        });
      };

      return (
        <div
          contentEditable={Boolean(onUpdate)}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.(e.currentTarget.innerText)}
          className="opacity-90 mt-0.5 text-[0.95em] outline-none cursor-text whitespace-pre-line"
        >
          {renderParsedMarkdownText(textVal)}
        </div>
      );
    }

    return (
      <div className="opacity-90 mt-0.5 text-[0.95em] whitespace-pre-line">
        {textVal}
      </div>
    );
  };

  const sectionBgStyle = getBackgroundStyle({
    backgroundType: secStyle?.backgroundType,
    colorSolid: secStyle?.couleurFond,
    opacity: secStyle?.backgroundOpacity,
    colorStart: secStyle?.backgroundColorStart,
    colorEnd: secStyle?.backgroundColorEnd,
    patternName: secStyle?.backgroundPattern,
    imageUrl: secStyle?.backgroundImage,
    fallbackColor: 'transparent'
  });

  return (
    <div className="section-slot-container w-full">
      {section.pageBreakBefore && (
        <div className="w-full my-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase tracking-wider print:hidden select-none">
          <div className="h-0.5 bg-blue-500/40 flex-1 border-t border-dashed border-blue-500" />
          <span>Saut de Page Impératif</span>
          <div className="h-0.5 bg-blue-500/40 flex-1 border-t border-dashed border-blue-500" />
        </div>
      )}

      <div
        onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect(section.id);
          }
        }}
        className={`relative group transition-all rounded-md p-1 cursor-pointer transition-all ${
          isSelected
            ? 'ring-2 ring-blue-500 border-2 border-blue-500 shadow-lg bg-blue-50/10'
            : 'border border-transparent hover:border-blue-300 hover:bg-slate-50/30'
        } ${
          (secStyle?.ombre || cv?.ombreCarte || cv?.ombre) === 'sm' ? 'shadow-xs' : (secStyle?.ombre || cv?.ombreCarte || cv?.ombre) === 'md' ? 'shadow-md' : (secStyle?.ombre || cv?.ombreCarte || cv?.ombre) === 'lg' ? 'shadow-xl' : ''
        }`}
        style={{
          ...sectionBgStyle,
          borderWidth: secStyle?.epaisseurBordure !== undefined && secStyle?.epaisseurBordure > 0 ? `${secStyle.epaisseurBordure}px` : undefined,
          borderStyle: secStyle?.epaisseurBordure !== undefined && secStyle?.epaisseurBordure > 0 ? 'solid' : undefined,
          borderColor: isSelected ? '#2563EB' : (secStyle?.epaisseurBordure ? (secStyle?.couleurBordure || accentColor) : undefined),
          borderRadius: secStyle?.rayonBordure !== undefined ? `${secStyle.rayonBordure}px` : undefined,
          fontFamily: fontCss,
          color: effectiveTextColor,
          fontSize: secStyle?.tailleTextePt ? `${secStyle.tailleTextePt}pt` : undefined,
          pageBreakBefore: section.pageBreakBefore ? 'always' : 'auto',
          breakBefore: section.pageBreakBefore ? 'page' : 'auto',
          ...dynamicTextStyle
        }}
      >
      {/* Interactive Floating Section Toolbar when Selected */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-11 left-0 z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl p-1.5 flex items-center gap-2 border border-slate-700 text-xs animate-in fade-in zoom-in duration-150 print:hidden whitespace-nowrap overflow-x-auto max-w-full"
        >
          <div className="flex items-center gap-1 font-black px-1 text-blue-300 text-[11px]">
            <FolderTree className="w-3.5 h-3.5" />
            <span className="max-w-[100px] truncate">{section.titre}</span>
          </div>

          <div className="h-4 w-px bg-slate-700 shrink-0" />

          {/* Couleur du Texte de la Section */}
          <label className="flex items-center gap-1 cursor-pointer hover:text-blue-300 text-[10px] font-bold shrink-0" title="Définir la couleur du texte pour cette section">
            <span>Texte:</span>
            <input
              type="color"
              value={effectiveTextColor || '#1E293B'}
              onChange={(e) => onUpdateSectionStyle?.(section.id, { couleurTexte: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
            />
          </label>

          {/* Couleur du Titre de la Section */}
          <label className="flex items-center gap-1 cursor-pointer hover:text-blue-300 text-[10px] font-bold shrink-0" title="Définir la couleur du titre pour cette section">
            <span>Titre:</span>
            <input
              type="color"
              value={effectiveHeadingColor || '#2563EB'}
              onChange={(e) => onUpdateSectionStyle?.(section.id, { couleurTitre: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
            />
          </label>

          {/* Background / Couleur de Fond de la Section */}
          <label className="flex items-center gap-1 cursor-pointer hover:text-blue-300 text-[10px] font-bold shrink-0" title="Définir le background/arrière-plan de cette section">
            <span>Fond:</span>
            <input
              type="color"
              value={effectiveBgColor || '#FFFFFF'}
              onChange={(e) => onUpdateSectionStyle?.(section.id, { couleurFond: e.target.value, backgroundType: 'solid' })}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
            />
          </label>

          {/* Quick Clear Background */}
          {effectiveBgColor && (
            <button
              onClick={() => onUpdateSectionStyle?.(section.id, { couleurFond: undefined, backgroundType: 'transparent' })}
              className="text-[9px] text-slate-400 hover:text-red-300 underline font-semibold shrink-0"
              title="Effacer le fond"
            >
              Effacer
            </button>
          )}

          <div className="h-4 w-px bg-slate-700 shrink-0" />

          {/* Taille du Texte (pt) */}
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
            <span>Taille:</span>
            <select
              value={secStyle?.tailleTextePt || 10}
              onChange={(e) => onUpdateSectionStyle?.(section.id, { tailleTextePt: Number(e.target.value) })}
              className="bg-slate-800 text-white rounded text-[10px] font-bold px-1 py-0.5 outline-none border border-slate-700"
            >
              <option value={8}>8 pt</option>
              <option value={9}>9 pt</option>
              <option value={10}>10 pt</option>
              <option value={11}>11 pt</option>
              <option value={12}>12 pt</option>
              <option value={14}>14 pt</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-700 shrink-0" />

          {/* Position Colonne */}
          <button
            onClick={() => onUpdateSection?.({ ...section, colonne: section.colonne === 'gauche' ? 'principale' : 'gauche' })}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded font-bold text-[10px] cursor-pointer shrink-0"
            title="Déplacer vers l'autre colonne"
          >
            {section.colonne === 'gauche' ? 'Gauche' : 'Principale'}
          </button>

          {/* Close Floating Bar */}
          <button
            onClick={() => onSelect?.('')}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer shrink-0"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* Reorder Mode Touch Handle Bar */}
      {isReorderActive && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="print:hidden mb-2 p-2 bg-blue-600 text-white rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-between font-bold shadow-md select-none touch-none hover:bg-blue-700 transition-colors"
          style={{ minHeight: '44px' }}
        >
          <span className="flex items-center gap-1.5">
            <GripVertical className="w-4 h-4" />
            <span>Déplacer: {section.titre}</span>
          </span>
          <span className="text-[0.8em] bg-white/20 px-2 py-0.5 rounded uppercase">Zone {section.colonne || 'principale'}</span>
        </div>
      )}

      {renderHeader()}

      {/* SECTION CONTENT TYPES */}
      <div className="space-y-1">
        {/* PROFIL / CONTACT */}
        {section.type === 'profil' && (
          <div
            className="space-y-2 flex flex-col justify-center py-2 my-1"
            style={{ minHeight: (cv?.hauteurEnTetePx || cv?.hauteurEnTete) ? `${cv.hauteurEnTetePx || cv.hauteurEnTete}px` : undefined }}
          >
            {section.contenu?.resume !== undefined && !cv?.afficherResumeSeulFullWidth && !cv?.resumeFullWidth && (
              <p
                contentEditable={Boolean(onUpdateSection)}
                suppressContentEditableWarning
                onBlur={(e) => handleProfilBlur('resume', e.currentTarget.innerText)}
                className="opacity-90 whitespace-pre-line mb-1 outline-none cursor-text leading-snug"
              >
                {section.contenu.resume}
              </p>
            )}
            {/* Contact Items Badge Styling Helper */}
            {(() => {
              const bStyle = cv?.styleBadgesCoordonnees || badgesContactStyle || 'none';
              const bBg = cv?.couleurFondBadgeContact || cv?.couleurFondBadgeCoordonnees || (bStyle === 'solid-accent' ? accentColor : bStyle === 'soft-tint' ? `${accentColor}20` : bStyle === 'glass' ? 'rgba(255,255,255,0.2)' : 'transparent');
              const bText = cv?.couleurTexteBadgeContact || cv?.couleurTexteBadgeCoordonnees || (bStyle === 'solid-accent' ? '#FFFFFF' : 'inherit');
              const bBorderCol = cv?.couleurBordureBadgeCoordonnees || accentColor;
              const bBorderW = cv?.tailleBordureBadgeCoordonnees ?? (bStyle === 'outline' || bStyle === 'glass' ? 1 : 0);
              const bRadius = cv?.rayonBordureBadgeCoordonnees ?? (bStyle === 'pill' ? 9999 : bStyle === 'rounded' || bStyle === 'glass' ? 8 : 4);
              const bOpacity = cv?.opaciteBadgeCoordonnees ?? 1;

              const getBadgeItemStyle = (): React.CSSProperties => {
                if (bStyle === 'none') {
                  return { display: 'flex', alignItems: 'center', gap: '6px' };
                }
                return {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: bBg,
                  color: bText,
                  borderColor: bBorderCol,
                  borderWidth: `${bBorderW}px`,
                  borderStyle: bBorderW > 0 ? 'solid' : 'none',
                  borderRadius: `${bRadius}px`,
                  opacity: bOpacity,
                  padding: '3px 8px',
                  boxShadow: bStyle === 'glass' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  backdropFilter: bStyle === 'glass' ? 'blur(4px)' : 'none'
                };
              };

              const badgeItemStyle = getBadgeItemStyle();

              return (
                <div className={`grid grid-cols-1 gap-1.5 ${bStyle !== 'none' ? 'flex flex-wrap gap-1.5' : ''}`}>
                  {section.contenu?.email !== undefined && (
                    <div style={badgeItemStyle}>
                      <Mail className="w-3 h-3 shrink-0 opacity-80" style={{ color: bStyle === 'solid-accent' ? '#FFFFFF' : (isSidebar || effectiveTextColor === '#FFFFFF') ? 'currentColor' : accentColor }} />
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProfilBlur('email', e.currentTarget.innerText)}
                        className="break-all outline-none cursor-text text-[11px]"
                      >
                        {section.contenu.email}
                      </span>
                    </div>
                  )}
                  {section.contenu?.telephone !== undefined && (
                    <div style={badgeItemStyle}>
                      <Phone className="w-3 h-3 shrink-0 opacity-80" style={{ color: bStyle === 'solid-accent' ? '#FFFFFF' : (isSidebar || effectiveTextColor === '#FFFFFF') ? 'currentColor' : accentColor }} />
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProfilBlur('telephone', e.currentTarget.innerText)}
                        className="outline-none cursor-text text-[11px]"
                      >
                        {section.contenu.telephone}
                      </span>
                    </div>
                  )}
                  {section.contenu?.adresse !== undefined && (
                    <div style={badgeItemStyle}>
                      <MapPin className="w-3 h-3 shrink-0 opacity-80" style={{ color: bStyle === 'solid-accent' ? '#FFFFFF' : (isSidebar || effectiveTextColor === '#FFFFFF') ? 'currentColor' : accentColor }} />
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProfilBlur('adresse', e.currentTarget.innerText)}
                        className="outline-none cursor-text text-[11px]"
                      >
                        {section.contenu.adresse}
                      </span>
                    </div>
                  )}
                  {section.contenu?.siteWeb !== undefined && (
                    <div style={badgeItemStyle}>
                      <Globe className="w-3 h-3 shrink-0 opacity-80" style={{ color: bStyle === 'solid-accent' ? '#FFFFFF' : (isSidebar || effectiveTextColor === '#FFFFFF') ? 'currentColor' : accentColor }} />
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProfilBlur('siteWeb', e.currentTarget.innerText)}
                        className="break-all outline-none cursor-text text-[11px]"
                      >
                        {section.contenu.siteWeb}
                      </span>
                    </div>
                  )}
                  {section.contenu?.linkedin !== undefined && (
                    <div style={badgeItemStyle}>
                      <Globe className="w-3 h-3 shrink-0 opacity-80" style={{ color: bStyle === 'solid-accent' ? '#FFFFFF' : (isSidebar || effectiveTextColor === '#FFFFFF') ? 'currentColor' : accentColor }} />
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProfilBlur('linkedin', e.currentTarget.innerText)}
                        className="break-all outline-none cursor-text text-[11px]"
                      >
                        {section.contenu.linkedin}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* EXPÉRIENCES */}
        {section.type === 'experience' && (
          <div
            className={`space-y-2 ${
              timelineStyle === 'line-dots'
                ? 'border-l-2 pl-3.5 ml-1.5 relative'
                : timelineStyle === 'left-bar'
                ? 'border-l-[2.5px] pl-3 ml-1 relative'
                : ''
            }`}
            style={
              timelineStyle === 'line-dots'
                ? { borderColor: accentColor + '66' }
                : timelineStyle === 'left-bar'
                ? { borderColor: accentColor }
                : {}
            }
          >
            {(section.contenu as ExperienceItem[])?.map((exp, expIdx) => {
              const presentLabel = cv?.langue === 'en' ? 'Present' : cv?.langue === 'ar' ? 'حتى الآن' : 'Présent';
              const datesText = `${exp.dateDebut || ''} ${exp.dateFin ? `- ${exp.dateFin}` : exp.actuel ? `- ${presentLabel}` : ''}`.trim();
              const expLayout = cv?.styleExperienceLayout || 'classic';
              const posteColor = cv?.couleurPosteExperience;
              const isCardExp = expLayout === 'cards';
              const isBoxedExp = expLayout === 'boxed';

              const itemContainerClass = isCardExp
                ? 'p-2 rounded-xl my-1 relative'
                : isBoxedExp
                ? 'p-2 rounded-lg border border-slate-300/60 dark:border-slate-700/60 my-1 relative'
                : 'space-y-1 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0 relative';

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={exp.id || `exp-${expIdx}`} className={`grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 last:border-0 pb-2 last:pb-0 relative ${isCardExp ? 'p-2 mb-2 border-b-0' : isBoxedExp ? 'p-2 rounded-lg border border-slate-300/60 dark:border-slate-700/60 mb-2 border-b-0' : ''}`}>
                    {timelineStyle === 'line-dots' && (
                      <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs" style={{ backgroundColor: accentColor }} />
                    )}
                    {timelineStyle === 'left-bar' && (
                      <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white shadow-2xs" style={{ backgroundColor: accentColor }} />
                    )}
                    <div className="font-bold opacity-75 sm:col-span-1" style={{ color: accentColor }}>
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExpItem(expIdx, 'dateDebut', e.currentTarget.innerText)}
                        className="outline-none cursor-text"
                      >
                        {datesText}
                      </span>
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <div
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExpItem(expIdx, 'poste', e.currentTarget.innerText)}
                        className="font-extrabold uppercase tracking-tight outline-none cursor-text"
                        style={posteColor ? { color: posteColor } : undefined}
                      >
                        {exp.poste}
                      </div>
                      <div className="font-semibold opacity-90">
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExpItem(expIdx, 'entreprise', e.currentTarget.innerText)}
                          className="outline-none cursor-text"
                        >
                          {exp.entreprise}
                        </span>
                        {exp.ville && (
                          <span> | <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateExpItem(expIdx, 'ville', e.currentTarget.innerText)}
                            className="outline-none cursor-text"
                          >{exp.ville}</span></span>
                        )}
                      </div>
                      {renderFormattedDescription(exp.description, (val) => updateExpItem(expIdx, 'description', val))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={exp.id || `exp-${expIdx}`} className={itemContainerClass}>
                  {timelineStyle === 'line-dots' && (
                    <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs" style={{ backgroundColor: accentColor }} />
                  )}
                  {timelineStyle === 'left-bar' && (
                    <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white shadow-2xs" style={{ backgroundColor: accentColor }} />
                  )}
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExpItem(expIdx, 'poste', e.currentTarget.innerText)}
                      className="font-bold uppercase tracking-tight outline-none cursor-text"
                      style={posteColor ? { color: posteColor } : undefined}
                    >
                      {exp.poste}
                    </span>
                    {datesText && (
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExpItem(expIdx, 'dateDebut', e.currentTarget.innerText)}
                        className="text-[0.85em] font-bold px-1.5 py-0.5 rounded outline-none cursor-text"
                        style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}
                      >
                        {datesText}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold opacity-90">
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExpItem(expIdx, 'entreprise', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {exp.entreprise}
                    </span>
                    {exp.ville && (
                      <span> | <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExpItem(expIdx, 'ville', e.currentTarget.innerText)}
                        className="outline-none cursor-text"
                      >{exp.ville}</span></span>
                    )}
                  </div>
                  {renderFormattedDescription(exp.description, (val) => updateExpItem(expIdx, 'description', val))}
                </div>
              );
            })}
          </div>
        )}

        {/* FORMATION */}
        {section.type === 'formation' && (
          <div
            className={`space-y-2 ${
              timelineStyle === 'line-dots'
                ? 'border-l-2 pl-3.5 ml-1.5 relative'
                : timelineStyle === 'left-bar'
                ? 'border-l-[2.5px] pl-3 ml-1 relative'
                : ''
            }`}
            style={
              timelineStyle === 'line-dots'
                ? { borderColor: accentColor + '66' }
                : timelineStyle === 'left-bar'
                ? { borderColor: accentColor }
                : {}
            }
          >
            {(section.contenu as FormationItem[])?.map((edu, eduIdx) => {
              const datesText = `${edu.dateDebut || ''} ${edu.dateFin ? `- ${edu.dateFin}` : ''}`.trim();
              const eduLayout = cv?.styleFormationLayout || 'classic';
              const diplomeColor = cv?.couleurDiplomeFormation;
              const isCardEdu = eduLayout === 'cards';
              const isBoxedEdu = eduLayout === 'boxed';

              const eduContainerClass = isCardEdu
                ? 'p-2 rounded-xl my-1 relative'
                : isBoxedEdu
                ? 'p-2 rounded-lg border border-slate-300/60 dark:border-slate-700/60 my-1 relative'
                : 'space-y-1 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0 relative';

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={edu.id || `edu-${eduIdx}`} className={`grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 last:border-0 pb-1.5 last:pb-0 relative ${isCardEdu ? 'p-2 mb-2 border-b-0' : isBoxedEdu ? 'p-2 rounded-lg border border-slate-300/60 dark:border-slate-700/60 mb-2 border-b-0' : ''}`}>
                    {timelineStyle === 'line-dots' && (
                      <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs" style={{ backgroundColor: accentColor }} />
                    )}
                    {timelineStyle === 'left-bar' && (
                      <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white shadow-2xs" style={{ backgroundColor: accentColor }} />
                    )}
                    <div className="font-bold opacity-75 sm:col-span-1" style={{ color: accentColor }}>
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateEduItem(eduIdx, 'dateDebut', e.currentTarget.innerText)}
                        className="outline-none cursor-text"
                      >
                        {datesText}
                      </span>
                    </div>
                    <div className="sm:col-span-3 space-y-0.5">
                      <div
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateEduItem(eduIdx, 'diplome', e.currentTarget.innerText)}
                        className="font-extrabold uppercase tracking-tight outline-none cursor-text"
                        style={diplomeColor ? { color: diplomeColor } : undefined}
                      >
                        {edu.diplome}
                      </div>
                      <div className="font-semibold opacity-90">
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateEduItem(eduIdx, 'etablissement', e.currentTarget.innerText)}
                          className="outline-none cursor-text"
                        >
                          {edu.etablissement}
                        </span>
                        {edu.ville && (
                          <span> | <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateEduItem(eduIdx, 'ville', e.currentTarget.innerText)}
                            className="outline-none cursor-text"
                          >{edu.ville}</span></span>
                        )}
                      </div>
                      {renderFormattedDescription(edu.description, (val) => updateEduItem(eduIdx, 'description', val))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={edu.id || `edu-${eduIdx}`} className={eduContainerClass}>
                  {timelineStyle === 'line-dots' && (
                    <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs" style={{ backgroundColor: accentColor }} />
                  )}
                  {timelineStyle === 'left-bar' && (
                    <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white shadow-2xs" style={{ backgroundColor: accentColor }} />
                  )}
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateEduItem(eduIdx, 'diplome', e.currentTarget.innerText)}
                      className="font-bold uppercase tracking-tight outline-none cursor-text"
                      style={diplomeColor ? { color: diplomeColor } : undefined}
                    >
                      {edu.diplome}
                    </span>
                    {datesText && (
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateEduItem(eduIdx, 'dateDebut', e.currentTarget.innerText)}
                        className="text-[0.85em] font-bold px-1.5 py-0.5 rounded outline-none cursor-text"
                        style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}
                      >
                        {datesText}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold opacity-90">
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateEduItem(eduIdx, 'etablissement', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {edu.etablissement}
                    </span>
                    {edu.ville && (
                      <span> | <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateEduItem(eduIdx, 'ville', e.currentTarget.innerText)}
                        className="outline-none cursor-text"
                      >{edu.ville}</span></span>
                    )}
                  </div>
                  {renderFormattedDescription(edu.description, (val) => updateEduItem(eduIdx, 'description', val))}
                </div>
              );
            })}
          </div>
        )}

        {/* COMPÉTENCES */}
        {section.type === 'competences' && (() => {
          const rawItems = (Array.isArray(section.contenu) ? section.contenu : []) as CompetenceItem[];

          const formatSubWithNote = (sub: SubCompetenceItem) => {
            if (sub.note !== undefined && sub.note !== null) {
              return `${sub.nom} (${sub.note}/5)`;
            }
            return sub.nom;
          };

          const renderSubTools = (subItems?: SubCompetenceItem[]) => {
            if (!subItems || subItems.length === 0) return null;

            const styleMode = cv?.styleOutilsCompetences || 'badges';
            const levelDisplay = cv?.afficherNiveauOutilsCompetences || 'jamais';
            const levelStyle = cv?.styleNiveauOutilsCompetences || 'etoiles';
            const customBg = cv?.couleurFondOutils || (styleMode === 'badges' ? `${accentColor}18` : 'transparent');
            const customText = cv?.couleurOutils || effectiveTextColor;
            const customBorder = cv?.couleurBordureOutils || accentColor;

            return (
              <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-0.5">
                {subItems.map((sub, sIdx) => {
                  const hasRating = sub.note !== undefined && sub.note !== null;
                  // Tools rating/level is strictly optional - only shown if explicitly configured
                  const showRating = Boolean(cv?.afficherNiveauOutilsCompetences && cv.afficherNiveauOutilsCompetences !== 'jamais' && cv.afficherNiveauOutilsCompetences !== 'none' && hasRating);

                  const renderRatingBadge = () => {
                    if (!showRating) return null;
                    if (levelStyle === 'etoiles') {
                      return <span className="ml-1 text-[9px] font-bold text-amber-500">{'★'.repeat(sub.note || 0)}</span>;
                    }
                    if (levelStyle === 'pastilles') {
                      return <span className="ml-1 text-[9px] opacity-75 font-mono">{'●'.repeat(sub.note || 0)}</span>;
                    }
                    if (levelStyle === 'pourcentage') {
                      return <span className="ml-1 text-[9px] font-bold opacity-85">({((sub.note || 0) * 20)}%)</span>;
                    }
                    if (levelStyle === 'barre') {
                      return (
                        <span className="inline-block w-7 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full ml-1 overflow-hidden align-middle">
                          <span className="block h-full bg-current rounded-full" style={{ width: `${((sub.note || 0) / 5) * 100}%` }} />
                        </span>
                      );
                    }
                    if (levelStyle === 'badge-text') {
                      const textLabel = (sub.note || 0) <= 2 ? 'Notions' : (sub.note || 0) <= 3 ? 'Intermédiaire' : (sub.note || 0) <= 4 ? 'Avancé' : 'Expert';
                      return <span className="ml-1 text-[8.5px] font-bold uppercase tracking-wider opacity-90 px-1 py-0.2 rounded bg-black/5 dark:bg-white/10">{textLabel}</span>;
                    }
                    return <span className="ml-1 text-[9px] font-mono opacity-80">({sub.note}/5)</span>;
                  };

                  if (styleMode === 'tags') {
                    return (
                      <span key={sub.id || `sub-${sIdx}`} className="text-[10px] font-semibold opacity-90 mr-1" style={{ color: customText }}>
                        #{sub.nom}{renderRatingBadge()}
                      </span>
                    );
                  }

                  if (styleMode === 'dots') {
                    return (
                      <span key={sub.id || `sub-${sIdx}`} className="inline-flex items-center gap-1 text-[10px] font-medium opacity-90" style={{ color: customText }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: customBorder }} />
                        <span>{sub.nom}</span>{renderRatingBadge()}
                      </span>
                    );
                  }

                  if (styleMode === 'outline') {
                    return (
                      <span
                        key={sub.id || `sub-${sIdx}`}
                        className="inline-flex items-center text-[9.5px] px-2 py-0.5 rounded-md font-semibold border"
                        style={{
                          borderColor: customBorder,
                          color: customText,
                          backgroundColor: customBg
                        }}
                      >
                        <span>{sub.nom}</span>{renderRatingBadge()}
                      </span>
                    );
                  }

                  if (styleMode === 'solid') {
                    return (
                      <span
                        key={sub.id || `sub-${sIdx}`}
                        className="inline-flex items-center text-[9.5px] px-2 py-0.5 rounded-full font-bold shadow-2xs text-white"
                        style={{
                          backgroundColor: customBorder || accentColor,
                        }}
                      >
                        <span>{sub.nom}</span>{renderRatingBadge()}
                      </span>
                    );
                  }

                  if (styleMode === 'text') {
                    return (
                      <span key={sub.id || `sub-${sIdx}`} className="text-[10px] font-medium opacity-85" style={{ color: customText }}>
                        {sub.nom}{renderRatingBadge()}{sIdx < subItems.length - 1 ? ' •' : ''}
                      </span>
                    );
                  }

                  // Default 'badges' / pills
                  return (
                    <span
                      key={sub.id || `sub-${sIdx}`}
                      className="inline-flex items-center text-[9.5px] px-2 py-0.5 rounded-full font-medium shadow-2xs"
                      style={{
                        backgroundColor: customBg,
                        color: customText,
                        border: `1px solid ${customBorder}33`
                      }}
                    >
                      <span>{sub.nom}</span>{renderRatingBadge()}
                    </span>
                  );
                })}
              </div>
            );
          };

          const showSkillLevels = Boolean(cv?.afficherNiveauCompetence || cv?.afficherNiveaux || cv?.afficherNiveau);

          const renderRatingIndicator = (sk: CompetenceItem, compact: boolean = false) => {
            // Rating / level is completely optional - by default, no levels/gauges are shown
            if (!showSkillLevels) return null;

            const levelVal = Math.min(10, Math.max(0, sk.niveau ?? 8));
            const percent = Math.min(100, Math.max(10, Math.round((levelVal / 10) * 100)));
            const score5 = Math.min(5, Math.max(1, Math.round(levelVal / 2)));
            const ratingMode = cv?.styleNiveauCompetence || (
              effectiveSkillsMode === 'stars' ? 'stars' :
              effectiveSkillsMode === 'dots' ? 'dots' :
              effectiveSkillsMode === 'progress' ? 'progress' : 'progress'
            );
            const activeGaugeColor = cv?.couleurJaugeNiveau || accentColor;

            if (sk.niveau === undefined || sk.niveau === null || ratingMode === 'none') return null;

            if (ratingMode === 'numeric') {
              return (
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-300/80 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800 shrink-0"
                  style={{ color: activeGaugeColor }}
                >
                  {levelVal}/10
                </span>
              );
            }

            if (ratingMode === 'percentage') {
              return (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-neutral-300/80 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800 shrink-0"
                  style={{ color: activeGaugeColor }}
                >
                  {percent}%
                </span>
              );
            }

            if (ratingMode === 'stars') {
              return (
                <div className="flex items-center space-x-0.5 shrink-0" style={{ color: activeGaugeColor }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= score5 ? 'fill-current' : 'opacity-25'}`}
                    />
                  ))}
                </div>
              );
            }

            if (ratingMode === 'dots') {
              return (
                <div className="flex items-center space-x-1 shrink-0">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <span
                      key={d}
                      className={`w-2 h-2 rounded-full ${d <= score5 ? 'shadow-2xs' : 'opacity-25'}`}
                      style={{ backgroundColor: d <= score5 ? activeGaugeColor : '#94A3B8' }}
                    />
                  ))}
                </div>
              );
            }

            if (ratingMode === 'segmented') {
              return (
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <span
                      key={seg}
                      className="w-3.5 h-1.5 rounded-xs"
                      style={{
                        backgroundColor: seg <= score5 ? activeGaugeColor : `${activeGaugeColor}25`
                      }}
                    />
                  ))}
                </div>
              );
            }

            if (ratingMode === 'badge-text') {
              const textLabel = levelVal <= 3 ? 'Débutant' : levelVal <= 5 ? 'Intermédiaire' : levelVal <= 7 ? 'Avancé' : levelVal <= 9 ? 'Expert' : 'Maître';
              return (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 border"
                  style={{
                    backgroundColor: `${activeGaugeColor}15`,
                    color: activeGaugeColor,
                    borderColor: `${activeGaugeColor}40`
                  }}
                >
                  {textLabel}
                </span>
              );
            }

            // 'progress' mode
            if (compact) {
              return (
                <div className="flex items-center gap-1.5 min-w-[70px]">
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%`, backgroundColor: activeGaugeColor }}
                    />
                  </div>
                  <span className="text-[9px] font-bold opacity-75">{percent}%</span>
                </div>
              );
            }

            return (
              <div className="w-full space-y-1">
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: activeGaugeColor }}
                  />
                </div>
              </div>
            );
          };

          const getSmartSkillIcon = (name: string, index: number) => {
            const lower = (name || '').toLowerCase();
            // Métiers de la santé et du soin
            if (lower.includes('sant') || lower.includes('médic') || lower.includes('chirurg') || lower.includes('clin') || lower.includes('soin') || lower.includes('urgenc') || lower.includes('hospit') || lower.includes('patient') || lower.includes('diagno')) {
              return <Stethoscope className="w-3.5 h-3.5" />;
            }
            // Droit, justice et notariat
            if (lower.includes('droit') || lower.includes('juri') || lower.includes('notair') || lower.includes('avocat') || lower.includes('légal') || lower.includes('contrat') || lower.includes('content') || lower.includes('magistr')) {
              return <Scale className="w-3.5 h-3.5" />;
            }
            // Direction, gouvernance et conseil stratégique
            if (lower.includes('direct') || lower.includes('gouvern') || lower.includes('strat') || lower.includes('conseil') || lower.includes('comex') || lower.includes('assoc') || lower.includes('exec') || lower.includes('cadre')) {
              return <Briefcase className="w-3.5 h-3.5" />;
            }
            // Hôtellerie de luxe, œnologie et gastronomie
            if (lower.includes('sommel') || lower.includes('vin') || lower.includes('œno') || lower.includes('oeno') || lower.includes('palace') || lower.includes('gastron') || lower.includes('dégust') || lower.includes('cave')) {
              return <Wine className="w-3.5 h-3.5" />;
            }
            // Architecture, espace et scénographie
            if (lower.includes('archit') || lower.includes('scéno') || lower.includes('espace') || lower.includes('bâti') || lower.includes('design') || lower.includes('plan') || lower.includes('chantier')) {
              return <Compass className="w-3.5 h-3.5" />;
            }
            // Ressources humaines, RSE et relations sociales
            if (lower.includes('rh') || lower.includes('recrut') || lower.includes('talent') || lower.includes('humain') || lower.includes('rse') || lower.includes('dialog') || lower.includes('social') || lower.includes('personnel')) {
              return <Users className="w-3.5 h-3.5" />;
            }
            // Horlogerie, haute facture et artisanat d'art
            if (lower.includes('horlog') || lower.includes('artisan') || lower.includes('métier') || lower.includes('précision') || lower.includes('restaur') || lower.includes('mécaniq') || lower.includes('patrimoin')) {
              return <Clock className="w-3.5 h-3.5" />;
            }
            // Journalisme, rédaction et presse
            if (lower.includes('journ') || lower.includes('press') || lower.includes('édit') || lower.includes('rédac') || lower.includes('investig') || lower.includes('média') || lower.includes('écrit')) {
              return <Newspaper className="w-3.5 h-3.5" />;
            }
            // Événementiel, relations publiques et culture
            if (lower.includes('évé') || lower.includes('event') || lower.includes('rp') || lower.includes('relat') || lower.includes('publiq') || lower.includes('festiv') || lower.includes('cultur')) {
              return <Sparkles className="w-3.5 h-3.5" />;
            }
            // Enseignement supérieur et recherche
            if (lower.includes('enseign') || lower.includes('recher') || lower.includes('académ') || lower.includes('doctor') || lower.includes('thèse') || lower.includes('publicat') || lower.includes('laborat')) {
              return <GraduationCap className="w-3.5 h-3.5" />;
            }
            // Finance, comptabilité et audit
            if (lower.includes('compt') || lower.includes('finan') || lower.includes('audit') || lower.includes('bilan') || lower.includes('fiscal') || lower.includes('tréso') || lower.includes('gest')) {
              return <TrendingUp className="w-3.5 h-3.5" />;
            }
            // Fallback tech
            if (lower.includes('code') || lower.includes('dev') || lower.includes('web') || lower.includes('prog') || lower.includes('script') || lower.includes('logiciel') || lower.includes('frontend') || lower.includes('backend') || lower.includes('react') || lower.includes('js') || lower.includes('python')) {
              return <Code className="w-3.5 h-3.5" />;
            }
            if (lower.includes('serv') || lower.includes('cloud') || lower.includes('infra') || lower.includes('system') || lower.includes('devops') || lower.includes('linux') || lower.includes('docker') || lower.includes('aws') || lower.includes('reseau')) {
              return <Server className="w-3.5 h-3.5" />;
            }
            if (lower.includes('secu') || lower.includes('cyber') || lower.includes('shield') || lower.includes('firewall') || lower.includes('audit') || lower.includes('auth')) {
              return <ShieldCheck className="w-3.5 h-3.5" />;
            }
            if (lower.includes('data') || lower.includes('sql') || lower.includes('base') || lower.includes('bdd') || lower.includes('mongo') || lower.includes('analyt')) {
              return <Database className="w-3.5 h-3.5" />;
            }
            const fallbacks = [
              <Briefcase className="w-3.5 h-3.5" />,
              <Award className="w-3.5 h-3.5" />,
              <BookOpen className="w-3.5 h-3.5" />,
              <Sparkles className="w-3.5 h-3.5" />,
              <Layers className="w-3.5 h-3.5" />,
              <Building2 className="w-3.5 h-3.5" />,
              <Activity className="w-3.5 h-3.5" />
            ];
            return fallbacks[index % fallbacks.length];
          };

          const renderSkillItemList = (itemsList: CompetenceItem[]) => {
            const currentRatingMode = cv?.styleNiveauCompetence || (effectiveSkillsMode === 'stars' ? 'stars' : effectiveSkillsMode === 'progress' ? 'progress' : 'progress');

            // NEW 1: EXECUTIVE-TAGS (Badge de Haute Direction sans note)
            if (effectiveSkillsMode === 'executive-tags') {
              return (
                <div className="flex flex-wrap gap-2.5 my-2 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-exec-${resolvedIdx}-${sk.nom || ''}`}
                        className="px-3.5 py-1.5 rounded-md border text-xs font-serif tracking-wide inline-flex items-center gap-2 transition-all shadow-2xs"
                        style={{
                          borderColor: `${accentColor}40`,
                          backgroundColor: `${accentColor}08`,
                          color: textColor
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                          className="font-semibold outline-none cursor-text tracking-wider uppercase text-[10.5px]"
                        >
                          {sk.nom}
                        </span>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="flex items-center gap-1 pl-1 border-l border-neutral-300 dark:border-neutral-700">
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // NEW 2: CATEGORIZED-PILLS (Piliers Juridiques & Notariaux sans notation)
            if (effectiveSkillsMode === 'categorized-pills') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-catp-${resolvedIdx}-${sk.nom || ''}`}
                        className="p-3 rounded-lg border bg-stone-50/50 dark:bg-stone-900/30 flex flex-col justify-between transition-all"
                        style={{ borderColor: `${accentColor}30`, borderLeftWidth: '3px', borderLeftColor: accentColor }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-bold text-xs uppercase tracking-wider outline-none cursor-text"
                            style={{ color: accentColor }}
                          >
                            {sk.nom}
                          </span>
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border border-stone-300 dark:border-stone-700 opacity-80">
                            Maîtrise experte
                          </span>
                        </div>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 ? (
                          <div>{renderSubTools(sk.listSousCompetences)}</div>
                        ) : (
                          <div
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'description', e.currentTarget.innerText)}
                            className="text-[10px] opacity-80 whitespace-pre-line outline-none cursor-text leading-relaxed"
                          >
                            {sk.description || '• Cliquez pour ajouter des précisions...'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // NEW 3: STEPPED-LEVELS (Niveaux Médicaux / Praticiens sans note chiffrée)
            if (effectiveSkillsMode === 'stepped-levels') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-step-${resolvedIdx}-${sk.nom || ''}`}
                        className="p-2.5 rounded-xl border border-sky-100 dark:border-sky-950 bg-sky-50/40 dark:bg-sky-950/20 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accentColor }}>
                              {getSmartSkillIcon(sk.nom, idx)}
                            </div>
                            <span
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                              className="font-bold text-xs outline-none cursor-text"
                              style={{ color: textColor }}
                            >
                              {sk.nom}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-200/50 dark:bg-sky-900/50" style={{ color: accentColor }}>
                            Pratique clinique
                          </span>
                        </div>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="pt-1">{renderSubTools(sk.listSousCompetences)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // NEW 4: COMPACT-CHIPS (Chips Prestige Sommelier & Gastronomie)
            if (effectiveSkillsMode === 'compact-chips') {
              return (
                <div className="flex flex-wrap gap-2 my-2 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-chip-${resolvedIdx}-${sk.nom || ''}`}
                        className="px-3 py-1 rounded-full border inline-flex items-center gap-2 shadow-2xs transition-all"
                        style={{
                          borderColor: `${accentColor}50`,
                          backgroundColor: `${accentColor}10`,
                          color: textColor
                        }}
                      >
                        <span className="text-amber-600 dark:text-amber-400">❖</span>
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                          className="font-medium text-xs outline-none cursor-text tracking-normal"
                        >
                          {sk.nom}
                        </span>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="flex items-center gap-1 pl-1 border-l border-amber-300 dark:border-amber-800">
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // NEW 5: MATRIX-CARDS (Haute Facture Horlogerie & Artisanat)
            if (effectiveSkillsMode === 'matrix-cards') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-2 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-mat-${resolvedIdx}-${sk.nom || ''}`}
                        className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0 bg-amber-100 dark:bg-amber-900/40">
                            {getSmartSkillIcon(sk.nom, idx)}
                          </div>
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-serif font-bold text-xs uppercase tracking-wider outline-none cursor-text"
                            style={{ color: accentColor }}
                          >
                            {sk.nom}
                          </span>
                        </div>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 ? (
                          <div>{renderSubTools(sk.listSousCompetences)}</div>
                        ) : (
                          <p className="text-[9.5px] opacity-75 leading-snug">
                            {sk.description || "Savoir-faire d'exception certifié"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 1. TECH-CARDS (Signature des Modèles 51 à 55)
            if (effectiveSkillsMode === 'tech-cards') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-1.5 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-tc-${resolvedIdx}-${sk.nom || ''}`}
                        className="flex flex-col rounded-t-xl rounded-b-lg p-2.5 border relative shadow-2xs transition-all"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: 'rgba(0,0,0,0.1)',
                          borderTopColor: accentColor,
                          borderTopWidth: '3px'
                        }}
                      >
                        {/* Top Circular Floating Badge */}
                        <div
                          className="w-6 h-6 rounded-full mx-auto -mt-5 mb-1.5 flex items-center justify-center shadow-xs text-white shrink-0"
                          style={{ backgroundColor: accentColor }}
                        >
                          {getSmartSkillIcon(sk.nom, idx)}
                        </div>

                        {/* Card Title */}
                        <h4
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                          className="font-black text-center text-[10.5px] uppercase tracking-wider mb-1 outline-none cursor-text leading-tight"
                          style={{ color: accentColor }}
                        >
                          {sk.nom}
                        </h4>

                        {/* Rating Display */}
                        <div className="flex justify-center mb-1.5">
                          {renderRatingIndicator(sk, true)}
                        </div>

                        {/* Bullets List / Sub-competences */}
                        <div className="flex-1 flex flex-col justify-between">
                          {sk.listSousCompetences && sk.listSousCompetences.length > 0 ? (
                            <div>
                              {renderSubTools(sk.listSousCompetences)}
                            </div>
                          ) : (
                            <div
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'description', e.currentTarget.innerText)}
                              className="text-[9.5px] leading-snug opacity-90 whitespace-pre-line outline-none cursor-text min-h-[20px]"
                            >
                              {sk.description || '• Cliquez pour ajouter des détails...'}
                            </div>
                          )}

                          {onUpdateSection && (
                            <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => addSubSkillItem(resolvedIdx, 'Nouvel outil / technologie')}
                                className="text-[8.5px] font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                              >
                                + Ajouter un outil
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 2. ICON-CARD-GRID (Signature des Modèles 56 à 60)
            if (effectiveSkillsMode === 'icon-card-grid') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 my-1.5 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-icg-${resolvedIdx}-${sk.nom || ''}`}
                        className="flex flex-col p-2.5 rounded-xl border relative shadow-2xs transition-all bg-neutral-50/70 dark:bg-neutral-900/50"
                        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${accentColor}18`,
                              color: accentColor
                            }}
                          >
                            {getSmartSkillIcon(sk.nom, idx)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                              className="font-bold text-[11px] truncate outline-none cursor-text leading-tight"
                              style={{ color: cv?.couleurOutils || textColor }}
                            >
                              {sk.nom}
                            </h4>
                            <div className="mt-0.5">
                              {renderRatingIndicator(sk, true)}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          {sk.listSousCompetences && sk.listSousCompetences.length > 0 ? (
                            <div>
                              {renderSubTools(sk.listSousCompetences)}
                            </div>
                          ) : (
                            <div
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'description', e.currentTarget.innerText)}
                              className="text-[9.5px] opacity-85 whitespace-pre-line outline-none cursor-text min-h-[18px]"
                            >
                              {sk.description || '• Cliquez pour ajouter des détails...'}
                            </div>
                          )}

                          {onUpdateSection && (
                            <div className="mt-1.5 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => addSubSkillItem(resolvedIdx, 'Nouvel outil')}
                                className="text-[8.5px] font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                              >
                                + Ajouter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 3. CARDS-MODERN (Cartes Modernes avec Bordure d'Accent Latérale)
            if (effectiveSkillsMode === 'cards-modern') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1.5 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-cm-${resolvedIdx}-${sk.nom || ''}`}
                        className="flex flex-col p-2.5 rounded-r-xl rounded-l-xs border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60 shadow-2xs relative transition-all"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: accentColor
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-extrabold text-xs outline-none cursor-text"
                            style={{ color: cv?.couleurOutils || textColor }}
                          >
                            {sk.nom}
                          </h4>
                          {renderRatingIndicator(sk, true)}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          {sk.listSousCompetences && sk.listSousCompetences.length > 0 ? (
                            <div>
                              {renderSubTools(sk.listSousCompetences)}
                            </div>
                          ) : (
                            <div
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'description', e.currentTarget.innerText)}
                              className="text-[9.5px] opacity-80 whitespace-pre-line outline-none cursor-text min-h-[16px]"
                            >
                              {sk.description || '• Cliquez pour ajouter des détails...'}
                            </div>
                          )}

                          {onUpdateSection && (
                            <div className="mt-1.5 pt-1 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => addSubSkillItem(resolvedIdx, 'Nouvel outil')}
                                className="text-[8.5px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                              >
                                + Ajouter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 4. GRID-3 (Grille Compacte 3 Colonnes)
            if (effectiveSkillsMode === 'grid-3') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-1 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-g3-${resolvedIdx}-${sk.nom || ''}`}
                        className="flex flex-col p-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30"
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-bold text-[10.5px] truncate outline-none cursor-text"
                            style={{ color: cv?.couleurOutils || textColor }}
                          >
                            {sk.nom}
                          </span>
                          {renderRatingIndicator(sk, true)}
                        </div>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div>
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 5. MINIMAL-CARDS (Cartes Épurées Minimalistes avec Point Géométrique)
            if (effectiveSkillsMode === 'minimal-cards') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1.5 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-mc-${resolvedIdx}-${sk.nom || ''}`}
                        className="flex flex-col p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-neutral-200/60 dark:border-neutral-800">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-xs shrink-0"
                              style={{ backgroundColor: accentColor }}
                            />
                            <span
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                              className="font-bold text-[11px] truncate outline-none cursor-text uppercase tracking-wider"
                              style={{ color: cv?.couleurOutils || textColor }}
                            >
                              {sk.nom}
                            </span>
                          </div>
                          {renderRatingIndicator(sk, true)}
                        </div>

                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 ? (
                          <div>
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        ) : (
                          <div
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'description', e.currentTarget.innerText)}
                            className="text-[9.5px] opacity-80 whitespace-pre-line outline-none cursor-text min-h-[16px]"
                          >
                            {sk.description || '• Cliquez pour ajouter des détails...'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 6. PILL-BARS (Pilules Modernes avec Micro-Jauge Intégrée)
            if (effectiveSkillsMode === 'pill-bars') {
              return (
                <div className="flex flex-wrap gap-2 py-1">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    const levelVal = Math.min(10, Math.max(0, sk.niveau ?? 8));
                    const percent = Math.min(100, Math.max(10, Math.round((levelVal / 10) * 100)));
                    return (
                      <div
                        key={sk.id || `sk-pb-${resolvedIdx}-${sk.nom || ''}`}
                        className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 inline-flex items-center gap-2.5 shadow-2xs"
                      >
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                          className="text-xs font-bold outline-none cursor-text"
                          style={{ color: cv?.couleurOutils || textColor }}
                        >
                          {sk.nom}
                        </span>
                        {showSkillLevels && sk.niveau !== undefined && sk.niveau !== null && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-10 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${percent}%`, backgroundColor: cv?.couleurJaugeNiveau || accentColor }}
                              />
                            </div>
                            <span className="text-[9px] font-mono font-bold opacity-75">{percent}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 7. STRIPED-TABLE (Lignes Zébrées Alternées)
            if (effectiveSkillsMode === 'striped-table') {
              return (
                <div className="space-y-1 my-1 w-full">
                  {itemsList.map((sk, idx) => {
                    const itemIdx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = itemIdx >= 0 ? itemIdx : idx;
                    return (
                      <div
                        key={sk.id || `sk-st-${resolvedIdx}-${sk.nom || ''}`}
                        className={`p-2 rounded-lg transition-all flex flex-col gap-1 ${
                          idx % 2 === 0 ? 'bg-neutral-100/70 dark:bg-neutral-800/40' : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-bold text-xs outline-none cursor-text"
                            style={{ color: cv?.couleurOutils || textColor }}
                          >
                            {sk.nom}
                          </span>
                          {renderRatingIndicator(sk, true)}
                        </div>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="pl-1">
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'grid') {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    return (
                      <div
                        key={sk.id || `sk-grid-${resolvedIdx}-${sk.nom || ''}`}
                        className="flex flex-col gap-1 py-1 px-1.5 rounded-lg transition-all"
                        style={{ color: cv?.couleurOutils || textColor }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-bold text-xs outline-none cursor-text"
                          >
                            {sk.nom}
                          </span>
                          {currentRatingMode !== 'progress' && renderRatingIndicator(sk, true)}
                        </div>
                        {currentRatingMode === 'progress' && (
                          <div className="w-full">
                            {renderRatingIndicator(sk, true)}
                          </div>
                        )}
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div>
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'badges') {
              return (
                <div className="flex flex-wrap gap-2 py-1">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    return (
                      <div key={sk.id || `sk-bdg-${resolvedIdx}-${sk.nom || ''}`} className="space-y-1">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-2xs"
                          style={{
                            backgroundColor: cv?.couleurFondOutils || accentColor,
                            color: cv?.couleurOutils || '#FFFFFF'
                          }}
                        >
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="outline-none cursor-text"
                          >
                            {sk.nom}
                          </span>
                          {currentRatingMode !== 'none' && (
                            <span className="opacity-90">{renderRatingIndicator(sk, true)}</span>
                          )}
                        </span>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="pl-1">
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'tags') {
              return (
                <div className="space-y-2 py-1">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    return (
                      <div key={sk.id || `sk-tag-${resolvedIdx}-${sk.nom || ''}`} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                            style={{
                              backgroundColor: cv?.couleurFondOutils || `${accentColor}18`,
                              color: cv?.couleurOutils || textColor
                            }}
                          >
                            <span className="opacity-60">#</span>
                            <span
                              contentEditable={Boolean(onUpdateSection)}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                              className="outline-none cursor-text font-bold"
                            >
                              {sk.nom}
                            </span>
                          </span>
                          {currentRatingMode !== 'none' && renderRatingIndicator(sk, true)}
                        </div>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div>
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'stars') {
              return (
                <div className="space-y-2">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    return (
                      <div key={sk.id || `sk-star-${resolvedIdx}-${sk.nom || ''}`} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-bold outline-none cursor-text"
                          >
                            {sk.nom}
                          </span>
                          {renderRatingIndicator(sk, true)}
                        </div>
                        {currentRatingMode === 'progress' && (
                          <div className="w-full">
                            {renderRatingIndicator(sk, false)}
                          </div>
                        )}
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="pl-2 space-y-0.5 border-l border-slate-200 dark:border-slate-700">
                            {sk.listSousCompetences.map((sub, sIdx) => (
                              <div key={sub.id || `sub-star-${resolvedIdx}-${sIdx}`} className="flex items-center justify-between text-[0.85em] opacity-80">
                                <span>{sub.nom}</span>
                                {sub.note !== undefined && (
                                  <div className="flex items-center space-x-0.5" style={{ color: cv?.couleurJaugeNiveau || accentColor }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-2.5 h-2.5 ${s <= sub.note! ? 'fill-current' : 'opacity-20'}`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'progress') {
              return (
                <div className="space-y-2">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    return (
                      <div key={sk.id || `sk-prog-${resolvedIdx}-${sk.nom || ''}`} className="space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="outline-none cursor-text"
                          >
                            {sk.nom}
                          </span>
                          {renderRatingIndicator(sk, true)}
                        </div>
                        {showSkillLevels && (!cv?.styleNiveauCompetence || cv.styleNiveauCompetence === 'progress') && (
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(10, (sk.niveau || 8) * 10))}%`, backgroundColor: cv?.couleurJaugeNiveau || accentColor }}
                            />
                          </div>
                        )}
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="pl-2 pt-0.5 space-y-1">
                            {sk.listSousCompetences.map((sub, sIdx) => {
                              const subPercent = (showSkillLevels && sub.note) ? Math.min(100, sub.note * 20) : null;
                              return (
                                <div key={sub.id || `sub-prog-${resolvedIdx}-${sIdx}`} className="space-y-0.5">
                                  <div className="flex justify-between text-[0.8em] opacity-80">
                                    <span>{sub.nom}</span>
                                    {subPercent !== null && <span>{subPercent}%</span>}
                                  </div>
                                  {subPercent !== null && (
                                    <div className="w-full h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{ width: `${subPercent}%`, backgroundColor: accentColor, opacity: 0.8 }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'badges-multicolor') {
              return (
                <div className="flex flex-wrap gap-1.5">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    return (
                      <span
                        key={sk.id || `sk-bmc-${resolvedIdx}-${sk.nom || ''}`}
                        className="px-2.5 py-1 rounded-md font-bold text-white shadow-2xs"
                        style={{ backgroundColor: resolvedIdx % 2 === 0 ? accentColor : (secondaryAccentColor && secondaryAccentColor !== '#FFFFFF' ? secondaryAccentColor : '#1E293B') }}
                      >
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                          className="outline-none cursor-text"
                        >
                          {sk.nom}
                        </span>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <span className="text-[0.8em] opacity-90 font-normal ml-1">
                            ({sk.listSousCompetences.map(formatSubWithNote).join(', ')})
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              );
            }

            if (effectiveSkillsMode === 'circular-progress') {
              return (
                <div className="grid grid-cols-2 gap-2">
                  {itemsList.map((sk, skIdx) => {
                    const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                    const resolvedIdx = idx >= 0 ? idx : skIdx;
                    const levelPercent = Math.min(100, Math.max(20, (sk.niveau || 3) * 10));
                    const radius = 14;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (levelPercent / 100) * circumference;
                    return (
                      <div key={sk.id || `sk-cp-${resolvedIdx}-${sk.nom || ''}`} className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                          <svg className="w-9 h-9 transform -rotate-90">
                            <circle cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="3" className="opacity-20" fill="transparent" />
                            <circle
                              cx="18" cy="18" r={radius}
                              stroke={accentColor} strokeWidth="3"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <span className="absolute text-[0.75em] font-black">{levelPercent}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            contentEditable={Boolean(onUpdateSection)}
                            suppressContentEditableWarning
                            onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                            className="font-bold text-[0.9em] leading-tight block truncate outline-none cursor-text"
                          >
                            {sk.nom}
                          </span>
                          {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                            <div className="text-[0.75em] opacity-75 truncate font-normal">
                              {sk.listSousCompetences.map(formatSubWithNote).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Default list style
            return (
              <div className="space-y-1 opacity-90">
                {itemsList.map((sk, skIdx) => {
                  const idx = rawItems.findIndex(i => (Boolean(sk.id) && i.id === sk.id) || i === sk);
                  const resolvedIdx = idx >= 0 ? idx : skIdx;
                  return (
                    <div key={sk.id || `sk-list-${resolvedIdx}-${sk.nom || ''}`} className="font-semibold flex items-start gap-1.5">
                      <span className="mt-0.5" style={{ color: accentColor }}>{getBulletPrefix(resolvedIdx)}</span>
                      <div className="flex-1">
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(resolvedIdx, 'nom', e.currentTarget.innerText)}
                          className="outline-none cursor-text"
                        >
                          {sk.nom}
                        </span>
                        {sk.listSousCompetences && sk.listSousCompetences.length > 0 && (
                          <div className="pl-2 border-l border-slate-300 dark:border-slate-700 mt-0.5">
                            {renderSubTools(sk.listSousCompetences)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          };

          // Check if any items have a subtitle
          const hasSubtitles = rawItems.some(it => it.sousTitre && it.sousTitre.trim().length > 0);

          if (!hasSubtitles) {
            return renderSkillItemList(rawItems);
          }

          // Group items by subtitle
          const groupsMap = new Map<string, CompetenceItem[]>();
          rawItems.forEach(it => {
            const groupKey = it.sousTitre && it.sousTitre.trim().length > 0 ? it.sousTitre.trim() : '';
            if (!groupsMap.has(groupKey)) {
              groupsMap.set(groupKey, []);
            }
            groupsMap.get(groupKey)!.push(it);
          });

          return (
            <div className="space-y-3">
              {Array.from(groupsMap.entries()).map(([subTitleKey, groupedSkills], gIdx) => (
                <div key={subTitleKey ? `grp-${subTitleKey}` : `grp-idx-${gIdx}`} className="space-y-1.5">
                  {subTitleKey && (
                    <div className="flex items-center gap-2 pt-1 first:pt-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                      <span 
                        className="text-[0.85em] font-extrabold uppercase tracking-wider opacity-90"
                        style={{ color: accentColor }}
                      >
                        {subTitleKey}
                      </span>
                      <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: accentColor }} />
                    </div>
                  )}
                  {renderSkillItemList(groupedSkills)}
                </div>
              ))}
            </div>
          );
        })()}

        {/* LANGUES */}
        {section.type === 'langues' && (
          <div className="space-y-1.5">
            {(section.contenu as LangueItem[])?.map((l, idx) => (
              <div key={l.id || `lang-${idx}-${l.langue || ''}`} className="flex justify-between items-center border-b border-slate-100/40 pb-1 last:border-0">
                <span
                  contentEditable={Boolean(onUpdateSection)}
                  suppressContentEditableWarning
                  onBlur={(e) => updateLangueItem(idx, 'langue', e.currentTarget.innerText)}
                  className="font-extrabold outline-none cursor-text"
                >
                  {l.langue}
                </span>
                <span
                  contentEditable={Boolean(onUpdateSection)}
                  suppressContentEditableWarning
                  onBlur={(e) => updateLangueItem(idx, 'niveau', e.currentTarget.innerText)}
                  className="italic opacity-80 outline-none cursor-text"
                >
                  {l.niveau}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PROJETS & RÉALISATIONS */}
        {section.type === 'projets' && (
          <div className="space-y-3">
            {Array.isArray(section.contenu) && (section.contenu as any[]).map((p, idx) => (
              <div key={p.id || `proj-${idx}-${p.titre || ''}`} className="space-y-1 border-b border-slate-100/30 pb-2 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[0.95em]">{p.titre}</span>
                    {p.sousTitre && <span className="opacity-75 text-[0.85em]">({p.sousTitre})</span>}
                  </div>
                  {(p.dateDebut || p.dateFin) && (
                    <span className="text-[0.8em] opacity-75 font-mono">
                      {p.dateDebut} {p.dateFin ? `– ${p.dateFin}` : ''}
                    </span>
                  )}
                </div>
                {p.technologies && (
                  <div className="flex flex-wrap gap-1 my-0.5">
                    {p.technologies.split(/[,•|]/).map((tech: string, tIdx: number) => tech.trim() && (
                      <span key={`tech-${idx}-${tIdx}`} className="text-[0.75em] px-1.5 py-0.5 rounded font-mono font-bold" style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {p.lien && (
                  <div className="text-[0.8em] font-mono opacity-80 flex items-center gap-1" style={{ color: accentColor }}>
                    <Link2 className="w-3 h-3 shrink-0" />
                    <span>{p.lien}</span>
                  </div>
                )}
                {p.description && (
                  <p className="text-[0.88em] opacity-90 whitespace-pre-line leading-relaxed">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATIONS */}
        {section.type === 'certifications' && (
          <div className="space-y-2">
            {Array.isArray(section.contenu) && (section.contenu as any[]).map((c, idx) => (
              <div key={c.id || `cert-${idx}-${c.nom || c.intitule || c.titre || ''}`} className="flex items-start justify-between gap-2 border-b border-slate-100/30 pb-1.5 last:border-0">
                <div>
                  <div className="font-extrabold text-[0.9em]">
                    {c.nom || c.intitule || c.titre}
                  </div>
                  <div className="text-[0.8em] opacity-80">{c.organisme} {c.idCertification ? `• ID: ${c.idCertification}` : ''}</div>
                </div>
                {(c.annee || c.dateObtention) && (
                  <span className="text-[0.8em] opacity-75 font-mono shrink-0">
                    {c.annee || c.dateObtention}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BÉNÉVOLAT & ENGAGEMENT */}
        {section.type === 'benevolat' && (
          <div className="space-y-2.5">
            {Array.isArray(section.contenu) && (section.contenu as BenevolatItem[]).map((b, idx) => (
              <div key={b.id || `ben-${idx}-${b.role || ''}`} className="space-y-1 border-b border-slate-100/30 pb-1.5 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                    <span className="font-extrabold text-[0.95em]">{b.role}</span>
                  </div>
                  {(b.dateDebut || b.dateFin) && (
                    <span className="text-[0.8em] opacity-75 font-mono">
                      {b.dateDebut} {b.dateFin ? `– ${b.dateFin}` : b.actuel ? `– ${cv?.langue === 'en' ? 'Present' : cv?.langue === 'ar' ? 'حتى الآن' : 'Présent'}` : ''}
                    </span>
                  )}
                </div>
                <div className="font-semibold opacity-90 text-[0.9em]">
                  <span>{b.organisation}</span>
                  {b.ville && <span> | {b.ville}</span>}
                </div>
                {b.description && (
                  <p className="text-[0.88em] opacity-90 whitespace-pre-line leading-relaxed">{b.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PUBLICATIONS & RECHERCHES */}
        {section.type === 'publications' && (
          <div className="space-y-2.5">
            {Array.isArray(section.contenu) && (section.contenu as PublicationItem[]).map((pub, idx) => (
              <div key={pub.id || `pub-${idx}-${pub.titre || ''}`} className="space-y-1 border-b border-slate-100/30 pb-1.5 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                    <span className="font-extrabold text-[0.95em]">{pub.titre}</span>
                  </div>
                  {pub.datePublication && (
                    <span className="text-[0.8em] opacity-75 font-mono">{pub.datePublication}</span>
                  )}
                </div>
                {pub.editeurOuRevue && (
                  <div className="italic opacity-85 text-[0.88em]">{pub.editeurOuRevue} {pub.auteurs ? `• ${pub.auteurs}` : ''}</div>
                )}
                {pub.lien && (
                  <div className="text-[0.8em] font-mono opacity-80 flex items-center gap-1" style={{ color: accentColor }}>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{pub.lien}</span>
                  </div>
                )}
                {pub.description && (
                  <p className="text-[0.88em] opacity-90 whitespace-pre-line leading-relaxed">{pub.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DISTINCTIONS & PRIX */}
        {section.type === 'distinctions' && (
          <div className="space-y-2">
            {Array.isArray(section.contenu) && (section.contenu as DistinctionItem[]).map((dist, idx) => (
              <div key={dist.id || `dist-${idx}-${dist.titre || ''}`} className="flex items-start justify-between gap-2 border-b border-slate-100/30 pb-1.5 last:border-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-[0.9em]">
                    <Award className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                    <span>{dist.titre}</span>
                  </div>
                  {dist.organisme && <div className="text-[0.8em] opacity-80">{dist.organisme}</div>}
                  {dist.description && <p className="text-[0.85em] opacity-90 leading-snug">{dist.description}</p>}
                </div>
                {dist.annee && (
                  <span className="text-[0.8em] opacity-75 font-mono shrink-0 font-bold" style={{ color: accentColor }}>
                    {dist.annee}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* QUALITÉS / SOFT SKILLS */}
        {section.type === 'qualites' && (
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(section.contenu) && (section.contenu as QualiteItem[]).map((q, idx) => (
              <div
                key={q.id || `qual-${idx}-${q.nom || ''}`}
                className="px-2.5 py-1 rounded-lg text-[0.85em] font-bold border inline-flex items-center gap-1.5 shadow-2xs"
                style={{ backgroundColor: secondaryAccentColor + '44', borderColor: accentColor + '44', color: textColor }}
              >
                <Sparkles className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                <span>{q.nom}</span>
                {q.description && <span className="text-[0.8em] opacity-75 font-normal">({q.description})</span>}
              </div>
            ))}
          </div>
        )}

        {/* CENTRES D'INTÉRÊT / HOBBIES */}
        {section.type === 'interets' && (
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(section.contenu) ? (
              (section.contenu as any[]).map((it, idx) => (
                <span
                  key={it.id || `int-${idx}-${typeof it === 'string' ? it : it.nom || ''}`}
                  className="px-2.5 py-1 rounded-full text-[0.85em] font-bold border inline-flex items-center gap-1"
                  style={{ backgroundColor: secondaryAccentColor + '44', borderColor: accentColor + '44', color: textColor }}
                >
                  {it.icone && <span className="text-xs">{it.icone}</span>}
                  <span>{typeof it === 'string' ? it : it.nom}</span>
                </span>
              ))
            ) : (
              <div className="text-[0.9em] opacity-90">{String(section.contenu || '')}</div>
            )}
          </div>
        )}

        {/* RÉFÉRENCES PROFESSIONNELLES */}
        {section.type === 'references' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.isArray(section.contenu) && (section.contenu as any[]).map((ref, idx) => (
              <div key={ref.id || `ref-${idx}-${ref.nomComplet || ''}`} className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1" style={{ backgroundColor: secondaryAccentColor + '22' }}>
                <div className="font-extrabold text-[0.9em]">{ref.nomComplet}</div>
                <div className="text-[0.8em] opacity-80">{ref.poste} • {ref.entreprise}</div>
                {ref.email && (
                  <div className="text-[0.75em] opacity-75 font-mono flex items-center gap-1">
                    <Mail className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                    <span>{ref.email}</span>
                  </div>
                )}
                {ref.telephone && (
                  <div className="text-[0.75em] opacity-75 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                    <span>{ref.telephone}</span>
                  </div>
                )}
                {ref.relation && <div className="text-[0.75em] opacity-70 italic">{ref.relation}</div>}
              </div>
            ))}
          </div>
        )}

        {/* PERSONNALISÉE / LOISIRS */}
        {section.type === 'personnalisee' && (
          <div
            contentEditable={Boolean(onUpdateSection)}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateSection?.({ ...section, contenu: { ...(section.contenu || {}), texteLibre: e.currentTarget.innerText } })}
            className="whitespace-pre-line opacity-90 outline-none cursor-text"
          >
            {(section.contenu as PersonnaliseeContenu)?.texteLibre}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
