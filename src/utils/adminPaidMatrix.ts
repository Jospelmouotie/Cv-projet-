// System to handle Admin-configured paid features matrix
export interface StudioMenuDefinition {
  id: string;
  number: number;
  label: string;
  description: string;
  subOptions: { id: string; label: string }[];
}

export const STUDIO_17_MENUS: StudioMenuDefinition[] = [
  {
    id: 'template',
    number: 1,
    label: 'Sélection du Modèle & Structure',
    description: 'Modèles de CV, disposition 1/2 colonnes et largeur sidebar',
    subOptions: [
      { id: 'template:column_layout', label: 'Basculement Disposition 1 / 2 Colonnes' },
      { id: 'template:sidebar_position', label: 'Positionnement de la Sidebar (Gauche / Droite)' },
      { id: 'template:sidebar_width', label: 'Ajustement Réglage Largeur Sidebar' }
    ]
  },
  {
    id: 'sidebar',
    number: 2,
    label: 'Personnalisation de la Sidebar',
    description: 'Arrière-plan, forme, couleur de fond, couleur de texte et motif sidebar',
    subOptions: [
      { id: 'sidebar:bg_type', label: 'Type d\'Arrière-Plan Sidebar (Unie/Dégradé/Motif)' },
      { id: 'sidebar:shape', label: 'Forme & Découpe Sidebar (Vague/Arche/Diagonale/Flottante)' },
      { id: 'sidebar:bg_color', label: 'Couleur de Fond Dédiée Sidebar' },
      { id: 'sidebar:text_color', label: 'Couleur du Texte Spécifique Sidebar' },
      { id: 'sidebar:pattern', label: 'Motif Texturé de Fond Sidebar' }
    ]
  },
  {
    id: 'header',
    number: 3,
    label: 'Style du Bandeau / En-tête Principal',
    description: 'Modèles d\'en-tête, hauteur, fonds et couleurs du titre/sous-titre',
    subOptions: [
      { id: 'header:style', label: 'Choix des Styles d\'En-Tête (Banner, Arch, Split, Tech)' },
      { id: 'header:height', label: 'Hauteur Personnalisée du Bandeau' },
      { id: 'header:bg_color', label: 'Couleur de Fond du Profil / Bandeau' },
      { id: 'header:title_color', label: 'Couleur Spécifique Titre Principal' },
      { id: 'header:subtitle_color', label: 'Couleur Spécifique Sous-Titre' }
    ]
  },
  {
    id: 'sectionHeaders',
    number: 4,
    label: 'Style des Titres de Sections',
    description: 'Souligné, bannières, pilules, arches, encadrés, badges et étoiles',
    subOptions: [
      { id: 'sectionHeaders:underline', label: 'Style Titre : Ligne de Soulignement' },
      { id: 'sectionHeaders:banner', label: 'Style Titres : Bannière de Couleur' },
      { id: 'sectionHeaders:arch-block', label: 'Style Titres : Bloc Arche VIP' },
      { id: 'sectionHeaders:boxed', label: 'Style Titres : Encadré Moderne' },
      { id: 'sectionHeaders:badge-header', label: 'Style Titres : Badge Latéral' },
      { id: 'sectionHeaders:stars', label: 'Style Titres : Étoiles Décoratives' },
      { id: 'sectionHeaders:double-line', label: 'Style Titres : Double Ligne Top/Bottom' },
      { id: 'sectionHeaders:left-border', label: 'Style Titres : Barre Accent Gauche' },
      { id: 'sectionHeaders:icon-inline', label: 'Style Titres : Icône Inline en Cercle' },
      { id: 'sectionHeaders:font_size', label: 'Taille d\'Affichage des Titres de Section' },
      { id: 'sectionHeaders:color', label: 'Couleur d\'Affichage des Titres de Section' }
    ]
  },
  {
    id: 'typography',
    number: 5,
    label: 'Typographie, Polices & Tailles',
    description: 'Polices premium, taille de texte, taille de titres et hauteur de ligne',
    subOptions: [
      { id: 'typography:fonts', label: 'Polices de Caractères Réservées Payantes' },
      { id: 'typography:text_size', label: 'Ajustement Taille du Texte (pt)' },
      { id: 'typography:heading_size', label: 'Ajustement Taille des Titres (pt)' },
      { id: 'typography:line_height', label: 'Ajustement Hauteur de Ligne (Interligne)' }
    ]
  },
  {
    id: 'titlesCase',
    number: 6,
    label: 'Casse, Alignements & Formatage des Titres',
    description: 'Alignement (gauche/centre/droite) et casse (majuscules/capitalize)',
    subOptions: [
      { id: 'titlesCase:alignment', label: 'Alignement des Titres de Section' },
      { id: 'titlesCase:case', label: 'Formatage Casse (MAJUSCULES / Capitalize / Normal)' }
    ]
  },
  {
    id: 'background',
    number: 7,
    label: 'Motif d\'Arrière-Plan & Gradients Globaux',
    description: 'Types de fond, motifs texturés et calques décoratifs VIP',
    subOptions: [
      { id: 'background:bg_type', label: 'Types d\'Arrière-Plan Globaux' },
      { id: 'background:patterns', label: 'Motifs d\'Arrière-Plan Réservés' },
      { id: 'background:decorative_layers', label: 'Calques Décoratifs VIP (Arches, Waves)' }
    ]
  },
  {
    id: 'photo',
    number: 8,
    label: 'Photo de Profil & Cadres Ring',
    description: 'Formes de photo (ronde, carrée, arche, galet) et anneaux de cadre',
    subOptions: [
      { id: 'photo:shapes', label: 'Formes de Découpe Photo (Galet, Arche, Hexagone)' },
      { id: 'photo:rings', label: 'Style de Cadre Anneau Ring (Double Ring, Gold Ring)' }
    ]
  },
  {
    id: 'contactBadges',
    number: 9,
    label: 'Style des Badges Coordonnées Contact',
    description: 'Badges coordonnées (soft-tint, solid-accent, outline, pill, glass)',
    subOptions: [
      { id: 'contactBadges:none', label: 'Mode Standard Sans Badge' },
      { id: 'contactBadges:soft-tint', label: 'Badge Fond Doux Teinté' },
      { id: 'contactBadges:solid-accent', label: 'Badge Couleur Accent Pleine' },
      { id: 'contactBadges:outline', label: 'Badge Contour Épuré' },
      { id: 'contactBadges:pill', label: 'Badge Forme Pilule Arrondie' },
      { id: 'contactBadges:glass', label: 'Badge Effet Verre Transparent (Glass)' }
    ]
  },
  {
    id: 'timeline',
    number: 10,
    label: 'Style des Lignes Temporelles & Dates (Timeline)',
    description: 'Timeline avec points, pilules d\'accent ou barre latérale',
    subOptions: [
      { id: 'timeline:line-dots', label: 'Timeline avec Ligne Virtuelle & Points' },
      { id: 'timeline:accent-pills', label: 'Timeline avec Dates en Pilules d\'Accent' },
      { id: 'timeline:left-bar', label: 'Timeline avec Barre d\'Accent Latérale' }
    ]
  },
  {
    id: 'bullets',
    number: 11,
    label: 'Style des Puces & Listes de Missions',
    description: 'Puces carrées, flèches, coche, étoile, tiret, numérotées',
    subOptions: [
      { id: 'bullets:square', label: 'Puces Carrées Média' },
      { id: 'bullets:arrow', label: 'Puces Flèches Dynamiques' },
      { id: 'bullets:check', label: 'Puces Coche de Validation' },
      { id: 'bullets:star', label: 'Puces Étoiles' },
      { id: 'bullets:numbered', label: 'Listes Numérotées Avancées' }
    ]
  },
  {
    id: 'shadows',
    number: 12,
    label: 'Ombre Portée, Relief & Profondeur',
    description: 'Niveau d\'ombre portée (sm, md, lg) pour effet carte 3D',
    subOptions: [
      { id: 'shadows:sm', label: 'Ombre Discrète (Soft Depth)' },
      { id: 'shadows:md', label: 'Ombre Modérée (Card Depth)' },
      { id: 'shadows:lg', label: 'Ombre Prononcée (Elevated 3D)' }
    ]
  },
  {
    id: 'pageCalibration',
    number: 13,
    label: 'Calibration & Marges Générales',
    description: 'Marges globales de page, espacement des sections et des éléments',
    subOptions: [
      { id: 'pageCalibration:margin', label: 'Réglage Marge Globale de Page' },
      { id: 'pageCalibration:section_gap', label: 'Réglage Espacement entre Sections' },
      { id: 'pageCalibration:item_gap', label: 'Réglage Espacement des Éléments Interne' }
    ]
  },
  {
    id: 'experiences',
    number: 14,
    label: 'Personnalisation des Expériences Pro',
    description: 'Alignement des dates (gauche, haut, en ligne) et styles d\'entreprises',
    subOptions: [
      { id: 'experiences:dates_alignment', label: 'Alignement des Dates Expériences' },
      { id: 'experiences:company_style', label: 'Mise en Valeur du Poste & Entreprise' }
    ]
  },
  {
    id: 'formations',
    number: 15,
    label: 'Personnalisation des Formations',
    description: 'Alignement des dates, diplômes et badges des établissements',
    subOptions: [
      { id: 'formations:dates_alignment', label: 'Alignement des Dates Formations' },
      { id: 'formations:diploma_style', label: 'Formatage des Diplômes & Établissements' }
    ]
  },
  {
    id: 'skills',
    number: 16,
    label: 'Format d\'Affichage des Compétences',
    description: 'Grille, liste, badges, jauges de progression, étoiles, cartes tech',
    subOptions: [
      { id: 'skills:badges', label: 'Format Compétences : Badges' },
      { id: 'skills:progress', label: 'Format Compétences : Jauges de Progression' },
      { id: 'skills:stars', label: 'Format Compétences : Niveaux d\'Étoiles' },
      { id: 'skills:tags', label: 'Format Compétences : Tags Interactifs' },
      { id: 'skills:circular-progress', label: 'Format Compétences : Jauges Circulaires' },
      { id: 'skills:badges-multicolor', label: 'Format Compétences : Badges Multicolores' },
      { id: 'skills:tech-cards', label: 'Format Compétences : Cartes Tech Pro' },
      { id: 'skills:icon-card-grid', label: 'Format Compétences : Grille d\'Icônes Tech' }
    ]
  },
  {
    id: 'individualSection',
    number: 17,
    label: 'Style Individuel par Section',
    description: 'Couleur de fond, texte, titre et bordures spécifiques par section',
    subOptions: [
      { id: 'individualSection:bg_color', label: 'Fond Spécifique par Section' },
      { id: 'individualSection:text_color', label: 'Couleur Texte Dédiée par Section' },
      { id: 'individualSection:title_color', label: 'Couleur Titre Dédiée par Section' },
      { id: 'individualSection:borders', label: 'Bordures et Rayons par Section' }
    ]
  }
];

