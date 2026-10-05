import { SubscriptionTier, FeatureKey, PlanConfig } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import {
  isTemplatePaidByAdmin,
  isFontPaidByAdmin,
  isHeaderStylePaidByAdmin,
  isPatternPaidByAdmin,
  isSubOptionPaidByAdmin,
  isStudioMenuPaidByAdmin,
  isStudioTabPaidByAdmin,
  isPaymentActive,
  getAdminPaidMatrixConfig
} from './adminPaidMatrix';
import { CV_TEMPLATES } from '../data/templates';
import { TEMPLATE_PRESETS } from '../data/templatePresets';

/**
 * =========================================================================
 * ARCHITECTURE DU SYSTÈME D'ABONNEMENT ET GATING DE FONCTIONNALITÉS
 * =========================================================================
 * Ce module prépare l'ensemble des règles de restriction par forfait :
 * 1. Freemium : Modèles de base + export PDF standard + édition classique.
 * 2. Classique : Tous les modèles + ensemble des onglets du Creator Studio (couleurs, typo, background, mise en page).
 * 3. Premium : Personnalisation avancée par IA des CV (ciblage d'offres) + Générateur de Lettres de motivation + Optimiseur LinkedIn.
 *
 * NOTE : `ENFORCE_PAYMENT_GATES` est configuré sur `false` par défaut afin
 * de ne rien bloquer prématurément. Dès que le processeur de paiement (Orange/MTN/Stripe)
 * est activé, il suffit de passer ce flag à `true`.
 */

export const ENFORCE_PAYMENT_GATES = true;

// Les seuls modèles gratuits sont ceux créés par l’admin.
// Les modèles intégrés sont tous payants par défaut.
export const DEFAULT_FREE_TEMPLATE_IDS: string[] = [];

export const FREE_TEMPLATE_IDS: string[] = getFreeTemplateIds();

export function getFreeTemplateIds(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FREE_TEMPLATE_IDS;
  }

  try {
    const raw = localStorage.getItem('admin_custom_templates');
    if (!raw) return DEFAULT_FREE_TEMPLATE_IDS;
    const parsed = JSON.parse(raw);
    const customIds = Array.isArray(parsed)
      ? parsed.map((item: any) => item?.id).filter((id: string | undefined): id is string => Boolean(id))
      : [];
    return customIds;
  } catch {
    return DEFAULT_FREE_TEMPLATE_IDS;
  }
}

export function getTemplateConflictWarnings(templateId: string, relatedTemplateIds: string[] = []): string[] {
  const warnings: string[] = [];
  const freeSet = new Set(getFreeTemplateIds());
  const relatedSet = new Set((relatedTemplateIds || []).filter(Boolean));

  if (freeSet.has(templateId)) {
    const hasPaidRelated = [...relatedSet].some((id) => id !== templateId && !freeSet.has(id));
    if (hasPaidRelated) {
      warnings.push(`Le modèle gratuit ${templateId} utilise un élément payant. Le passer en Premium ou le rendre gratuit.`);
    }
  } else {
    const usesFreeElement = [...relatedSet].some((id) => freeSet.has(id));
    if (usesFreeElement) {
      warnings.push(`Le modèle Premium ${templateId} utilise un élément gratuit. Vérifier le conflit de droits avant publication.`);
    }
  }

  return warnings;
}

