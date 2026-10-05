import React from 'react';
import { CV, Section, CVTemplate } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { TEMPLATE_PRESETS } from '../data/templatePresets';

/**
 * Shared helper to generate CSS style objects for background types (solid, gradient, pattern, image)
 */
export function getBackgroundStyle(
  type?: 'solid' | 'gradient' | 'pattern' | 'image',
  colorSolid?: string,
  opacity: number = 1,
  colorStart?: string,
  colorEnd?: string,
  patternName?: string,
  imageUrl?: string
): React.CSSProperties {
  const baseOpacity = typeof opacity === 'number' ? opacity : 1;

  if (type === 'gradient' && colorStart && colorEnd) {
    return {
      background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`,
      opacity: baseOpacity,
    };
  }

  if (type === 'pattern') {
    let patternSvg = '';
    const mainColor = colorSolid || '#000000';
    const encodedColor = encodeURIComponent(mainColor);

    switch (patternName) {
      case 'dots':
        patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="2" fill="${encodedColor}" fill-opacity="0.15"/></svg>`;
        break;
      case 'stripes':
        patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><line x1="0" y1="20" x2="20" y2="0" stroke="${encodedColor}" stroke-opacity="0.15" stroke-width="2"/></svg>`;
        break;
      case 'grid':
        patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="${encodedColor}" stroke-opacity="0.12" stroke-width="1"/></svg>`;
        break;
      case 'mesh':
        patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><path d="M0 15 Q15 0 30 15 Q15 30 0 15" fill="none" stroke="${encodedColor}" stroke-opacity="0.15" stroke-width="1.5"/></svg>`;
        break;
      case 'waves':
        patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="${encodedColor}" stroke-opacity="0.15" stroke-width="1.5"/></svg>`;
        break;
      default:
        patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="1.5" fill="${encodedColor}" fill-opacity="0.12"/></svg>`;
    }

    return {
      backgroundColor: colorSolid || '#ffffff',
      backgroundImage: `url("${patternSvg}")`,
      backgroundRepeat: 'repeat',
      opacity: baseOpacity,
    };
  }

  if (type === 'image' && imageUrl) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: baseOpacity,
    };
  }

  // Fallback to solid color
  if (colorSolid) {
    return {
      backgroundColor: colorSolid,
      opacity: baseOpacity,
    };
  }

  return { opacity: baseOpacity };
}

/**
 * Losslessly remaps a CV to a new target template without losing any user data or text.
 */
export function remapContentToTemplate(cv: CV, targetTemplate: CVTemplate): CV {
  const newTemplateId = targetTemplate.id;
  const preset = TEMPLATE_PRESETS[newTemplateId] || TEMPLATE_PRESETS['modele-1'];
  const presetSections = preset?.sections || [];

  const isTargetTwoColumn = targetTemplate.layoutFamily === 'two-column-left' || targetTemplate.layoutFamily === 'two-column-right';
  const targetCols: 1 | 2 = isTargetTwoColumn ? 2 : 1;
  const targetSidePosition: 'gauche' | 'droite' = targetTemplate.layoutFamily === 'two-column-right' ? 'droite' : 'gauche';

  // If source CV sections are completely empty or missing, seed directly from target preset
  const sourceSections = (cv.sections && cv.sections.length > 0)
    ? cv.sections
    : JSON.parse(JSON.stringify(presetSections));

  // Smart section column reassignment preserving all items and custom text
  const updatedSections: Section[] = sourceSections.map((sec: Section) => {
    let newCol = sec.colonne;
    if (targetCols === 1) {
      newCol = 'principale';
    } else {
      if (['competences', 'langues', 'profil', 'interets', 'coordonnees', 'qualites', 'references', 'certifications'].includes(sec.type) || (sec.type === 'personnalisee' && !sec.titre?.toLowerCase().includes('projet') && !sec.titre?.toLowerCase().includes('exp'))) {
        newCol = 'gauche';
      } else {
        newCol = 'droite';
      }
    }

    // If section content was empty, populate from target preset
    let finalContenu = sec.contenu;
    const matchingPresetSec = presetSections.find(ps => ps.type === sec.type);
    if (matchingPresetSec) {
      const isEmpty = !finalContenu ||
        (Array.isArray(finalContenu) && finalContenu.length === 0) ||
        (typeof finalContenu === 'object' && Object.keys(finalContenu).length === 0) ||
        (sec.type === 'profil' && !finalContenu.nomComplet && !finalContenu.resume);
      if (isEmpty) {
        finalContenu = JSON.parse(JSON.stringify(matchingPresetSec.contenu));
      }
    }

    return {
      ...sec,
      colonne: newCol,
      contenu: finalContenu
    };
  });

  // Ensure all 5 core sections exist (profil, experience, formation, competences, projets)
  const coreTypes: Array<Section['type']> = ['profil', 'experience', 'formation', 'competences', 'projets'];
  for (const cType of coreTypes) {
    if (!updatedSections.some(s => s.type === cType)) {
      const pSec = presetSections.find(ps => ps.type === cType);
      if (pSec) {
        updatedSections.push(JSON.parse(JSON.stringify(pSec)));
      }
    }
  }

  return {
    ...cv,
    templateId: newTemplateId,
    couleurAccent: preset?.couleurAccent || targetTemplate.defaultAccent || targetTemplate.themeConfig?.primaryColor || '#0284C7',
    couleurAccentSecondaire: preset?.couleurAccentSecondaire || targetTemplate.defaultSecondaryAccent || targetTemplate.themeConfig?.secondaryColor || '#0EA5E9',
    couleurFondSidebar: preset?.couleurFondSidebar || targetTemplate.themeConfig?.sidebarBackgroundColor || (targetCols === 2 ? '#F8FAFC' : '#FFFFFF'),
    couleurFond: preset?.couleurFond || targetTemplate.themeConfig?.backgroundColor || '#FFFFFF',
    couleurFondProfil: preset?.couleurFondProfil || targetTemplate.themeConfig?.headerBackgroundColor || preset?.couleurAccent || targetTemplate.defaultAccent || '#0284C7',
    couleurTexteProfil: preset?.couleurTexteProfil || targetTemplate.themeConfig?.headerTextColor || '#FFFFFF',
    couleurTitreSection: preset?.couleurTitreSection || targetTemplate.themeConfig?.headingColor || preset?.couleurAccent || targetTemplate.defaultAccent || '#0284C7',
    couleurTexte: preset?.couleurTexte || targetTemplate.themeConfig?.textColor || '#1E293B',
    couleurTexteSidebar: preset?.couleurTexteSidebar || targetTemplate.themeConfig?.sidebarTextColor || '#334155',
    couleurTitrePrincipal: preset?.couleurTitrePrincipal || undefined,
    couleurSousTitrePrincipal: preset?.couleurSousTitrePrincipal || undefined,
    police: preset?.police || targetTemplate.defaultFont || cv.police,
    nombreColonnes: targetCols,
    positionSidebar: targetSidePosition,
    largeurColonneGauche: preset?.largeurColonneGauche ?? cv.largeurColonneGauche ?? 32,
    styleEnTete: (preset?.styleEnTete || targetTemplate.themeConfig?.headerStyle || 'banner') as any,
    styleEnTeteSection: (preset?.styleEnTeteSection || targetTemplate.themeConfig?.sectionHeaderStyle || 'underline') as any,
    styleCompetences: (preset?.styleCompetences || targetTemplate.themeConfig?.skillsDisplayMode || 'badges') as any,
    photoForme: (preset?.photoForme || targetTemplate.themeConfig?.photoFrameStyle || 'ronde') as any,
    formePhoto: (preset?.photoForme || targetTemplate.themeConfig?.photoFrameStyle || 'ronde') as any,
    photoPosition: preset?.photoPosition || (preset?.styleEnTete === 'sidebar-top' ? 'in-sidebar' : 'in-header'),
    formeSidebarDecor: (preset?.formeSidebarDecor || targetTemplate.themeConfig?.formeSidebarDecor || 'straight') as any,
    timelineStyle: (preset?.timelineStyle || targetTemplate.themeConfig?.timelineStyle || 'none') as any,
    cadrePhotoRing: (preset?.cadrePhotoRing || targetTemplate.themeConfig?.cadrePhotoRing || 'none') as any,
    styleBadgesCoordonnees: preset?.styleBadgesCoordonnees || 'none',
    decorativeLayers: preset?.decorativeLayers || targetTemplate.themeConfig?.decorativeLayers || [],
    backgroundPattern: targetTemplate.themeConfig?.backgroundPattern || preset?.arrierePlanPattern || 'none',
    arrierePlanPattern: preset?.arrierePlanPattern || targetTemplate.themeConfig?.backgroundPattern || 'none',
    alignementDatesExperience: (preset?.alignementDatesExperience || targetTemplate.themeConfig?.experienceDatesAlignment || 'left') as any,
    sections: updatedSections,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Universal safe template switcher that accepts either a CVTemplate object or a templateId string,
 * strictly keeping all profile info, contact details, photos, and section content intact.
 */
export function switchTemplateSafely(cv: CV, templateOrId: CVTemplate | string): CV {
  if (typeof templateOrId === 'string') {
    const tmplObj = CV_TEMPLATES.find((t) => t.id === templateOrId) || {
      id: templateOrId,
      name: `Modèle ${templateOrId}`,
      category: 'moderne',
      description: { fr: '', en: '' },
      layoutType: 'standard',
      layoutFamily: 'two-column-left',
      defaultAccent: '#2563EB',
      defaultSecondaryAccent: '#93C5FD',
      defaultFont: 'Inter'
    };
    return remapContentToTemplate(cv, tmplObj as CVTemplate);
  }
  return remapContentToTemplate(cv, templateOrId);
}

/**
 * Reversibly toggles layout between 1 column and 2 columns without losing data.
 */
export function toggleColumnLayout(cv: CV, targetLayout: 1 | 2): CV {
  const updatedSections: Section[] = (cv.sections || []).map((sec, idx) => {
    if (targetLayout === 1) {
      return { ...sec, colonne: 'principale', ordre: idx + 1 };
    } else {
      // 2 columns mapping
      if (['competences', 'langues', 'profil', 'interets', 'coordonnees', 'references'].includes(sec.type) || (sec.type === 'certifications' && !sec.titre?.toLowerCase().includes('diplôme'))) {
        return { ...sec, colonne: 'gauche' };
      } else {
        return { ...sec, colonne: 'droite' };
      }
    }
  });

  return {
    ...cv,
    nombreColonnes: targetLayout,
    largeurColonneGauche: cv.largeurColonneGauche || 34,
    positionSidebar: cv.positionSidebar || 'gauche',
    sections: updatedSections,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Toggles sidebar position between left ('gauche') and right ('droite')
 */
export function toggleSidebarPosition(cv: CV, position: 'gauche' | 'droite'): CV {
  return {
    ...cv,
    positionSidebar: position,
    updatedAt: new Date().toISOString(),
  };
}