export interface AdminPaidMatrixConfig {
  paidFonts: string[]; // List of font names that require paid subscription
  paidTemplates: string[]; // List of template IDs that require paid subscription
  paidStudioTabs: string[]; // List of studio tabs that require paid subscription
  paidPatterns: string[]; // List of background patterns that require paid subscription
  paidHeaderStyles: string[]; // List of header styles that require paid subscription
  paidExportFormats: string[]; // List of export formats that require paid subscription
  paidFeatures: string[]; // Generic feature keys marked as paid
  paidStudioMenus: string[]; // List of menu IDs (from 1 to 17) marked as paid
  paidSubOptions: string[]; // List of sub-option IDs marked as paid
}

import { CV_TEMPLATES } from '../data/templates';

const STORAGE_KEY = 'admin_paid_features_matrix_config';

const ALL_STUDIO_MENU_IDS = [
  'template',
  'sidebar',
  'header',
  'sectionHeaders',
  'typography',
  'titlesCase',
  'background',
  'photo',
  'contactBadges',
  'timeline',
  'bullets',
  'shadows',
  'pageCalibration',
  'experiences',
  'formations',
  'skills',
  'individualSection',
  'footer',
  'footerContact'
];

const FREE_STUDIO_MENU_IDS = ['template', 'timeline', 'sectionHeaders', 'footer'];

