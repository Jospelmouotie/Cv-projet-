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

  // 1. Check Template ID (Admin configuration, non-free template, or contains an element marked paid by admin)
  if (cv.templateId && isTemplatePaid(cv.templateId)) {
    paidUsages.push({
      id: 'template_paid',
      name: 'Modèle Pro / Payant',
      description: `Vous utilisez le modèle réservé "${cv.templateId}".`,
      requiredTier: 'classique'
    });
  }

  // 2. Check Column layout / Template menu
  if (isStudioMenuPaidByAdmin('template') || (cv.nombreColonnes === 1 && isSubOptionPaidByAdmin('template:column_layout', 'template'))) {
    paidUsages.push({
      id: 'template_menu_paid',
      name: 'Disposition / Structure Pro',
      description: 'La personnalisation de la disposition et structure est configurée comme payante.',
      requiredTier: 'classique'
    });
  }

  // 3. Check Font
  const defaultFont = preset?.police || template?.defaultFont || 'Inter';
  const isCustomFont = cv.police && cv.police !== defaultFont;
  if ((isCustomFont && isFontPaidByAdmin(cv.police)) || isStudioMenuPaidByAdmin('typography')) {
    paidUsages.push({
      id: 'font_paid',
      name: 'Typographie Pro',
      description: `La typographie ou la personnalisation de police est configurée comme payante.`,
      requiredTier: 'classique'
    });
  }

  // 4. Check Background Pattern
  const defaultPattern = template?.themeConfig?.backgroundPattern || 'none';
  const patternToTest = cv.backgroundPattern || cv.arrierePlanPattern || cv.sidebarBackgroundPattern;
  const isCustomPattern = patternToTest && patternToTest !== 'none' && patternToTest !== defaultPattern;
  if ((isCustomPattern && isPatternPaidByAdmin(patternToTest)) || isStudioMenuPaidByAdmin('background')) {
    paidUsages.push({
      id: 'bg_pattern_paid',
      name: 'Motif d\'Arrière-plan Pro',
      description: `Le motif d'arrière-plan ou fond studio est configuré comme payant.`,
      requiredTier: 'classique'
    });
  }

  // 5. VIP Custom Decorative Layers
  if ((cv.calqueDecoratif && cv.calqueDecoratif !== 'none' && cv.calqueDecoratif !== 'standard') || isSubOptionPaidByAdmin('background:decorative_layers', 'background')) {
    paidUsages.push({
      id: 'decorative_layer_paid',
      name: 'Calque Décoratif VIP',
      description: `Éléments géométriques VIP "${cv.calqueDecoratif || 'calque'}".`,
      requiredTier: 'premium'
    });
  }

  // 6. Check Header Style
  const defaultHeader = preset?.styleEnTete || template?.themeConfig?.headerStyle || 'banner';
  const isCustomHeader = cv.styleEnTete && cv.styleEnTete !== defaultHeader;
  if ((isCustomHeader && isHeaderStylePaidByAdmin(cv.styleEnTete)) || isStudioMenuPaidByAdmin('header') || (isCustomHeader && isSubOptionPaidByAdmin(`header:${cv.styleEnTete}`, 'header'))) {
    paidUsages.push({
      id: 'header_style_paid',
      name: 'Style d\'En-Tête Pro',
      description: `Le style d'en-tête "${cv.styleEnTete || 'en-tête'}" est configuré comme payant.`,
      requiredTier: 'classique'
    });
  }

  // 7. Check Section Headers
  const defaultSectionHeader = preset?.styleEnTeteSection || template?.themeConfig?.sectionHeaderStyle || 'underline';
  const isCustomSectionHeader = cv.styleEnTeteSection && cv.styleEnTeteSection !== defaultSectionHeader;
  if (isCustomSectionHeader) {
    if (isStudioMenuPaidByAdmin('sectionHeaders') || isSubOptionPaidByAdmin(`sectionHeaders:${cv.styleEnTeteSection}`, 'sectionHeaders')) {
      paidUsages.push({
        id: 'section_headers_paid',
        name: 'Style Titres de Sections Pro',
        description: `Le style de titre de section "${cv.styleEnTeteSection}" est réservé.`,
        requiredTier: 'classique'
      });
    }
  }

  // 8. Check Sidebar Customizations
  if (cv.couleurFondSidebar || (cv.formeSidebarDecor && cv.formeSidebarDecor !== 'straight') || cv.sidebarBackgroundType === 'gradient') {
    if (isStudioMenuPaidByAdmin('sidebar') || isSubOptionPaidByAdmin('sidebar:shape', 'sidebar') || isSubOptionPaidByAdmin('sidebar:bg_color', 'sidebar')) {
      paidUsages.push({
        id: 'sidebar_custom_paid',
        name: 'Personnalisation Sidebar Pro',
        description: 'Les effets avancés de la sidebar sont configurés comme payants.',
        requiredTier: 'classique'
      });
    }
  }

  // 9. Check Photo Styling & Ring Frames
  const defaultPhotoShape = preset?.photoForme || template?.themeConfig?.photoFrameStyle || 'ronde';
  const defaultRing = preset?.cadrePhotoRing || 'none';
  const isCustomPhoto = (cv.photoForme && cv.photoForme !== defaultPhotoShape) || (cv.cadrePhotoRing && cv.cadrePhotoRing !== defaultRing);
  if (isCustomPhoto) {
    if (isStudioMenuPaidByAdmin('photo') || (cv.cadrePhotoRing && cv.cadrePhotoRing !== 'none' && isSubOptionPaidByAdmin('photo:rings', 'photo')) || isSubOptionPaidByAdmin('photo:shapes', 'photo')) {
      paidUsages.push({
        id: 'photo_styling_paid',
        name: 'Cadre & Forme Photo Pro',
        description: `Le style de photo (${cv.photoForme || 'cadre'}) est réservé.`,
        requiredTier: 'classique'
      });
    }
  }

  // 10. Check Contact Badges
  const defaultBadgeStyle = preset?.styleBadgesCoordonnees || 'none';
  if (cv.styleBadgesCoordonnees && cv.styleBadgesCoordonnees !== defaultBadgeStyle) {
    if (isStudioMenuPaidByAdmin('contactBadges') || isSubOptionPaidByAdmin(`contactBadges:${cv.styleBadgesCoordonnees}`, 'contactBadges')) {
      paidUsages.push({
        id: 'contact_badges_paid',
        name: 'Badges Coordonnées Pro',
        description: `Le style de badge contact "${cv.styleBadgesCoordonnees}" est réservé.`,
        requiredTier: 'classique'
      });
    }
  }

  // 11. Check Timeline Style
  const defaultTimeline = preset?.timelineStyle || 'none';
  if (cv.timelineStyle && cv.timelineStyle !== defaultTimeline) {
    if (isStudioMenuPaidByAdmin('timeline') || isSubOptionPaidByAdmin(`timeline:${cv.timelineStyle}`, 'timeline')) {
      paidUsages.push({
        id: 'timeline_paid',
        name: 'Ligne Temporelle (Timeline) Pro',
        description: `L'effet timeline "${cv.timelineStyle}" est réservé.`,
        requiredTier: 'classique'
      });
    }
  }

  // 12. Check Bullet Styles
  if (cv.stylePucesListes && cv.stylePucesListes !== 'disc') {
    if (isStudioMenuPaidByAdmin('bullets') || isSubOptionPaidByAdmin(`bullets:${cv.stylePucesListes}`, 'bullets')) {
      paidUsages.push({
        id: 'bullets_paid',
        name: 'Puces de Listes Pro',
        description: `Le style de puces "${cv.stylePucesListes}" est réservé.`,
        requiredTier: 'classique'
      });
    }
  }

  // 13. Check Shadows
  if (cv.ombreCarte && cv.ombreCarte !== 'none') {
    if (isStudioMenuPaidByAdmin('shadows') || isSubOptionPaidByAdmin(`shadows:${cv.ombreCarte}`, 'shadows')) {
      paidUsages.push({
        id: 'shadows_paid',
        name: 'Ombre Portée 3D Pro',
        description: `L'effet de profondeur est configuré comme payant.`,
        requiredTier: 'classique'
      });
    }
  }

  // 14. Check Skills Format
  const defaultSkillsMode = preset?.styleCompetences || template?.themeConfig?.skillsDisplayMode || 'badges';
  if (cv.styleCompetences && cv.styleCompetences !== defaultSkillsMode) {
    if (isStudioMenuPaidByAdmin('skills') || isSubOptionPaidByAdmin(`skills:${cv.styleCompetences}`, 'skills')) {
      paidUsages.push({
        id: 'skills_format_paid',
        name: 'Format Compétences Pro',
        description: `Le format de compétences "${cv.styleCompetences}" est réservé.`,
        requiredTier: 'classique'
      });
    }
  }

  // 15. Check Individual Section Styles
  const hasCustomSectionStyle = (cv.sections || []).some(s => s.styleSection && Object.keys(s.styleSection).length > 0 && Object.values(s.styleSection).some(v => Boolean(v)));
  if (hasCustomSectionStyle && isStudioMenuPaidByAdmin('individualSection')) {
    paidUsages.push({
      id: 'individual_section_paid',
      name: 'Style Individuel par Section Pro',
      description: 'La personnalisation individuelle par section est configurée comme payante.',
      requiredTier: 'classique'
    });
  }

  return paidUsages;
}

