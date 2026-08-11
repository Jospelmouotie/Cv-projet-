export type Language = 'fr' | 'en';

export type StatutPaiement = 'NON_PAYE' | 'EN_ATTENTE' | 'EN_ATTENTE_VALIDATION' | 'PAYE';
export type StatutPayment = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface User {
  id: string;
  nom: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  langue: Language;
  createdAt: string;
}

export interface Section {
  id: string;
  type: 'profil' | 'experience' | 'formation' | 'competences' | 'langues' | 'personnalisee';
  titre: string;
  ordre: number;
  visible: boolean;
  colonne?: 'gauche' | 'droite' | 'principale';
  isExpanded?: boolean; // accordion state
  contenu: any; // Dynamic content based on section type
  // Optional individual section style overrides
  styleSection?: {
    couleurFond?: string;
    couleurTexte?: string;
    couleurTitre?: string;
    styleEntete?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line';
    styleCompetences?: 'grid' | 'list' | 'badges' | 'progress';
    alignementDates?: 'left' | 'top' | 'inline';
    rayonBordure?: number;
    epaisseurBordure?: number;
    ombre?: 'none' | 'sm' | 'md' | 'lg';
  };
}

export interface CVTheme {
  primaryColor: string; // couleurPrincipale / couleurAccent
  secondaryColor?: string;
  backgroundColor?: string;
  sidebarBackgroundColor?: string;
  textColor?: string;
  sidebarTextColor?: string;
  headingColor?: string;
  sidebarHeadingColor?: string;
  headerStyle?: 'banner' | 'clean' | 'card' | 'arch' | 'modern-split' | 'minimal' | 'luxury-gold' | 'ocean-wave' | 'diagonal-split' | 'organic-arch' | 'sidebar-top';
  sectionHeaderStyle?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header';
  separatorStyle?: 'solid' | 'dashed' | 'dotted' | 'thick' | 'none';
  skillsDisplayMode?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags' | 'circular-progress' | 'badges-multicolor';
  experienceDatesAlignment?: 'left' | 'top' | 'inline';
  borderRadiusVal?: number;
  borderWidthVal?: number;
  shadowVal?: 'none' | 'sm' | 'md' | 'lg';
  pageMarginVal?: number;
  columnGapVal?: number;
  photoFrameStyle?: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche' | 'galet';
  photoBorderColor?: string;
  photoBorderWidth?: number;
  decorativeShapes?: 'none' | 'circle-photo' | 'curved-sidebar-cut' | 'diagonal-split';
  photoPosition?: 'in-header' | 'in-sidebar';
}

export interface CV {
  id: string;
  utilisateurId: string;
  titre: string;
  templateId: string;
  langue: Language;
  couleurAccent: string;
  couleurAccentSecondaire?: string;
  // Theme & Layout Overrides for Mode Créateur Libre
  couleurFond?: string;
  couleurFondSidebar?: string;
  couleurTexte?: string;
  couleurTexteSidebar?: string;
  couleurTitreSection?: string;
  couleurTitreSectionSidebar?: string;
  styleEnTete?: 'banner' | 'clean' | 'card' | 'arch' | 'modern-split' | 'minimal' | 'luxury-gold' | 'ocean-wave' | 'diagonal-split' | 'organic-arch' | 'sidebar-top';
  styleEnTeteSection?: 'underline' | 'pill' | 'banner' | 'left-border' | 'minimal' | 'boxed' | 'stars' | 'double-line' | 'arch-block' | 'badge-header';
  styleCompetences?: 'grid' | 'list' | 'badges' | 'progress' | 'stars' | 'tags' | 'circular-progress' | 'badges-multicolor';
  stylePucesListes?: 'disc' | 'square' | 'arrow' | 'check' | 'star' | 'dash' | 'numbered' | 'none';
  alignementDatesExperience?: 'left' | 'top' | 'inline';
  nombreColonnes?: 1 | 2;
  positionSidebar?: 'gauche' | 'droite';
  rayonBordure?: number;
  epaisseurBordure?: number;
  ombreCarte?: 'none' | 'sm' | 'md' | 'lg';
  margeGlobalePage?: number;
  ecartColonnes?: number;
  photoBordureCouleur?: string;
  photoBordureEpaisseur?: number;

  // Mode Page Cible & Compactage Automatique
  pageCibleMode?: 'auto' | '1_page' | '2_pages' | 'compact';
  espacementSectionsPx?: number; // 0 to 30 px
  espacementItemsPx?: number; // 0 to 20 px

  // Titres de Sections Personnalisés
  tailleTitreSectionValeur?: number; // 8 to 26 pt
  casseTitreSection?: 'uppercase' | 'capitalize' | 'normal';
  alignementTitreSection?: 'left' | 'center' | 'right';
  grasTitreSection?: 'bold' | 'black' | 'medium' | 'normal';

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
  photoForme?: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche' | 'galet';
  photoTaille?: number; // Size in px e.g. 40-250
  photoPosition?: 'in-header' | 'in-sidebar';
  photoAlignement?: 'gauche' | 'centre' | 'droite';
  photoRayon?: number; // Custom border-radius in px (0 to 100)
  grandTitreMode?: 'nom' | 'poste';
  photoZoom?: number;
  photoCropX?: number;
  photoCropY?: number;
  sections: Section[];
  statutPaiement: StatutPaiement;
  createdAt: string;
  updatedAt: string;
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

export type TemplateCategory = 'moderne' | 'classique' | 'creatif' | 'minimaliste' | 'executif';

export interface CVTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: {
    fr: string;
    en: string;
  };
  layoutType: string;
  layoutFamily?: 'single-column' | 'two-column-left' | 'two-column-right';
  supportsSecondaryAccent?: boolean;
  defaultAccent: string;
  defaultSecondaryAccent?: string;
  defaultFont: string;
  badgeText?: string;
  // Unified Theme Definition Preset
  themeConfig?: CVTheme;
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
}

export interface FormationItem {
  id: string;
  diplome: string;
  etablissement: string;
  ville: string;
  dateDebut: string;
  dateFin: string;
  description?: string;
}

export interface SubCompetenceItem {
  id: string;
  nom: string;
  note?: number; // 1 to 10 score
}

export interface CompetenceItem {
  id: string;
  nom: string;
  niveau: number; // 1-5
  categorie?: string;
  sousCompetences?: string; // Legacy string or raw text
  listSousCompetences?: SubCompetenceItem[]; // Structured array of sub-competences
  styleSousCompetences?: 'badges' | 'puces' | 'tirets' | 'gras' | 'italique' | 'texte_libre' | 'barres';
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