export const DEFAULT_ADMIN_PAID_MATRIX: AdminPaidMatrixConfig = {
  paidFonts: ['Playfair Display', 'Cinzel', 'Syne', 'Bebas Neue'],
  paidTemplates: CV_TEMPLATES.map((template) => template.id),
  paidStudioTabs: ['calques', 'espacements', 'bordures', 'style-sections', 'arriere-plan'],
  paidPatterns: ['mesh', 'waves', 'hexagons', 'polka', 'chevrons', 'circuit', 'cubes', 'mandala'],
  paidHeaderStyles: ['luxury-gold', 'tech-arches', 'arc-contour', 'organic-arch', 'ocean-wave'],
  paidExportFormats: ['pdf_hd', 'docx', 'json', 'txt'],
  paidFeatures: ['COVER_LETTER_AI', 'CV_AI_JOB_TARGETING', 'LINKEDIN_OPTIMIZER', 'CUSTOM_SECTIONS'],
  paidStudioMenus: ALL_STUDIO_MENU_IDS.filter(id => !FREE_STUDIO_MENU_IDS.includes(id)),
  paidSubOptions: ['background:decorative_layers', 'sectionHeaders:arch-block', 'photo:rings']
};

export function isPaymentActive(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('app_settings_paiementActif');
  if (stored !== null) {
    return stored === 'true';
  }
  return true;
}

