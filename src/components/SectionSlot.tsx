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
  isExpanded = true
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

  // Helper for Section Titles
  const renderHeader = () => {
    const headerFontSize = titleFontSizePt ? `${titleFontSizePt}pt` : '1.1em';

    switch (effectiveHeaderStyle) {
      case 'pill':
        return (
          <div className={`mb-2.5 flex ${titleAlignClass}`}>
            <span
              className="px-3 py-1 font-bold rounded-full inline-block shadow-2xs"
              style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: headerFontSize }}
            >
              {formattedTitle}
            </span>
          </div>
        );
      case 'banner':
        return (
          <div
            className={`mb-2.5 px-3 py-1.5 rounded-md font-black tracking-wider shadow-2xs ${titleAlignClass}`}
            style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: headerFontSize }}
          >
            {formattedTitle}
          </div>
        );
      case 'left-border':
        return (
          <div className={`mb-1 flex items-center gap-1.5 ${titleAlignClass}`}>
            <div className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
            <h3 className="font-extrabold tracking-wide" style={titleStyleObj}>
              {formattedTitle}
            </h3>
          </div>
        );
      case 'boxed':
        return (
          <div
            className="mb-1 p-1 rounded border font-black tracking-wider text-center"
            style={{ borderColor: accentColor, backgroundColor: secondaryAccentColor + '33', ...titleStyleObj }}
          >
            {formattedTitle}
          </div>
        );
      case 'stars':
        return (
          <div className="mb-1 flex items-center justify-between border-b pb-0.5" style={{ borderColor: accentColor + '44' }}>
            <h3 className="font-black tracking-wider" style={titleStyleObj}>
              {formattedTitle}
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
              {formattedTitle}
            </h3>
          </div>
        );
      case 'arch-block':
        return (
          <div
            className={`mb-1 px-2.5 py-1 rounded-t-xl rounded-b-xs font-black tracking-wider text-white ${titleAlignClass}`}
            style={{ backgroundColor: accentColor, fontSize: headerFontSize }}
          >
            {formattedTitle}
          </div>
        );
      case 'badge-header':
        return (
          <div className={`mb-1 flex ${titleAlignClass}`}>
            <span
              className="px-2.5 py-0.5 font-black rounded inline-block border-l-2"
              style={{ backgroundColor: secondaryAccentColor + '44', borderColor: accentColor, color: effectiveHeadingColor, fontSize: headerFontSize }}
            >
              {formattedTitle}
            </span>
          </div>
        );
      case 'minimal':
        return (
          <div className={`mb-1 ${titleAlignClass}`}>
            <h3 className="font-extrabold tracking-widest" style={titleStyleObj}>
              {formattedTitle}
            </h3>
          </div>
        );
      case 'underline':
      default:
        return (
          <div className="mb-1 border-b pb-0.5" style={{ borderColor: accentColor }}>
            <h3 className="font-extrabold tracking-wider" style={titleStyleObj}>
              {formattedTitle}
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
  const renderFormattedDescription = (desc: string | undefined) => {
    if (!desc) return null;
    const rawLines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return null;

    if (rawLines.length === 1 && !rawLines[0].match(/^[•\-\*\d+\.]/)) {
      return (
        <p className="opacity-85 mt-0.5 text-[0.95em]">
          {rawLines[0]}
        </p>
      );
    }

    return (
      <ul className="mt-1 space-y-0.5 text-[0.95em]">
        {rawLines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-\*\d+\.]\s*/, '');
          return (
            <li key={idx} className="flex items-start gap-1.5 opacity-90">
              <span className="shrink-0 font-bold select-none text-[0.9em]" style={{ color: accentColor }}>
                {getBulletPrefix(idx)}
              </span>
              <span>{cleanLine}</span>
            </li>
          );
        })}
      </ul>
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
            {section.contenu?.resume && (
              <p className="opacity-90 whitespace-pre-line mb-1">
                {section.contenu.resume}
              </p>
            )}
            <div className="grid grid-cols-1 gap-1">
              {section.contenu?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span className="break-all">{section.contenu.email}</span>
                </div>
              )}
              {section.contenu?.telephone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span>{section.contenu.telephone}</span>
                </div>
              )}
              {section.contenu?.adresse && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span>{section.contenu.adresse}</span>
                </div>
              )}
              {section.contenu?.siteWeb && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span className="break-all">{section.contenu.siteWeb}</span>
                </div>
              )}
              {section.contenu?.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span className="break-all">{section.contenu.linkedin}</span>
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
                  <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                    <div className="font-bold opacity-75 sm:col-span-1" style={{ color: accentColor }}>
                      {datesText}
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <div className="font-extrabold uppercase tracking-tight">{exp.poste}</div>
                      <div className="font-semibold opacity-90">{exp.entreprise} {exp.ville ? `| ${exp.ville}` : ''}</div>
                      {renderFormattedDescription(exp.description)}
                    </div>
                  </div>
                );
              }

              return (
                <div key={exp.id} className="space-y-1 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span className="font-bold uppercase tracking-tight">{exp.poste}</span>
                    {datesText && (
                      <span className="text-[0.85em] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}>
                        {datesText}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold opacity-90">{exp.entreprise} {exp.ville ? `| ${exp.ville}` : ''}</div>
                  {renderFormattedDescription(exp.description)}
                </div>
              );
            })}
          </div>
        )}

        {/* FORMATION */}
        {section.type === 'formation' && (
          <div className="space-y-2">
            {(section.contenu as FormationItem[])?.map((edu) => {
              const datesText = `${edu.dateDebut || ''} ${edu.dateFin ? `- ${edu.dateFin}` : ''}`.trim();

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                    <div className="font-bold opacity-75 sm:col-span-1" style={{ color: accentColor }}>
                      {datesText}
                    </div>
                    <div className="sm:col-span-3 space-y-0.5">
                      <div className="font-extrabold uppercase tracking-tight">{edu.diplome}</div>
                      <div className="font-semibold opacity-90">{edu.etablissement} {edu.ville ? `| ${edu.ville}` : ''}</div>
                      {renderFormattedDescription(edu.description)}
                    </div>
                  </div>
                );
              }

              return (
                <div key={edu.id} className="space-y-1 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span className="font-bold uppercase tracking-tight">{edu.diplome}</span>
                    {datesText && (
                      <span className="text-[0.85em] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}>
                        {datesText}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold opacity-90">{edu.etablissement} {edu.ville ? `| ${edu.ville}` : ''}</div>
                  {renderFormattedDescription(edu.description)}
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
                {(section.contenu as CompetenceItem[])?.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-1.5 rounded text-center font-bold border transition-all"
                    style={{ backgroundColor: secondaryAccentColor + '33', borderColor: accentColor + '44' }}
                  >
                    <span>{sk.nom}</span>
                  </div>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'badges' && (
              <div className="flex flex-wrap gap-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2.5 py-1 rounded-full font-bold shadow-2xs"
                    style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
                  >
                    {sk.nom}
                  </span>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'tags' && (
              <div className="flex flex-wrap gap-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2 py-0.5 rounded-lg font-extrabold border"
                    style={{ backgroundColor: secondaryAccentColor + '55', color: textColor, borderColor: accentColor + '55' }}
                  >
                    #{sk.nom}
                  </span>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'stars' && (
              <div className="space-y-1.5">
                {(section.contenu as CompetenceItem[])?.map((sk) => {
                  const level = sk.niveau || 3;
                  return (
                    <div key={sk.id} className="flex items-center justify-between gap-2">
                      <span className="font-bold">{sk.nom}</span>
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
                {(section.contenu as CompetenceItem[])?.map((sk) => {
                  const levelPercent = Math.min(100, Math.max(20, (sk.niveau || 3) * 20));
                  return (
                    <div key={sk.id} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{sk.nom}</span>
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
                    key={sk.id}
                    className="px-2.5 py-1 rounded-md font-bold text-white shadow-2xs"
                    style={{ backgroundColor: idx % 2 === 0 ? accentColor : (secondaryAccentColor && secondaryAccentColor !== '#FFFFFF' ? secondaryAccentColor : '#1E293B') }}
                  >
                    {sk.nom}
                  </span>
                ))}
              </div>
            )}

            {effectiveSkillsMode === 'circular-progress' && (
              <div className="grid grid-cols-2 gap-2">
                {(section.contenu as CompetenceItem[])?.map((sk) => {
                  const levelPercent = Math.min(100, Math.max(20, (sk.niveau || 3) * 20));
                  const radius = 14;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (levelPercent / 100) * circumference;
                  return (
                    <div key={sk.id} className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
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
                      <span className="font-bold text-[0.9em] leading-tight truncate">{sk.nom}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {effectiveSkillsMode === 'list' && (
              <div className="space-y-1 opacity-90">
                {(section.contenu as CompetenceItem[])?.map((sk, idx) => (
                  <div key={sk.id} className="font-semibold flex items-center gap-1.5">
                    <span style={{ color: accentColor }}>{getBulletPrefix(idx)}</span>
                    <span>{sk.nom}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LANGUES */}
        {section.type === 'langues' && (
          <div className="space-y-1.5">
            {(section.contenu as LangueItem[])?.map((l) => (
              <div key={l.id} className="flex justify-between items-center border-b border-slate-100/40 pb-1 last:border-0">
                <span className="font-extrabold">{l.langue}</span>
                <span className="italic opacity-80">{l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {/* PERSONNALISÉE / LOISIRS */}
        {section.type === 'personnalisee' && (
          <div className="whitespace-pre-line opacity-90">
            {(section.contenu as PersonnaliseeContenu)?.texteLibre}
          </div>
        )}
      </div>
    </div>
  );
};
