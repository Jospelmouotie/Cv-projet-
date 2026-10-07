import { CV, SubscriptionTier } from '../types';
import { isTemplatePaid } from './subscriptionGates';
import { CV_TEMPLATES } from '../data/templates';
import { TEMPLATE_PRESETS } from '../data/templatePresets';
import {
  isFontPaidByAdmin,
  isPatternPaidByAdmin,
  isHeaderStylePaidByAdmin,
  isStudioMenuPaidByAdmin,
  isSubOptionPaidByAdmin,
  isPaymentActive
} from './adminPaidMatrix';

export interface PaidFeatureUsage {
  id: string;
  name: string;
  description: string;
  requiredTier: 'classique' | 'premium';
}

/**
 * Analyzes a CV and detects any features that require a paid subscription (Classique or Premium).
 * Used at export time to block freemium users from exporting CVs with premium features.
 */
export function detectPaidFeaturesInCV(cv: CV, userTier: SubscriptionTier | string = 'freemium'): PaidFeatureUsage[] {
  const norm = (userTier || '').toString().toLowerCase();
  // If payment is disabled by admin, or user has Premium/Classique/Decouverte/Admin, or paid for this CV, all features are unlocked!
  if (!isPaymentActive() || norm === 'premium' || norm === 'admin' || norm === 'classique' || norm === 'decouverte' || cv.statutPaiement === 'PAYE') {
    return [];
  }

  const paidUsages: PaidFeatureUsage[] = [];

  const template = CV_TEMPLATES.find(t => t.id === cv.templateId);
  const preset = cv.templateId ? TEMPLATE_PRESETS[cv.templateId] : undefined;

  // Check if using an admin-created free template
  const isAdminFreeTemplate = template?.badgeText === 'Admin' && template?.requiredTier === 'freemium';

  // 1. Check Template ID (Admin configuration, non-free template, or contains an element marked paid by admin)
  // Skip this check if using an admin-created free template
  if (cv.templateId && isTemplatePaid(cv.templateId) && !isAdminFreeTemplate) {
    paidUsages.push({
      id: 'template_paid',
      name: 'Modèle Pro / Payant',
      description: `Vous utilisez le modèle réservé "${cv.templateId}".`,
      requiredTier: 'classique'
    });
  }

  // If using an admin-created free template, skip all other paid feature checks
  // The template itself is free, so its default features are allowed
  if (isAdminFreeTemplate) {
    return [];
  }

  // 2. Menu & Sub-option checks — generic loop to avoid manual omissions on future menu additions.
  const genericChecks: Array<{
    id: string;
    name: string;
    description: string;
    requiredTier: 'classique' | 'premium';
    condition: () => boolean;
  }> = [
    {
      id: 'template_menu_paid',
      name: 'Disposition / Structure Pro',
      description: 'La personnalisation de la disposition et structure est configurée comme payante.',
      requiredTier: 'classique',
      condition: () => isStudioMenuPaidByAdmin('template') || (cv.nombreColonnes === 1 && isSubOptionPaidByAdmin('template:column_layout', 'template'))
    },
    {
      id: 'font_paid',
      name: 'Typographie Pro',
      description: 'La typographie ou la personnalisation de police est configurée comme payante.',
      requiredTier: 'classique',
      condition: () => {
        const defaultFont = preset?.police || template?.defaultFont || 'Inter';
        const isCustomFont = Boolean(cv.police && cv.police !== defaultFont);
        return (isCustomFont && isFontPaidByAdmin(cv.police)) || isStudioMenuPaidByAdmin('typography');
      }
    },
    {
      id: 'bg_pattern_paid',
      name: 'Motif d\'Arrière-plan Pro',
      description: 'Le motif d\'arrière-plan ou fond studio est configuré comme payant.',
      requiredTier: 'classique',
      condition: () => {
        const defaultPattern = template?.themeConfig?.backgroundPattern || 'none';
        const patternToTest = cv.backgroundPattern || cv.arrierePlanPattern || cv.sidebarBackgroundPattern;
        const isCustomPattern = Boolean(patternToTest && patternToTest !== 'none' && patternToTest !== defaultPattern);
        return (isCustomPattern && isPatternPaidByAdmin(patternToTest)) || isStudioMenuPaidByAdmin('background');
      }
    },
    {
      id: 'decorative_layer_paid',
      name: 'Calque Décoratif VIP',
      description: `Éléments géométriques VIP "${cv.calqueDecoratif || 'calque'}".`,
      requiredTier: 'premium',
      condition: () => Boolean((cv.calqueDecoratif && cv.calqueDecoratif !== 'none' && cv.calqueDecoratif !== 'standard') || isSubOptionPaidByAdmin('background:decorative_layers', 'background'))
    },
    {
      id: 'header_style_paid',
      name: 'Style d\'En-Tête Pro',
      description: `Le style d'en-tête "${cv.styleEnTete || 'en-tête'}" est configuré comme payant.`,
      requiredTier: 'classique',
      condition: () => {
        const defaultHeader = preset?.styleEnTete || template?.themeConfig?.headerStyle || 'banner';
        const isCustomHeader = Boolean(cv.styleEnTete && cv.styleEnTete !== defaultHeader);
        return (isCustomHeader && isHeaderStylePaidByAdmin(cv.styleEnTete)) || isStudioMenuPaidByAdmin('header') || (isCustomHeader && isSubOptionPaidByAdmin(`header:${cv.styleEnTete}`, 'header'));
      }
    },
    {
      id: 'section_headers_paid',
      name: 'Style Titres de Sections Pro',
      description: `Le style de titre de section "${cv.styleEnTeteSection}" est réservé.`,
      requiredTier: 'classique',
      condition: () => {
        const defaultSectionHeader = preset?.styleEnTeteSection || template?.themeConfig?.sectionHeaderStyle || 'underline';
        const isCustomSectionHeader = Boolean(cv.styleEnTeteSection && cv.styleEnTeteSection !== defaultSectionHeader);
        return isCustomSectionHeader && (isStudioMenuPaidByAdmin('sectionHeaders') || isSubOptionPaidByAdmin(`sectionHeaders:${cv.styleEnTeteSection}`, 'sectionHeaders'));
      }
    },
    {
      id: 'sidebar_custom_paid',
      name: 'Personnalisation Sidebar Pro',
      description: 'Les effets avancés de la sidebar sont configurés comme payants.',
      requiredTier: 'classique',
      condition: () => Boolean(cv.couleurFondSidebar || (cv.formeSidebarDecor && cv.formeSidebarDecor !== 'straight') || cv.sidebarBackgroundType === 'gradient') && (isStudioMenuPaidByAdmin('sidebar') || isSubOptionPaidByAdmin('sidebar:shape', 'sidebar') || isSubOptionPaidByAdmin('sidebar:bg_color', 'sidebar'))
    },
    {
      id: 'photo_styling_paid',
      name: 'Cadre & Forme Photo Pro',
      description: `Le style de photo (${cv.photoForme || 'cadre'}) est réservé.`,
      requiredTier: 'classique',
      condition: () => {
        const defaultPhotoShape = preset?.photoForme || template?.themeConfig?.photoFrameStyle || 'ronde';
        const defaultRing = preset?.cadrePhotoRing || 'none';
        const isCustomPhoto = Boolean((cv.photoForme && cv.photoForme !== defaultPhotoShape) || (cv.cadrePhotoRing && cv.cadrePhotoRing !== defaultRing));
        return isCustomPhoto && (isStudioMenuPaidByAdmin('photo') || (cv.cadrePhotoRing && cv.cadrePhotoRing !== 'none' && isSubOptionPaidByAdmin('photo:rings', 'photo')) || isSubOptionPaidByAdmin('photo:shapes', 'photo'));
      }
    },
    {
      id: 'contact_badges_paid',
      name: 'Badges Coordonnées Pro',
      description: `Le style de badge contact "${cv.styleBadgesCoordonnees}" est réservé.`,
      requiredTier: 'classique',
      condition: () => {
        const defaultBadgeStyle = preset?.styleBadgesCoordonnees || 'none';
        return Boolean(cv.styleBadgesCoordonnees && cv.styleBadgesCoordonnees !== defaultBadgeStyle) && (isStudioMenuPaidByAdmin('contactBadges') || isSubOptionPaidByAdmin(`contactBadges:${cv.styleBadgesCoordonnees}`, 'contactBadges'));
      }
    },
    {
      id: 'timeline_paid',
      name: 'Ligne Temporelle (Timeline) Pro',
      description: `L'effet timeline "${cv.timelineStyle}" est réservé.`,
      requiredTier: 'classique',
      condition: () => {
        const defaultTimeline = preset?.timelineStyle || 'none';
        return Boolean(cv.timelineStyle && cv.timelineStyle !== defaultTimeline) && (isStudioMenuPaidByAdmin('timeline') || isSubOptionPaidByAdmin(`timeline:${cv.timelineStyle}`, 'timeline'));
      }
    },
    {
      id: 'bullets_paid',
      name: 'Puces de Listes Pro',
      description: `Le style de puces "${cv.stylePucesListes}" est réservé.`,
      requiredTier: 'classique',
      condition: () => Boolean(cv.stylePucesListes && cv.stylePucesListes !== 'disc') && (isStudioMenuPaidByAdmin('bullets') || isSubOptionPaidByAdmin(`bullets:${cv.stylePucesListes}`, 'bullets'))
    },
    {
      id: 'shadows_paid',
      name: 'Ombre Portée 3D Pro',
      description: 'L\'effet de profondeur est configuré comme payant.',
      requiredTier: 'classique',
      condition: () => Boolean(cv.ombreCarte && cv.ombreCarte !== 'none') && (isStudioMenuPaidByAdmin('shadows') || isSubOptionPaidByAdmin(`shadows:${cv.ombreCarte}`, 'shadows'))
    },
    {
      id: 'titles_case_paid',
      name: 'Casse & Alignement des Titres Pro',
      description: 'La casse et l\'alignement des titres sont configurés comme payants.',
      requiredTier: 'classique',
      condition: () => {
        const defaultCase = template?.themeConfig?.titleCase || 'uppercase';
        const activeCase = cv.casseTitresSection || cv.casseTitreSection || 'uppercase';
        const activeAlign = cv.alignementTitresSection || cv.alignementTitreSection || 'left';
        const caseChanged = activeCase !== defaultCase;
        const alignChanged = activeAlign !== 'left';
        return (caseChanged || alignChanged) && (isStudioMenuPaidByAdmin('titlesCase') || isSubOptionPaidByAdmin('titlesCase:case', 'titlesCase') || isSubOptionPaidByAdmin('titlesCase:alignment', 'titlesCase'));
      }
    },
    {
      id: 'page_calibration_paid',
      name: 'Calibration & Marges Pro',
      description: 'Les marges et espacements de page sont configurés comme payants.',
      requiredTier: 'classique',
      condition: () => {
        const defaultMargin = preset?.pageMarginVal ?? template?.themeConfig?.pageMarginVal ?? 0;
        const marginChanged = typeof cv.margeGlobalePage === 'number' && cv.margeGlobalePage !== defaultMargin;
        const spacingChanged = typeof cv.espacementSections === 'number' && cv.espacementSections !== 0 || typeof cv.espacementElements === 'number' && cv.espacementElements !== 0;
        return (marginChanged || spacingChanged) && (isStudioMenuPaidByAdmin('pageCalibration') || isSubOptionPaidByAdmin('pageCalibration:margin', 'pageCalibration') || isSubOptionPaidByAdmin('pageCalibration:section_gap', 'pageCalibration') || isSubOptionPaidByAdmin('pageCalibration:item_gap', 'pageCalibration'));
      }
    },
    {
      id: 'experiences_paid',
      name: 'Personnalisation des Expériences Pro',
      description: 'Les styles d\'expérience sont configurés comme payants.',
      requiredTier: 'classique',
      condition: () => {
        const customExperience = Boolean(
          cv.styleExperienceLayout && cv.styleExperienceLayout !== 'classic' ||
          cv.alignementDatesExperience && cv.alignementDatesExperience !== 'left' ||
          (cv.sections || []).some((section) => section.type === 'experience' && section.styleSection && Object.values(section.styleSection).some((value) => value !== undefined && value !== null && value !== '' && value !== 'none' && value !== 'classic' && value !== 'left'))
        );
        return customExperience && (isStudioMenuPaidByAdmin('experiences') || isSubOptionPaidByAdmin('experiences:dates_alignment', 'experiences') || isSubOptionPaidByAdmin('experiences:company_style', 'experiences'));
      }
    },
    {
      id: 'formations_paid',
      name: 'Personnalisation des Formations Pro',
      description: 'Les styles de formations sont configurés comme payants.',
      requiredTier: 'classique',
      condition: () => {
        const customFormation = Boolean(
          cv.styleFormationLayout && cv.styleFormationLayout !== 'classic' ||
          cv.alignementDatesFormation && cv.alignementDatesFormation !== 'left' ||
          (cv.sections || []).some((section) => section.type === 'formation' && section.styleSection && Object.values(section.styleSection).some((value) => value !== undefined && value !== null && value !== '' && value !== 'none' && value !== 'classic' && value !== 'left'))
        );
        return customFormation && (isStudioMenuPaidByAdmin('formations') || isSubOptionPaidByAdmin('formations:dates_alignment', 'formations') || isSubOptionPaidByAdmin('formations:diploma_style', 'formations'));
      }
    },
    {
      id: 'skills_format_paid',
      name: 'Format Compétences Pro',
      description: `Le format de compétences "${cv.styleCompetences}" est réservé.`,
      requiredTier: 'classique',
      condition: () => {
        const defaultSkillsMode = preset?.styleCompetences || template?.themeConfig?.skillsDisplayMode || 'badges';
        return Boolean(cv.styleCompetences && cv.styleCompetences !== defaultSkillsMode) && (isStudioMenuPaidByAdmin('skills') || isSubOptionPaidByAdmin(`skills:${cv.styleCompetences}`, 'skills'));
      }
    },
    {
      id: 'individual_section_paid',
      name: 'Style Individuel par Section Pro',
      description: 'La personnalisation individuelle par section est configurée comme payante.',
      requiredTier: 'classique',
      condition: () => {
        const hasCustomSectionStyle = (cv.sections || []).some((section) => section.styleSection && Object.keys(section.styleSection).length > 0 && Object.values(section.styleSection).some((value) => Boolean(value)));
        return hasCustomSectionStyle && isStudioMenuPaidByAdmin('individualSection');
      }
    }
  ];

  for (const check of genericChecks) {
    if (check.condition()) {
      paidUsages.push(check);
    }
  }

  return paidUsages;
}