export function getAdminPaidMatrixConfig(): AdminPaidMatrixConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_ADMIN_PAID_MATRIX,
        ...parsed
      };
    }
  } catch (e) {
    console.error('Failed to load admin paid matrix config:', e);
  }
  return DEFAULT_ADMIN_PAID_MATRIX;
}

// Fetch from backend API and update localStorage
export async function syncAdminPaidMatrixFromBackend(): Promise<AdminPaidMatrixConfig> {
  try {
    const token = localStorage.getItem('cv_builder_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Try public /api/paid-matrix or authenticated /api/admin/paid-matrix
    let res = await fetch('/api/paid-matrix');
    if (!res.ok) {
      res = await fetch('/api/admin/paid-matrix', { headers });
    }
    if (res.ok) {
      const serverConfig = await res.json();
      if (serverConfig && typeof serverConfig === 'object') {
        const merged = { ...DEFAULT_ADMIN_PAID_MATRIX, ...serverConfig };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('admin_paid_matrix_updated', { detail: merged }));
        return merged;
      }
    } else {
      // Fallback to public app-settings
      const appRes = await fetch('/api/app-settings');
      if (appRes.ok) {
        const appData = await appRes.json();
        if (appData.adminPaidMatrix) {
          const merged = { ...DEFAULT_ADMIN_PAID_MATRIX, ...appData.adminPaidMatrix };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('admin_paid_matrix_updated', { detail: merged }));
          return merged;
        }
      }
    }
  } catch (e) {
    // Fail silently, use local storage fallback
  }
  return getAdminPaidMatrixConfig();
}

export function saveAdminPaidMatrixConfig(config: AdminPaidMatrixConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('admin_paid_matrix_updated', { detail: config }));
    window.dispatchEvent(new CustomEvent('app_settings_updated'));

    const token = localStorage.getItem('cv_builder_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Save asynchronously to database
    fetch('/api/admin/paid-matrix', {
      method: 'POST',
      headers,
      body: JSON.stringify(config)
    }).catch(err => console.error('Failed to persist admin paid matrix to DB:', err));
  } catch (e) {
    console.error('Failed to save admin paid matrix config:', e);
  }
}

export function isFontPaidByAdmin(fontName: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidFonts.includes(fontName);
}

export function isTemplatePaidByAdmin(templateId: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidTemplates.includes(templateId);
}

export function isStudioTabPaidByAdmin(tabId: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidStudioTabs.includes(tabId) || config.paidStudioMenus.includes(tabId);
}

export function isStudioMenuPaidByAdmin(menuId: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidStudioMenus.includes(menuId);
}

export function isSubOptionPaidByAdmin(subOptionId: string, parentMenuId?: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  if (config.paidSubOptions.includes(subOptionId)) return true;
  if (parentMenuId && config.paidStudioMenus.includes(parentMenuId)) return true;
  return false;
}

export function isPatternPaidByAdmin(patternName: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidPatterns.includes(patternName);
}

export function isHeaderStylePaidByAdmin(headerStyle: string): boolean {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidHeaderStyles.includes(headerStyle);
}

