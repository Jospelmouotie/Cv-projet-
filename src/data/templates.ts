import { CVTemplate } from '../types';

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: 'modele-1',
    name: 'Modèle 1 — Vert Canard (Intérimaire Pro)',
    category: 'moderne',
    description: {
      fr: 'En-tête bleu/vert canard avec titre majuscule, photo sur fond bleu glacé à gauche et mise en page claire.',
      en: 'Teal/cyan top header banner, left ice-blue sidebar with top-left portrait and structured sections.'
    },
    layoutType: 'interimaire-teal',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#006666',
    defaultSecondaryAccent: '#E6F0F2',
    defaultFont: 'Inter',
    badgeText: 'Modèle Photo 1',
    themeConfig: {
      primaryColor: '#006666',
      secondaryColor: '#E6F0F2',
      sidebarBackgroundColor: '#E6F0F2',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'underline',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-2',
    name: 'Modèle 2 — Prune & Arche (Aïssatou Mdalé)',
    category: 'creatif',
    description: {
      fr: 'Design violet/prune élégant, photo dans une arche arrondie sur fond clair, parfait pour créatifs et artistes.',
      en: 'Deep plum purple background with light arch photo frame and delicate dashed typography.'
    },
    layoutType: 'aissatou-plum',
    layoutFamily: 'two-column-right',
    supportsSecondaryAccent: true,
    defaultAccent: '#381A3C',
    defaultSecondaryAccent: '#EADDF0',
    defaultFont: 'Playfair Display',
    badgeText: 'Modèle Photo 2',
    themeConfig: {
      primaryColor: '#381A3C',
      secondaryColor: '#EADDF0',
      sidebarBackgroundColor: '#381A3C',
      sidebarTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'arch',
      sectionHeaderStyle: 'pill',
      skillsDisplayMode: 'badges',
      experienceDatesAlignment: 'inline'
    }
  },
  {
    id: 'modele-3',
    name: 'Modèle 3 — Cyan & Charbon (Brian Baxter)',
    category: 'executif',
    description: {
      fr: 'Médaillon photo cyan en haut à gauche sur colonne sombre, ligne de temps cyan et jauges de compétences.',
      en: 'Cyan medallion portrait on dark charcoal column with vertical timeline and level meters.'
    },
    layoutType: 'baxter-cyan',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#00B4D8',
    defaultSecondaryAccent: '#22252A',
    defaultFont: 'Outfit',
    badgeText: 'Modèle Photo 3',
    themeConfig: {
      primaryColor: '#00B4D8',
      secondaryColor: '#22252A',
      sidebarBackgroundColor: '#22252A',
      sidebarTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'modern-split',
      sectionHeaderStyle: 'left-border',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-4',
    name: 'Modèle 4 — Écusson Violet Central (Infirmière)',
    category: 'classique',
    description: {
      fr: 'Cadre épuré avec écusson violet centré pour les coordonnées, barres de section violettes et style soigné.',
      en: 'Central purple header shield badge with structured purple section dividers.'
    },
    layoutType: 'infirmiere-purple',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#522166',
    defaultFont: 'Inter',
    badgeText: 'Modèle Photo 4',
    themeConfig: {
      primaryColor: '#522166',
      secondaryColor: '#F3E8FF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'clean',
      sectionHeaderStyle: 'boxed',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'top'
    }
  },
  {
    id: 'modele-5',
    name: 'Modèle 5 — Vagues Océan (Joseph Carlier)',
    category: 'creatif',
    description: {
      fr: 'Motifs de vagues organiques bleu vert en haut et en bas, fond eau doux et lignes pointillées de formation.',
      en: 'Organic ocean wave contours at top and bottom on soft ice-green background.'
    },
    layoutType: 'ocean-wave-carlier',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#3B8B88',
    defaultFont: 'Lato',
    badgeText: 'Modèle Photo 5',
    themeConfig: {
      primaryColor: '#3B8B88',
      secondaryColor: '#E6F4F1',
      backgroundColor: '#F0FDF4',
      headerStyle: 'clean',
      sectionHeaderStyle: 'double-line',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'inline'
    }
  },
  {
    id: 'modele-6',
    name: 'Modèle 6 — Bleu Roi Intérimaire (Assistant Admin)',
    category: 'moderne',
    description: {
      fr: 'Bandeau bleu roi supérieur avec photo rectangulaire et extrait de profil, jauges de compétences bleues.',
      en: 'Royal blue header banner with portrait, summary block, and progress bar skills column.'
    },
    layoutType: 'interimaire-royal-blue',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#1D3557',
    defaultFont: 'Inter',
    badgeText: 'Modèle Photo 6',
    themeConfig: {
      primaryColor: '#1D3557',
      secondaryColor: '#F0F4F8',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'banner',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-7',
    name: 'Modèle 7 — Célia Naudin (Beige Arch & Étoiles)',
    category: 'creatif',
    description: {
      fr: 'Colonne gauche beige sable avec arche photo, typographie à étoiles ✨ et pilules de compétences.',
      en: 'Warm sand arch column on left, serif headlines with star icons and skill tag buttons.'
    },
    layoutType: 'celia-beige-arch',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#D8C3A5',
    defaultSecondaryAccent: '#E8DED1',
    defaultFont: 'Playfair Display',
    badgeText: 'Modèle Photo 7',
    themeConfig: {
      primaryColor: '#D8C3A5',
      secondaryColor: '#E8DED1',
      sidebarBackgroundColor: '#E8DED1',
      backgroundColor: '#FFFFFF',
      headerStyle: 'arch',
      sectionHeaderStyle: 'stars',
      skillsDisplayMode: 'badges',
      experienceDatesAlignment: 'inline'
    }
  },
  {
    id: 'modele-8',
    name: 'Modèle 8 — Hexagone Top Manager (Michael Johnson)',
    category: 'executif',
    description: {
      fr: 'Cadre photo hexagonal au centre-haut de la colonne bleu nuit, lignes verticales d\'accent orange.',
      en: 'Hexagonal portrait frame centered atop dark navy sidebar with bright orange timeline accents.'
    },
    layoutType: 'michael-hexagon-navy',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#1B2A4A',
    defaultSecondaryAccent: '#F4A261',
    defaultFont: 'Outfit',
    badgeText: 'Modèle Photo 8',
    themeConfig: {
      primaryColor: '#1B2A4A',
      secondaryColor: '#F4A261',
      sidebarBackgroundColor: '#1B2A4A',
      sidebarTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'modern-split',
      sectionHeaderStyle: 'left-border',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-9',
    name: 'Modèle 9 — Ardoise & Cartes (Exécutif Pro)',
    category: 'executif',
    description: {
      fr: 'En-tête gris ardoise noble, séparateur doré, cartes d\'expériences structurées en double colonne.',
      en: 'Noble slate header with gold accent stripe and clean structured cards.'
    },
    layoutType: 'slate-executive',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#2D3748',
    defaultFont: 'Roboto',
    badgeText: 'Modèle Photo 9',
    themeConfig: {
      primaryColor: '#2D3748',
      secondaryColor: '#EDF2F7',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'underline',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-10',
    name: 'Modèle 10 — Studio Minimaliste Noir (Noel Taylor)',
    category: 'minimaliste',
    description: {
      fr: 'Design éditorial ultra moderne noir et blanc, ligne verticale d\'accentuation et typographie d\'auteur.',
      en: 'Ultra modern black and white editorial layout with accent line and modern sans-serif fonts.'
    },
    layoutType: 'minimal-studio-black',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#1A202C',
    defaultFont: 'Poppins',
    badgeText: 'Modèle Photo 10',
    themeConfig: {
      primaryColor: '#1A202C',
      secondaryColor: '#F7FAFC',
      backgroundColor: '#FFFFFF',
      headerStyle: 'clean',
      sectionHeaderStyle: 'minimal',
      skillsDisplayMode: 'badges',
      experienceDatesAlignment: 'inline'
    }
  },
  {
    id: 'modele-11',
    name: 'Modèle 11 — Bordeaux Royal & Cadre Doré (Luxe Exécutif)',
    category: 'executif',
    description: {
      fr: 'En-tête rouge bordeaux majestueux avec liseré doré et typographie classique raffinée.',
      en: 'Royal burgundy header with gold trim and refined classic typography.'
    },
    layoutType: 'bordeaux-gold-luxury',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#800020',
    defaultFont: 'Georgia',
    badgeText: 'Modèle Photo 11',
    themeConfig: {
      primaryColor: '#800020',
      secondaryColor: '#FDF2F2',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'double-line',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-12',
    name: 'Modèle 12 — Vert Émeraude & Cartes (Tech & Consulting)',
    category: 'moderne',
    description: {
      fr: 'Fond vert émeraude profond avec cartes arrondies pour les expériences et barres de progression.',
      en: 'Deep emerald green canvas with rounded cards and skill level bars.'
    },
    layoutType: 'emerald-rounded-tech',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#064E3B',
    defaultFont: 'Arial',
    badgeText: 'Modèle Photo 12',
    themeConfig: {
      primaryColor: '#064E3B',
      secondaryColor: '#ECFDF5',
      backgroundColor: '#FFFFFF',
      headerStyle: 'clean',
      sectionHeaderStyle: 'pill',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-13',
    name: 'Modèle 13 — Terracotta & Géométrie (Marketing & Design)',
    category: 'creatif',
    description: {
      fr: 'Nuances terracotta chaleureuses, bande diagonale moderne et badges de compétences épurés.',
      en: 'Warm terracotta tones with modern diagonal header and skill badges.'
    },
    layoutType: 'terracotta-creative',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#C2410C',
    defaultFont: 'Montserrat',
    badgeText: 'Modèle Photo 13',
    themeConfig: {
      primaryColor: '#C2410C',
      secondaryColor: '#FFEDD5',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'pill',
      skillsDisplayMode: 'badges',
      experienceDatesAlignment: 'inline'
    }
  },
  {
    id: 'modele-14',
    name: 'Modèle 14 — Bleu Marine & Lignes Dorées (Finance & Avocat)',
    category: 'classique',
    description: {
      fr: 'Double colonne équilibrée bleu marine et or, parfaite pour juristes, comptables et cadres.',
      en: 'Balanced navy and gold double column, tailored for lawyers, accountants and managers.'
    },
    layoutType: 'navy-gold-executive',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#0F172A',
    defaultSecondaryAccent: '#D4AF37',
    defaultFont: 'Times New Roman',
    badgeText: 'Modèle Photo 14',
    themeConfig: {
      primaryColor: '#0F172A',
      secondaryColor: '#FEF3C7',
      sidebarBackgroundColor: '#0F172A',
      sidebarTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'double-line',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-15',
    name: 'Modèle 15 — Vert Olive Nature (Ingénierie & Développement)',
    category: 'minimaliste',
    description: {
      fr: 'Colonne gauche vert olive pastel apaisant, mise en page aérée et frise chronologique épurée.',
      en: 'Soothing pastel olive sidebar, airy layout and minimal timeline.'
    },
    layoutType: 'olive-nature-engineering',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#3F6212',
    defaultSecondaryAccent: '#ECF3E8',
    defaultFont: 'Calibri',
    badgeText: 'Modèle Photo 15',
    themeConfig: {
      primaryColor: '#3F6212',
      secondaryColor: '#ECF3E8',
      sidebarBackgroundColor: '#ECF3E8',
      backgroundColor: '#FFFFFF',
      headerStyle: 'clean',
      sectionHeaderStyle: 'left-border',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-16',
    name: 'Modèle 16 — Vert Canard Executive (Charles Sartré)',
    category: 'executif',
    description: {
      fr: 'Colonne gauche vert canard élégante avec jauges de compétences et certification, colonne principale épurée.',
      en: 'Teal left column with progress bars and certifications, clean right main column.'
    },
    layoutType: 'sartre-teal-executive',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#237A62',
    defaultSecondaryAccent: '#114B3B',
    defaultFont: 'Arial',
    badgeText: 'Nouveau Modèle 16',
    themeConfig: {
      primaryColor: '#237A62',
      secondaryColor: '#E6F4F1',
      sidebarBackgroundColor: '#237A62',
      sidebarTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'underline',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-17',
    name: 'Modèle 17 — Dark Navy Arch (Thomas Durant)',
    category: 'executif',
    description: {
      fr: 'En-tête arche bleu nuit avec photo en médaillon supérieur, colonne sombre et section profil soignée.',
      en: 'Dark navy rounded arch header with top circular photo and clean structured profile.'
    },
    layoutType: 'durant-navy-arch',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#0A192F',
    defaultFont: 'Montserrat',
    badgeText: 'Nouveau Modèle 17',
    themeConfig: {
      primaryColor: '#0A192F',
      secondaryColor: '#E2E8F0',
      backgroundColor: '#FFFFFF',
      headerStyle: 'arch',
      sectionHeaderStyle: 'left-border',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-18',
    name: 'Modèle 18 — Ardoise & Bannières Dorées',
    category: 'classique',
    description: {
      fr: 'Colonne gauche bleu ardoise avec photo ronde, titres de section surlignés en bannières dorées.',
      en: 'Slate left column with circular portrait, right section headers highlighted with soft gold banners.'
    },
    layoutType: 'slate-gold-banners',
    layoutFamily: 'two-column-left',
    supportsSecondaryAccent: true,
    defaultAccent: '#3A4750',
    defaultSecondaryAccent: '#D4AF37',
    defaultFont: 'Inter',
    badgeText: 'Nouveau Modèle 18',
    themeConfig: {
      primaryColor: '#3A4750',
      secondaryColor: '#FEF3C7',
      sidebarBackgroundColor: '#3A4750',
      sidebarTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'banner',
      skillsDisplayMode: 'grid',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-19',
    name: 'Modèle 19 — Banderole Bleu Roi (Intérimaire Pro)',
    category: 'moderne',
    description: {
      fr: 'En-tête banderole bleu roi majestueux avec photo carrée et résumé, colonne droite bleu glacé avec jauges.',
      en: 'Royal blue top banner with summary and left photo, right ice-blue column with skill meters.'
    },
    layoutType: 'royal-blue-banner-grid',
    layoutFamily: 'two-column-right',
    supportsSecondaryAccent: true,
    defaultAccent: '#1E3A8A',
    defaultSecondaryAccent: '#EFF6FF',
    defaultFont: 'Roboto',
    badgeText: 'Nouveau Modèle 19',
    themeConfig: {
      primaryColor: '#1E3A8A',
      secondaryColor: '#EFF6FF',
      sidebarBackgroundColor: '#EFF6FF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'banner',
      sectionHeaderStyle: 'underline',
      skillsDisplayMode: 'progress',
      experienceDatesAlignment: 'left'
    }
  },
  {
    id: 'modele-20',
    name: 'Modèle 20 — Courbes Vertes (Michel Martin)',
    category: 'creatif',
    description: {
      fr: 'Frise de vagues courbes vertes sur le bord gauche, titres vert lime et compétences par domaines.',
      en: 'Green wave curves along the left edge, lime green titles and categorized domain skills.'
    },
    layoutType: 'michel-green-curves',
    layoutFamily: 'single-column',
    supportsSecondaryAccent: false,
    defaultAccent: '#65A30D',
    defaultFont: 'Trebuchet MS',
    badgeText: 'Nouveau Modèle 20',
    themeConfig: {
      primaryColor: '#65A30D',
      secondaryColor: '#ECFDF5',
      backgroundColor: '#FFFFFF',
      headerStyle: 'clean',
      sectionHeaderStyle: 'left-border',
      skillsDisplayMode: 'badges',
      experienceDatesAlignment: 'inline'
    }
  }
];

export const ACCENT_COLORS = [
  { hex: '#006666', name: 'Vert Canard' },
  { hex: '#381A3C', name: 'Prune Élégant' },
  { hex: '#00B4D8', name: 'Cyan Éclatant' },
  { hex: '#522166', name: 'Violet Écusson' },
  { hex: '#3B8B88', name: 'Teal Océan' },
  { hex: '#1D3557', name: 'Bleu Roi Marine' },
  { hex: '#D8C3A5', name: 'Sable Warm Beige' },
  { hex: '#1B2A4A', name: 'Bleu Nuit Hexagone' },
  { hex: '#2D3748', name: 'Gris Ardoise' },
  { hex: '#1A202C', name: 'Noir Studio' },
  { hex: '#800020', name: 'Bordeaux Royal' },
  { hex: '#064E3B', name: 'Vert Émeraude' },
  { hex: '#C2410C', name: 'Terracotta' },
  { hex: '#0F172A', name: 'Bleu Marine Or' },
  { hex: '#3F6212', name: 'Vert Olive' }
];

export const FONT_OPTIONS = [
  { id: 'Arial', name: 'Arial (Moderne Standard)', family: 'Arial, Helvetica, sans-serif' },
  { id: 'Calibri', name: 'Calibri (Bureautique Word)', family: 'Calibri, sans-serif' },
  { id: 'Times New Roman', name: 'Times New Roman (Sérieux / Classique)', family: '"Times New Roman", Times, serif' },
  { id: 'Georgia', name: 'Georgia (Sérif Élégant)', family: 'Georgia, serif' },
  { id: 'Garamond', name: 'Garamond (Littéraire / Luxe)', family: 'Garamond, serif' },
  { id: 'Helvetica', name: 'Helvetica (Clean / Pro)', family: 'Helvetica, Arial, sans-serif' },
  { id: 'Trebuchet MS', name: 'Trebuchet MS (Dynamique)', family: '"Trebuchet MS", sans-serif' },
  { id: 'Verdana', name: 'Verdana (Lisible / Aéré)', family: 'Verdana, sans-serif' },
  { id: 'Inter', name: 'Inter (Sans-Serif Pro)', family: 'Inter, sans-serif' },
  { id: 'Montserrat', name: 'Montserrat (Design / Titres)', family: 'Montserrat, sans-serif' },
  { id: 'Poppins', name: 'Poppins (Contemporain)', family: 'Poppins, sans-serif' },
  { id: 'Playfair Display', name: 'Playfair Display (Haute Couture)', family: '"Playfair Display", serif' },
  { id: 'Outfit', name: 'Outfit (Moderne)', family: 'Outfit, sans-serif' },
  { id: 'Roboto', name: 'Roboto (Neutre)', family: 'Roboto, sans-serif' },
  { id: 'Lato', name: 'Lato (Pur)', family: 'Lato, sans-serif' }
];

export const FONT_SIZES = [
  { id: '9pt', name: '9 pt (Très compact)' },
  { id: '10pt', name: '10 pt (Standard CV)' },
  { id: '11pt', name: '11 pt (Équilibré Word)' },
  { id: '12pt', name: '12 pt (Grand / Lisible)' },
  { id: '13pt', name: '13 pt (Inconfort visuel réduit)' },
  { id: '14pt', name: '14 pt (Large)' },
  { id: '16pt', name: '16 pt (Très grand)' }
];
