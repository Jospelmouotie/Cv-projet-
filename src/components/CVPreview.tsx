import React, { useEffect } from 'react';
import { CV, Section, ProfilContenu, ExperienceItem, FormationItem, CompetenceItem, LangueItem, PersonnaliseeContenu } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { Mail, Phone, MapPin, Globe, ArrowUp, ArrowDown, User, Briefcase, GraduationCap, CheckCircle, Palette, Minus, Plus } from 'lucide-react';

interface CVPreviewProps {
  cv: CV;
  id?: string;
  onMoveSectionUp?: (sectionId: string) => void;
  onMoveSectionDown?: (sectionId: string) => void;
  onUpdateColor?: (color: string) => void;
  onUpdatePhotoShape?: (shape: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche') => void;
  onUpdatePhotoSize?: (size: number) => void;
  interactivePreview?: boolean;
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  cv,
  id = 'cv-preview-container',
  onMoveSectionUp,
  onMoveSectionDown,
  onUpdateColor,
  onUpdatePhotoShape,
  onUpdatePhotoSize,
  interactivePreview = true
}) => {
  const template = CV_TEMPLATES.find(t => t.id === cv.templateId) || CV_TEMPLATES[0];
  const accent = cv.couleurAccent || template.defaultAccent || '#006666';
  const fontFamily = cv.police || template.defaultFont || 'Inter';

  // Anti-Screenshot Event Detection
  useEffect(() => {
    if (!interactivePreview || cv.statutPaiement === 'PAYE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
        alert("🔒 Capture d'écran détectée ! Cet aperçu est filigrané et protégé. Effectuez un paiement de 500 FCFA via Orange Money/MTN pour télécharger votre CV propre en PDF HD sans filigrane.");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactivePreview, cv.statutPaiement]);

  // Font size mapping
  const getFontSizeClass = (taille?: string) => {
    if (!taille) return 'text-xs';
    if (taille === '9' || taille === '9pt' || taille === 'sm') return 'text-[10px]';
    if (taille === '10' || taille === '10pt') return 'text-[11px]';
    if (taille === '11' || taille === '11pt' || taille === 'md') return 'text-xs';
    if (taille === '12' || taille === '12pt' || taille === 'lg') return 'text-[13px]';
    if (taille === '13' || taille === '13pt') return 'text-sm';
    if (taille === '14' || taille === '14pt' || taille === 'xl') return 'text-[15px]';
    if (taille === '16' || taille === '16pt') return 'text-base';
    return 'text-xs';
  };
  const fontSizeClasses = getFontSizeClass(cv.taillePolice);

  // Line height
  const lineHeightClasses = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  }[cv.hauteurLigne || 'normal'];

  // Letter spacing
  const letterSpacingClasses = {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    widest: 'tracking-widest'
  }[cv.ecartementTexte || 'normal'];

  // Filter visible sections
  const visibleSections = (cv.sections || []).filter(s => s.visible).sort((a, b) => a.ordre - b.ordre);
  const profilSec = cv.sections?.find(s => s.type === 'profil')?.contenu as ProfilContenu | undefined;

  // Photo Visibility & Main Title Mode
  const showPhoto = cv.afficherPhoto !== false && !!cv.photoUrl;

  // Photo Shape Helper Class
  const getPhotoShapeClass = (forme?: string) => {
    switch (forme) {
      case 'carree': return 'rounded-none';
      case 'arrondie': return 'rounded-2xl';
      case 'hexagone': return 'clip-hexagon';
      case 'arche': return 'rounded-t-full rounded-b-none';
      case 'ronde':
      default:
        return 'rounded-full';
    }
  };

  const photoShapeClass = getPhotoShapeClass(cv.photoForme);
  const photoSizeStyle = cv.photoTaille ? { width: `${cv.photoTaille}px`, height: `${cv.photoTaille}px` } : undefined;

  // Floating Interactive Customization Bar on Preview
  const renderInteractiveToolbar = () => {
    if (!interactivePreview) return null;

    return (
      <div className="absolute top-2 right-2 z-40 flex items-center gap-1.5 bg-slate-900/90 text-white p-1.5 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/80 text-[11px] font-bold">
        {/* Color Touch Picker */}
        <div className="relative flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Couleur</span>
          <input
            type="color"
            value={cv.couleurAccent || '#006666'}
            onChange={(e) => onUpdateColor?.(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
            title="Changer la couleur directement"
          />
        </div>

        {/* Photo Controls if photo visible */}
        {showPhoto && (
          <>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-300 hidden sm:inline">Forme:</span>
              {(['ronde', 'carree', 'arrondie', 'arche'] as const).map(shape => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => onUpdatePhotoShape?.(shape)}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                    (cv.photoForme || 'ronde') === shape ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`Forme ${shape}`}
                >
                  {shape === 'ronde' ? '⭕' : shape === 'carree' ? '🟩' : shape === 'arrondie' ? '🔲' : '🏛️'}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onUpdatePhotoSize?.(Math.max(60, (cv.photoTaille || 96) - 10))}
                className="p-1 hover:bg-slate-700 rounded cursor-pointer text-slate-300"
                title="Réduire taille photo"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[10px] px-1 font-mono text-amber-300">{cv.photoTaille || 96}px</span>
              <button
                type="button"
                onClick={() => onUpdatePhotoSize?.(Math.min(180, (cv.photoTaille || 96) + 10))}
                className="p-1 hover:bg-slate-700 rounded cursor-pointer text-slate-300"
                title="Agrandir taille photo"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Anti-Screenshot Watermark Overlay
  const renderWatermarkOverlay = () => {
    if (!interactivePreview || cv.statutPaiement === 'PAYE') return null;

    return (
      <div className="absolute inset-0 z-50 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-4">
        {/* Top Warning Badge */}
        <div className="flex justify-center">
          <div className="bg-amber-500/95 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-amber-300 tracking-wider flex items-center gap-1.5 backdrop-blur-xs">
            🔒 APERÇU PROTÉGÉ — NE PAS CAPTURER • MYCV BUILDER
          </div>
        </div>

        {/* Diagonal Repeated Watermark */}
        <div className="absolute inset-0 flex flex-col justify-around items-center opacity-15 rotate-[-28deg] pointer-events-none font-black text-slate-900 text-sm tracking-widest uppercase">
          <div>★ APERÇU PROTÉGÉ ★ MYCV BUILDER ★ SANS CAPTURE ★</div>
          <div>★ MYCV BUILDER ★ APERÇU EN TEMPS RÉEL ★</div>
          <div>★ APERÇU PROTÉGÉ ★ MYCV BUILDER ★ SANS CAPTURE ★</div>
          <div>★ MYCV BUILDER ★ APERÇU EN TEMPS RÉEL ★</div>
          <div>★ APERÇU PROTÉGÉ ★ MYCV BUILDER ★ SANS CAPTURE ★</div>
        </div>

        {/* Bottom Badge */}
        <div className="flex justify-center">
          <div className="bg-slate-900/90 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-amber-500/40 backdrop-blur-xs">
            MYCV BUILDER • EXPORT PDF HD PROPRE
          </div>
        </div>
      </div>
    );
  };

  const mainTitle = cv.grandTitreMode === 'poste'
    ? (profilSec?.titreProfessionnel || profilSec?.nomComplet || 'Intitulé du Poste')
    : (profilSec?.nomComplet || 'Nom Prénom');

  const subTitle = cv.grandTitreMode === 'poste'
    ? (profilSec?.nomComplet || 'Nom Prénom')
    : (profilSec?.titreProfessionnel || 'Intitulé du Poste');

  // Helper to partition sections by column while strictly preserving visibleSections array order
  const getSectionsForColumn = (columnType: 'gauche' | 'droite' | 'principale' | 'toutes') => {
    if (columnType === 'toutes') {
      return visibleSections.filter(s => s.type !== 'profil');
    }

    return visibleSections.filter(sec => {
      if (sec.type === 'profil') return false;

      // 1. Explicit user column choice in dropdown takes top priority ("gauche", "droite", "principale")
      if (sec.colonne) {
        if (columnType === 'gauche') return sec.colonne === 'gauche';
        if (columnType === 'droite' || columnType === 'principale') {
          return sec.colonne === 'droite' || sec.colonne === 'principale';
        }
      }

      // 2. Default position fallback if sec.colonne is undefined
      if (columnType === 'gauche') {
        return ['contact', 'langues', 'competences'].includes(sec.type);
      } else {
        return ['experience', 'formation', 'personnalisee'].includes(sec.type);
      }
    });
  };

  // Helper to render sub-competences (sous-compétences) with rich formatting (barres de progression, badges, puces, tirets, bold, italic)
  const renderSousCompetences = (sk: CompetenceItem, colorClass?: string) => {
    if (!sk.sousCompetences && !sk.categorie && (!sk.listSousCompetences || sk.listSousCompetences.length === 0)) return null;

    const renderFormattedSpan = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    const style = sk.styleSousCompetences || 'badges';
    const hasStructuredList = sk.listSousCompetences && sk.listSousCompetences.length > 0;

    const rawText = sk.sousCompetences || '';
    const itemsFromText = rawText
      ? rawText.split(/\n|,|•|-/).map(s => s.trim()).filter(Boolean)
      : [];

    return (
      <div className="mt-1 space-y-1">
        {sk.categorie && (
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
            {sk.categorie}
          </span>
        )}

        {/* Structured Sub-competences with Progress Bars (note / 10) */}
        {hasStructuredList ? (
          <div className="space-y-1.5 pt-0.5">
            {sk.listSousCompetences!.map((sub, idx) => {
              const note = sub.note || 7;
              const pct = Math.min(100, Math.max(10, (note / 10) * 100));
              return (
                <div key={sub.id || idx} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span>{renderFormattedSpan(sub.nom)}</span>
                    <span className="opacity-80 text-[9px] font-mono">{note}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : itemsFromText.length > 0 ? (
          style === 'puces' ? (
            <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
              {itemsFromText.map((item, idx) => (
                <li key={idx}>{renderFormattedSpan(item)}</li>
              ))}
            </ul>
          ) : style === 'tirets' ? (
            <div className="text-[11px] space-y-0.5 opacity-90">
              {itemsFromText.map((item, idx) => (
                <div key={idx} className="flex items-baseline gap-1">
                  <span className="shrink-0">•</span>
                  <span>{renderFormattedSpan(item)}</span>
                </div>
              ))}
            </div>
          ) : style === 'badges' ? (
            <div className="flex flex-wrap gap-1">
              {itemsFromText.map((item, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border border-current/20 bg-current/10 shrink-0 ${colorClass || ''}`}
                >
                  {renderFormattedSpan(item)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] opacity-85 leading-relaxed whitespace-pre-line">
              {renderFormattedSpan(rawText)}
            </p>
          )
        ) : null}
      </div>
    );
  };

  const experienceSec = visibleSections.filter(s => s.type === 'experience');
  const formationSec = visibleSections.filter(s => s.type === 'formation');
  const competencesSec = visibleSections.filter(s => s.type === 'competences');
  const languesSec = visibleSections.filter(s => s.type === 'langues');
  const personnaliseesSec = visibleSections.filter(s => s.type === 'personnalisee');

  // Render Section Controls overlay on preview
  const renderPreviewSectionControls = (secId: string, idx: number, total: number) => {
    if (!interactivePreview || !onMoveSectionUp || !onMoveSectionDown) return null;

    return (
      <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center bg-white/90 backdrop-blur-xs border border-slate-200 rounded-md shadow-xs p-0.5 z-20">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => onMoveSectionUp(secId)}
          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
          title="Monter la section"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          disabled={idx === total - 1}
          onClick={() => onMoveSectionDown(secId)}
          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
          title="Descendre la section"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const layoutType = template.layoutType || 'interimaire-teal';

  // Helper to render sections dynamically preserving user order and column selection
  const renderDynamicSectionGroup = (sections: Section[], isDark = false, customHeaderClass?: string) => {
    return (
      <>
        {sections.map((sec, idx) => (
          <div key={sec.id} className="space-y-2 relative group">
            {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
            
            <h2 className={customHeaderClass || `text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-white border-b border-white/30' : 'text-slate-900 border-b-2 border-slate-800'} pb-1`}>
              {sec.titre}
            </h2>

            {/* EXPÉRIENCE */}
            {sec.type === 'experience' && (
              <div className="space-y-3">
                {(sec.contenu as ExperienceItem[])?.map(exp => (
                  <div key={exp.id} className="space-y-0.5 text-xs">
                    <div className={`font-extrabold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{exp.entreprise}</div>
                    <div className={`flex justify-between items-baseline text-[11px] font-semibold italic ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <span>{exp.poste}</span>
                      <span className={`not-italic font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin}</span>
                    </div>
                    <p className={`text-[11px] leading-snug whitespace-pre-line pt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* FORMATION */}
            {sec.type === 'formation' && (
              <div className="space-y-2.5">
                {(sec.contenu as FormationItem[])?.map(edu => (
                  <div key={edu.id} className="space-y-0.5 text-xs">
                    <div className={`font-extrabold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{edu.diplome}</div>
                    <div className={`flex justify-between text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span>{edu.etablissement}</span>
                      <span>{edu.dateDebut} - {edu.dateFin}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COMPÉTENCES */}
            {sec.type === 'competences' && (
              <div className="space-y-2 text-xs">
                {(sec.contenu as CompetenceItem[])?.map(sk => (
                  <div key={sk.id} className="space-y-0.5">
                    <div className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <CheckCircle className="w-3.5 h-3.5 text-[#006666] shrink-0" />
                      <span>{sk.nom}</span>
                    </div>
                    {renderSousCompetences(sk)}
                  </div>
                ))}
              </div>
            )}

            {/* LANGUES */}
            {sec.type === 'langues' && (
              <div className="space-y-1 text-xs">
                {(sec.contenu as LangueItem[])?.map(l => (
                  <div key={l.id} className={isDark ? 'text-white' : 'text-slate-900'}>
                    <span className="font-bold">{l.langue}</span> : <span className={`italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{l.niveau}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PERSONNALISÉE */}
            {sec.type === 'personnalisee' && (
              <div className={`text-xs whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {(sec.contenu as PersonnaliseeContenu)?.texteLibre}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  /* ==================================================================
   * MODEL 1: INTÉRIMAIRE PRO / VERT CANARD (PHOTO 1)
   * ================================================================== */
  if (layoutType === 'interimaire-teal' || cv.templateId === 'modele-1') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex flex-col ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        {/* Top Header Banner */}
        <div className="w-full h-32 bg-[#E6F0F2] relative flex shrink-0 border-b border-slate-200">
          {/* Top Left Circular Photo */}
          {showPhoto && (
            <div className="absolute top-3 left-8 z-10">
              <div className={`border-4 border-white shadow-md overflow-hidden bg-slate-800 ${photoShapeClass}`} style={photoSizeStyle || { width: '96px', height: '96px' }}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            </div>
          )}

          {/* Top Right Main Title */}
          <div className={`${showPhoto ? 'ml-36' : 'ml-8'} pt-4 pr-6 text-slate-900 leading-tight transition-all`}>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">{mainTitle}</h1>
          </div>

          {/* Bottom Teal Banner Across Header */}
          <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-end px-8 z-0" style={{ backgroundColor: accent }}>
            <span className="text-xs font-bold uppercase tracking-wider text-white">{subTitle}</span>
          </div>
        </div>

        {/* Body Content 2 Columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column (Light Blue) */}
          <div className="w-[36%] bg-[#E6F0F2] p-6 space-y-5 border-r border-slate-200 text-slate-800 shrink-0">
            {/* CONTACT */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1">
                CONTACT
              </h2>
              <div className="space-y-1 text-[11px] text-slate-700 font-medium">
                {profilSec?.email && <p className="truncate">✉️ {profilSec.email}</p>}
                {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
                {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
                {profilSec?.linkedin && <p className="truncate">🔗 {profilSec.linkedin}</p>}
              </div>
            </div>

            {/* MON PROFIL */}
            {profilSec?.resume && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1">
                  MON PROFIL
                </h2>
                <p className="text-[11px] text-slate-700 leading-relaxed italic">{profilSec.resume}</p>
              </div>
            )}

            {/* DYNAMIC LEFT COLUMN SECTIONS (Preserving User Order & Column selection) */}
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false)}
          </div>

          {/* Right Column (White) */}
          <div className="w-[64%] p-6 space-y-6 bg-white overflow-hidden">
            {/* DYNAMIC MAIN COLUMN SECTIONS (Preserving User Order & Column selection) */}
            {renderDynamicSectionGroup(getSectionsForColumn('principale'), false)}
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 2: AÏSSATOU MDALÉ / PHOTOGRAPHE (PHOTO 2)
   * ================================================================== */
  if (layoutType === 'aissatou-plum' || cv.templateId === 'modele-2') {
    return (
      <div
        id={id}
        className={`bg-[#381A3C] text-white w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-800 relative select-none flex flex-col justify-between ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", "Playfair Display", Georgia, serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        {/* Top Header Section */}
        <div className="p-8 pb-4 flex justify-between items-start">
          {/* Top Left Title */}
          <div className="space-y-2 max-w-[60%] pt-2">
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight leading-none">{mainTitle}</h1>
            <p className="text-lg italic font-serif text-slate-200 border-b border-dotted border-slate-400 pb-1 w-fit">{subTitle}</p>
            <div className="text-xs text-slate-300 pt-2 space-y-0.5 font-sans">
              {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
              {profilSec?.email && <p>✉️ {profilSec.email}</p>}
              {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
            </div>
          </div>

          {/* Top Right Lavender Arch Card */}
          {showPhoto && (
            <div className="w-32 h-44 bg-[#EADDF0] rounded-t-full flex items-center justify-center p-2 shrink-0 shadow-lg">
              <div className={`border-2 border-white overflow-hidden bg-slate-800 shadow-md ${photoShapeClass}`} style={photoSizeStyle || { width: '96px', height: '96px' }}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            </div>
          )}
        </div>

        {/* Body Content 2 Equal Columns */}
        <div className="px-8 py-4 grid grid-cols-2 gap-8 overflow-hidden font-sans">
          {/* Left Column */}
          <div className="space-y-5 border-r border-white/20 pr-6">
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), true, "text-sm font-bold font-serif border-b border-white/30 pb-1 text-white")}
          </div>

          {/* Right Column */}
          <div className="space-y-5 font-sans">
            {renderDynamicSectionGroup(getSectionsForColumn('principale'), true, "text-sm font-bold font-serif border-b border-white/30 pb-1 text-white")}
          </div>
        </div>

        {/* Bottom Lavender Footer Bar */}
        <div className="bg-[#EADDF0] text-[#381A3C] font-bold text-xs py-2 px-6 text-center tracking-wide font-sans shrink-0">
          Découvrez mon portfolio : {profilSec?.siteWeb || 'www.photographe.site.com'}
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 3: BRIAN R. BAXTER / WEB DESIGNER (PHOTO 3)
   * ================================================================== */
  if (layoutType === 'baxter-cyan' || cv.templateId === 'modele-3') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        {/* Left Column (Dark Charcoal) */}
        <div className="w-[36%] bg-[#22252A] text-white p-5 space-y-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Top Cyan Medallion */}
            {showPhoto && (
              <div className="bg-[#00B4D8] rounded-b-full p-3 pt-2 text-center flex flex-col items-center shadow-md">
                <div className={`border-2 border-white shadow-lg overflow-hidden bg-slate-800 ${photoShapeClass}`} style={photoSizeStyle || { width: '80px', height: '80px' }}>
                  <img src={cv.photoUrl} alt="Brian" className={`w-full h-full object-cover ${photoShapeClass}`} />
                </div>
              </div>
            )}

            {/* CONTACT ME */}
            <div className="space-y-2 text-xs">
              <h2 className="font-bold text-sm text-[#00B4D8] uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-1">
                CONTACT ME
              </h2>
              {profilSec?.telephone && <p className="text-slate-300">📞 {profilSec.telephone}</p>}
              {profilSec?.email && <p className="text-slate-300 truncate">✉️ {profilSec.email}</p>}
              {profilSec?.adresse && <p className="text-slate-300">📍 {profilSec.adresse}</p>}
            </div>

            {/* LEFT DYNAMIC SECTIONS */}
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), true, "font-bold text-sm text-[#00B4D8] uppercase tracking-wider border-b border-white/10 pb-1")}
          </div>
        </div>

        {/* Right Column (White) */}
        <div className="w-[64%] p-6 space-y-6 bg-white text-slate-800 relative">
          {/* Header Title */}
          <div className="border-b-2 border-slate-900 pb-2">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{mainTitle}</h1>
            <p className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest mt-0.5">{subTitle}</p>
          </div>

          {/* ABOUT ME */}
          {profilSec?.resume && (
            <div className="space-y-1">
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">ABOUT ME</h2>
              <p className="text-[11px] text-slate-600 leading-relaxed">{profilSec.resume}</p>
            </div>
          )}

          {/* RIGHT DYNAMIC SECTIONS */}
          {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b pb-0.5")}

          {/* Bottom Right Cyan Triangle */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#00B4D8]" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 4: INFIRMIÈRE / ÉCUSSON VIOLET (PHOTO 4)
   * ================================================================== */
  if (layoutType === 'infirmiere-purple' || cv.templateId === 'modele-4') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border-4 border-slate-300 p-8 relative select-none flex flex-col justify-between ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        <div className="space-y-6">
          {/* Top Central Dark Purple Header Shield */}
          <div className="bg-[#522166] text-white p-4 text-center rounded-sm shadow-md space-y-1 mx-auto max-w-xl">
            <h1 className="text-xl font-bold text-white tracking-widest uppercase">{mainTitle}</h1>
            <div className="text-xs text-slate-200 font-medium space-y-0.5">
              {profilSec?.adresse && <p>{profilSec.adresse}</p>}
              <p className="flex justify-center gap-4">
                {profilSec?.telephone && <span>TÉLÉPHONE : {profilSec.telephone}</span>}
                {profilSec?.email && <span>COURRIEL : {profilSec.email}</span>}
              </p>
            </div>
          </div>

          {/* Centered Serif Title */}
          <div className="text-center py-1 border-b border-slate-200">
            <span className="font-serif font-extrabold text-2xl tracking-widest text-[#522166] uppercase">{subTitle}</span>
          </div>

          {/* ALL DYNAMIC SECTIONS */}
          {renderDynamicSectionGroup(getSectionsForColumn('toutes'), false, "bg-[#522166] text-white font-extrabold text-xs px-3 py-1 uppercase tracking-wider")}
        </div>

        {/* Bottom Centered Reference */}
        <div className="text-center text-xs italic text-slate-600 font-serif pt-4 border-t border-slate-200">
          RÉFÉRENCES SUR DEMANDE
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 5: JOSEPH CARLIER / OCEAN WAVES (PHOTO 5)
   * ================================================================== */
  if (layoutType === 'ocean-wave-carlier' || cv.templateId === 'modele-5') {
    return (
      <div
        id={id}
        className={`bg-[#EDF2F0] text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex flex-col justify-between ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", Georgia, serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}

        {/* Top Organic Wave Header */}
        <div className="relative w-full h-44 shrink-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
            <path d="M0,0 L500,0 L500,75 Q360,175 180,120 Q70,95 0,165 Z" fill={accent} />
          </svg>

          {/* Photo on Top Left Wave */}
          {showPhoto && (
            <div className="absolute top-5 left-6 z-10">
              <div className={`overflow-hidden border-4 border-white shadow-md bg-slate-800 ${photoShapeClass}`} style={photoSizeStyle || { width: '88px', height: '88px' }}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            </div>
          )}

          {/* Title on Wave */}
          <div className={`absolute top-6 ${showPhoto ? 'left-36' : 'left-8'} right-6 z-10 text-white transition-all`}>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">{mainTitle}</h1>
            <p className="text-sm italic font-medium text-white/90 mt-0.5">{subTitle}</p>
          </div>
        </div>

        {/* Body Content: 2 Columns */}
        <div className="flex-1 px-8 py-2 grid grid-cols-12 gap-8 overflow-hidden z-10">
          {/* Left Column (42%) */}
          <div className="col-span-5 space-y-5 overflow-hidden">
            {/* Présentation */}
            {profilSec?.resume && (
              <div className="space-y-1.5">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Présentation</h2>
                <p className="text-[11px] text-slate-700 leading-relaxed italic text-justify">{profilSec.resume}</p>
              </div>
            )}

            {/* DYNAMIC LEFT COLUMN SECTIONS */}
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "text-sm font-bold text-slate-900 tracking-tight")}
          </div>

          {/* Right Column (58%) */}
          <div className="col-span-7 space-y-5 overflow-hidden">
            {/* DYNAMIC RIGHT COLUMN SECTIONS */}
            {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-sm font-bold text-slate-900 tracking-tight")}
          </div>
        </div>

        {/* Bottom Organic Wave Footer */}
        <div className="relative w-full h-36 shrink-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
            <path d="M0,160 L500,160 L500,40 Q380,120 220,85 Q100,55 0,125 Z" fill={accent} />
          </svg>

          {/* Contacts inside Bottom Wave */}
          <div className="absolute bottom-4 right-8 z-10 text-right text-white space-y-0.5">
            <h3 className="text-base font-bold text-white tracking-wide">Contacts</h3>
            {profilSec?.telephone && <p className="text-[11px] font-medium text-white/95">{profilSec.telephone}</p>}
            {profilSec?.email && <p className="text-[11px] font-medium text-white/95">{profilSec.email}</p>}
            {profilSec?.adresse && <p className="text-[10px] text-white/80">{profilSec.adresse}</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 6: BLEU ROI INTÉRIMAIRE (ASSISTANT ADMIN - PHOTO 2)
   * ================================================================== */
  if (layoutType === 'interimaire-royal-blue' || cv.templateId === 'modele-6') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex flex-col ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}

        {/* Top Header Royal Blue Banner */}
        <div className="w-full text-white p-6 flex gap-6 items-center shrink-0 border-b-4 border-blue-400" style={{ backgroundColor: accent }}>
          {showPhoto && (
            <div className={`overflow-hidden border-2 border-white shadow-md bg-slate-800 shrink-0 ${photoShapeClass}`} style={photoSizeStyle || { width: '96px', height: '96px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
          <div className="space-y-1 overflow-hidden">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">{mainTitle}</h1>
            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest">{subTitle}</p>
            {profilSec?.resume && (
              <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-3 pt-1">{profilSec.resume}</p>
            )}
          </div>
        </div>

        {/* Body 2 Columns */}
        <div className="flex flex-1 p-6 gap-6 overflow-hidden">
          {/* Left Main Column */}
          <div className="w-[62%] space-y-6">
            {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-xs font-extrabold uppercase tracking-wider text-[#1D3557] border-b-2 border-[#1D3557] pb-1")}
          </div>

          {/* Right Sidebar */}
          <div className="w-[38%] bg-blue-50/70 p-4 rounded-xl space-y-5 border border-blue-100 text-slate-800 shrink-0">
            {/* CONTACT */}
            <div className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1D3557] border-b border-blue-200 pb-1">CONTACT</h2>
              <div className="space-y-1.5 text-[11px] text-slate-700">
                {profilSec?.email && <p className="truncate">✉️ {profilSec.email}</p>}
                {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
                {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
                {profilSec?.linkedin && <p className="truncate">🔗 {profilSec.linkedin}</p>}
              </div>
            </div>

            {/* DYNAMIC RIGHT SIDEBAR SECTIONS */}
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "text-xs font-extrabold uppercase tracking-wider text-[#1D3557] border-b border-blue-200 pb-1")}
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 7: CÉLIA NAUDIN (BEIGE ARCH & ÉTOILES - PHOTO 3)
   * ================================================================== */
  if (layoutType === 'celia-beige-arch' || cv.templateId === 'modele-7') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", "Playfair Display", Georgia, serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}

        {/* Left Column (Warm Sand Beige) */}
        <div className="w-[36%] bg-[#E8DED1] p-6 space-y-6 text-slate-800 shrink-0 flex flex-col items-center text-center border-r border-[#D8C3A5]">
          {/* Arch Photo Frame */}
          {showPhoto && (
            <div className={`bg-[#D8C3A5] overflow-hidden p-1 shadow-md ${photoShapeClass}`} style={photoSizeStyle || { width: '112px', height: '144px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}

          {/* CONTACT */}
          <div className="w-full space-y-2 font-sans text-xs">
            <h2 className="font-serif font-bold text-sm text-[#5C4033] border-b border-[#C8B295] pb-1">Contact</h2>
            {profilSec?.email && <p className="truncate text-[11px] text-slate-700">✉️ {profilSec.email}</p>}
            {profilSec?.telephone && <p className="text-[11px] text-slate-700">📞 {profilSec.telephone}</p>}
            {profilSec?.adresse && <p className="text-[11px] text-slate-700">📍 {profilSec.adresse}</p>}
          </div>

          {/* DYNAMIC LEFT COLUMN SECTIONS */}
          {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "font-serif font-bold text-sm text-[#5C4033] border-b border-[#C8B295] pb-1")}
        </div>

        {/* Right Main Column (White) */}
        <div className="w-[64%] p-8 space-y-6 bg-white overflow-hidden">
          {/* Header */}
          <div className="border-b-2 border-[#D8C3A5] pb-3">
            <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight">{mainTitle}</h1>
            <p className="text-sm font-serif text-[#A0522D] italic mt-0.5">{subTitle}</p>
            {profilSec?.resume && (
              <p className="text-xs text-slate-600 font-sans leading-relaxed pt-2 italic">{profilSec.resume}</p>
            )}
          </div>

          {/* DYNAMIC RIGHT MAIN COLUMN SECTIONS */}
          {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5 border-b pb-1")}
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 8: MICHAEL JOHNSON (HEXAGONE & ORANGE - PHOTO 4)
   * ================================================================== */
  if (layoutType === 'michael-hexagon-navy' || cv.templateId === 'modele-8') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}

        {/* Left Dark Navy Column */}
        <div className="w-[36%] bg-[#1B2A4A] text-white p-6 flex flex-col items-center space-y-6 shrink-0">
          {/* Hexagon Photo Frame */}
          {showPhoto && (
            <div className={`bg-[#F4A261] p-1 my-2 flex items-center justify-center shadow-lg overflow-hidden ${photoShapeClass}`} style={photoSizeStyle || { width: '112px', height: '112px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}

          {/* ABOUT ME */}
          {profilSec?.resume && (
            <div className="w-full space-y-2 text-xs">
              <h2 className="font-bold text-sm text-[#F4A261] uppercase tracking-wider border-b border-white/20 pb-1">ABOUT ME</h2>
              <p className="text-[11px] text-slate-300 leading-relaxed">{profilSec.resume}</p>
            </div>
          )}

          {/* CONTACT */}
          <div className="w-full space-y-2 text-xs">
            <h2 className="font-bold text-sm text-[#F4A261] uppercase tracking-wider border-b border-white/20 pb-1">CONTACT ME</h2>
            {profilSec?.telephone && <p className="text-[11px] text-slate-300">📞 {profilSec.telephone}</p>}
            {profilSec?.email && <p className="text-[11px] text-slate-300 truncate">✉️ {profilSec.email}</p>}
            {profilSec?.adresse && <p className="text-[11px] text-slate-300">📍 {profilSec.adresse}</p>}
          </div>

          {/* DYNAMIC LEFT COLUMN SECTIONS */}
          {renderDynamicSectionGroup(getSectionsForColumn('gauche'), true, "font-bold text-sm text-[#F4A261] uppercase tracking-wider border-b border-white/20 pb-1")}
        </div>

        {/* Right Main Column */}
        <div className="w-[64%] p-8 space-y-6 bg-white overflow-hidden">
          {/* Header Title */}
          <div className="border-b-4 border-[#1B2A4A] pb-3">
            <h1 className="text-3xl font-black text-[#1B2A4A] uppercase tracking-tight leading-none">{mainTitle}</h1>
            <span className="inline-block bg-[#F4A261] text-white font-bold text-xs uppercase px-3 py-1 rounded-sm mt-2">
              {subTitle}
            </span>
          </div>

          {/* DYNAMIC RIGHT MAIN COLUMN SECTIONS */}
          {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-sm font-black text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2 border-b pb-1")}
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 9: SLATE EXECUTIVE (BABACAR NDIAYE)
   * ================================================================== */
  if (layoutType === 'slate-executive' || cv.templateId === 'modele-9') {
    return (
      <div
        id={id}
        className={`bg-[#F8FAFC] text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-200 relative select-none flex flex-col ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}

        {/* Top Header Slate */}
        <div className="bg-[#2D3748] text-white p-8 flex justify-between items-center border-b-4 border-amber-500 shrink-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{mainTitle}</h1>
            <p className="text-base font-bold text-amber-400 tracking-wide uppercase">{subTitle}</p>
            <div className="text-xs text-slate-300 flex flex-wrap gap-4 pt-2">
              {profilSec?.email && <span>✉️ {profilSec.email}</span>}
              {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
              {profilSec?.adresse && <span>📍 {profilSec.adresse}</span>}
            </div>
          </div>
          {showPhoto && (
            <div className={`border-4 border-amber-500 overflow-hidden shadow-lg bg-slate-700 shrink-0 ${photoShapeClass}`} style={photoSizeStyle || { width: '96px', height: '96px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-8 space-y-6 flex-1 overflow-hidden">
          {profilSec?.resume && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2D3748]">PROFIL EXÉCUTIF</h2>
              <p className="text-xs text-slate-700 leading-relaxed italic">{profilSec.resume}</p>
            </div>
          )}

          {/* 2 Columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left */}
            <div className="space-y-6">
              {experienceSec.map((sec, idx) => (
                <div key={sec.id} className="space-y-3 relative group">
                  {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2D3748] border-b-2 border-amber-500 pb-1">{sec.titre}</h2>
                  <div className="space-y-3">
                    {(sec.contenu as ExperienceItem[])?.map(exp => (
                      <div key={exp.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs">
                        <p className="font-bold text-slate-900">{exp.poste}</p>
                        <p className="text-[11px] font-semibold text-amber-600">{exp.entreprise} | {exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right */}
            <div className="space-y-6">
              {formationSec.map((sec, idx) => (
                <div key={sec.id} className="space-y-3 relative group">
                  {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2D3748] border-b-2 border-amber-500 pb-1">{sec.titre}</h2>
                  <div className="space-y-2">
                    {(sec.contenu as FormationItem[])?.map(edu => (
                      <div key={edu.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-0.5 text-xs">
                        <p className="font-bold text-slate-900">{edu.diplome}</p>
                        <p className="text-[11px] text-slate-600">{edu.etablissement} | {edu.dateDebut} - {edu.dateFin}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {competencesSec.map((sec, idx) => (
                <div key={sec.id} className="space-y-3 relative group">
                  {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2D3748] border-b-2 border-amber-500 pb-1">{sec.titre}</h2>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2 text-xs">
                    {(sec.contenu as CompetenceItem[])?.map(sk => (
                      <div key={sk.id} className="flex justify-between items-center font-bold text-slate-800">
                        <span>{sk.nom}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={`w-2 h-2 rounded-full ${star <= (sk.niveau || 4) ? 'bg-amber-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 10: MINIMAL STUDIO BLACK (NOEL TAYLOR)
   * ================================================================== */
  if (layoutType === 'minimal-studio-black' || cv.templateId === 'modele-10') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-900 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", "Poppins", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}

        {/* Left Vertical Black Accent */}
        <div className="w-3 bg-[#1A202C] shrink-0" />

        {/* Main Body */}
        <div className="flex-1 p-8 space-y-6 flex flex-col justify-between overflow-hidden">
          {/* Top Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="space-y-1 max-w-[70%]">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{mainTitle}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest pt-1">{subTitle}</p>
              <div className="text-xs text-slate-600 flex flex-wrap gap-3 pt-2 font-medium">
                {profilSec?.email && <span>✉️ {profilSec.email}</span>}
                {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
                {profilSec?.adresse && <span>📍 {profilSec.adresse}</span>}
              </div>
            </div>
            {showPhoto && (
              <div className={`border-2 border-slate-900 overflow-hidden shadow-sm bg-slate-800 shrink-0 ${photoShapeClass}`} style={photoSizeStyle || { width: '80px', height: '80px' }}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            )}
          </div>

          {/* Profile */}
          {profilSec?.resume && (
            <div className="space-y-1">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">PROFIL</h2>
              <p className="text-xs text-slate-700 leading-relaxed italic">{profilSec.resume}</p>
            </div>
          )}

          {/* 2 Columns */}
          <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
            {/* Main Left */}
            <div className="col-span-8 space-y-5">
              {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-xs font-black uppercase tracking-widest border-b border-slate-300 pb-1 text-slate-900")}
            </div>

            {/* Right Sidebar */}
            <div className="col-span-4 space-y-5 border-l border-slate-200 pl-4">
              {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "text-xs font-black uppercase tracking-widest border-b border-slate-300 pb-1 text-slate-900")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 11: BORDEAUX ROYAL & LISERÉ DORÉ
   * ================================================================== */
  if (layoutType === 'bordeaux-gold-luxury' || cv.templateId === 'modele-11') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-900 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border-2 border-[#D4AF37] relative select-none flex flex-col ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", Georgia, serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        <div className="bg-[#800020] text-white p-8 flex justify-between items-center border-b-4 border-[#D4AF37]">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-extrabold text-[#F3E5AB] tracking-wide">{mainTitle}</h1>
            <p className="text-sm font-serif italic text-white/90">{subTitle}</p>
            <div className="text-xs text-[#F3E5AB]/90 flex flex-wrap gap-4 pt-2 font-sans">
              {profilSec?.email && <span>✉️ {profilSec.email}</span>}
              {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
              {profilSec?.adresse && <span>📍 {profilSec.adresse}</span>}
            </div>
          </div>
          {showPhoto && (
            <div className={`border-4 border-[#D4AF37] overflow-hidden shadow-lg bg-slate-800 shrink-0 ${photoShapeClass}`} style={photoSizeStyle || { width: '96px', height: '96px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
        </div>
        <div className="p-8 space-y-6 flex-1 overflow-hidden font-serif">
          {profilSec?.resume && (
            <p className="text-xs text-slate-700 leading-relaxed italic border-l-2 border-[#800020] pl-3">{profilSec.resume}</p>
          )}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-5">
              {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-xs font-bold uppercase tracking-wider text-[#800020] border-b border-[#D4AF37] pb-1")}
            </div>
            <div className="space-y-5">
              {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "text-xs font-bold uppercase tracking-wider text-[#800020] border-b border-[#D4AF37] pb-1")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 12: VERT ÉMERAUDE TECH & CONSULTING
   * ================================================================== */
  if (layoutType === 'emerald-rounded-tech' || cv.templateId === 'modele-12') {
    return (
      <div
        id={id}
        className={`bg-[#F0FDF4] text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-emerald-200 relative select-none flex flex-col p-8 space-y-6 ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", Arial, sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        <div className="bg-[#064E3B] text-white p-6 rounded-2xl flex justify-between items-center shadow-md">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{mainTitle}</h1>
            <p className="text-sm font-semibold text-emerald-200">{subTitle}</p>
            <div className="text-xs text-emerald-100 flex flex-wrap gap-3 pt-2">
              {profilSec?.email && <span>✉️ {profilSec.email}</span>}
              {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
              {profilSec?.adresse && <span>📍 {profilSec.adresse}</span>}
            </div>
          </div>
          {showPhoto && (
            <div className={`border-2 border-white overflow-hidden shadow-md shrink-0 ${photoShapeClass}`} style={photoSizeStyle || { width: '80px', height: '80px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
          <div className="col-span-8 space-y-5">
            {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-xs font-bold uppercase tracking-wider text-[#064E3B] border-b-2 border-[#064E3B] pb-1")}
          </div>
          <div className="col-span-4 space-y-5">
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "text-xs font-bold uppercase tracking-wider text-[#064E3B] border-b-2 border-[#064E3B] pb-1")}
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 13: TERRACOTTA GÉOMÉTRIE & BRANDING
   * ================================================================== */
  if (layoutType === 'terracotta-creative' || cv.templateId === 'modele-13') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-900 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-orange-200 relative select-none flex flex-col ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", Montserrat, sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {renderInteractiveToolbar()}
        <div className="bg-[#C2410C] text-white p-8 flex justify-between items-center border-b-4 border-amber-400">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">{mainTitle}</h1>
            <p className="text-sm font-bold text-orange-200">{subTitle}</p>
            <div className="text-xs text-orange-100 flex flex-wrap gap-4 pt-2">
              {profilSec?.email && <span>✉️ {profilSec.email}</span>}
              {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
            </div>
          </div>
          {showPhoto && (
            <div className={`border-2 border-white overflow-hidden shadow-lg shrink-0 ${photoShapeClass}`} style={photoSizeStyle || { width: '88px', height: '88px' }}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
        </div>
        <div className="p-8 space-y-6 flex-1 overflow-hidden">
          {profilSec?.resume && (
            <p className="text-xs text-slate-700 leading-relaxed italic border-l-4 border-[#C2410C] pl-3">{profilSec.resume}</p>
          )}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-5">
              {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-xs font-black uppercase tracking-wider text-[#C2410C] border-b pb-1")}
            </div>
            <div className="col-span-4 space-y-5">
              {renderDynamicSectionGroup(getSectionsForColumn('gauche'), false, "text-xs font-black uppercase tracking-wider text-[#C2410C] border-b pb-1")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 16: CHARLES SARTRÉ — TEAL EXECUTIVE
   * ================================================================== */
  if (layoutType === 'sartre-teal-executive' || cv.templateId === 'modele-16') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {/* Left Teal Sidebar */}
        <div className="w-[38%] bg-[#237A62] text-white p-6 space-y-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-5">
            {showPhoto && (
              <div className="w-24 h-24 bg-white/20 p-1 border-2 border-white/40 overflow-hidden shadow-lg mx-auto" style={photoSizeStyle}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            )}
            <div className="text-center">
              <h1 className="text-xl font-bold uppercase tracking-tight text-white">{mainTitle}</h1>
              <p className="text-xs text-teal-200 uppercase font-semibold mt-0.5">{subTitle}</p>
            </div>
            <div className="space-y-2 text-[11px] text-teal-100 border-t border-teal-500/50 pt-3">
              {profilSec?.email && <p className="truncate">✉️ {profilSec.email}</p>}
              {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
              {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
            </div>
            {renderDynamicSectionGroup(getSectionsForColumn('gauche'), true, "text-xs font-bold uppercase tracking-wider text-teal-200 border-t border-teal-500/50 pt-3")}
          </div>
        </div>

        {/* Right White Main */}
        <div className="w-[62%] p-8 space-y-6 bg-white overflow-hidden">
          {profilSec?.resume && (
            <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-[#237A62] pl-3">{profilSec.resume}</p>
          )}
          {renderDynamicSectionGroup(getSectionsForColumn('principale'), false, "text-xs font-black uppercase tracking-wider text-[#237A62] border-b-2 border-[#237A62] pb-1")}
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 17: THOMAS DURANT — NAVY ARCH & CURVE
   * ================================================================== */
  if (layoutType === 'durant-navy-arch' || cv.templateId === 'modele-17') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {/* Left Dark Navy Column */}
        <div className="w-[36%] bg-[#1E293B] text-white p-6 space-y-6 shrink-0 flex flex-col justify-between rounded-tr-3xl">
          <div className="space-y-6">
            {showPhoto && (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mx-auto bg-slate-700" style={photoSizeStyle}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            )}
            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-700 pt-4">
              <h2 className="font-bold text-white uppercase text-xs tracking-wider">CONTACT</h2>
              {profilSec?.email && <p className="truncate">✉️ {profilSec.email}</p>}
              {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
              {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
            </div>
            {competencesSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-2 border-t border-slate-700 pt-4 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="font-bold text-white uppercase text-xs tracking-wider">{sec.titre}</h2>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {(sec.contenu as CompetenceItem[])?.map(sk => (
                    <div key={sk.id} className="flex justify-between items-center">
                      <span>{sk.nom}</span>
                      <span className="text-[10px] text-blue-300 font-mono">{sk.niveau ? `${sk.niveau}/5` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[64%] p-8 space-y-6 bg-white overflow-hidden">
          <div className="border-b-2 border-blue-900 pb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{mainTitle}</h1>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-0.5">{subTitle}</p>
          </div>
          {profilSec?.resume && <p className="text-xs text-slate-600 leading-relaxed italic">{profilSec.resume}</p>}
          {experienceSec.map((sec, idx) => (
            <div key={sec.id} className="space-y-3 relative group">
              {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b pb-1">{sec.titre}</h2>
              <div className="space-y-3 text-xs">
                {(sec.contenu as ExperienceItem[])?.map(exp => (
                  <div key={exp.id} className="space-y-0.5">
                    <p className="font-bold text-slate-900">{exp.poste}</p>
                    <p className="text-[11px] font-semibold text-blue-600">{exp.entreprise} ({exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin})</p>
                    <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {formationSec.map((sec, idx) => (
            <div key={sec.id} className="space-y-2 relative group">
              {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b pb-1">{sec.titre}</h2>
              <div className="space-y-2 text-xs">
                {(sec.contenu as FormationItem[])?.map(edu => (
                  <div key={edu.id}>
                    <p className="font-bold text-slate-900">{edu.diplome}</p>
                    <p className="text-[11px] text-slate-500">{edu.etablissement} ({edu.dateDebut} - {edu.dateFin})</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 18: SLATE GOLD BANNERS
   * ================================================================== */
  if (layoutType === 'slate-gold-banners' || cv.templateId === 'modele-18') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {/* Left Dark Column */}
        <div className="w-[36%] bg-[#3A4750] text-white p-6 space-y-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            {showPhoto && (
              <div className="w-24 h-24 rounded-full border-2 border-[#F59E0B] overflow-hidden mx-auto shadow-md" style={photoSizeStyle}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            )}
            <div className="space-y-2 text-xs text-slate-200">
              <span className="bg-[#F59E0B] text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase">Contact</span>
              {profilSec?.email && <p className="truncate pt-1">✉️ {profilSec.email}</p>}
              {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
              {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
            </div>
          </div>
        </div>

        {/* Right Main Column */}
        <div className="w-[64%] p-8 space-y-6 bg-white overflow-hidden">
          <div className="border-b-2 border-slate-900 pb-3">
            <h1 className="text-2xl font-black text-slate-900 uppercase">{mainTitle}</h1>
            <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider mt-0.5">{subTitle}</p>
          </div>
          {profilSec?.resume && <p className="text-xs text-slate-600 italic leading-relaxed">{profilSec.resume}</p>}
          {experienceSec.map((sec, idx) => (
            <div key={sec.id} className="space-y-3 relative group">
              {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
              <div className="bg-[#FEF3C7] text-[#92400E] font-bold text-xs px-3 py-1 rounded inline-block uppercase tracking-wider">
                {sec.titre}
              </div>
              <div className="space-y-3 text-xs pl-1">
                {(sec.contenu as ExperienceItem[])?.map(exp => (
                  <div key={exp.id} className="space-y-0.5">
                    <p className="font-bold text-slate-900">{exp.poste}</p>
                    <p className="text-[11px] font-semibold text-[#D97706]">{exp.entreprise} ({exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin})</p>
                    <p className="text-[11px] text-slate-600 whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {formationSec.map((sec, idx) => (
            <div key={sec.id} className="space-y-2 relative group">
              {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
              <div className="bg-[#FEF3C7] text-[#92400E] font-bold text-xs px-3 py-1 rounded inline-block uppercase tracking-wider">
                {sec.titre}
              </div>
              <div className="space-y-2 text-xs pl-1">
                {(sec.contenu as FormationItem[])?.map(edu => (
                  <div key={edu.id}>
                    <p className="font-bold text-slate-900">{edu.diplome}</p>
                    <p className="text-[11px] text-slate-500">{edu.etablissement} ({edu.dateDebut} - {edu.dateFin})</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 19: ROYAL BLUE BANNER GRID
   * ================================================================== */
  if (layoutType === 'royal-blue-banner-grid' || cv.templateId === 'modele-19') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex flex-col ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {/* Top Header Banner */}
        <div className="bg-[#1E3A8A] text-white p-6 flex justify-between items-center border-b-4 border-amber-400">
          <div className="flex items-center gap-4">
            {showPhoto && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-slate-800 shrink-0" style={photoSizeStyle}>
                <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">{mainTitle}</h1>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mt-0.5">{subTitle}</p>
              <div className="text-[11px] text-blue-200 flex flex-wrap gap-3 pt-2">
                {profilSec?.email && <span>✉️ {profilSec.email}</span>}
                {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 2 Column Body */}
        <div className="flex flex-1 overflow-hidden p-6 gap-6">
          <div className="w-[62%] space-y-6">
            {experienceSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-3 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1">{sec.titre}</h2>
                <div className="space-y-3 text-xs">
                  {(sec.contenu as ExperienceItem[])?.map(exp => (
                    <div key={exp.id} className="space-y-0.5">
                      <p className="font-bold text-slate-900">{exp.poste}</p>
                      <p className="text-[11px] font-semibold text-blue-700">{exp.entreprise} ({exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin})</p>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="w-[38%] bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-5">
            {formationSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-2 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1E3A8A] border-b pb-1">{sec.titre}</h2>
                <div className="space-y-2 text-xs">
                  {(sec.contenu as FormationItem[])?.map(edu => (
                    <div key={edu.id}>
                      <p className="font-bold text-slate-900">{edu.diplome}</p>
                      <p className="text-[11px] text-slate-500">{edu.etablissement}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {competencesSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-2 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1E3A8A] border-b pb-1">{sec.titre}</h2>
                <div className="flex flex-wrap gap-1">
                  {(sec.contenu as CompetenceItem[])?.map(sk => (
                    <span key={sk.id} className="bg-[#1E3A8A] text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs">
                      {sk.nom}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 20: MICHEL MARTIN — GREEN CURVES & DOMAINS
   * ================================================================== */
  if (layoutType === 'michel-green-curves' || cv.templateId === 'modele-20') {
    return (
      <div
        id={id}
        className={`bg-white text-slate-800 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex flex-col p-8 ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {renderWatermarkOverlay()}
        {/* Decorative Green Accent Bar */}
        <div className="absolute top-0 left-0 bottom-0 w-3 bg-[#15803D]" />

        <div className="pl-4 flex justify-between items-start border-b-2 border-emerald-700 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{mainTitle}</h1>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mt-1">{subTitle}</p>
            <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-2">
              {profilSec?.email && <span>✉️ {profilSec.email}</span>}
              {profilSec?.telephone && <span>📞 {profilSec.telephone}</span>}
              {profilSec?.adresse && <span>📍 {profilSec.adresse}</span>}
            </div>
          </div>
          {showPhoto && (
            <div className="w-22 h-22 rounded-xl overflow-hidden border-2 border-emerald-700 shadow-md bg-slate-800 shrink-0" style={photoSizeStyle}>
              <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
            </div>
          )}
        </div>

        <div className="pl-4 pt-6 grid grid-cols-12 gap-6 flex-1 overflow-hidden">
          <div className="col-span-8 space-y-6">
            {experienceSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-3 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="text-xs font-black uppercase tracking-wider text-[#15803D] border-b pb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#15803D] rounded-full" />
                  {sec.titre}
                </h2>
                <div className="space-y-3 text-xs pl-2">
                  {(sec.contenu as ExperienceItem[])?.map(exp => (
                    <div key={exp.id} className="space-y-0.5">
                      <p className="font-bold text-slate-900">{exp.poste}</p>
                      <p className="text-[11px] font-semibold text-emerald-700">{exp.entreprise} ({exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin})</p>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-4 space-y-6">
            {formationSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-2 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="text-xs font-black uppercase tracking-wider text-[#15803D] border-b pb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#15803D] rounded-full" />
                  {sec.titre}
                </h2>
                <div className="space-y-2 text-xs pl-2">
                  {(sec.contenu as FormationItem[])?.map(edu => (
                    <div key={edu.id}>
                      <p className="font-bold text-slate-900">{edu.diplome}</p>
                      <p className="text-[11px] text-slate-500">{edu.etablissement}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {competencesSec.map((sec, idx) => (
              <div key={sec.id} className="space-y-2 relative group">
                {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
                <h2 className="text-xs font-black uppercase tracking-wider text-[#15803D] border-b pb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#15803D] rounded-full" />
                  {sec.titre}
                </h2>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {(sec.contenu as CompetenceItem[])?.map(sk => (
                    <span key={sk.id} className="bg-emerald-100 text-[#15803D] font-bold text-[10px] px-2 py-0.5 rounded">
                      {sk.nom} {sk.categorie ? `(${sk.categorie})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==================================================================
   * MODEL 14 & 15 / DEFAULT FALLBACK
   * ================================================================== */
  return (
    <div
      id={id}
      className={`bg-white text-slate-900 w-full aspect-[210/297] shadow-xl rounded-none sm:rounded-lg overflow-hidden border border-slate-300 relative select-none flex ${fontSizeClasses} ${lineHeightClasses} ${letterSpacingClasses}`}
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      {renderWatermarkOverlay()}
      {renderInteractiveToolbar()}
      <div className="w-[36%] text-white p-6 space-y-6 shrink-0 flex flex-col items-center text-center" style={{ backgroundColor: accent }}>
        {showPhoto && (
          <div className={`border-2 border-[#D4AF37] overflow-hidden shadow-lg bg-slate-800 ${photoShapeClass}`} style={photoSizeStyle || { width: '96px', height: '96px' }}>
            <img src={cv.photoUrl} alt="Portrait" className={`w-full h-full object-cover ${photoShapeClass}`} />
          </div>
        )}
        <div className="w-full space-y-2 text-xs text-slate-300">
          {profilSec?.email && <p className="truncate">✉️ {profilSec.email}</p>}
          {profilSec?.telephone && <p>📞 {profilSec.telephone}</p>}
          {profilSec?.adresse && <p>📍 {profilSec.adresse}</p>}
        </div>
      </div>
      <div className="w-[64%] p-8 space-y-6 bg-white overflow-hidden">
        <div className="border-b-2 border-[#0F172A] pb-3">
          <h1 className="text-2xl font-bold text-[#0F172A] uppercase">{mainTitle}</h1>
          <p className="text-xs font-bold text-amber-700 uppercase mt-0.5">{subTitle}</p>
        </div>
        {profilSec?.resume && <p className="text-xs text-slate-600 italic">{profilSec.resume}</p>}
        {experienceSec.map((sec, idx) => (
          <div key={sec.id} className="space-y-2 relative group">
            {renderPreviewSectionControls(sec.id, idx, visibleSections.length)}
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b pb-1">{sec.titre}</h2>
            {(sec.contenu as ExperienceItem[])?.map(exp => (
              <div key={exp.id} className="text-xs">
                <p className="font-bold text-slate-900">{exp.poste}</p>
                <p className="text-[11px] text-amber-700">{exp.entreprise} ({exp.dateDebut} - {exp.actuel ? 'Présent' : exp.dateFin})</p>
                <p className="text-[11px] text-slate-600 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
