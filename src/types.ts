export type Language = 'fr' | 'en' | 'ar';

export type StatutPaiement = 'NON_PAYE' | 'EN_ATTENTE' | 'EN_ATTENTE_VALIDATION' | 'PAYE';
export type StatutPayment = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

// Tiered Subscription Model (Freemium, Decouverte, Classique, Premium)
export type SubscriptionTier = 'freemium' | 'decouverte' | 'classique' | 'premium';

export type FeatureKey =
  | 'EXPORT_PDF_STANDARD'
  | 'EXPORT_PDF_HD'
  | 'EXPORT_MULTI_FORMAT' // JSON, TXT, DOCX
  | 'FREE_TEMPLATES'
  | 'ALL_TEMPLATES'
  | 'STUDIO_BASIC_EDITION'
  | 'STUDIO_FULL_CUSTOMIZATION' // palettes, backgrounds, typography, custom layout, spacing
  | 'CUSTOM_SECTIONS'
  | 'CV_AI_JOB_TARGETING' // Adaptation & tailor to job offers
  | 'COVER_LETTER_AI' // Lettre de motivation generator & deep editor
  | 'LINKEDIN_OPTIMIZER' // LinkedIn Profile AI Generator
  | 'DECORATIVE_LAYERS_CUSTOM' // Advanced geometric SVG layers
  | 'UNLIMITED_CV_SAVES'
  | 'PRIORITY_SUPPORT';

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  tagline: {
    fr: string;
    en: string;
  };
  pricing: {
    xaf: number; // in FCFA (e.g. 0, 1000, 2500)
    eur: number;
    usd: number;
    billingType: 'free' | 'one-time' | 'monthly' | 'per-cv';
  };
  features: FeatureKey[];
  highlights: {
    fr: string[];
    en: string[];
  };
  limits: {
    maxCVs?: number;
    allowedTemplateCount?: number | 'all';
    allowStudioCustomization: boolean;
    allowCoverLetter: boolean;
    allowJobTargeting: boolean;
    allowLinkedInOptimizer: boolean;
    pdfExportQuality: 'standard' | 'hd_300dpi';
  };
}

