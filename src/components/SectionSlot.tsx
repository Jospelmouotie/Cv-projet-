import React from 'react';
import { Section, ProfilContenu, ExperienceItem, FormationItem, CompetenceItem, LangueItem, PersonnaliseeContenu } from '../types';
import { Mail, Phone, MapPin, Globe, User, Briefcase, GraduationCap, CheckCircle, Star } from 'lucide-react';

interface SectionSlotProps {
  section: Section;
  isSidebar?: boolean;
  accentColor: string;
  secondaryAccentColor?: string;
  textColor: string;
  headingColor: string;
  headerStyle?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line';
  skillsDisplayMode?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags';
  experienceDatesAlignment?: 'left' | 'top' | 'inline';
  bulletStyle?: 'disc' | 'square' | 'arrow' | 'check' | 'star' | 'dash' | 'numbered' | 'none';
  titleFontSizePt?: number;
  titleCase?: 'uppercase' | 'capitalize' | 'normal';
  titleAlign?: 'left' | 'center' | 'right';
  fontCss?: string;
  dynamicTextStyle?: React.CSSProperties;
  // Drag and Drop handle option for Interactive Preview Mode
  dragHandleProps?: any;
  isReorderActive?: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  onUpdateSection?: (updatedSection: Section) => void;
}