// Configuration complète des forfaits
export const PLANS_CONFIG: Record<SubscriptionTier, PlanConfig> = {
  freemium: {
    id: 'freemium',
    name: 'Freemium',
    badge: 'Gratuit',
    tagline: {
      fr: 'Idéal pour démarrer et créer un premier CV rapidement.',
      en: 'Ideal for getting started and creating a clean first resume.'
    },
    pricing: {
      xaf: 0,
      eur: 0,
      usd: 0,
      billingType: 'free'
    },
    features: [
      'FREE_TEMPLATES',
      'STUDIO_BASIC_EDITION',
      'EXPORT_PDF_STANDARD'
    ],
    highlights: {
      fr: [
        'Sélection de modèles professionnels gratuits',
        'Éditeur de texte et gestion des sections',
        'Exportation PDF standard',
        'Sauvegarde de votre premier CV'
      ],
      en: [
        'Curated selection of free professional templates',
        'Full text editor and section manager',
        'Standard PDF export',
        'Save your primary resume draft'
      ]
    },
    limits: {
      maxCVs: 1,
      allowedTemplateCount: getFreeTemplateIds().length,
      allowStudioCustomization: false,
      allowCoverLetter: false,
      allowJobTargeting: false,
      allowLinkedInOptimizer: false,
      pdfExportQuality: 'standard'
    }
  },
  decouverte: {
    id: 'decouverte',
    name: 'Pack Découverte',
    badge: '7 Jours',
    tagline: {
      fr: 'Accès complet aux modèles essentiels et à la personnalisation avancée pendant 7 jours.',
      en: 'Full access to the core templates and advanced design tools for 7 days.'
    },
    pricing: {
      xaf: 1000,
      eur: 1.50,
      usd: 1.70,
      billingType: 'monthly'
    },
    features: [
      'FREE_TEMPLATES',
      'ALL_TEMPLATES',
      'STUDIO_BASIC_EDITION',
      'STUDIO_FULL_CUSTOMIZATION',
      'CUSTOM_SECTIONS',
      'EXPORT_PDF_STANDARD',
      'EXPORT_PDF_HD',
      'UNLIMITED_CV_SAVES'
    ],
    highlights: {
      fr: [
        'Accès aux modèles essentiels et à la personnalisation avancée',
        'Creator Studio complet : colonnes, bordures & polices',
        'Export PDF Ultra HD 300 DPI sans restriction',
        'Rubriques et mises en page personnalisées',
        'Valable 7 jours (1 semaine)'
      ],
      en: [
        'Access to essential templates and advanced customization',
        'Complete Creator Studio design tools',
        'Ultra HD 300 DPI PDF exports without watermarks',
        'Unlimited custom sections & layouts',
        'Valid for 7 days (1 week)'
      ]
    },
    limits: {
      maxCVs: 5,
      allowedTemplateCount: 'all',
      allowStudioCustomization: true,
      allowCoverLetter: false,
      allowJobTargeting: false,
      allowLinkedInOptimizer: false,
      pdfExportQuality: 'hd_300dpi'
    }
  },
  classique: {
    id: 'classique',
    name: 'Legacy Classique',
    badge: 'Compatibilité',
    tagline: {
      fr: 'Compatibilité legacy : à conserver pour les anciens comptes.',
      en: 'Legacy compatibility for older accounts.'
    },
    pricing: {
      xaf: 2500,
      eur: 3.80,
      usd: 4.20,
      billingType: 'monthly'
    },
    features: [
      'FREE_TEMPLATES',
      'ALL_TEMPLATES',
      'STUDIO_BASIC_EDITION',
      'STUDIO_FULL_CUSTOMIZATION',
      'CUSTOM_SECTIONS',
      'EXPORT_PDF_STANDARD',
      'EXPORT_PDF_HD',
      'UNLIMITED_CV_SAVES'
    ],
    highlights: {
      fr: [
        'Compatibilité legacy pour anciens comptes',
        'Accès intégral au studio et aux modèles',
        'Sans blocage sur l’ancien parcours d’achat'
      ],
      en: [
        'Legacy compatibility for older accounts',
        'Full access to studio and templates',
        'No disruption to older purchase flows'
      ]
    },
    limits: {
      maxCVs: 10,
      allowedTemplateCount: 'all',
      allowStudioCustomization: true,
      allowCoverLetter: false,
      allowJobTargeting: false,
      allowLinkedInOptimizer: false,
      pdfExportQuality: 'hd_300dpi'
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium VIP',
    badge: 'Recommandé Pro',
    tagline: {
      fr: 'Le pack complet : Personnalisation avancée des CV, Lettres de motivation & LinkedIn.',
      en: 'The complete suite: Job Offer Targeting, Cover Letter & LinkedIn Optimizer.'
    },
    pricing: {
      xaf: 2500,
      eur: 3.80,
      usd: 4.20,
      billingType: 'monthly'
    },
    features: [
      'FREE_TEMPLATES',
      'ALL_TEMPLATES',
      'STUDIO_BASIC_EDITION',
      'STUDIO_FULL_CUSTOMIZATION',
      'CUSTOM_SECTIONS',
      'CV_AI_JOB_TARGETING',
      'COVER_LETTER_AI',
      'LINKEDIN_OPTIMIZER',
      'DECORATIVE_LAYERS_CUSTOM',
      'EXPORT_PDF_STANDARD',
      'EXPORT_PDF_HD',
      'EXPORT_MULTI_FORMAT',
      'UNLIMITED_CV_SAVES',
      'PRIORITY_SUPPORT'
    ],
    highlights: {
      fr: [
        'Tout ce qui est inclus dans le Pack Découverte',
        'Générateur et éditeur de Lettres de Motivation professionnelles',
        'Ciblage automatique de CV adapté à vos offres d’emploi cibles',
        'Optimiseur de profil LinkedIn haute visibilité',
        'Calques décoratifs géométriques et styles personnalisés avancés',
        'Exports multi-formats (PDF HD, JSON, TXT, DOCX)'
      ],
      en: [
        'Everything included in the Découverte pack',
        'AI Cover Letter generator & professional editor',
        'Automatic resume adaptation tailored to specific job descriptions',
        'LinkedIn Profile Optimizer for high recruiter visibility',
        'Advanced geometric decorative layers and custom themes',
        'Multi-format exports (HD PDF, JSON, TXT, DOCX)'
      ]
    },
    limits: {
      maxCVs: 50,
      allowedTemplateCount: 'all',
      allowStudioCustomization: true,
      allowCoverLetter: true,
      allowJobTargeting: true,
      allowLinkedInOptimizer: true,
      pdfExportQuality: 'hd_300dpi'
    }
  }
};

// Hiérarchie numérique des forfaits
export const TIER_WEIGHTS: Record<SubscriptionTier, number> = {
  freemium: 0,
  decouverte: 1,
  classique: 1,
  premium: 2
};

/**
 * Compare deux forfaits (retourne true si userTier >= requiredTier)
 */
export function hasRequiredTier(userTier: SubscriptionTier | string = 'freemium', requiredTier: SubscriptionTier): boolean {
  if (!isPaymentActive()) return true;
  const normalizedTier = (userTier || '').toString().toLowerCase();
  if (normalizedTier === 'admin' || normalizedTier === 'premium') return true;
  const userWeight = TIER_WEIGHTS[normalizedTier as SubscriptionTier] ?? 0;
  const reqWeight = TIER_WEIGHTS[requiredTier] ?? 0;
  return userWeight >= reqWeight;
}

/**
 * Détermine le forfait minimal requis pour une fonctionnalité donnée
 */
export function getRequiredTierForFeature(feature: FeatureKey): SubscriptionTier {
  if (!isPaymentActive()) return 'freemium';
  switch (feature) {
    case 'CV_AI_JOB_TARGETING':
    case 'COVER_LETTER_AI':
    case 'LINKEDIN_OPTIMIZER':
    case 'DECORATIVE_LAYERS_CUSTOM':
    case 'EXPORT_MULTI_FORMAT':
    case 'PRIORITY_SUPPORT':
      return 'premium';

    case 'ALL_TEMPLATES':
    case 'STUDIO_FULL_CUSTOMIZATION':
    case 'CUSTOM_SECTIONS':
    case 'EXPORT_PDF_HD':
    case 'UNLIMITED_CV_SAVES':
      return 'classique';

    case 'FREE_TEMPLATES':
    case 'STUDIO_BASIC_EDITION':
    case 'EXPORT_PDF_STANDARD':
    default:
      return 'freemium';
  }
}

/**
 * Vérifie si une fonctionnalité est autorisée pour l'utilisateur
 */
export function isFeatureAllowed(
  userTier: SubscriptionTier | string = 'freemium',
  feature: FeatureKey,
  enforce: boolean = ENFORCE_PAYMENT_GATES
): boolean {
  if (!enforce || !isPaymentActive()) return true;
  const normalizedTier = (userTier || '').toString().toLowerCase();
  if (normalizedTier === 'admin' || normalizedTier === 'premium') return true;
  const requiredTier = getRequiredTierForFeature(feature);
  return hasRequiredTier(normalizedTier, requiredTier);
}

/**
 * Détermine si un modèle de CV est payant (Pro).
 * - Un modèle est payant s'il est configuré payant par l'admin.
 * - S'il n'est pas dans la liste des modèles gratuits.
 */
export function isTemplatePaid(templateId: string): boolean {
  if (!isPaymentActive()) return false;

  const config = getAdminPaidMatrixConfig();
  const activeFreeTemplateIds = getFreeTemplateIds();

  // If the admin has defined paidTemplates, this is the single source of truth.
  if (config && Array.isArray(config.paidTemplates)) {
    return config.paidTemplates.includes(templateId);
  }

  // Fallback to the default free set and any admin-created models.
  return !activeFreeTemplateIds.includes(templateId);
}

/**
 * Détermine le forfait minimal requis pour un modèle de CV
 */
export function getRequiredTierForTemplate(templateId: string): SubscriptionTier {
  if (!isPaymentActive()) return 'freemium';
  if (isTemplatePaid(templateId)) {
    return 'classique';
  }
  return 'freemium';
}

/**
 * Vérifie si un modèle de CV est débloqué pour l'utilisateur
 */
export function isTemplateAllowed(
  userTier: SubscriptionTier | string = 'freemium',
  templateId: string,
  enforce: boolean = ENFORCE_PAYMENT_GATES
): boolean {
  if (!enforce || !isPaymentActive()) return true;
  const normalizedTier = (userTier || '').toString().toLowerCase();
  if (normalizedTier === 'admin' || normalizedTier === 'premium') return true;
  const requiredTier = getRequiredTierForTemplate(templateId);
  return hasRequiredTier(normalizedTier, requiredTier);
}

/**
 * Onglets du Creator Studio et leurs restrictions
 */
export const STUDIO_TABS_CONFIG = {
  // Onglets basiques disponibles en Freemium
  freemiumTabs: ['contenu', 'sections', 'apercu'],
  // Onglets avancés nécessitant le forfait Classique
  classiqueTabs: [
    'couleurs',
    'mise-en-page',
    'typographie',
    'arriere-plan',
    'espacements',
    'style-sections',
    'bordures',
    'calques'
  ]
};

/**
 * Détermine le forfait minimal requis pour un onglet du Creator Studio
 */
export function getRequiredTierForStudioTab(tabId: string): SubscriptionTier {
  if (!isPaymentActive()) return 'freemium';
  if (isStudioTabPaidByAdmin(tabId)) {
    return 'classique';
  }
  if (STUDIO_TABS_CONFIG.freemiumTabs.includes(tabId)) {
    return 'freemium';
  }
  return 'classique';
}

/**
 * Vérifie si un onglet du Creator Studio est accessible
 */
export function isStudioTabAllowed(
  userTier: SubscriptionTier = 'freemium',
  tabId: string,
  enforce: boolean = ENFORCE_PAYMENT_GATES
): boolean {
  if (!enforce || !isPaymentActive()) return true;
  const requiredTier = getRequiredTierForStudioTab(tabId);
  return hasRequiredTier(userTier, requiredTier);
}
