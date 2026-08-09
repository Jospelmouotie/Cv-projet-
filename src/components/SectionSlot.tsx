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
    fontSize: titleFontSizePt ? `${titleFontSizePt}pt` : undefined,
    textAlign: titleAlign
  };

  const titleAlignClass = titleAlign === 'center' ? 'text-center justify-center' : titleAlign === 'right' ? 'text-right justify-end' : 'text-left justify-start';

  // Helper for Section Titles
  const renderHeader = () => {
    switch (effectiveHeaderStyle) {
      case 'pill':
        return (
          <div className={`mb-2.5 flex ${titleAlignClass}`}>
            <span
              className="px-3 py-1 text-xs font-bold rounded-full inline-block shadow-2xs"
              style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: titleFontSizePt ? `${titleFontSizePt}pt` : undefined }}
            >
              {formattedTitle}
            </span>
          </div>
        );
      case 'banner':
        return (
          <div
            className={`mb-2.5 px-3 py-1.5 rounded-md text-xs font-black tracking-wider shadow-2xs ${titleAlignClass}`}
            style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: titleFontSizePt ? `${titleFontSizePt}pt` : undefined }}
          >
            {formattedTitle}
          </div>
        );
      case 'left-border':
        return (
          <div className={`mb-2.5 flex items-center gap-2 ${titleAlignClass}`}>
            <div className="w-1.5 h-4.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
            <h3 className="text-xs sm:text-sm font-extrabold tracking-wide" style={titleStyleObj}>
              {formattedTitle}
            </h3>
          </div>
        );
      case 'boxed':
        return (
          <div
            className="mb-2.5 p-1.5 rounded border text-xs font-black tracking-wider text-center"
            style={{ borderColor: accentColor, backgroundColor: secondaryAccentColor + '33', ...titleStyleObj }}
          >
            {formattedTitle}
          </div>
        );
      case 'stars':
        return (
          <div className="mb-2.5 flex items-center justify-between border-b pb-1" style={{ borderColor: accentColor + '44' }}>
            <h3 className="text-xs sm:text-sm font-black tracking-wider" style={titleStyleObj}>
              {formattedTitle}
            </h3>
            <div className="flex items-center space-x-1" style={{ color: accentColor }}>
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
            </div>
          </div>
        );
      case 'double-line':
        return (
          <div className="mb-2.5 border-b-2 border-t-2 py-1" style={{ borderColor: accentColor }}>
            <h3 className="text-xs sm:text-sm font-black tracking-widest text-center" style={titleStyleObj}>
              {formattedTitle}
            </h3>
          </div>
        );
      case 'minimal':
        return (
          <div className={`mb-2.5 ${titleAlignClass}`}>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-widest" style={titleStyleObj}>
              {formattedTitle}
            </h3>
          </div>
        );
      case 'underline':
      default:
        return (
          <div className="mb-2.5 border-b-2 pb-1" style={{ borderColor: accentColor }}>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-wider" style={titleStyleObj}>
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

  return (
    <div
      className={`relative group transition-all rounded-lg p-2 ${
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
          className="print:hidden mb-2 p-2 bg-blue-600 text-white rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-between text-xs font-bold shadow-md select-none touch-none hover:bg-blue-700 transition-colors"
          style={{ minHeight: '44px' }}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-base">☰</span>
            <span>Déplacer: {section.titre}</span>
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase">Zone {section.colonne || 'principale'}</span>
        </div>
      )}

      {renderHeader()}

      {/* SECTION CONTENT TYPES */}
      <div className="space-y-2">
        {/* PROFIL / CONTACT */}
        {section.type === 'profil' && (
          <div className="space-y-2 text-xs">
            {section.contenu?.resume && (
              <p className="leading-relaxed opacity-90 whitespace-pre-line mb-2">
                {section.contenu.resume}
              </p>
            )}
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {section.contenu?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span className="break-all">{section.contenu.email}</span>
                </div>
              )}
              {section.contenu?.telephone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span>{section.contenu.telephone}</span>
                </div>
              )}
              {section.contenu?.adresse && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span>{section.contenu.adresse}</span>
                </div>
              )}
              {section.contenu?.siteWeb && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span className="break-all">{section.contenu.siteWeb}</span>
                </div>
              )}
              {section.contenu?.linkedin && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: accentColor }} />
                  <span className="break-all">{section.contenu.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXPÉRIENCES */}
        {section.type === 'experience' && (
          <div className="space-y-2.5">
            {(section.contenu as ExperienceItem[])?.map((exp, expIdx) => {
              const datesText = `${exp.dateDebut || ''} ${exp.dateFin ? `- ${exp.dateFin}` : exp.actuel ? '- Présent' : ''}`.trim();

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                    <div className="font-bold opacity-75 sm:col-span-1" style={{ color: accentColor }}>
                      {datesText}
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <div className="font-extrabold text-xs uppercase tracking-tight">{exp.poste}</div>
                      <div className="font-semibold opacity-90">{exp.entreprise} {exp.ville ? `| ${exp.ville}` : ''}</div>
                      {exp.description && (
                        <p className="leading-relaxed opacity-80 whitespace-pre-line mt-1">
                          {getBulletPrefix(expIdx)}{exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={exp.id} className="text-xs space-y-1 border-b border-slate-100/50 last:border-0 pb-2 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span className="font-bold uppercase tracking-tight text-xs">{exp.poste}</span>
                    {datesText && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}>
                        {datesText}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold opacity-90">{exp.entreprise} {exp.ville ? `| ${exp.ville}` : ''}</div>
                  {exp.description && (
                    <p className="leading-relaxed opacity-80 whitespace-pre-line mt-1">
                      {getBulletPrefix(expIdx)}{exp.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* FORMATION */}
        {section.type === 'formation' && (
          <div className="space-y-2.5">
            {(section.contenu as FormationItem[])?.map((edu, eduIdx) => {
              const datesText = `${edu.dateDebut || ''} ${edu.dateFin ? `- ${edu.dateFin}` : ''}`.trim();

              if (effectiveDatesAlign === 'left' && !isSidebar) {
                return (
                  <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                    <div className="font-bold opacity-75 sm:col-span-1" style={{ color: accentColor }}>
                      {datesText}
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <div className="font-extrabold text-xs uppercase tracking-tight">{edu.diplome}</div>
                      <div className="font-semibold opacity-90">{edu.etablissement} {edu.ville ? `| ${edu.ville}` : ''}</div>
                      {edu.description && (
                        <p className="leading-relaxed opacity-80 whitespace-pre-line mt-1">
                          {getBulletPrefix(eduIdx)}{edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={edu.id} className="text-xs space-y-1 border-b border-slate-100/50 last:border-0 pb-2 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <span className="font-bold uppercase tracking-tight">{edu.diplome}</span>
                    {datesText && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: secondaryAccentColor + '44', color: accentColor }}>
                        {datesText}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold opacity-90">{edu.etablissement} {edu.ville ? `| ${edu.ville}` : ''}</div>
                  {edu.description && (
                    <p className="leading-relaxed opacity-80 whitespace-pre-line mt-1">
                      {getBulletPrefix(eduIdx)}{edu.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* COMPÉTENCES */}
        {section.type === 'competences' && (
          <div>
            {effectiveSkillsMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
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
              <div className="flex flex-wrap gap-1.5 text-xs">
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
              <div className="flex flex-wrap gap-1.5 text-xs">
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
              <div className="space-y-1.5 text-xs">
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
              <div className="space-y-2 text-xs">
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

            {effectiveSkillsMode === 'list' && (
              <div className="space-y-1 text-xs opacity-90">
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
          <div className="space-y-1.5 text-xs">
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
          <div className="text-xs whitespace-pre-line leading-relaxed opacity-90">
            {(section.contenu as PersonnaliseeContenu)?.texteLibre}
          </div>
        )}
      </div>
    </div>
  );
};