export const SectionSlot: React.FC<SectionSlotProps> = ({
  section,
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
  fontCss,
  dynamicTextStyle,
  dragHandleProps,
  isReorderActive = false,
  onToggleExpand,
  isExpanded = true,
  onUpdateSection
}) => {
  if (!section.visible) return null;

  // Custom Section Overrides
  const secStyle = section.styleSection;
  const effectiveHeaderStyle = secStyle?.styleEntete || headerStyle;
  const effectiveSkillsMode = secStyle?.styleCompetences || skillsDisplayMode;
  const effectiveDatesAlign = secStyle?.alignementDates || experienceDatesAlignment;
  const effectiveHeadingColor = secStyle?.couleurTitre || headingColor;
  const effectiveTextColor = secStyle?.couleurTexte || textColor;
  const effectiveBgColor = secStyle?.couleurFond;

  // Formatting Title Text
  const formatTitleText = (rawTitle: string) => {
    if (titleCase === 'capitalize') {
      return rawTitle.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }
    if (titleCase === 'normal') {
      return rawTitle;
    }
    return rawTitle.toUpperCase();
  };

  const formattedTitle = formatTitleText(section.titre);
  const titleStyleObj: React.CSSProperties = {
    color: effectiveHeadingColor,
    fontSize: titleFontSizePt ? `${titleFontSizePt}pt` : '1.1em',
    textAlign: titleAlign
  };

  const titleAlignClass = titleAlign === 'center' ? 'text-center justify-center' : titleAlign === 'right' ? 'text-right justify-end' : 'text-left justify-start';

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

  const updateLangueItem = (idx: number, field: string, val: string) => {
    if (!onUpdateSection) return;
    const list = Array.isArray(section.contenu) ? [...(section.contenu as LangueItem[])] : [];
    if (list[idx]) {
      list[idx] = { ...list[idx], [field]: val };
      onUpdateSection({ ...section, contenu: list });
    }
  };

  // Helper for Section Titles
  const renderHeader = () => {
    const headerFontSize = titleFontSizePt ? `${titleFontSizePt}pt` : '1.1em';

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
      case 'pill':
        return (
          <div className={`mb-2.5 flex ${titleAlignClass}`}>
            <span
              className="px-3 py-1 font-bold rounded-full inline-block shadow-2xs"
              style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: headerFontSize }}
            >
              {renderTitleEditable()}
            </span>
          </div>
        );
      case 'banner':
        return (
          <div
            className={`mb-2.5 px-3 py-1.5 rounded-md font-black tracking-wider shadow-2xs ${titleAlignClass}`}
            style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: headerFontSize }}
          >
            {renderTitleEditable()}
          </div>
        );
      case 'left-border':
        return (
          <div className={`mb-1 flex items-center gap-1.5 ${titleAlignClass}`}>
            <div className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
            <h3 className="font-extrabold tracking-wide" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
          </div>
        );
      case 'boxed':
        return (
          <div
            className="mb-1 p-1 rounded border font-black tracking-wider text-center"
            style={{ borderColor: accentColor, backgroundColor: secondaryAccentColor + '33', ...titleStyleObj }}
          >
            {renderTitleEditable()}
          </div>
        );
      case 'stars':
        return (
          <div className="mb-1 flex items-center justify-between border-b pb-0.5" style={{ borderColor: accentColor + '44' }}>
            <h3 className="font-black tracking-wider" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
            <div className="flex items-center space-x-0.5" style={{ color: accentColor }}>
              <Star className="w-2.5 h-2.5 fill-current" />
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
          </div>
        );
      case 'double-line':
        return (
          <div className="mb-1 border-b border-t py-0.5" style={{ borderColor: accentColor }}>
            <h3 className="font-black tracking-widest text-center" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
          </div>
        );
      case 'arch-block':
        return (
          <div
            className={`mb-1 px-2.5 py-1 rounded-t-xl rounded-b-xs font-black tracking-wider text-white ${titleAlignClass}`}
            style={{ backgroundColor: accentColor, fontSize: headerFontSize }}
          >
            {renderTitleEditable()}
          </div>
        );
      case 'badge-header':
        return (
          <div className={`mb-1 flex ${titleAlignClass}`}>
            <span
              className="px-2.5 py-0.5 font-black rounded inline-block border-l-2"
              style={{ backgroundColor: secondaryAccentColor + '44', borderColor: accentColor, color: effectiveHeadingColor, fontSize: headerFontSize }}
            >
              {renderTitleEditable()}
            </span>
          </div>
        );
      case 'minimal':
        return (
          <div className={`mb-1 ${titleAlignClass}`}>
            <h3 className="font-extrabold tracking-widest" style={titleStyleObj}>
              {renderTitleEditable()}
            </h3>
          </div>
        );
      case 'underline':
      default:
        return (
          <div className="mb-1 border-b pb-0.5" style={{ borderColor: accentColor }}>
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

  // Helper for multi-line description & bullet lists
  const renderFormattedDescription = (desc: string | undefined, onUpdate?: (val: string) => void) => {
    if (!desc && !onUpdate) return null;
    const textVal = desc || '';

    return (
      <div
        contentEditable={Boolean(onUpdate)}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.(e.currentTarget.innerText)}
        className="opacity-90 mt-0.5 text-[0.95em] outline-none cursor-text whitespace-pre-line"
      >
        {textVal}
      </div>
    );
  };

  return (
    <div
      className={`relative group transition-all rounded-md p-0.5 sm:p-1 ${
        secStyle?.ombre === 'sm' ? 'shadow-xs' : secStyle?.ombre === 'md' ? 'shadow-md' : secStyle?.ombre === 'lg' ? 'shadow-xl' : ''
      } ${secStyle?.epaisseurBordure ? 'border' : ''}`}
      style={{
        backgroundColor: effectiveBgColor || 'transparent',
        borderColor: secStyle?.epaisseurBordure ? accentColor : undefined,
        borderRadius: secStyle?.rayonBordure ? `${secStyle.rayonBordure}px` : undefined,
        fontFamily: fontCss,
        color: effectiveTextColor,
        ...dynamicTextStyle
      }}
    >
      {/* Reorder Mode Touch Handle Bar */}
      {isReorderActive && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="print:hidden mb-2 p-2 bg-blue-600 text-white rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-between font-bold shadow-md select-none touch-none hover:bg-blue-700 transition-colors"
          style={{ minHeight: '44px' }}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-[1.1em]">☰</span>
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
          <div className="space-y-1">
            {section.contenu?.resume !== undefined && (
              <p
                contentEditable={Boolean(onUpdateSection)}
                suppressContentEditableWarning
                onBlur={(e) => handleProfilBlur('resume', e.currentTarget.innerText)}
                className="opacity-90 whitespace-pre-line mb-1 outline-none cursor-text"
              >
                {section.contenu.resume}
              </p>
            )}
            <div className="grid grid-cols-1 gap-1">
              {section.contenu?.email !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span
                    contentEditable={Boolean(onUpdateSection)}
                    suppressContentEditableWarning
                    onBlur={(e) => handleProfilBlur('email', e.currentTarget.innerText)}
                    className="break-all outline-none cursor-text"
                  >
                    {section.contenu.email}
                  </span>
                </div>
              )}
              {section.contenu?.telephone !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span
                    contentEditable={Boolean(onUpdateSection)}
                    suppressContentEditableWarning
                    onBlur={(e) => handleProfilBlur('telephone', e.currentTarget.innerText)}
                    className="outline-none cursor-text"
                  >
                    {section.contenu.telephone}
                  </span>
                </div>
              )}
              {section.contenu?.adresse !== undefined && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span
                    contentEditable={Boolean(onUpdateSection)}
                    suppressContentEditableWarning
                    onBlur={(e) => handleProfilBlur('adresse', e.currentTarget.innerText)}
                    className="outline-none cursor-text"
                  >
                    {section.contenu.adresse}
                  </span>
                </div>
              )}
              {section.contenu?.siteWeb !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span
                    contentEditable={Boolean(onUpdateSection)}
                    suppressContentEditableWarning
                    onBlur={(e) => handleProfilBlur('siteWeb', e.currentTarget.innerText)}
                    className="break-all outline-none cursor-text"
                  >
                    {section.contenu.siteWeb}
                  </span>
                </div>
              )}
              {section.contenu?.linkedin !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span
                    contentEditable={Boolean(onUpdateSection)}
                    suppressContentEditableWarning
                    onBlur={(e) => handleProfilBlur('linkedin', e.currentTarget.innerText)}
                    className="break-all outline-none cursor-text"
                  >
                    {section.contenu.linkedin}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXPÉRIENCES */}
        {section.type === 'experience' && (
          <div className="space-y-1.5">
            {(section.contenu as ExperienceItem[])?.map((exp, expIdx) => {
              const datesText = `${exp.dateDebut || ''} ${exp.dateFin ? `- ${exp.dateFin}` : exp.actuel ? '- Présent' : ''}`.trim();

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={exp.id || expIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 last:border-0 pb-2 last:pb-0">
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
                <div key={exp.id || expIdx} className="space-y-1 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExpItem(expIdx, 'poste', e.currentTarget.innerText)}
                      className="font-bold uppercase tracking-tight outline-none cursor-text"
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
          <div className="space-y-2">
            {(section.contenu as FormationItem[])?.map((edu, eduIdx) => {
              const datesText = `${edu.dateDebut || ''} ${edu.dateFin ? `- ${edu.dateFin}` : ''}`.trim();

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={edu.id || eduIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
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
                <div key={edu.id || eduIdx} className="space-y-1 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateEduItem(eduIdx, 'diplome', e.currentTarget.innerText)}
                      className="font-bold uppercase tracking-tight outline-none cursor-text"
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
        {section.type === 'competences' && (
          <div>
            {effectiveSkillsMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => (
                  <div
                    key={sk.id || idx}
                    className="p-1.5 rounded text-center font-bold border transition-all"
                    style={{ backgroundColor: secondaryAccentColor + '33', borderColor: accentColor + '44' }}
                  >
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {sk.nom}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'badges' && (
              <div className="flex flex-wrap gap-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => (
                  <span
                    key={sk.id || idx}
                    className="px-2.5 py-1 rounded-full font-bold shadow-2xs"
                    style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
                  >
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {sk.nom}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'tags' && (
              <div className="flex flex-wrap gap-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => (
                  <span
                    key={sk.id || idx}
                    className="px-2 py-0.5 rounded-lg font-extrabold border"
                    style={{ backgroundColor: secondaryAccentColor + '55', color: textColor, borderColor: accentColor + '55' }}
                  >
                    #<span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {sk.nom}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'stars' && (
              <div className="space-y-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => {
                  const level = sk.niveau || 3;
                  return (
                    <div key={sk.id || idx} className="flex items-center justify-between gap-2">
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                        className="font-bold outline-none cursor-text"
                      >
                        {sk.nom}
                      </span>
                      <div className="flex items-center space-x-0.5" style={{ color: accentColor }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= level ? 'fill-current' : 'opacity-25'}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {effectiveSkillsMode === 'progress' && (
              <div className="space-y-2">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => {
                  const levelPercent = Math.min(100, Math.max(20, (sk.niveau || 3) * 20));
                  return (
                    <div key={sk.id || idx} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span
                          contentEditable={Boolean(onUpdateSection)}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                          className="outline-none cursor-text"
                        >
                          {sk.nom}
                        </span>
                        <span className="opacity-70">{levelPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${levelPercent}%`, backgroundColor: accentColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {effectiveSkillsMode === 'badges-multicolor' && (
              <div className="flex flex-wrap gap-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => (
                  <span
                    key={sk.id || idx}
                    className="px-2.5 py-1 rounded-md font-bold text-white shadow-2xs"
                    style={{ backgroundColor: idx % 2 === 0 ? accentColor : (secondaryAccentColor && secondaryAccentColor !== '#FFFFFF' ? secondaryAccentColor : '#1E293B') }}
                  >
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {sk.nom}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'circular-progress' && (
              <div className="grid grid-cols-2 gap-2">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => {
                  const levelPercent = Math.min(100, Math.max(20, (sk.niveau || 3) * 20));
                  const radius = 14;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (levelPercent / 100) * circumference;
                  return (
                    <div key={sk.id || idx} className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
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
                      <span
                        contentEditable={Boolean(onUpdateSection)}
                        suppressContentEditableWarning
                        onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                        className="font-bold text-[0.9em] leading-tight truncate outline-none cursor-text"
                      >
                        {sk.nom}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {effectiveSkillsMode === 'list' && (
              <div className="space-y-1 opacity-90">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => (
                  <div key={sk.id || idx} className="font-semibold flex items-center gap-1.5">
                    <span style={{ color: accentColor }}>{getBulletPrefix(idx)}</span>
                    <span
                      contentEditable={Boolean(onUpdateSection)}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSkillItem(idx, 'nom', e.currentTarget.innerText)}
                      className="outline-none cursor-text"
                    >
                      {sk.nom}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LANGUES */}
        {section.type === 'langues' && (
          <div className="space-y-1.5">
            {(section.contenu as LangueItem[])?.map((l, idx) => (
              <div key={l.id || idx} className="flex justify-between items-center border-b border-slate-100/40 pb-1 last:border-0">
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
  );
};
