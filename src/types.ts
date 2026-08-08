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
  contenu: any; // Dynamic content based on section type
}

export interface CV {
  id: string;
  utilisateurId: string;
  titre: string;
  templateId: string;
  langue: Language;
  couleurAccent: string;
  police: string;
  taillePolice?: string;
  hauteurLigne?: 'tight' | 'normal' | 'relaxed' | 'loose';
  ecartementTexte?: 'tight' | 'normal' | 'wide' | 'widest';
  margeSection?: 'compact' | 'normal' | 'spacious';
  photoUrl?: string;
  afficherPhoto?: boolean;
  photoForme?: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche';
  photoTaille?: number; // Size in px e.g. 60-180
  grandTitreMode?: 'nom' | 'poste';
  photoZoom?: number;
  photoCropX?: number;
  photoCropY?: number;
  sections: Section[];
  statutPaiement: StatutPaiement;
  createdAt: string;
  updatedAt: string;
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
  defaultAccent: string;
  defaultFont: string;
  badgeText?: string;
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