export interface User {
  id: string;
  nom: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  langue: Language;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface ArcConcentricConfig {
  rings?: number;
  colors?: string[];
  radius?: number;
  position?: { x?: number; y?: number; align?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' };
  strokeWidth?: number;
  filled?: boolean;
}

export interface FooterColumnItem {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface FooterBarConfig {
  columns?: FooterColumnItem[];
  backgroundColor?: string;
  textColor?: string;
  labelColor?: string;
}

export interface DecorativeLayer {
  id: string;
  zone: 'header' | 'sidebar' | 'page-footer' | 'page-top' | 'floating' | 'background';
  shape: 'arc-concentric' | 'clip-path' | 'svg-path' | 'diagonal-band' | 'blob' | 'page-footer-bar' | 'hexagon-lattice' | 'wave';
  value?: string | ArcConcentricConfig | FooterBarConfig | any;
  colors?: string[];
  position?: { x?: number; y?: number }; // % or coordinate
  size?: { width?: number | string; height?: number | string };
  zIndex?: number;
  opacity?: number;
  customData?: any;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  fontCss: string;
}

export interface Section {
  id: string;
  type: 'profil' | 'experience' | 'formation' | 'competences' | 'langues' | 'projets' | 'certifications' | 'interets' | 'references' | 'benevolat' | 'publications' | 'distinctions' | 'qualites' | 'personnalisee';
  titre: string;
  ordre?: number;
  visible?: boolean;
  colonne?: 'gauche' | 'droite' | 'principale';
  zone?: 'gauche' | 'droite' | 'principale' | string;
  pageBreakBefore?: boolean; // Page break indicator
  isExpanded?: boolean; // accordion state
  contenu: any; // Dynamic content based on section type
  // Optional individual section style overrides
  couleurFond?: string;
  couleurTexte?: string;
  couleurTitre?: string;
  alignementTitre?: 'gauche' | 'centre' | 'droite' | 'left' | 'center' | 'right';
  tailleTitre?: 'petit' | 'moyen' | 'grand' | number;
  casseTitre?: 'normal' | 'majuscule' | 'capitalize' | 'uppercase';
  styleEntete?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header' | 'badge-line' | 'icon-inline' | string;
  backgroundPattern?: string;
  styleSection?: {
    couleurFond?: string;
    couleurTexte?: string;
    couleurTitre?: string;
    alignementTitre?: 'left' | 'center' | 'right';
    tailleTitre?: number;
    casseTitre?: 'uppercase' | 'capitalize' | 'normal';
    styleEntete?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header' | 'badge-line' | 'icon-inline' | string;
    styleCompetences?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags' | 'circular-progress' | 'badges-multicolor' | 'tech-cards' | 'icon-card-grid' | 'cards-modern' | 'grid-3' | 'minimal-cards' | 'pill-bars' | 'striped-table' | 'dots' | string;
    alignementDates?: 'left' | 'top' | 'inline';
    rayonBordure?: number;
    epaisseurBordure?: number;
    ombre?: 'none' | 'sm' | 'md' | 'lg';
    backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
    backgroundOpacity?: number;
    backgroundColorStart?: string;
    backgroundColorEnd?: string;
    backgroundPattern?: string;
    backgroundImage?: string;
  };
}

export interface CVTheme {
  primaryColor: string; // couleurPrincipale / couleurAccent
  secondaryColor?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  sidebarBackgroundColor?: string;
  textColor?: string;
  sidebarTextColor?: string;
  headingColor?: string;
  sidebarHeadingColor?: string;
  headerStyle?: 'banner' | 'clean' | 'card' | 'arch' | 'modern-split' | 'minimal' | 'luxury-gold' | 'ocean-wave' | 'diagonal-split' | 'organic-arch' | 'sidebar-top' | 'tech-arches' | 'arc-contour' | 'sylvie-wave' | 'baxter-diagonal' | 'sylvie-loiseau' | 'brian-baxter' | 'two-tone-split' | 'two-tone-stripe' | 'wave-bottom' | 'wave-top' | 'wave-double' | 'curved-wave-badge' | 'simple-minimal' | 'centered-clean' | 'executive-stripe' | string;
  sectionHeaderStyle?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header' | 'badge-line' | 'icon-inline' | string;
  separatorStyle?: 'solid' | 'dashed' | 'dotted' | 'thick' | 'none';
  skillsDisplayMode?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags' | 'circular-progress' | 'badges-multicolor' | 'tech-cards' | 'icon-card-grid' | 'cards-modern' | 'grid-3' | 'minimal-cards' | 'pill-bars' | 'striped-table' | 'dots' | 'executive-tags' | 'categorized-pills' | 'stepped-levels' | 'compact-chips' | 'matrix-cards' | string;
  skillsRatingMode?: 'none' | 'stars' | 'dots' | 'progress' | 'percentage' | 'numeric' | 'segmented' | 'badge-text' | string;
  footerStyle?: 'banner-solid' | 'cards-grid' | 'minimal-inline' | 'pill-floating' | 'modern-split' | 'dark-tech' | 'neon-border' | 'classic-divider' | 'executive-signature' | 'legal-seal' | 'soft-pills' | 'architect-metric' | string;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerAccentColor?: string;
  stylePucesListes?: 'disc' | 'square' | 'arrow' | 'check' | 'star' | 'dash' | 'numbered' | 'none';
  experienceDatesAlignment?: 'left' | 'top' | 'inline' | 'right' | 'subline' | string;
  borderRadiusVal?: number;
  borderWidthVal?: number;
  shadowVal?: 'none' | 'sm' | 'md' | 'lg';
  pageMarginVal?: number;
  columnGapVal?: number;
  photoFrameStyle?: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche' | 'galet' | 'cameo' | 'losange' | 'carree-doree' | 'passe-partout' | string;
  photoBorderColor?: string;
  photoBorderWidth?: number;
  cadrePhotoRing?: 'none' | 'double-ring' | 'gold-ring' | 'accent-ring';
  formeSidebarDecor?: 'straight' | 'arch-top' | 'wave-cut' | 'diagonal-cut' | 'card-float';
  timelineStyle?: 'none' | 'line-dots' | 'accent-pills' | 'left-bar' | string;
  afficherBadgesIcones?: boolean;
  decorBanniereCouleur2?: string;
  decorativeShapes?: 'none' | 'circle-photo' | 'curved-sidebar-cut' | 'diagonal-split';
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'lines' | 'mesh' | 'waves' | 'stripes' | 'cross' | 'circles' | 'topography';
  decorativeLayers?: DecorativeLayer[];
  photoPosition?: 'in-header' | 'in-sidebar';
  defaultLeftWidth?: number;
}

export interface CV {
  id: string;
  utilisateurId: string;
  userId?: string; // Scoped user identifier for local draft isolation
  titre: string;
  templateId: string;
  langue: Language;
  couleurAccent: string;
  couleurAccentSecondaire?: string;
  // Theme & Layout Overrides for Mode Créateur Libre
  couleurFond?: string;
  couleurFondProfil?: string;
  couleurTexteProfil?: string;
  backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
  backgroundOpacity?: number; // 0 to 1
  backgroundColorStart?: string;
  backgroundColorEnd?: string;
  backgroundPattern?: string; // e.g. 'dots' | 'stripes' | 'grid' | 'mesh' | 'waves'
  backgroundImage?: string;

  couleurFondSidebar?: string;
  sidebarBackgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
  sidebarBackgroundOpacity?: number;
  sidebarBackgroundColorStart?: string;
  sidebarBackgroundColorEnd?: string;
  sidebarBackgroundPattern?: string;
  sidebarBackgroundImage?: string;
  couleurTexte?: string;
  couleurTexteSidebar?: string;
  couleurTitreSection?: string;
  couleurTitreSectionSidebar?: string;
  styleEnTete?: 'banner' | 'clean' | 'card' | 'arch' | 'modern-split' | 'minimal' | 'luxury-gold' | 'ocean-wave' | 'diagonal-split' | 'organic-arch' | 'sidebar-top' | 'tech-arches' | 'arc-contour' | 'sylvie-wave' | 'baxter-diagonal' | 'sylvie-loiseau' | 'brian-baxter' | 'two-tone-split' | 'two-tone-stripe' | 'wave-bottom' | 'wave-top' | 'wave-double' | 'curved-wave-badge' | 'simple-minimal' | 'centered-clean' | 'executive-stripe' | 'executive-centered' | 'notarial-crest' | 'medical-clinic' | 'luxury-menu' | 'asymmetric-blueprint' | 'academic-journal' | 'soft-organic' | 'horlogerie-guilloche' | 'newspaper-headline' | 'event-marquee' | string;
  styleEnTeteSection?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header' | 'badge-line' | 'icon-inline' | string;
  styleCompetences?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags' | 'circular-progress' | 'badges-multicolor' | 'tech-cards' | 'icon-card-grid' | 'cards-modern' | 'grid-3' | 'minimal-cards' | 'pill-bars' | 'striped-table' | 'dots' | 'executive-tags' | 'categorized-pills' | 'stepped-levels' | 'compact-chips' | 'matrix-cards' | string;
  stylePucesListes?: 'disc' | 'square' | 'arrow' | 'check' | 'star' | 'dash' | 'numbered' | 'none' | string;
  alignementDatesExperience?: 'left' | 'top' | 'inline' | 'right' | 'subline' | string;
  nombreColonnes?: 1 | 2;
  positionSidebar?: 'gauche' | 'droite';
  rayonBordure?: number;
  epaisseurBordure?: number;
  ombreCarte?: 'none' | 'sm' | 'md' | 'lg';
  margeGlobalePage?: number;
  ecartColonnes?: number;
  photoBordureCouleur?: string;
  photoBordureEpaisseur?: number;
  cadrePhotoRing?: 'none' | 'double-ring' | 'gold-ring' | 'accent-ring' | string | boolean;
  formeSidebarDecor?: 'straight' | 'arch-top' | 'wave-cut' | 'diagonal-cut' | 'card-float' | string;
  timelineStyle?: 'none' | 'line-dots' | 'accent-pills' | 'left-bar' | string;
  afficherBadgesIcones?: boolean;
  decorBanniereCouleur2?: string;
  decorativeLayers?: DecorativeLayer[];
  arrierePlanPattern?: string;
  calqueDecoratif?: string;

  // Style Badges Coordonnées & Objets
  styleBadgesCoordonnees?: 'none' | 'pill' | 'rounded' | 'outline' | 'glass' | 'soft-tint' | 'solid-accent' | string;
  couleurFondBadgeCoordonnees?: string;
  opaciteBadgeCoordonnees?: number; // 0.1 to 1
  couleurBordureBadgeCoordonnees?: string;
  tailleBordureBadgeCoordonnees?: number; // 0 to 8 px
  rayonBordureBadgeCoordonnees?: number; // 0 to 30 px
  couleurTexteBadgeCoordonnees?: string;
  couleurLigneTemps?: string;
  timelineDotColor?: string;
  couleurPointLigneTemps?: string;
  couleurPuces?: string;
  formePhoto?: string;

  // Mode Page Cible & Compactage Automatique
  pageCibleMode?: 'auto' | '1_page' | '2_pages' | 'compact';
  espacementSectionsPx?: number; // 0 to 30 px
  espacementItemsPx?: number; // 0 to 20 px

  // Pied de page & Marche de Protection (Footer & Bottom Margin)
  afficherPiedDePage?: boolean;
  margePiedDePagePx?: number; // Espace/marche sous le contenu pour le pied de page (ex: 10 à 100px)
  textePiedDePage?: string;
  afficherNumPagePiedDePage?: boolean;
  alignementPiedDePage?: 'gauche' | 'centre' | 'droite' | 'between';
  stylePiedDePage?: 'minimal' | 'top-line' | 'boxed' | 'pill' | 'banner';
  couleurTextePiedDePage?: string;
  couleurFondPiedDePage?: string;
  couleurBordurePiedDePage?: string;
  epaisseurBordurePiedDePage?: number;
  taillePolicePiedDePage?: number;

  // Bandeau Footer de Contact (CV Contact Footer)
  afficherFooterContact?: boolean;
  styleFooterContact?: 'banner-solid' | 'cards-grid' | 'minimal-inline' | 'pill-floating' | 'modern-split' | 'dark-tech' | 'neon-border' | 'classic-divider' | 'executive-signature' | 'legal-seal' | 'soft-pills' | 'architect-metric' | string;
  couleurFondFooterContact?: string;
  couleurTexteFooterContact?: string;
  couleurAccentFooterContact?: string;
  disponibiliteTexte?: string;
  elementsFooterContact?: string[];
  afficherAdresseFooterContact?: boolean;
  afficherTelephoneFooterContact?: boolean;
  afficherEmailFooterContact?: boolean;
  afficherDisponibiliteFooterContact?: boolean;
  afficherSiteWebFooterContact?: boolean;
  afficherLinkedinFooterContact?: boolean;

  // Personnalisation des Vagues, Déco & Rubans
  afficherVagues?: boolean;
  typeVague?: 'wave-smooth' | 'wave-double' | 'diagonal' | 'arch-dome' | 'hex-grid' | 'minimal-stripes' | 'blob' | 'curved' | string;
  positionVagues?: 'haut' | 'bas' | 'sidebar' | 'fond' | 'gauche' | 'droite' | string;
  couleurVague1?: string;
  couleurVague2?: string;
  couleurVague3?: string;
  opaciteVagues?: number;

  // Personnalisation En-tête Multi-Couleurs
  couleurHeader1?: string;
  couleurHeader2?: string;
  couleurHeader3?: string;
  couleurHeaderAccent?: string;
  couleurHeaderTexte?: string;
  couleurSousTitrePrincipal?: string;
  couleurTitrePrincipal?: string;

  // Titres de Sections Personnalisés
  tailleTitreSectionValeur?: number; // 8 to 26 pt
  casseTitreSection?: 'uppercase' | 'capitalize' | 'normal';
  alignementTitreSection?: 'left' | 'center' | 'right';
  grasTitreSection?: 'bold' | 'black' | 'medium' | 'normal';
  policeTitreSection?: string;

  police: string;
  policeTitre?: string;
  taillePolice?: string;
  taillePoliceValeur?: number; // 4 to 30 px
  hauteurLigne?: 'tight' | 'normal' | 'relaxed' | 'loose';
  hauteurLigneValeur?: number; // 0.5 to 2.0
  ecartementTexte?: 'tight' | 'normal' | 'wide' | 'widest';
  margeSection?: 'compact' | 'normal' | 'spacious';
  largeurColonneGauche?: number; // 20% to 50%
  margeColonneGauche?: number; // 4px to 40px
  margeColonneDroite?: number; // 4px to 40px
  photoUrl?: string;
  afficherPhoto?: boolean;
  photoForme?: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche' | 'galet' | string;
  photoTaille?: number; // Size in px e.g. 40-250
  photoSize?: number; // Alias size in px
  photoPosition?: 'in-header' | 'in-sidebar' | 'free' | string;
  photoAlignement?: 'gauche' | 'centre' | 'droite';
  cadrePhotoBorderWidth?: number;
  cadrePhotoBorderColor?: string;
  hauteurEnTete?: number;
  timelineColor?: string;
  bulletStyle?: 'disc' | 'square' | 'arrow' | 'check' | 'star' | 'dash' | 'numbered' | 'numeric' | 'none';
  bulletColor?: string;
  couleurFondBadgeContact?: string;
  couleurTexteBadgeContact?: string;
  espacementSections?: number;
  espacementElements?: number;
  tailleTitreSection?: number;
  alignementTitresSection?: 'left' | 'center' | 'right';
  casseTitresSection?: 'uppercase' | 'capitalize' | 'normal';
  ombre?: 'none' | 'sm' | 'md' | 'lg';

  // Specific Customizations: Expériences
  styleExperienceLayout?: 'classic' | 'timeline' | 'cards' | 'boxed' | 'minimal';
  couleurPosteExperience?: string;
  couleurDatesExperience?: string;
  taillePolicePosteExperience?: number;
  styleOutilsExperience?: 'badges' | 'outline' | 'tags' | 'dots' | 'stars' | 'progress' | 'text' | 'none';
  afficherNiveauOutils?: 'toujours' | 'si_renseigne' | 'masquer';
  styleNiveauOutils?: 'etoiles' | 'note' | 'pastilles' | 'barre';
  couleurFondOutilsExp?: string;
  couleurTexteOutilsExp?: string;
  couleurBordureOutilsExp?: string;

  // Specific Customizations: Formations
  styleFormationLayout?: 'classic' | 'cards' | 'timeline' | 'boxed';
  alignementDatesFormation?: 'left' | 'top' | 'inline' | 'right';
  couleurDiplomeFormation?: string;
  couleurDatesFormation?: string;

  // Specific Customizations: Compétences & Outils
  styleNiveauCompetence?: 'progress' | 'stars' | 'numeric' | 'percentage' | 'dots' | 'segmented' | 'badge-text' | 'none' | string;
  styleCompetencesLayout?: 'grid' | 'tech-cards' | 'badges' | 'tags' | 'stars' | 'progress' | 'list' | 'badges-multicolor' | 'circular-progress' | 'icon-card-grid' | 'cards-modern' | 'grid-3' | 'minimal-cards' | 'pill-bars' | 'striped-table';
  styleOutilsCompetences?: 'badges' | 'outline' | 'tags' | 'dots' | 'text' | 'solid';
  afficherNiveauOutilsCompetences?: 'si_renseigne' | 'toujours' | 'masquer';
  styleNiveauOutilsCompetences?: 'etoiles' | 'note' | 'pourcentage' | 'pastilles' | 'barre' | 'badge-text';
  tailleOutils?: 'petit' | 'moyen' | 'grand';
  tailleOutilsPx?: number;
  policeOutils?: string;
  couleurOutils?: string;
  couleurFondOutils?: string;
  couleurBordureOutils?: string;
  couleurJaugeNiveau?: string;
  styleOutilsBadge?: 'pill' | 'outline' | 'card' | 'flat' | 'solid';
  photoRayon?: number; // Custom border-radius in px (0 to 100)
  photoX?: number; // Position X relative in % (0 to 100)
  photoY?: number; // Position Y relative in % (0 to 100)
  hauteurEnTetePx?: number; // Hauteur de l'en-tête/profil en px (ex: 40 à 300)
  grandTitreMode?: 'nom' | 'poste' | 'custom';
  tailleTitrePrincipal?: number;
  ribbonOpacite?: number;
  titrePrincipalEnGrand?: string;
  grandTitreTexte?: string;
  photoZoom?: number;
  photoCropX?: number;
  photoCropY?: number;
  afficherResumeSeulFullWidth?: boolean;
  resumeFullWidth?: boolean;
  // Option to place professional profile inside the header
  profilDansEnTete?: boolean;

  sections: Section[];
  statutPaiement: StatutPaiement;
  // Preservation & Custom adaptation metadata
  isModified?: boolean; // Flag if this CV was tailored/customized for a specific job offer
  parentCvId?: string; // ID of the original source CV
  jobContextSlug?: string; // Slug of Job Landing Page context if created via programmatic SEO
  jobTargetTitle?: string; // Name of targeted position
  jobTargetCompany?: string; // Name of targeted company
  jobMatchRate?: number; // Match rate percentage (e.g. 92)
  adaptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedLetter {
  id: string;
  utilisateurId: string;
  cvId?: string; // Associated source CV ID
  titre: string; // Title given to this letter (e.g. "Lettre Développeur - TotalEnergies")
  destinataire: string; // e.g. "Direction des Ressources Humaines"
  entreprise: string; // e.g. "Société Générale"
  poste: string; // e.g. "Chef de Projet Digital"
  villeDate?: string; // e.g. "Douala, le 15 Août 2026"
  dateCreation: string;
  updatedAt: string;
  langue: Language;
  police?: string;
  taillePolice?: number;
  couleurAccent?: string;
  expediteur: {
    nomComplet: string;
    titreProfessionnel?: string;
    email: string;
    telephone: string;
    adresse: string;
    ville?: string;
  };
  objet: string;
  formulePolitesseEntree: string;
  paragrapheAccroche: string;
  paragrapheValeurAjoutee: string;
  paragrapheAdequationEntreprise: string;
  paragrapheConclusion: string;
  formulePolitesseSortie: string;
  texteComplet: string;
  signature?: string;
}

export interface CustomPreset {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  cvData: Partial<CV>;
}

export interface Payment {
  id: string;
  utilisateurId: string;
  cvId: string;
  montant: number; // 100 FCFA
  numeroReception: string; // '658606103' | '653998494'
  numeroExpediteur: string;
  referenceTransaction: string;
  statut: StatutPayment;
  noteAdmin?: string;
  valideLe?: string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
  cvTitle?: string;
}

export * from './types/document';

export type TemplateCategory = 'moderne' | 'classique' | 'creatif' | 'minimaliste' | 'executif' | 'technique' | 'academique' | 'professionnel' | 'modern' | 'classic' | 'creative' | 'minimal' | 'executive' | 'tech' | 'professional';

export interface CVTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: {
    fr: string;
    en: string;
    ar?: string;
  };
  layoutType: string;
  layoutFamily?: 'single-column' | 'two-column-left' | 'two-column-right';
  supportsSecondaryAccent?: boolean;
  defaultAccent: string;
  defaultSecondaryAccent?: string;
  defaultFont: string;
  badgeText?: string;
  previewImage?: string;
  preview?: string;
  requiredTier?: SubscriptionTier; // 'freemium' | 'classique' | 'premium'
  // Unified Theme Definition Preset
  themeConfig?: Partial<CVTheme> | Record<string, any>;
}

// Section data interfaces
export interface ProfilContenu {
  nomComplet: string;
  titreProfessionnel: string;
  email: string;
  telephone: string;
  adresse: string;
  siteWeb?: string;
  linkedin?: string;
  github?: string;
  dateNaissance?: string;
  permis?: string;
  resume: string;
}

export interface ExperienceItem {
  id: string;
  poste: string;
  entreprise: string;
  ville: string;
  dateDebut: string;
  dateFin: string;
  actuel: boolean;
  description: string;
  taches?: string[];
  outils?: SubCompetenceItem[] | string[];
  technologies?: SubCompetenceItem[] | string[];
}

export interface FormationItem {
  id: string;
  diplome: string;
  etablissement: string;
  ville: string;
  dateDebut: string;
  dateFin: string;
  actuel?: boolean;
  description?: string;
}

export interface SubCompetenceItem {
  id: string;
  nom: string;
  note?: number; // 1 to 10 score
  niveau?: number; // 1 to 10 or 0 to 100 score
}

export interface CompetenceItem {
  id: string;
  nom: string;
  niveau?: number; // 0 to 10
  sousTitre?: string; // e.g. "Développeur Backend"
  categorie?: string;
  description?: string;
  sousCompetences?: string; // Legacy string or raw text
  listSousCompetences?: SubCompetenceItem[]; // Structured array of sub-competences
  styleSousCompetences?: 'badges' | 'puces' | 'tirets' | 'gras' | 'italique' | 'texte_libre' | 'barres';
}

export interface CompetenceGroupe {
  id: string;
  sousTitre?: string;
  competences: CompetenceItem[];
}

export interface LangueItem {
  id: string;
  langue: string;
  niveau: string; // e.g. "Courant (C1)", "Maternelle", "Intermédiaire (B2)"
}

export interface PersonnaliseeContenu {
  typeLayout: 'liste' | 'texte_libre' | 'grille';
  texteLibre?: string;
  items?: Array<{
    id: string;
    titre: string;
    sousTitre?: string;
    date?: string;
    description?: string;
  }>;
}

export interface ProjetItem {
  id: string;
  titre?: string;
  nom?: string;
  role?: string;
  sousTitre?: string;
  dateDebut?: string;
  dateFin?: string;
  lien?: string;
  technologies?: string | string[];
  description: string;
}

export interface CertificationItem {
  id: string;
  nom: string;
  organisme: string;
  annee?: string;
  dateObtention?: string;
  idCertification?: string;
  lien?: string;
}

export interface InteretItem {
  id: string;
  nom: string;
  icone?: string;
  details?: string;
}

export interface ReferenceItem {
  id: string;
  nomComplet: string;
  poste: string;
  entreprise: string;
  email?: string;
  telephone?: string;
  relation?: string;
}

export interface BenevolatItem {
  id: string;
  role: string;
  organisation: string;
  ville?: string;
  dateDebut?: string;
  dateFin?: string;
  actuel?: boolean;
  description?: string;
}

export interface PublicationItem {
  id: string;
  titre: string;
  editeurOuRevue?: string;
  datePublication?: string;
  auteurs?: string;
  lien?: string;
  description?: string;
}

export interface DistinctionItem {
  id: string;
  titre: string;
  organisme?: string;
  annee?: string;
  description?: string;
}

export interface QualiteItem {
  id: string;
  nom: string;
  description?: string;
}

// AI Career Tools Types
export interface LettreMotivationResult {
  destinataire?: string;
  entreprise?: string;
  poste?: string;
  objet: string;
  formulePolitesseEntree: string;
  paragrapheAccroche: string;
  paragrapheValeurAjoutee: string;
  paragrapheAdequationEntreprise: string;
  paragrapheConclusion: string;
  formulePolitesseSortie: string;
  texteComplet: string;
}

export interface LinkedInProfileResult {
  titreProfessionnel: string; // Headline percutante
  resumeAPropos: string; // Bio / About
  motsClesStrategiques: string[];
  experiencesOptimisees: Array<{
    poste: string;
    entreprise: string;
    pointsCles: string[];
  }>;
  conseilsVisibilite: string[];
}

export interface JobOfferExtraction {
  titrePoste: string;
  entreprise?: string;
  lieu?: string;
  competencesClesRequises?: string[];
  competencesRequises?: string[];
  competencesCles?: string[];
  pointsFortsDetectes?: string[];
  couleurDetectee?: string;
  couleurSecondaire?: string;
  nomCouleurMarque?: string;
  // Suggestion pour le profil pro (titre & accroche orientée)
  suggestionsProfil?: {
    titreSuggere: string;
    resumeSuggere: string;
  };
  // Compétences classées par priorité
  competencesPriorisees?: Array<{
    nom: string;
    priorite: 'haute' | 'moyenne' | 'standard';
    dejaPresente?: boolean;
    justification?: string;
  }>;
  // Suggestions interactives de reformulation pour les expériences du candidat
  suggestionsExperiences?: Array<{
    experienceId?: string;
    poste: string;
    entreprise: string;
    periode?: string;
    descriptionOriginale?: string;
    descriptionSuggeree: string;
    competencesCiblees?: string[];
    conseils?: string;
  }>;
  // Questions ciblées compétences et expériences (pour ne rien inventer)
  questionsCompetences?: Array<{
    id: string;
    question: string;
    description?: string;
    contexte?: string;
  }>;
  questionsExperiences?: Array<{
    id: string;
    question: string;
    description?: string;
    contexte?: string;
  }>;
  questionsPrecision?: Array<{
    id: string;
    question: string;
    description: string;
    contexte: string;
  }>;
  questionsPersonnalisees?: Array<{
    id: string;
    question: string;
    description: string;
    contexte: string;
  }>;
}

export type OffreEmploiAnalyse = JobOfferExtraction;

export interface PersonnalisationResult {
  cvModifie?: CV;
  cvPersonnalise?: CV;
  lettreMotivation?: LettreMotivationResult;
  modificationsApportees: string[];
  tauxCorrespondanceEstime: number;
  couleurDetectee?: string;
  couleurSecondaire?: string;
  nomCouleurMarque?: string;
}

export type OffreAdaptationResult = PersonnalisationResult;

export interface LinkedInOptimizationResult {
  titreProfil: string; // Headline
  resumeBio: string; // Bio / About section
  motsClesRecommandes: string[];
  experiencesLinkedIn: Array<{
    titrePoste: string;
    pointsCles: string[];
  }>;
  conseilsVisibilite: string[];
}

// -------------------------------------------------------------
// NOTIFICATIONS & EMAIL BROADCAST TYPES
// -------------------------------------------------------------
export type NotificationType = 
  | 'FEATURE_FREE' 
  | 'NOUVEAUTE_IA' 
  | 'PROMO' 
  | 'MODELES_HD' 
  | 'PWA_DISPO' 
  | 'SYSTEM'
  | 'INFO'
  | 'SUCCESS';

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  cible: 'TOUS' | 'freemium' | 'decouverte' | 'classique' | 'premium';
  lien?: string;
  badge?: string;
  envoyeParEmail: boolean;
  nombreEmailsEnvoyes?: number;
  luPar: string[]; // User IDs who marked as read
  dateCreation: string;
  auteur?: string;
  isRead?: boolean; // Evaluated client-side or server-side for the current user
}



