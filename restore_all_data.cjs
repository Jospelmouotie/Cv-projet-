const fs = require('fs');

// =========================================================================
// 1. CREATE templates.ts
// =========================================================================

const fontOptions = [
  { id: "Inter", name: "Inter (Moderne & Net)", family: "Inter", fontCss: "Inter, sans-serif" },
  { id: "Roboto", name: "Roboto (Google Standard)", family: "Roboto", fontCss: "Roboto, sans-serif" },
  { id: "Open Sans", name: "Open Sans (Neutre & Lisible)", family: "Open Sans", fontCss: '"Open Sans", sans-serif' },
  { id: "Lato", name: "Lato (Corporate Contemporain)", family: "Lato", fontCss: "Lato, sans-serif" },
  { id: "Montserrat", name: "Montserrat (Audacieux & Géométrique)", family: "Montserrat", fontCss: "Montserrat, sans-serif" },
  { id: "Poppins", name: "Poppins (Moderne & Chaleureux)", family: "Poppins", fontCss: "Poppins, sans-serif" },
  { id: "Raleway", name: "Raleway (Élégant & Fin)", family: "Raleway", fontCss: "Raleway, sans-serif" },
  { id: "Merriweather", name: "Merriweather (Sérif Littéraire)", family: "Merriweather", fontCss: "Merriweather, serif" },
  { id: "Playfair Display", name: "Playfair Display (Luxe & Exécutif)", family: "Playfair Display", fontCss: '"Playfair Display", serif' },
  { id: "Source Sans 3", name: "Source Sans 3 (Éditorial & Pro)", family: "Source Sans 3", fontCss: '"Source Sans 3", sans-serif' },
  { id: "Ubuntu", name: "Ubuntu (Tech & Innovant)", family: "Ubuntu", fontCss: "Ubuntu, sans-serif" },
  { id: "Nunito", name: "Nunito (Doux & Accessible)", family: "Nunito", fontCss: "Nunito, sans-serif" }
];

const colorPalettes = [
  { name: "Bleu Corporate", hex: "#2563EB" },
  { name: "Bleu Nuit", hex: "#1E3A8A" },
  { name: "Indigo Moderne", hex: "#4F46E5" },
  { name: "Violet Exécutif", hex: "#7C3AED" },
  { name: "Émeraude Végétal", hex: "#059669" },
  { name: "Vert Forêt", hex: "#15803D" },
  { name: "Teal Océan", hex: "#0D9488" },
  { name: "Corail Vibrant", hex: "#F97316" },
  { name: "Ambre Chaud", hex: "#D97706" },
  { name: "Bordeaux Profond", hex: "#881337" },
  { name: "Anthracite Neutre", hex: "#334155" },
  { name: "Noir Pur & Minimal", hex: "#18181B" }
];

const templatesDefinitions = [
  {
    id: "modele-1",
    name: "Éléonore — Découpe Diagonale",
    category: "moderne",
    description: {
      fr: "En-tête dynamique bicolore avec coupe diagonale nette et mise en page épurée.",
      en: "Dynamic two-tone header with a clean diagonal cut and elegant layout.",
      ar: "ترويسة ديناميكية بلونين مع قصة مائلة وتنسيق أنيق."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#2563EB",
    defaultSecondaryAccent: "#F97316",
    defaultFont: "Inter",
    badgeText: "Populaire",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "diagonal-split",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-2",
    name: "Michel — Ruban Vert",
    category: "professionnel",
    description: {
      fr: "Ruban latéral distinctive vert sapin avec photo en médaillon et timeline structurée.",
      en: "Distinctive green lateral ribbon with cameo photo and structured timeline.",
      ar: "شريط جانبي أخضر مميز مع صورة دائرية وجدول زمني منظم."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#059669",
    defaultSecondaryAccent: "#10B981",
    defaultFont: "Roboto",
    badgeText: "Classique Pro",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sidebar-top",
      styleEnTeteSection: "left-border",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-3",
    name: "Sacha — Vague Organique",
    category: "creatif",
    description: {
      fr: "Courbe fluide et organique inspirée du design scandinave avec cartouches contemporains.",
      en: "Fluid organic wave inspired by Scandinavian design with contemporary cards.",
      ar: "منحنى انسيابي مستوحى من التصميم الإسكندنافي مع بطاقات حديثة."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#0D9488",
    defaultSecondaryAccent: "#14B8A6",
    defaultFont: "Montserrat",
    badgeText: "Coup de Cœur",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sylvie-wave",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-4",
    name: "Laura — Minimal Émeraude",
    category: "minimaliste",
    description: {
      fr: "Design sobre à haute lisibilité avec accents émeraude discrets et typographie aérée.",
      en: "Understated high-readability design with discrete emerald accents.",
      ar: "تصميم بسيط عالي الوضوح مع لمسات زمردية راقية."
    },
    layoutType: "minimaliste",
    layoutFamily: "two-column-left",
    defaultAccent: "#059669",
    defaultSecondaryAccent: "#34D399",
    defaultFont: "Lato",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "minimal",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-5",
    name: "Alexandre — Ruban Bicolore",
    category: "moderne",
    description: {
      fr: "Architecture en colonnes nettes avec bandeau contrasté pour profils technologiques et IT.",
      en: "Sharp two-column architecture with contrasted banner for tech profiles.",
      ar: "تنسيق عمودي بأعمدة واضحة وشريط متباين للملفات التقنية."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#2563EB",
    defaultSecondaryAccent: "#38BDF8",
    defaultFont: "Inter",
    badgeText: "Recommandé IT",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "two-tone-split",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-6",
    name: "Léa — Arche Studio",
    category: "creatif",
    description: {
      fr: "Arche supérieure élégante style portfolio pour designers, créatifs et communicants.",
      en: "Elegant upper arch portfolio style for designers and creatives.",
      ar: "قوس علوي أنيق لملفات المصممين والمبدعين."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#7C3AED",
    defaultSecondaryAccent: "#A78BFA",
    defaultFont: "Poppins",
    badgeText: "Créatif Pro",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    nom: "Marc — Badges Chocolat",
    id: "modele-7",
    name: "Marc — Badges Chocolat",
    category: "professionnel",
    description: {
      fr: "Teintes chaudes ambrées et badges de compétences percutants pour cadres opérationnels.",
      en: "Warm amber tones and impactful skill badges for operational managers.",
      ar: "نغمات كهرمانية دافئة وشارات كفاءة قوية للمديرين التنفيذيين."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#D97706",
    defaultSecondaryAccent: "#F59E0B",
    defaultFont: "Roboto",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "boxed",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-8",
    name: "Amélie — Corporate Marine",
    category: "executif",
    description: {
      fr: "Bleu marine institutionnel et typographie sérif pour profils exécutifs, finance et juridique.",
      en: "Institutional navy blue and serif typography for executive, finance, and legal profiles.",
      ar: "كحلي مؤسسي مع خط كلاسيكي للمناصب القيادية والمالية."
    },
    layoutType: "executif",
    layoutFamily: "two-column-left",
    defaultAccent: "#1E3A8A",
    defaultSecondaryAccent: "#3B82F6",
    defaultFont: "Merriweather",
    badgeText: "Exécutif",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "double-line",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-9",
    name: "Thomas — Violet Moderne",
    category: "moderne",
    description: {
      fr: "Nuances violettes contemporaines et structure modulaire pour métiers du digital et SaaS.",
      en: "Contemporary violet hues and modular layout for digital and SaaS professionals.",
      ar: "درجات بنفسجية معاصرة وهيكل تركيبي لمهن الرقمنة."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#6366F1",
    defaultSecondaryAccent: "#818CF8",
    defaultFont: "Inter",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-10",
    name: "Claire — Bandeau Latéral & Pastilles",
    category: "professionnel",
    description: {
      fr: "Colonne latérale teintée avec pastilles de compétences pour profils RH et gestion.",
      en: "Tinted side column with skill dots for HR and administration profiles.",
      ar: "عمود جانبي ملون مع مؤشرات نقطية لإداريي الموارد البشرية."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#0284C7",
    defaultSecondaryAccent: "#38BDF8",
    defaultFont: "Open Sans",
    badgeText: "Spécial RH",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "left-border",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-11",
    name: "Hugo — Bleu Nuit & Blanc",
    category: "minimaliste",
    description: {
      fr: "Contraste sombre et immaculé avec hiérarchie visuelle stricte inspirée de la presse écrite.",
      en: "Immaculate contrast with strict visual hierarchy inspired by editorial press.",
      ar: "تباين نقي ومثالي مستوحى من الصحافة المطبوعة."
    },
    layoutType: "minimaliste",
    layoutFamily: "two-column-left",
    defaultAccent: "#0F172A",
    defaultSecondaryAccent: "#475569",
    defaultFont: "Source Sans 3",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "minimal",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-12",
    name: "Julie — Carte Flottante",
    category: "creatif",
    description: {
      fr: "Effet d'ombres douces et de cartes surélevées pour un rendu moderne et aéré.",
      en: "Soft shadows and elevated cards for a modern, airy presentation.",
      ar: "تأثير الظلال الناعمة والبطاقات المرتفعة لمظهر عصري."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#EC4899",
    defaultSecondaryAccent: "#F472B6",
    defaultFont: "Poppins",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-13",
    name: "Lucas — Tech & Coches",
    category: "moderne",
    description: {
      fr: "Style technique avec coches de validation et format optimisé pour les systèmes ATS.",
      en: "Technical style with verification checkmarks and ATS-optimized layout.",
      ar: "أسلوب تقني مع علامات تحقق متوافق مع أنظمة الفرز الآلي."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#14B8A6",
    defaultSecondaryAccent: "#2DD4BF",
    defaultFont: "Inter",
    badgeText: "100% ATS",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-14",
    name: "Alexandre — Bandeau Doré",
    category: "executif",
    description: {
      fr: "Touches dorées subtiles et typographie prestigieuse pour cadres dirigeants et consultants.",
      en: "Subtle gold accents and prestigious typography for directors and partners.",
      ar: "لمسات ذهبية أنيقة لمديري الشركات والشركاء التنفيذيين."
    },
    layoutType: "executif",
    layoutFamily: "two-column-left",
    defaultAccent: "#B45309",
    defaultSecondaryAccent: "#F59E0B",
    defaultFont: "Playfair Display",
    badgeText: "Prestige",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "double-line",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-15",
    name: "Aurélie — Triangle Bicolore",
    category: "moderne",
    description: {
      fr: "Géométrie angulaire moderne avec découpes triangulaires et blocs d'informations équilibrés.",
      en: "Angular modern geometry with balanced information blocks.",
      ar: "هندسة بصرية مثلثة مع توازن متقن بين الكتل."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#8B5CF6",
    defaultSecondaryAccent: "#C084FC",
    defaultFont: "Inter",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "diagonal-split",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-16",
    name: "Laurent — Vert Forêt & Barres",
    category: "professionnel",
    description: {
      fr: "Vert sapin profond et barres de progression horizontales pour ingénieurs et techniciens.",
      en: "Deep forest green and horizontal progress bars for engineers.",
      ar: "أخضر غابي عميق مع أشرطة تقدم للمهندسين والتقنيين."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#15803D",
    defaultSecondaryAccent: "#22C55E",
    defaultFont: "Roboto",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "left-border",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-17",
    name: "Amélie — Bordeaux & Lignes",
    category: "executif",
    description: {
      fr: "Tonalités bordeaux élégantes et lignes d'espacement soignées pour juristes et communicants.",
      en: "Burgundy tones and clean rule lines for legal and communications executives.",
      ar: "نبيذي فاخر مع خطوط فاصلة دقيقة للمحامين والمسؤولين."
    },
    layoutType: "executif",
    layoutFamily: "two-column-left",
    defaultAccent: "#881337",
    defaultSecondaryAccent: "#BE123C",
    defaultFont: "Merriweather",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "double-line",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-18",
    name: "Noël — Arch Noir & Timeline",
    category: "professionnel",
    description: {
      fr: "Arch noir exécutif avec timeline verticale continue pour mettre en valeur les carrières riches.",
      en: "Executive dark arch with continuous timeline to highlight solid careers.",
      ar: "قوس أسود فخم مع خط زمني مستمر لإبراز المسار المهني."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#18181B",
    defaultSecondaryAccent: "#71717A",
    defaultFont: "Inter",
    badgeText: "Timeline Pro",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-19",
    name: "Joseph — Vague Sarcelle",
    category: "creatif",
    description: {
      fr: "Palette sarcelle vivifiante et courbes d'en-tête douces pour métiers du marketing et du web.",
      en: "Invigorating teal palette and gentle header curves for digital marketers.",
      ar: "أزرق تركوازي منعش مع منحنيات علوية ناعمة."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#0F766E",
    defaultSecondaryAccent: "#14B8A6",
    defaultFont: "Poppins",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sylvie-wave",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-20",
    name: "Élise — Rose Doux & Minimal",
    category: "minimaliste",
    description: {
      fr: "Élégance poudrée et typographie fine pour profils artistiques, bien-être et conseil.",
      en: "Powdered elegance and fine typography for arts and wellness profiles.",
      ar: "أناقة وردية هادئة مع خطوط رفيعة للمجالات الفنية والإرشادية."
    },
    layoutType: "minimaliste",
    layoutFamily: "two-column-left",
    defaultAccent: "#DB2777",
    defaultSecondaryAccent: "#F472B6",
    defaultFont: "Raleway",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "minimal",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-21",
    name: "Exécutif Neutre",
    category: "executif",
    description: {
      fr: "Gris anthracite noble et disposition classique pour directions générales et conseils d'administration.",
      en: "Noble charcoal grey and classic layout for general management and boards.",
      ar: "رمادي فحمي رصين وتصميم كلاسيكي للإدارات العامة."
    },
    layoutType: "executif",
    layoutFamily: "two-column-left",
    defaultAccent: "#334155",
    defaultSecondaryAccent: "#64748B",
    defaultFont: "Source Sans 3",
    badgeText: "Direction",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-30",
    name: "Minimal Saphir",
    category: "minimaliste",
    description: {
      fr: "Bleu saphir pur et structure allégée garantissant une lisibilité maximale pour recruteurs pressés.",
      en: "Pure sapphire blue and streamlined structure ensuring instant readability.",
      ar: "أزرق ياقوتي نقي بتصميم خفيف لسرعة القراءة."
    },
    layoutType: "minimaliste",
    layoutFamily: "two-column-left",
    defaultAccent: "#1D4ED8",
    defaultSecondaryAccent: "#60A5FA",
    defaultFont: "Inter",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "minimal",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-31",
    name: "Arc Contour Découverte",
    category: "creatif",
    description: {
      fr: "Arche graphique asymétrique et cartouches d'expérience colorés pour candidatures originales.",
      en: "Asymmetric graphic arch with colorful cards for creative candidates.",
      ar: "قوس بصري غير متماثل مع بطاقات خبرة ملونة."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#9333EA",
    defaultSecondaryAccent: "#C084FC",
    defaultFont: "Poppins",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-35",
    name: "Studio Minimaliste",
    category: "minimaliste",
    description: {
      fr: "Pleine largeur sur une seule colonne avec typographie géométrique soignée et aération optimale.",
      en: "Full-width single column with refined geometric typography and optimal breathing room.",
      ar: "صفحة واحدة كاملة العرض مع خطوط هندسية مريحة للعين."
    },
    layoutType: "minimaliste",
    layoutFamily: "single-column",
    defaultAccent: "#18181B",
    defaultSecondaryAccent: "#71717A",
    defaultFont: "Inter",
    badgeText: "1 Colonne",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-40",
    name: "Cartouche Saphir",
    category: "professionnel",
    description: {
      fr: "Cartouches encadrés avec en-têtes bleus saphir pour structurer clairement les profils denses.",
      en: "Framed cards with sapphire headers to neatly structure dense profiles.",
      ar: "بطاقات مؤطرة مع عناوين زرقاء لتنظيم السير الذاتية الكثيفة."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#1E40AF",
    defaultSecondaryAccent: "#3B82F6",
    defaultFont: "Roboto",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "boxed",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-45",
    name: "Ligne Épurée",
    category: "minimaliste",
    description: {
      fr: "Format linéaire sobre privilégiant la chronologie des postes et l'impact des réalisations.",
      en: "Linear understated layout highlighting chronology and concrete impact.",
      ar: "تنسيق خطي هادئ يعطي الأولوية للتسلسل الزمني والإنجازات."
    },
    layoutType: "minimaliste",
    layoutFamily: "single-column",
    defaultAccent: "#0F172A",
    defaultSecondaryAccent: "#334155",
    defaultFont: "Lato",
    badgeText: "Sobre & Net",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "minimal",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-51",
    name: "Yann Landy Marine & Corail",
    category: "moderne",
    description: {
      fr: "Style tech bicolore marine et corail inspiré des meilleures agences web.",
      en: "Marine and coral two-tone tech style inspired by top digital agencies.",
      ar: "تصميم تقني عصري كحلي وبرتقالي مستوحى من الوكالات الرقمية."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#0F172A",
    defaultSecondaryAccent: "#F97316",
    defaultFont: "Inter",
    badgeText: "Populaire Tech",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "two-tone-split",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-52",
    name: "Horizon Bicolore Sky & Slate",
    category: "professionnel",
    description: {
      fr: "Palette ciel et ardoise pour ingénieurs, techniciens et spécialistes du cloud.",
      en: "Sky blue and slate palette for engineers, technicians, and cloud experts.",
      ar: "ألوان السماء والأردواز للمهندسين والمتخصصين في الأنظمة السحابية."
    },
    layoutType: "professionnel",
    layoutFamily: "two-column-left",
    defaultAccent: "#0284C7",
    defaultSecondaryAccent: "#475569",
    defaultFont: "Roboto",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-53",
    name: "Nordic Wave Sauge & Menthe",
    category: "creatif",
    description: {
      fr: "Esthétique scandinave épurée vert sauge et menthe fraîche.",
      en: "Clean Scandinavian aesthetic with sage green and fresh mint.",
      ar: "تصميم اسكندنافي هادئ بألوان الميرمية والنعناع."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#0D9488",
    defaultSecondaryAccent: "#2DD4BF",
    defaultFont: "Poppins",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sylvie-wave",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-54",
    name: "Prestige Minimal ATS",
    category: "minimaliste",
    description: {
      fr: "Gabarit 100% monochrome optimisé pour la lecture optique ATS des grands groupes internationaux.",
      en: "100% monochrome layout optimized for international ATS optical parsers.",
      ar: "قالب أحادي اللون بنسبة 100% مهيأ لقارئات السير الذاتية للشركات الدولية."
    },
    layoutType: "minimaliste",
    layoutFamily: "single-column",
    defaultAccent: "#000000",
    defaultSecondaryAccent: "#525252",
    defaultFont: "Inter",
    badgeText: "ATS Élite",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-55",
    name: "Baxter Diagonal Indigo & Ambre",
    category: "moderne",
    description: {
      fr: "En-tête géométrique bicolore énergique pour créateurs d'entreprises et chefs de produits.",
      en: "Energizing two-tone geometric header for founders and product leads.",
      ar: "ترويسة هندسية ديناميكية لرواد الأعمال ومديري المنتجات."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#4F46E5",
    defaultSecondaryAccent: "#F59E0B",
    defaultFont: "Inter",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "diagonal-split",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-56",
    name: "Océane Aqua Wave",
    category: "creatif",
    description: {
      fr: "Courbe marine aqua dynamique avec encadrés doux pour marketing et communication.",
      en: "Dynamic aqua wave curve with soft boxes for marketing and comms.",
      ar: "منحنى مائي ديناميكي مع مربعات ناعمة للتسويق والاتصال."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#0284C7",
    defaultSecondaryAccent: "#38BDF8",
    defaultFont: "Montserrat",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sylvie-wave",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-57",
    name: "Éditorial Exécutif Or & Ardoise",
    category: "executif",
    description: {
      fr: "Typographie de prestige avec filets fins et nuances champagne pour dirigeants.",
      en: "Prestigious typography with fine hairpins and champagne tones for leaders.",
      ar: "خطوط فاخرة مع حواف دقيقة للمديرين وكبار المسؤولين."
    },
    layoutType: "executif",
    layoutFamily: "two-column-left",
    defaultAccent: "#1E293B",
    defaultSecondaryAccent: "#D97706",
    defaultFont: "Playfair Display",
    badgeText: "Haute Direction",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "double-line",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-58",
    name: "Double Vague Lilas & Violet",
    category: "creatif",
    description: {
      fr: "Douceur créative lilas et violette avec double ondulation pour profils culturels et RH.",
      en: "Creative lilac and violet softness with double ripple for cultural profiles.",
      ar: "لمسة إبداعية بنفسجية مع تموجات مزدوجة للمجالات الإنسانية."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#7C3AED",
    defaultSecondaryAccent: "#C084FC",
    defaultFont: "Poppins",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sylvie-wave",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-59",
    name: "Bandeau Accent Ruby & Framboise",
    category: "moderne",
    description: {
      fr: "Bandeau supérieur énergique ruby framboise pour profils commerciaux et communicants.",
      en: "Energetic ruby raspberry top banner for sales and communications pros.",
      ar: "شريط علوي ياقوتي نشيط للمبيعات والاتصال."
    },
    layoutType: "moderne",
    layoutFamily: "two-column-left",
    defaultAccent: "#BE123C",
    defaultSecondaryAccent: "#FB7185",
    defaultFont: "Inter",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-60",
    name: "Épure Métropolitaine Clean",
    category: "minimaliste",
    description: {
      fr: "Mise en page épurée universelle 1 colonne inspirée des standards anglo-saxons et suisses.",
      en: "Clean universal 1-column layout inspired by Swiss and Anglo-Saxon standards.",
      ar: "تصميم بسيط وعالمي بعمود واحد مستوحى من المعايير السويسرية."
    },
    layoutType: "minimaliste",
    layoutFamily: "single-column",
    defaultAccent: "#18181B",
    defaultSecondaryAccent: "#71717A",
    defaultFont: "Inter",
    badgeText: "Standard Suisse",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "minimal",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-61",
    name: "Vague Sommet Solaire Orange",
    category: "creatif",
    description: {
      fr: "Vague solaire chaleureuse et lumineuse idéale pour le tourisme, l'artisanat et la création.",
      en: "Warm and bright solar wave ideal for hospitality, creative trades and tourism.",
      ar: "موجة برتقالية شمسية دافئة مثالية للسياحة والمشاريع الإبداعية."
    },
    layoutType: "creatif",
    layoutFamily: "two-column-left",
    defaultAccent: "#EA580C",
    defaultSecondaryAccent: "#FDBA74",
    defaultFont: "Poppins",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "sylvie-wave",
      styleEnTeteSection: "pill",
      nombreColonnes: 2
    }
  },
  {
    id: "modele-archisimple-1",
    name: "Noir Épuré ArchiSimple",
    category: "minimaliste",
    description: {
      fr: "Modèle 100% monochrome noir & blanc ultra-lisible, zéro artifice, taillé pour le fond.",
      en: "100% monochrome ultra-readable black & white layout focused purely on substance.",
      ar: "قالب أحادي اللون أبيض وأسود بسيط يركز على المحتوى فقط."
    },
    layoutType: "minimaliste",
    layoutFamily: "single-column",
    defaultAccent: "#000000",
    defaultSecondaryAccent: "#525252",
    defaultFont: "Inter",
    badgeText: "100% Épuré",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-archisimple-2",
    name: "Corporate Slate ArchiSimple",
    category: "professionnel",
    description: {
      fr: "Nuances d'ardoise et filets horizontaux discrets pour profils corporatifs rigoureux.",
      en: "Slate shades and discreet horizontal rules for rigorous corporate profiles.",
      ar: "درجات الأردواز مع خطوط أفقية للملفات المهنية الجادة."
    },
    layoutType: "professionnel",
    layoutFamily: "single-column",
    defaultAccent: "#334155",
    defaultSecondaryAccent: "#64748B",
    defaultFont: "Roboto",
    badgeText: "Corporate",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "left-border",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-archisimple-3",
    name: "Ligné Studio ArchiSimple",
    category: "creatif",
    description: {
      fr: "Lignes graphiques nettes et typographie moderne mettant en avant vos réalisations concrètes.",
      en: "Sharp graphic lines and modern typography highlighting your concrete portfolio.",
      ar: "خطوط بيانية واضحة مع خط حديث لإبراز الإنجازات."
    },
    layoutType: "creatif",
    layoutFamily: "single-column",
    defaultAccent: "#4F46E5",
    defaultSecondaryAccent: "#818CF8",
    defaultFont: "Montserrat",
    badgeText: "Studio Ligné",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "boxed",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-archisimple-4",
    name: "Académique Garamond ArchiSimple",
    category: "executif",
    description: {
      fr: "Typographie sérif littéraire pour carrières académiques, juridiques et médicales.",
      en: "Literary serif typography for academic, legal, and medical careers.",
      ar: "خط كلاسيكي رصين للمسارات الأكاديمية والطبية والقانونية."
    },
    layoutType: "executif",
    layoutFamily: "single-column",
    defaultAccent: "#1E3A8A",
    defaultSecondaryAccent: "#3B82F6",
    defaultFont: "Merriweather",
    badgeText: "Académique",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "double-line",
      nombreColonnes: 1
    }
  },
  {
    id: "modele-archisimple-5",
    name: "Compact Tech ATS ArchiSimple",
    category: "moderne",
    description: {
      fr: "Format hyper-dense et compact pour condenser 10 ans d’expérience sur une seule page.",
      en: "Hyper-compact layout designed to fit 10 years of experience on one single page.",
      ar: "تنسيق مدمج لضغط سنوات الخبرة في صفحة واحدة بذكاء."
    },
    layoutType: "moderne",
    layoutFamily: "single-column",
    defaultAccent: "#0D9488",
    defaultSecondaryAccent: "#14B8A6",
    defaultFont: "Inter",
    badgeText: "Hyper Compact",
    requiredTier: "freemium",
    themeConfig: {
      styleEnTete: "clean",
      styleEnTeteSection: "underline",
      nombreColonnes: 1
    }
  }
];

const templatesCode = `import { CVTemplate, FontOption } from "../types";

export const FONT_OPTIONS: FontOption[] = ${JSON.stringify(fontOptions, null, 2)};

export const COLOR_PALETTES = ${JSON.stringify(colorPalettes, null, 2)};

export const ACCENT_COLORS = COLOR_PALETTES;

export const CV_TEMPLATES: CVTemplate[] = ${JSON.stringify(templatesDefinitions, null, 2)};
`;

fs.writeFileSync('src/data/templates.ts', templatesCode, 'utf8');
console.log('src/data/templates.ts written successfully with 42 templates!');

// =========================================================================
// 2. CREATE jobLandingPages.ts
// =========================================================================

const secteurLabels = {
  finance: { fr: "Finance & Comptabilité", icon: "💳" },
  tech: { fr: "Informatique & Tech", icon: "💻" },
  commerce: { fr: "Commerce & Vente", icon: "🛍️" },
  marketing: { fr: "Marketing & Communication", icon: "📢" },
  rh: { fr: "Ressources Humaines", icon: "👥" },
  sante: { fr: "Santé & Médical", icon: "🏥" },
  ingenierie: { fr: "Ingénierie & BTP", icon: "🏗️" },
  logistique: { fr: "Logistique & Transport", icon: "📦" },
  juridique: { fr: "Droit & Juridique", icon: "⚖️" },
  creatif: { fr: "Design & Créatif", icon: "🎨" },
  autre: { fr: "Autres Domaines", icon: "✨" }
};

const jobLandingPages = [
  {
    slug: "cv-comptable",
    metier: "Comptable",
    titrePage: "Modèle de CV Comptable Professionnel (Prêt à l'Emploi)",
    metaDescription: "Exemple de CV comptable optimisé avec compétences clés (bilan, liasse fiscale, TVA, Sage/SAP), amorce percutante et conseils recruteur.",
    secteur: "finance",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    amorceProfil: "Comptable rigoureux fort de 6 ans d'expérience en cabinet et en entreprise. Spécialiste de la clôture des comptes annuels, de la gestion des déclarations fiscales (TVA, IS) et de l'optimisation de la trésorerie. Maîtrise avancée d'Excel et des logiciels Sage et SAP.",
    competencesCles: ["Clôture des comptes & Liasse fiscale", "Déclarations fiscales & TVA", "Audit comptable & Rapprochements bancaires", "Gestion de la trésorerie & BFR", "Logiciels Sage 100 & SAP"],
    outilsTypiques: ["Sage 100", "SAP FI/CO", "Excel avancé (TCD, XLOOKUP)", "Cegid", "QuickBooks"],
    missionsTypiques: ["Tenue de la comptabilité générale et analytique", "Établissement des situations mensuelles et bilans annuels", "Supervision des règlements fournisseurs et relances clients"],
    conseilsRecruteur: ["Mettez en avant le volume de dossiers gérés ou le chiffre d'affaires des structures", "Précisez votre aisance sur les logiciels comptables du marché"],
    faqs: [
      { q: "Quelles compétences mettre en avant pour un CV comptable ?", r: "Indiquez la maîtrise des liasses fiscales, de la TVA, du lettrage et des ERP comptables." },
      { q: "Quel modèle de CV choisir pour la comptabilité ?", r: "Privilégiez les modèles sobres comme Corporate Marine ou Minimal Saphir qui reflètent la rigueur." }
    ],
    templatesRecommandesIds: ["modele-8", "modele-18", "modele-40", "modele-archisimple-2", "modele-archisimple-1"],
    templateRecommandeId: "modele-8",
    salaireMoyen: "32 000 € – 42 000 € / an",
    formationRecommandee: "BTS CG, DCG (Bac+3) ou DSCG (Bac+5)"
  },
  {
    slug: "cv-developpeur-web",
    metier: "Développeur Web Full-Stack",
    titrePage: "Modèle de CV Développeur Web Full-Stack (ATS Compatible)",
    metaDescription: "CV Développeur Web moderne mettant en avant votre stack technique (React, Node.js, TypeScript, Cloud), projets GitHub et réalisations logicielles.",
    secteur: "tech",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    amorceProfil: "Développeur Full-Stack passionné avec 5 ans d'expérience dans la conception d'applications web scalables à forte audience. Expert en architectures React, TypeScript et Node.js, avec une sensibilité poussée pour la performance, l'accessibilité et les tests automatisés.",
    competencesCles: ["React, Next.js & TypeScript", "Node.js, Express & NestJS", "PostgreSQL, MongoDB & Redis", "Architectures REST & GraphQL", "Docker, CI/CD & Tests (Jest, Cypress)"],
    outilsTypiques: ["Git & GitHub", "Docker", "VS Code", "Postman", "AWS"],
    missionsTypiques: ["Développement de fonctionnalités front-end et back-end de bout en bout", "Optimisation des temps de chargement et des scores Core Web Vitals", "Revue de code et participation aux cérémonies Agiles"],
    conseilsRecruteur: ["Insérez impérativement des liens vers votre profil GitHub ou vos projets en ligne", "Détaillez concrètement la scalabilité de vos réalisations (utilisateurs, requêtes)"],
    faqs: [
      { q: "Faut-il lister tous les langages maîtrisés ?", r: "Concentrez-vous sur votre stack principale et les frameworks directement pertinents pour le poste visé." }
    ],
    templatesRecommandesIds: ["modele-5", "modele-1", "modele-11", "modele-13", "modele-archisimple-5"],
    templateRecommandeId: "modele-5",
    salaireMoyen: "42 000 € – 58 000 € / an",
    formationRecommandee: "Diplôme d'Ingénieur, Master Informatique ou Bootcamps certifiés"
  },
  {
    slug: "cv-directeur-artistique",
    metier: "Directeur Artistique & Designer UI/UX",
    titrePage: "Modèle de CV Directeur Artistique & UI/UX (Visuel Pro)",
    metaDescription: "CV créatif élégant pour directeurs artistiques et designers UI/UX : valorisation de votre portfolio, maîtrise des Design Systems et identité de marque.",
    secteur: "creatif",
    imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80",
    amorceProfil: "Directeur artistique alliant vision esthétique audacieuse et rigueur ergonomique. Plus de 7 ans d'expérience dans la création d'identités visuelles impactantes, la direction de campagnes multicanales et le déploiement de Design Systems complexes sous Figma.",
    competencesCles: ["Direction créative & Identité de marque", "UI/UX Design & Prototypage (Figma)", "Architecture de Design Systems", "Suite Adobe Creative (Illustrator, Photoshop)", "Recherche utilisateur & Tests d'usabilité"],
    outilsTypiques: ["Figma", "Adobe Illustrator", "Photoshop", "After Effects", "Storybook"],
    missionsTypiques: ["Supervision de la charte visuelle et des déclinaisons digitales", "Conception d'expériences web et mobiles centrées utilisateur", "Coordination des équipes graphistes, illustrateurs et motion designers"],
    conseilsRecruteur: ["Un lien direct vers votre book / portfolio en ligne est indispensable dès l'en-tête du CV"],
    faqs: [
      { q: "Quel modèle de CV correspond le mieux à un créatif ?", r: "Optez pour les modèles 'Sacha Vague Organique' ou 'Léa Arche Studio' qui disposent de formes contemporaines." }
    ],
    templatesRecommandesIds: ["modele-3", "modele-6", "modele-12", "modele-19", "modele-53"],
    templateRecommandeId: "modele-3",
    salaireMoyen: "45 000 € – 65 000 € / an",
    formationRecommandee: "Master en Arts Appliqués, Gobelins, Penninghen, ECV"
  },
  {
    slug: "cv-responsable-rh",
    metier: "Responsable Ressources Humaines",
    titrePage: "Modèle de CV Responsable Ressources Humaines (RH)",
    metaDescription: "Modèle de CV complet pour Responsable RH : recrutement stratégique, relations sociales, gestion des compétences (GPEC) et politique QVT.",
    secteur: "rh",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    amorceProfil: "Professionnelle RH passionnée avec 8 ans d'expérience dans le recrutement de talents, l'accompagnement des managers et la conduite du dialogue social. Forte expertise en droit du travail, structuration des processus RH et initiatives de marque employeur.",
    competencesCles: ["Recrutement & Chasse de profils pénuriques", "Relations sociales & Animation du CSE", "Droit du travail & Gestion des contrats", "GPEC & Plans de formation", "Logiciels SIRH (Lucca, Workday)"],
    outilsTypiques: ["Lucca", "Workday", "LinkedIn Recruiter", "BambooHR", "Excel"],
    missionsTypiques: ["Définition et pilotage du plan de recrutement annuel", "Conseil et appui aux opérationnels sur la gestion des carrières", "Organisation des élections professionnelles et suivi des accords d'entreprise"],
    conseilsRecruteur: ["Quantifiez vos réalisations : nombre de recrutements menés, baisse du turnover, taux de satisfaction des collaborateurs"],
    faqs: [
      { q: "Comment présenter les relations sociales sur un CV RH ?", r: "Mentionnez clairement votre rôle dans les réunions du CSE et les négociations d'accords d'entreprise." }
    ],
    templatesRecommandesIds: ["modele-10", "modele-4", "modele-20", "modele-58", "modele-archisimple-2"],
    templateRecommandeId: "modele-10",
    salaireMoyen: "40 000 € – 55 000 € / an",
    formationRecommandee: "Master 2 Gestion des Ressources Humaines ou Droit Social"
  }
];

const jobLandingCode = `export interface JobLandingPage {
  slug: string;
  metier: string;
  titrePage: string;
  metaDescription: string;
  secteur: string;
  imageUrl: string;
  amorceProfil: string;
  competencesCles: string[];
  outilsTypiques?: string[];
  missionsTypiques?: string[];
  conseilsRecruteur?: string[];
  faqs?: { q: string; r: string }[];
  templatesRecommandesIds?: string[];
  templateRecommandeId?: string;
  salaireMoyen?: string;
  formationRecommandee?: string;
}

export const SECTEUR_LABELS = ${JSON.stringify(secteurLabels, null, 2)};

export const JOB_LANDING_PAGES: JobLandingPage[] = ${JSON.stringify(jobLandingPages, null, 2)};

export function getJobLandingPageBySlug(slug: string): JobLandingPage | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  const normalized = clean.startsWith('cv-') ? clean : 'cv-' + clean;
  return JOB_LANDING_PAGES.find(p => p.slug === clean || p.slug === normalized);
}
`;

fs.writeFileSync('src/data/jobLandingPages.ts', jobLandingCode, 'utf8');
console.log('src/data/jobLandingPages.ts written successfully!');

// =========================================================================
// 3. CREATE templatePresets.ts (ALL 42 MODELS FILLED WITH RICH CONTENT!)
// =========================================================================

// Comprehensive profiles pool
const personasList = [
  {
    nomComplet: "Alexandre Dupont",
    prenom: "Alexandre",
    nom: "Dupont",
    titreProfessionnel: "Directeur de Projets Digitaux & Innovation",
    email: "alexandre.dupont@email.com",
    telephone: "+33 6 12 34 56 78",
    adresse: "Paris, France",
    linkedin: "linkedin.com/in/alexandre-dupont",
    siteWeb: "www.alexandredupont.pro",
    resume: "Directeur de projets digitaux expérimenté avec 8 ans d'expertise dans le pilotage de transformations agiles et le déploiement de solutions cloud d'envergure. Leader d'équipes pluridisciplinaires axé sur l'excellence opérationnelle, la rentabilité financière et la satisfaction client.",
    formations: [
      {
        id: "form-1",
        diplome: "Master 2 Management de Projets & Systèmes d'Information",
        etablissement: "Université Paris-Dauphine",
        ville: "Paris",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Spécialisation en gouvernance numérique, stratégie de transformation IT et conduite du changement. Mention Très Bien."
      },
      {
        id: "form-2",
        diplome: "Licence en Informatique & Économie Appliquée",
        etablissement: "Sorbonne Université",
        ville: "Paris",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Socle solide en algorithmique, gestion de bases de données, économétrie et pilotage de la performance."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Directeur de Projets Senior",
        entreprise: "Nexus Digital Group",
        ville: "Paris",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Supervision d'un portefeuille de 6 projets digitaux stratégiques représentant un budget annuel de 3M€. Coordination d'une équipe de 14 experts (PO, Tech Leads, UX Designers). Réduction de 35% du time-to-market sur les lancements majeurs."
      },
      {
        id: "exp-2",
        poste: "Chef de Projet Digital & Transformation",
        entreprise: "Inova Consulting",
        ville: "Lyon",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Accompagnement de grands comptes bancaires et retail dans la refonte de leurs parcours omnicanaux. Déploiement des cérémonies agiles Scrum et pilotage des KPI d'adoption logicielle (+40%)."
      },
      {
        id: "exp-3",
        poste: "Consultant Junior en Organisation & SI",
        entreprise: "Cap Stratégie",
        ville: "Paris",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Recueil des besoins métiers, animation d'ateliers de cadrage fonctionnel, rédaction des spécifications et suivi des recettes utilisateurs (UAT)."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Pilotage de Projets Agiles & Scrum", niveau: 5 },
      { id: "comp-2", nom: "Stratégie Digitale & Roadmap Produit", niveau: 5 },
      { id: "comp-3", nom: "Management d'Équipes Pluridisciplinaires", niveau: 4 },
      { id: "comp-4", nom: "Gestion Budgétaire & Négociation Fournisseurs", niveau: 4 },
      { id: "comp-5", nom: "Gouvernance IT & Conduite du Changement", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Plateforme Omnicanale Banque & Assurances",
      sousTitre: "Refonte Core Banking & E-Services",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Architecture Microservices, Azure Cloud, React, Agile Scrum",
      lien: "nexus-digital.com/case-banking",
      description: "Conception et déploiement d'une infrastructure transactionnelle sécurisée pour 250 000 utilisateurs actifs. Taux de disponibilité 99.98% et gains de productivité client de 22%."
    }
  },
  {
    nomComplet: "Michel Kouam",
    prenom: "Michel",
    nom: "Kouam",
    titreProfessionnel: "Ingénieur Cloud & DevOps Senior",
    email: "michel.kouam@tech-cloud.com",
    telephone: "+33 6 88 44 22 10",
    adresse: "Bordeaux, France",
    linkedin: "linkedin.com/in/michel-kouam-devops",
    siteWeb: "www.michelkouam.dev",
    resume: "Ingénieur DevOps et Architecte Cloud certifié AWS & Kubernetes fort de 7 années de succès dans l'automatisation des pipelines CI/CD, l'Infrastructure as Code (Terraform) et l'observabilité système haute disponibilité à grande échelle.",
    formations: [
      {
        id: "form-1",
        diplome: "Diplôme d'Ingénieur en Systèmes, Réseaux & Sécurité",
        etablissement: "INSA Toulouse",
        ville: "Toulouse",
        dateDebut: "2015",
        dateFin: "2018",
        enCours: false,
        description: "Cursus d'excellence en virtualisation, architectures distribuées, protocoles réseaux et cryptographie appliquée."
      },
      {
        id: "form-2",
        diplome: "DUT Informatique Générale",
        etablissement: "IUT de Bordeaux",
        ville: "Bordeaux",
        dateDebut: "2013",
        dateFin: "2015",
        enCours: false,
        description: "Administration systèmes Linux/Unix, programmation système C/C++, réseaux TCP/IP et bases SQL."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Lead Cloud DevOps Engineer",
        entreprise: "AeroCloud Technologies",
        ville: "Bordeaux",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Architecture et maintenance d'un cluster Kubernetes multi-région sous AWS EKS supportant 15M de requêtes quotidiennes. Automatisation complète avec Terraform et GitOps (ArgoCD)."
      },
      {
        id: "exp-2",
        poste: "Ingénieur DevOps & Automatisation",
        entreprise: "FinTech Hub",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Mise en place de 45 pipelines GitLab CI/CD automatisés, sécurisation des conteneurs Docker avec Trivy et mise en place de l'observabilité Prometheus/Grafana."
      },
      {
        id: "exp-3",
        poste: "Administrateur Systèmes & Réseaux Junior",
        entreprise: "Datacenter Ouest",
        ville: "Nantes",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Gestion opérationnelle d'un parc de 300 serveurs Linux Debian/CentOS, monitoring des flux et automatisation des sauvegardes via scripts Bash et Ansible."
      }
    ],
    competences: [
      { id: "comp-1", nom: "AWS & Google Cloud Platform (GCP)", niveau: 5 },
      { id: "comp-2", nom: "Kubernetes, Docker & Containerization", niveau: 5 },
      { id: "comp-3", nom: "Infrastructure as Code (Terraform, Ansible)", niveau: 5 },
      { id: "comp-4", nom: "Pipelines CI/CD (GitLab CI, GitHub Actions)", niveau: 4 },
      { id: "comp-5", nom: "Observabilité (Prometheus, Grafana, ELK)", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Migration Cloud Multi-Région Zero-Downtime",
      sousTitre: "Infrastructure as Code & GitOps",
      dateDebut: "2023",
      dateFin: "2024",
      technologies: "Kubernetes, AWS EKS, Terraform, ArgoCD, Helm, Datadog",
      lien: "github.com/mkouam/infra-cluster-k8s",
      description: "Migration de 40 microservices critiques d'un hébergement on-premise vers AWS sans interruption de service. Réduction de 45% des coûts cloud et temps de déploiement passé de 2h à 7 min."
    }
  },
  {
    nomComplet: "Sacha Leroy",
    prenom: "Sacha",
    nom: "Leroy",
    titreProfessionnel: "Directeur Artistique & Lead UI/UX Designer",
    email: "sacha.leroy.design@crea-studio.fr",
    telephone: "+33 6 45 78 90 12",
    adresse: "Paris, France",
    linkedin: "linkedin.com/in/sacha-leroy-design",
    siteWeb: "www.sachaleroy.art",
    resume: "Directeur artistique et designer UI/UX primé alliant créativité visuelle audacieuse et rigueur ergonomique. Expert en création de systèmes de design (Design Systems), identités de marque remarquables et interfaces SaaS ergonomiques.",
    formations: [
      {
        id: "form-1",
        diplome: "Master Direction Artistique & Stratégie de Marque",
        etablissement: "Gobelins, l'école de l'image",
        ville: "Paris",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Direction créative, typographie avancée, scénographie digitale et branding contemporain. Félicitations du jury."
      },
      {
        id: "form-2",
        diplome: "Bachelor Design Graphique & Médias Numériques",
        etablissement: "École Supérieure d'Arts Appliqués",
        ville: "Strasbourg",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Composition graphique, théorie des couleurs, sémiologie de l'image, motion design et prototypage interactif."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Lead UI/UX Designer & DA",
        entreprise: "Studio Lumina Interactive",
        ville: "Paris",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Direction créative des projets digitaux de marques de luxe et d'applications mobiles grand public. Création et gouvernance d'un Design System global adopté par 25 designers et développeurs."
      },
      {
        id: "exp-2",
        poste: "Senior Product Designer",
        entreprise: "Pulse App Tech",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Conduite des phases d'UX research (interviews utilisateurs, tests utilisateurs, personae) et refonte complète de l'application SaaS B2B, augmentant le taux de rétention de 30%."
      },
      {
        id: "exp-3",
        poste: "UI Designer & Graphiste Web",
        entreprise: "Agence Vague Digitale",
        ville: "Lyon",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Création de maquettes web responsives, chartes graphiques, illustrations vectorielles et prototypes interactifs Figma pour plus de 30 clients."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Design System & UI Architecture (Figma)", niveau: 5 },
      { id: "comp-2", nom: "Recherche Utilisateur & Tests d'Usabilité (UX)", niveau: 5 },
      { id: "comp-3", nom: "Direction Artistique & Identité de Marque", niveau: 5 },
      { id: "comp-4", nom: "Prototypage Haute Fidélité & Micro-interactions", niveau: 4 },
      { id: "comp-5", nom: "Suite Adobe Creative (Illustrator, Photoshop)", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Écosystème Design System Universel 'Aura'",
      sousTitre: "Bibliothèque de Composants UI/UX Cross-Plateforme",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Figma Tokens, Storybook, React, Zeroheight, WCAG 2.1 AA",
      lien: "sachaleroy.art/work/aura-system",
      description: "Conception intégrale d'un système de plus de 180 composants modulaires accessibles (normes RGAA / WCAG) utilisé par 4 produits SaaS internationaux."
    }
  },
  {
    nomComplet: "Laura Mercier",
    prenom: "Laura",
    nom: "Mercier",
    titreProfessionnel: "Consultante Senior en Stratégie & Organisation",
    email: "laura.mercier@conseil-strategie.fr",
    telephone: "+33 6 71 89 23 45",
    adresse: "Paris, France",
    linkedin: "linkedin.com/in/laura-mercier-conseil",
    siteWeb: "www.lauramercier-conseil.com",
    resume: "Consultante en management et stratégie d'entreprise forte de 7 ans d'expérience auprès de directions générales du CAC 40. Spécialiste de la transformation organisationnelle, de l'optimisation des coûts et de la digitalisation des processus métiers.",
    formations: [
      {
        id: "form-1",
        diplome: "Mastère Spécialisé Stratégie & Management International",
        etablissement: "HEC Paris / ESSEC Business School",
        ville: "Paris",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Analyse financière corporate, fusions-acquisitions, stratégie d'expansion internationale et gouvernance d'entreprise."
      },
      {
        id: "form-2",
        diplome: "Licence Sciences Économiques & Gestion",
        etablissement: "Université Paris 1 Panthéon-Sorbonne",
        ville: "Paris",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Macroéconomie, microéconomie avancée, statistiques quantitatives et gestion comptable."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Manager Conseil en Stratégie",
        entreprise: "Boston Advisory Partners",
        ville: "Paris",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Pilotage de missions de transformation stratégique pour des groupes industriels et énergétiques. Encadrement d'équipes de 6 consultants seniors et juniors. Réalisation d'un plan d'économies de 15M€."
      },
      {
        id: "exp-2",
        poste: "Consultante Senior en Organisation",
        entreprise: "Accenture Strategy",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Refonte du modèle opérationnel (Operating Model) d'un leader de l'assurance. Cartographie de 120 processus métiers et implémentation de solutions d'automatisation intelligente."
      },
      {
        id: "exp-3",
        poste: "Analyste Stratégie & Marchés Junior",
        entreprise: "KPMG Advisory",
        ville: "Lyon",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Réalisation de benchmarks sectoriels, modélisation de business plans prévisionnels et préparation de présentations exécutives pour les Comités de Direction."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Diagnostic Stratégique & Due Diligence", niveau: 5 },
      { id: "comp-2", nom: "Optimisation des Processus Métiers (BPR)", niveau: 5 },
      { id: "comp-3", nom: "Modélisation Financière & Business Planning", niveau: 5 },
      { id: "comp-4", nom: "Conduite du Changement & Mobilisation des Équipes", niveau: 4 },
      { id: "comp-5", nom: "Gestion de Parties Prenantes C-Level", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Plan Stratégique 'Horizon 2030' Industrie Durable",
      sousTitre: "Plan de Croissance et Transition Énergétique",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Modélisation financière Excel, Tableau Software, Lean Six Sigma",
      lien: "conseil-strategie.fr/etude-industrie",
      description: "Élaboration d'une feuille de route stratégique à 5 ans pour un équipementier industriel réduisant son empreinte carbone de 40% tout en maintenant une marge d'EBITDA à 14%."
    }
  },
  {
    nomComplet: "Alexandre Ndiaye",
    prenom: "Alexandre",
    nom: "Ndiaye",
    titreProfessionnel: "Développeur Full-Stack Senior React & Node.js",
    email: "alexandre.ndiaye.dev@code-craft.io",
    telephone: "+33 6 52 34 89 01",
    adresse: "Nantes, France",
    linkedin: "linkedin.com/in/alexandre-ndiaye-fullstack",
    siteWeb: "www.alexandrendiaye.io",
    resume: "Développeur Full-Stack passionné avec 8 ans d'expertise dans la conception d'applications web scalables à fort trafic. Spécialiste des écosystèmes React, TypeScript, Node.js, GraphQL et architectures microservices conteneurisées.",
    formations: [
      {
        id: "form-1",
        diplome: "Master en Ingénierie du Web & Architectures Logicielles",
        etablissement: "EPITECH / Université Technologique",
        ville: "Nantes",
        dateDebut: "2015",
        dateFin: "2018",
        enCours: false,
        description: "Génie logiciel avancé, architecture des systèmes d'information, design patterns et sécurité web."
      },
      {
        id: "form-2",
        diplome: "Licence Professionnelle Métiers de l'Informatique",
        etablissement: "Université de Rennes 1",
        ville: "Rennes",
        dateDebut: "2012",
        dateFin: "2015",
        enCours: false,
        description: "Développement web orienté objet, bases de données relationnelles et frameworks modernes."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Lead Tech Full-Stack",
        entreprise: "SaaS Scale Engine",
        ville: "Nantes",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Pilotage technique d'une plateforme web hébergeant 400 000 utilisateurs actifs. Animation d'une squad de 7 développeurs, revues de code rigoureuses et réduction de 60% du temps de chargement des pages clés."
      },
      {
        id: "exp-2",
        poste: "Développeur Full-Stack Senior",
        entreprise: "TechPulse Solutions",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Développement de modules métiers complexes avec React, TypeScript et Node.js. Création d'une API GraphQL temps réel gérant des pics de 10 000 requêtes/seconde."
      },
      {
        id: "exp-3",
        poste: "Développeur Front-End React Junior",
        entreprise: "Digital Agency Web",
        ville: "Rennes",
        dateDebut: "2015",
        dateFin: "2018",
        enCours: false,
        description: "Intégration d'interfaces web réactives, optimisation des performances SEO/Lighthouse et intégration d'API RESTful."
      }
    ],
    competences: [
      { id: "comp-1", nom: "React, Next.js & TypeScript", niveau: 5 },
      { id: "comp-2", nom: "Node.js, Express & NestJS", niveau: 5 },
      { id: "comp-3", nom: "PostgreSQL, MongoDB & Redis", niveau: 4 },
      { id: "comp-4", nom: "GraphQL & Architectures REST API", niveau: 4 },
      { id: "comp-5", nom: "Docker, CI/CD & Tests (Jest, Cypress)", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Éditeur Collaboratif Temps Réel Type Canva",
      sousTitre: "Canvas Vectoriel & Synchronisation WebSocket",
      dateDebut: "2023",
      dateFin: "2024",
      technologies: "React, TypeScript, WebSockets, WebGL, TailwindCSS, Node.js",
      lien: "github.com/andiaye/realtime-canvas-studio",
      description: "Développement d'un moteur de rendu visuel haute fidélité capable de manipuler plus de 500 objets vectoriels à 60 FPS avec multi-curseurs en direct."
    }
  },
  {
    nomComplet: "Léa Fontaine",
    prenom: "Léa",
    nom: "Fontaine",
    titreProfessionnel: "Brand Strategist & Responsable Communication",
    email: "lea.fontaine@brand-pulse.fr",
    telephone: "+33 6 63 90 12 34",
    adresse: "Marseille, France",
    linkedin: "linkedin.com/in/lea-fontaine-brand",
    siteWeb: "www.leafontaine.com",
    resume: "Responsable de marque et stratège créative avec 6 ans d'expérience dans l'élaboration de campagnes à forte résonance culturelle et sociétale. Experte en storytelling de marque, communication d'influence et stratégie éditoriale multicanale.",
    formations: [
      {
        id: "form-1",
        diplome: "Master 2 Communication des Entreprises & Médias Sociaux",
        etablissement: "CELSA Paris-Sorbonne",
        ville: "Paris",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Stratégie de communication d'influence, sémiologie publicitaire, gestion de réputation de crise et relations médias."
      },
      {
        id: "form-2",
        diplome: "Licence Information & Communication",
        etablissement: "Université d'Aix-Marseille",
        ville: "Aix-en-Provence",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Théories des médias, écriture journalistique, relations publiques et sociologie des publics."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Brand Manager & Responsable Communication",
        entreprise: "Maison Solstice (Mode & Lifestyle)",
        ville: "Marseille",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Définition de la plateforme de marque internationale et coordination des campagnes d'image à 360°. Croissance de 65% de la notoriété assistée et multiplication par 3 de l'engagement sur les réseaux sociaux."
      },
      {
        id: "exp-2",
        poste: "Chef de Projet Contenu & Influence",
        entreprise: "Agence Havas Media",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Gestion d'un portefeuille de 8 comptes retail et beauté. Négociation et déploiement de partenariats d'influenceurs générant plus de 12M d'impressions organiques par an."
      },
      {
        id: "exp-3",
        poste: "Chargée de Communication Junior",
        entreprise: "Événements Sud Méditerranée",
        ville: "Marseille",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Rédaction de communiqués de presse, organisation de conférences de presse et animation des canaux institutionnels."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Plateforme de Marque & Positionnement", niveau: 5 },
      { id: "comp-2", nom: "Stratégie de Contenu & Storytelling", niveau: 5 },
      { id: "comp-3", nom: "Relations Presse & Médias d'Influence", niveau: 5 },
      { id: "comp-4", nom: "Gestion de Budget Média & Campagnes 360", niveau: 4 },
      { id: "comp-5", nom: "Communication RSE & Gestion de Crise", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Campagne Internationale 'Origines Durables'",
      sousTitre: "Lancement de Gamme Éco-Responsable",
      dateDebut: "2023",
      dateFin: "2023",
      technologies: "Brand Strategy, Campagne Vidéo, Influence Marketing, Activation RP",
      lien: "brand-pulse.fr/case-solstice",
      description: "Campagne transmédia primée au Grand Prix de la Communication. Plus de 4.8 millions de vues, retombées dans Le Figaro et Vogue, et ventes en hausse de 48% au premier trimestre."
    }
  },
  {
    nomComplet: "Marc Vasseur",
    prenom: "Marc",
    nom: "Vasseur",
    titreProfessionnel: "Directeur Supply Chain & Logistique Internationale",
    email: "marc.vasseur@supply-log.com",
    telephone: "+33 6 34 56 78 90",
    adresse: "Lille, France",
    linkedin: "linkedin.com/in/marc-vasseur-supplychain",
    siteWeb: "www.marcvasseur.pro",
    resume: "Directeur Supply Chain certifié APICS CSCP avec 9 années de leadership opérationnel dans l'industrie agroalimentaire et le retail omnichannel. Expert en prévision de la demande, gestion des entrepôts WMS/TMS et optimisation des flux logistiques durables.",
    formations: [
      {
        id: "form-1",
        diplome: "Master 2 Management des Opérations & Supply Chain",
        etablissement: "SKEMA Business School",
        ville: "Lille",
        dateDebut: "2015",
        dateFin: "2017",
        enCours: false,
        description: "Optimisation des flux mondiaux, logistique inversée, Lean Manufacturing et pilotage S&OP."
      },
      {
        id: "form-2",
        diplome: "Licence Gestion de Production & Logistique",
        etablissement: "Université de Lille",
        ville: "Lille",
        dateDebut: "2012",
        dateFin: "2015",
        enCours: false,
        description: "Gestion des stocks, méthodes Kanban/Kaizen, droit du transport international et douanes."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Directeur Supply Chain",
        entreprise: "Nordic Goods Logistique",
        ville: "Lille",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Pilotage stratégique de 4 plateformes logistiques totalisant 65 000 m² et 90 collaborateurs. Réduction des ruptures de stock de 4.2% à 0.8% et diminution de 18% des coûts de transport par optimisation des tournées."
      },
      {
        id: "exp-2",
        poste: "Responsable Approvisionnements & Flux",
        entreprise: "Groupe Distrib Europe",
        ville: "Arras",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Gestion des relations avec 120 fournisseurs internationaux, mise en place d'un outil de prévision par IA et refonte des contrats de fret maritime et ferroviaire."
      },
      {
        id: "exp-3",
        poste: "Coordinateur Logistique Entrepôt Junior",
        entreprise: "EuroTransit Log",
        ville: "Dunkerque",
        dateDebut: "2015",
        dateFin: "2018",
        enCours: false,
        description: "Optimisation du cross-docking, planification des réceptions et gestion des litiges transporteurs sur site portuaire."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Processus S&OP & Prévision de Demande", niveau: 5 },
      { id: "comp-2", nom: "Systèmes WMS, TMS & ERP (SAP S/4HANA)", niveau: 5 },
      { id: "comp-3", nom: "Management d'Équipes Logistiques Multi-Sites", niveau: 5 },
      { id: "comp-4", nom: "Lean Logistics & Amélioration Continue (Kaizen)", niveau: 4 },
      { id: "comp-5", nom: "Négociation Transport & Douanes Internationales", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Automatisation du Hub Logistique Central (65 000 m²)",
      sousTitre: "Déploiement WMS & AGV Robotisés",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "SAP EWM, Robots AGV, Traçabilité RFID, PowerBI Logistique",
      lien: "supply-log.com/case-hub",
      description: "Supervision du projet d'automatisation de 8.5M€ d'investissement. Gain de productivité de 38% sur les préparations de commandes et réduction de 90% des erreurs d'expédition."
    }
  },
  {
    nomComplet: "Amélie de Courcelles",
    prenom: "Amélie",
    nom: "de Courcelles",
    titreProfessionnel: "Directrice Financière & Contrôle de Gestion (DAF)",
    email: "amelie.decourcelles@finance-corp.fr",
    telephone: "+33 6 19 82 73 64",
    adresse: "Paris, France",
    linkedin: "linkedin.com/in/amelie-de-courcelles-daf",
    siteWeb: "www.ameliedecourcelles.fr",
    resume: "Directrice Administrative et Financière dotée de 10 ans d'expertise dans le pilotage de la performance financière, les opérations de levées de fonds (Séries B & C) et la structuration de fonctions financières en environnement scale-up et ETI.",
    formations: [
      {
        id: "form-1",
        diplome: "Diplôme Supérieur de Comptabilité et de Gestion (DSCG)",
        etablissement: "Institut National des Techniques Économiques et Comptables (INTEC)",
        ville: "Paris",
        dateDebut: "2014",
        dateFin: "2016",
        enCours: false,
        description: "Finance d'entreprise approfondie, audit légal, droit fiscal des sociétés et contrôle de gestion stratégique."
      },
      {
        id: "form-2",
        diplome: "Master Finance d'Entreprise & Ingénierie Financière",
        etablissement: "Université Paris 1 Panthéon-Sorbonne",
        ville: "Paris",
        dateDebut: "2011",
        dateFin: "2014",
        enCours: false,
        description: "Analyse financière, modélisation de flux de trésorerie (DCF), fusions-acquisitions et évaluation d'entreprises."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Directrice Financière (CFO)",
        entreprise: "NextGen Software Group",
        ville: "Paris",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Membre du Comité Exécutif, responsable de l'ensemble des départements Comptabilité, FP&A, Trésorerie et Juridique (équipe de 11 collaborateurs). Clôtures mensuelles à J+3 et pilotage d'un ARR de 28M€."
      },
      {
        id: "exp-2",
        poste: "Responsable Contrôle de Gestion & FP&A",
        entreprise: "BioTech Solutions",
        ville: "Paris",
        dateDebut: "2017",
        dateFin: "2021",
        enCours: false,
        description: "Conception du modèle budgétaire dynamique sous Anaplan, analyse des écarts d'EBITDA et pilotage du BFR permettant de dégager 3.2M€ de liquidités additionnelles."
      },
      {
        id: "exp-3",
        poste: "Auditrice Financière Senior",
        entreprise: "Deloitte France",
        ville: "Paris",
        dateDebut: "2014",
        dateFin: "2017",
        enCours: false,
        description: "Audit des comptes sociaux et consolidés (normes IFRS et françaises) pour des clients cotés du secteur Tech et Télécoms."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Modélisation Financière & Reporting FP&A", niveau: 5 },
      { id: "comp-2", nom: "Gestion de Trésorerie & Optimisation BFR", niveau: 5 },
      { id: "comp-3", nom: "Normes Comptables IFRS & Fiscalité des Sociétés", niveau: 5 },
      { id: "comp-4", nom: "Levées de Fonds & Relations Investisseurs", niveau: 4 },
      { id: "comp-5", nom: "Outils ERP & EPM (NetSuite, Anaplan, PowerBI)", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Levée de Fonds Série B de 32 Millions d'Euros",
      sousTitre: "Structuration Financière & Due Diligence Vendeur",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Data Room Électronique, Modélisation DCF, Audit VDD, Négociation Term Sheet",
      lien: "finance-corp.fr/serie-b-announcement",
      description: "Coordination complète des audits comptables, fiscaux et juridiques auprès de fonds de Private Equity internationaux. Clôture de l'opération en 5 mois aux meilleures conditions de valorisation."
    }
  },
  {
    nomComplet: "Thomas Renard",
    prenom: "Thomas",
    nom: "Renard",
    titreProfessionnel: "Senior Product Manager SaaS & IA",
    email: "thomas.renard.pm@product-lab.io",
    telephone: "+33 6 92 11 44 77",
    adresse: "Toulouse, France",
    linkedin: "linkedin.com/in/thomas-renard-product",
    siteWeb: "www.thomasrenard.pm",
    resume: "Product Manager orienté data fort de 7 années passées à transformer des besoins utilisateurs complexes en fonctionnalités logicielles intuitives. Passionné par l'intégration d'agents IA générative et l'optimisation des métriques d'engagement (PLG).",
    formations: [
      {
        id: "form-1",
        diplome: "Master 2 Management de l'Innovation & Produits Digitaux",
        etablissement: "Grenoble École de Management (GEM)",
        ville: "Grenoble",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Design thinking, méthodologies Agile Scrum/Kanban, analyse quantitative du comportement utilisateur et stratégie go-to-market."
      },
      {
        id: "form-2",
        diplome: "Licence Mathématiques Appliquées & Informatique",
        etablissement: "Université Paul Sabatier",
        ville: "Toulouse",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Probabilités, statistiques inférentielles, programmation Python et bases de données relationnelles."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Senior Product Manager - Core Features",
        entreprise: "CloudDesk Technologies",
        ville: "Toulouse",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Responsable de la roadmap produit de l'espace de travail collaboratif (1.2M d'utilisateurs actifs mensuels). Direction d'une équipe de 2 designers UX et 9 ingénieurs. Hausse du Net Promoter Score (NPS) de +18 points en 18 mois."
      },
      {
        id: "exp-2",
        poste: "Product Manager B2B SaaS",
        entreprise: "SalesBoost App",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Lancement de 12 fonctionnalités clés de productivité CRM. Conduite de plus de 80 entretiens utilisateurs et mise en place d'un framework d'expérimentation A/B testing continu."
      },
      {
        id: "exp-3",
        poste: "Associate Product Manager / Data Analyst",
        entreprise: "WebMetrics SAS",
        ville: "Toulouse",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Analyse des funnels de conversion, création de tableaux de bord Mixpanel et priorisation du backlog technique avec l'équipe de développement."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Roadmapping & Priorisation (RICE, MoSCoW)", niveau: 5 },
      { id: "comp-2", nom: "Product-Led Growth (PLG) & Funnels d'Adoption", niveau: 5 },
      { id: "comp-3", nom: "Discovery Utilisateur & Entretiens Qualitatifs", niveau: 5 },
      { id: "comp-4", nom: "Analytics Produit (Amplitude, Mixpanel, SQL)", niveau: 4 },
      { id: "comp-5", nom: "Intégration de Fonctionnalités IA & LLM", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Copilote IA Générative Intégré au Workspace",
      sousTitre: "Assistant Intelligent de Synthèse et Rédaction",
      dateDebut: "2023",
      dateFin: "2024",
      technologies: "LLM OpenAI/Gemini API, RAG Architecture, Mixpanel, TypeScript",
      lien: "cloud-desk.io/ai-assistant-launch",
      description: "Cadrage, prototypage et lancement réussi d'une suite d'assistance rédactionnelle par IA. Adoption par 62% des entreprises clientes dès le premier mois et hausse de l'ARPU de 25%."
    }
  },
  {
    nomComplet: "Claire Gauthier",
    prenom: "Claire",
    nom: "Gauthier",
    titreProfessionnel: "Responsable Ressources Humaines & Talents (DRH)",
    email: "claire.gauthier@rh-solutions.fr",
    telephone: "+33 6 78 90 23 45",
    adresse: "Rennes, France",
    linkedin: "linkedin.com/in/claire-gauthier-rh",
    siteWeb: "www.clairegauthier-rh.fr",
    resume: "Responsable RH engagée avec 8 ans d'expérience dans l'accompagnement de la croissance des équipes, le recrutement de profils pénuriques et la mise en place de politiques de qualité de vie au travail (QVT) et d'inclusion.",
    formations: [
      {
        id: "form-1",
        diplome: "Master 2 Gestion des Ressources Humaines & Relations Sociales",
        etablissement: "IAE de Rennes / Université de Rennes 1",
        ville: "Rennes",
        dateDebut: "2015",
        dateFin: "2017",
        enCours: false,
        description: "Droit du travail approfondi, négociation avec les IRP (CSE), gestion prévisionnelle des emplois et compétences (GPEC) et politique de rémunération."
      },
      {
        id: "form-2",
        diplome: "Licence Administration Économique et Sociale (AES)",
        etablissement: "Université Rennes 2",
        ville: "Rennes",
        dateDebut: "2012",
        dateFin: "2015",
        enCours: false,
        description: "Sociologie du travail, droit civil, droit social et fondamentaux de la gestion d'entreprise."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Responsable Ressources Humaines",
        entreprise: "Armor Tech Innovations (220 salariés)",
        ville: "Rennes",
        dateDebut: "2020",
        dateFin: "Présent",
        enCours: true,
        description: "Pilotage de la stratégie RH globale : recrutement de 45 ingénieurs par an, animation du CSE, mise en place d'un accord d'entreprise sur le télétravail et refonte des grilles salariales."
      },
      {
        id: "exp-2",
        poste: "Chargée de Développement RH & Recrutement",
        entreprise: "Ouest Conseil Groupe",
        ville: "Nantes",
        dateDebut: "2017",
        dateFin: "2020",
        enCours: false,
        description: "Chasse de têtes sur LinkedIn Recruiter, sourcing actif, conduite de plus de 300 entretiens de recrutement et mise en place d'un parcours d'intégration (onboarding) primé."
      },
      {
        id: "exp-3",
        poste: "Assistante RH & Paie Junior",
        entreprise: "Laboratoires BioArmor",
        ville: "Saint-Brieuc",
        dateDebut: "2015",
        dateFin: "2017",
        enCours: false,
        description: "Gestion administrative du personnel, suivi des visites médicales, préparation des éléments variables de paie et déclarations sociales (DSN)."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Recrutement Stratégique & Chasse de Talents", niveau: 5 },
      { id: "comp-2", nom: "Relations Sociales & Animation du CSE", niveau: 5 },
      { id: "comp-3", nom: "Droit du Travail & Gestion des Contrats", niveau: 5 },
      { id: "comp-4", nom: "Gestion des Compétences & Formation (GPEC)", niveau: 4 },
      { id: "comp-5", nom: "Outils SIRH (Lucca, Workday, BambooHR)", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Programme QVT & Label 'Great Place to Work'",
      sousTitre: "Culture d'Entreprise et Bien-Être au Travail",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Enquêtes Pulse, Ateliers Collaboratifs, SIRH Lucca, Charte Équilibre de Vie",
      lien: "rh-solutions.fr/label-armor-tech",
      description: "Conception et déploiement d'une politique globale d'inclusion et d'équilibre vie pro/vie perso. Obtention de la certification Great Place to Work avec 89% d'avis positifs et réduction du turnover de 35%."
    }
  },
  {
    nomComplet: "Hugo Morel",
    prenom: "Hugo",
    nom: "Morel",
    titreProfessionnel: "Architecte Logiciel & Microservices Cloud",
    email: "hugo.morel.arch@tech-systems.io",
    telephone: "+33 6 44 22 11 99",
    adresse: "Lyon, France",
    linkedin: "linkedin.com/in/hugo-morel-architecte",
    siteWeb: "www.hugomorel.dev",
    resume: "Architecte logiciel avec 10 ans d'expérience dans la conception de plateformes résilientes et hautement disponibles sous microservices et event-driven design (Kafka). Expert en scalabilité, DDD et modernisation de legacy.",
    formations: [
      {
        id: "form-1",
        diplome: "Diplôme d'Ingénieur en Informatique & Génie Logiciel",
        etablissement: "INSA Lyon",
        ville: "Lyon",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Architectures distribuées, génie logiciel formel, algorithmique avancée et parallélisme."
      },
      {
        id: "form-2",
        diplome: "Classe Préparatoire aux Grandes Écoles (MPSI / MP*)",
        etablissement: "Lycée du Parc",
        ville: "Lyon",
        dateDebut: "2011",
        dateFin: "2013",
        enCours: false,
        description: "Mathématiques fondamentales, physique et informatique théorique."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Principal Software Architect",
        entreprise: "FinTech Scale Europe",
        ville: "Lyon",
        dateDebut: "2020",
        dateFin: "Présent",
        enCours: true,
        description: "Conception de l'architecture cible event-driven traitant 50 millions de transactions journalières avec une latence p99 < 15ms. Définition des standards techniques pour 80 ingénieurs."
      },
      {
        id: "exp-2",
        poste: "Architecte Solution Cloud",
        entreprise: "CloudScale Partners",
        ville: "Paris",
        dateDebut: "2017",
        dateFin: "2020",
        enCours: false,
        description: "Découpage de monolithes bancaires en microservices indépendants conteneurisés sous Kubernetes et migration progressive sans interruption de service."
      },
      {
        id: "exp-3",
        poste: "Ingénieur d'Études & Développement Java",
        entreprise: "Sopra Steria",
        ville: "Lyon",
        dateDebut: "2015",
        dateFin: "2017",
        enCours: false,
        description: "Développement d'applications critiques backend avec Spring Boot, PostgreSQL et messages queues RabbitMQ."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Event-Driven Architecture & Apache Kafka", niveau: 5 },
      { id: "comp-2", nom: "Microservices & Domain-Driven Design (DDD)", niveau: 5 },
      { id: "comp-3", nom: "Cloud Architecture (AWS, Kubernetes, Terraform)", niveau: 5 },
      { id: "comp-4", nom: "Bases SQL & NoSQL (PostgreSQL, Redis, Cassandra)", niveau: 4 },
      { id: "comp-5", nom: "Haute Disponibilité & Résilience Système", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Architecture Transactionnelle Haute Fréquence",
      sousTitre: "Event Streaming & Découplage Microservices",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Java 21, Spring Cloud, Apache Kafka, AWS EKS, PostgreSQL Citus",
      lien: "github.com/hmorel/high-throughput-event-mesh",
      description: "Architecture d'un système de messagerie distribué résistant aux pannes capable d'absorber 100 000 événements par seconde avec garantie d'ordonnancement strict."
    }
  },
  {
    nomComplet: "Julie Perrin",
    prenom: "Julie",
    nom: "Perrin",
    titreProfessionnel: "Product Designer & Chercheuse UX Senior",
    email: "julie.perrin.ux@design-insight.fr",
    telephone: "+33 6 81 23 45 67",
    adresse: "Grenoble, France",
    linkedin: "linkedin.com/in/julie-perrin-ux",
    siteWeb: "www.julieperrin.design",
    resume: "Designer Produit animée par la résolution de problèmes complexes via la recherche utilisateur, l'architecture de l'information et le design d'interaction épuré. Experte en ergonomie logicielle B2B et interfaces mobiles grand public.",
    formations: [
      {
        id: "form-1",
        diplome: "Master Sciences Cognitives & Ergonomie des Interfaces",
        etablissement: "Université Grenoble Alpes",
        ville: "Grenoble",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Psychologie cognitive, ergonomie des systèmes homme-machine, méthodologies d'évaluation d'utilisabilité et tests oculométriques."
      },
      {
        id: "form-2",
        diplome: "Licence Arts & Technologies Numériques",
        etablissement: "Université Lumière Lyon 2",
        ville: "Lyon",
        dateDebut: "2013",
        dateFin: "2016",
        enCours: false,
        description: "Design visuel, sémiologie du web, programmation front-end HTML/CSS/JS et prototypage."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Lead Product Designer",
        entreprise: "HealthCare Digital Systems",
        ville: "Grenoble",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Conception de logiciels médicaux hospitaliers utilisés par 15 000 soignants. Réduction de 45% du temps de saisie des dossiers patients et division par 3 des erreurs de prescription."
      },
      {
        id: "exp-2",
        poste: "UX Researcher & Designer",
        entreprise: "Agence UserFirst",
        ville: "Lyon",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Conduite de 120 tests d'utilisabilité, création de parcours utilisateurs (journey maps), wireframes interactifs et design de dashboards analytiques B2B."
      },
      {
        id: "exp-3",
        poste: "UI Designer Junior",
        entreprise: "Creative Web Studio",
        ville: "Grenoble",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Réalisation de maquettes graphiques pour applications e-commerce, icônes personnalisées et déclinaisons responsive multi-devices."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Recherche Utilisateur & Tests Qualitatifs / Quantitatifs", niveau: 5 },
      { id: "comp-2", nom: "Wireframing & Prototypage Rapide (Figma)", niveau: 5 },
      { id: "comp-3", nom: "Architecture de l'Information & User Flows", niveau: 5 },
      { id: "comp-4", nom: "Accessibilité Numérique (RGAA / WCAG)", niveau: 4 },
      { id: "comp-5", nom: "Design System & Collaboration Développeurs", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Refonte Ergonomique du Dossier Patient Informatisé",
      sousTitre: "Interface Médicale Critique Zero-Error",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Figma, UserZoom, Maze, Ergonomie Hospitalière, Normes ISO 9241",
      lien: "julieperrin.design/case-med-flow",
      description: "Projet d'ergonomie salué par l'Ordre des Médecins : refonte complète de l'interface d'ordonnance réduisant de moitié la charge cognitive des praticiens aux urgences."
    }
  },
  {
    nomComplet: "Lucas Bernard",
    prenom: "Lucas",
    nom: "Bernard",
    titreProfessionnel: "Ingénieur Cybersécurité & Audit Systèmes (CISSP)",
    email: "lucas.bernard.sec@cyber-defense.fr",
    telephone: "+33 6 11 88 55 22",
    adresse: "Rennes, France",
    linkedin: "linkedin.com/in/lucas-bernard-cyber",
    siteWeb: "www.lucasbernard-sec.io",
    resume: "Expert en sécurité des systèmes d'information certifié CISSP et CEH. 8 ans d'expérience dans les audits de vulnérabilités, les tests d'intrusion (pentest red team), la conformité ISO 27001 et la réponse aux incidents de sécurité (SOC/CERT).",
    formations: [
      {
        id: "form-1",
        diplome: "Diplôme d'Ingénieur en Cybersécurité & Confiance Numérique",
        etablissement: "Télécom Paris / ESIR Rennes",
        ville: "Rennes",
        dateDebut: "2015",
        dateFin: "2018",
        enCours: false,
        description: "Sécurité des réseaux, cryptanalyse, rétro-ingénierie de malwares, sécurité offensive et forensic."
      },
      {
        id: "form-2",
        diplome: "DUT Réseaux & Télécommunications",
        etablissement: "IUT de Saint-Malo",
        ville: "Saint-Malo",
        dateDebut: "2013",
        dateFin: "2015",
        enCours: false,
        description: "Protocoles de communication, pare-feu (Firewall), routage Cisco et administration Linux sécurisée."
      }
    ],
    experiences: [
      {
        id: "exp-1",
        poste: "Responsable Sécurité des Systèmes d'Information (RSSI Adjoint)",
        entreprise: "CyberShield Technologies",
        ville: "Rennes",
        dateDebut: "2021",
        dateFin: "Présent",
        enCours: true,
        description: "Pilotage de la gouvernance de sécurité, gestion des audits externes ISO 27001 et supervision du centre opérationnel de sécurité (SOC). Réduction de 70% du temps moyen de remédiation (MTTR)."
      },
      {
        id: "exp-2",
        poste: "Consultant Senior Pentest & Red Team",
        entreprise: "Wavestone Cyber",
        ville: "Paris",
        dateDebut: "2018",
        dateFin: "2021",
        enCours: false,
        description: "Réalisation de plus de 60 tests d'intrusion sur des infrastructures bancaires, industrielles et applications cloud. Découverte de 15 failles critiques avec élévation de privilèges."
      },
      {
        id: "exp-3",
        poste: "Analyste Sécurité SOC Junior",
        entreprise: "Orange Cyberdefense",
        ville: "Cesson-Sévigné",
        dateDebut: "2016",
        dateFin: "2018",
        enCours: false,
        description: "Surveillance des alertes SIEM (Splunk), qualification des incidents de sécurité et rédaction des rapports d'alerte CERT."
      }
    ],
    competences: [
      { id: "comp-1", nom: "Tests d'Intrusion & Sécurité Offensive (Red Team)", niveau: 5 },
      { id: "comp-2", nom: "Normes ISO 27001, NIS 2 & Conformité RGPD", niveau: 5 },
      { id: "comp-3", nom: "Architecture Sécurité Cloud (AWS, Azure, Zero-Trust)", niveau: 5 },
      { id: "comp-4", nom: "Réponse à Incident & Analyse Forensique", niveau: 4 },
      { id: "comp-5", nom: "Outils SIEM & EDR (Splunk, Sentinel, CrowdStrike)", niveau: 4 }
    ],
    projet: {
      id: "proj-1",
      titre: "Déploiement d'une Architecture Zero-Trust d'Entreprise",
      sousTitre: "Sécurisation de 3 500 Postes et Accès Cloud",
      dateDebut: "2022",
      dateFin: "2023",
      technologies: "Zero-Trust Architecture, Okta MFA, Zscaler ZPA, EDR Crowdstrike",
      lien: "cyber-defense.fr/zero-trust-success",
      description: "Conception et déploiement de la politique Zero-Trust pour une ETI industrielle de 3 500 collaborateurs. Neutralisation à 100% des tentatives de phishing et accès non autorisés."
    }
  }
];

const totalTemplates = templatesDefinitions.length;
console.log(`Generating presets for ${totalTemplates} templates...`);

const builtPresets = {};

templatesDefinitions.forEach((tpl, idx) => {
  const persona = personasList[idx % personasList.length];
  
  const isTwoCol = tpl.layoutFamily !== 'single-column' && (tpl.themeConfig?.nombreColonnes !== 1);
  const isSidebarRight = tpl.layoutFamily === 'two-column-right';
  const sidebarZone = isSidebarRight ? 'droite' : 'gauche';
  const mainZone = isSidebarRight ? 'gauche' : 'droite';

  const defaultCol = isTwoCol ? mainZone : 'principale';
  const sideCol = isTwoCol ? sidebarZone : 'principale';

  builtPresets[tpl.id] = {
    id: tpl.id,
    titre: tpl.name,
    police: tpl.defaultFont || "Inter",
    couleurAccent: tpl.defaultAccent || "#2563EB",
    couleurAccentSecondaire: tpl.defaultSecondaryAccent || "#F97316",
    nombreColonnes: isTwoCol ? 2 : 1,
    positionSidebar: isTwoCol ? (isSidebarRight ? "droite" : "gauche") : undefined,
    largeurColonneGauche: isTwoCol ? 34 : undefined,
    styleEnTete: tpl.themeConfig?.styleEnTete || "clean",
    styleEnTeteSection: tpl.themeConfig?.styleEnTeteSection || "underline",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    sections: [
      {
        id: "sec-profil",
        type: "profil",
        titre: "Profil Professionnel",
        ordre: 1,
        visible: true,
        colonne: defaultCol,
        zone: defaultCol,
        contenu: {
          nomComplet: persona.nomComplet,
          prenom: persona.prenom,
          nom: persona.nom,
          titreProfessionnel: persona.titreProfessionnel,
          titrePoste: persona.titreProfessionnel,
          email: persona.email,
          telephone: persona.telephone,
          adresse: persona.adresse,
          linkedin: persona.linkedin,
          siteWeb: persona.siteWeb,
          resume: persona.resume
        }
      },
      {
        id: "sec-exp",
        type: "experience",
        titre: "Expériences Professionnelles",
        ordre: 2,
        visible: true,
        colonne: defaultCol,
        zone: defaultCol,
        contenu: persona.experiences
      },
      {
        id: "sec-form",
        type: "formation",
        titre: "Formations & Diplômes",
        ordre: 3,
        visible: true,
        colonne: defaultCol,
        zone: defaultCol,
        contenu: persona.formations
      },
      {
        id: "sec-comp",
        type: "competences",
        titre: "Compétences Clés",
        ordre: 4,
        visible: true,
        colonne: sideCol,
        zone: sideCol,
        contenu: persona.competences
      },
      {
        id: "sec-proj",
        type: "projets",
        titre: "Projets & Réalisations",
        ordre: 5,
        visible: true,
        colonne: defaultCol,
        zone: defaultCol,
        contenu: [persona.projet]
      },
      {
        id: "sec-lang",
        type: "langues",
        titre: "Langues",
        ordre: 6,
        visible: true,
        colonne: sideCol,
        zone: sideCol,
        contenu: [
          { id: "lang-1", langue: "Français", niveau: "Langue maternelle" },
          { id: "lang-2", langue: "Anglais", niveau: "Courant professionnel (C1)" }
        ]
      }
    ]
  };
});

const presetsCode = `import { CV, Section, Language } from "../types";

export interface CustomPreset {
  id: string;
  titre: string;
  police: string;
  couleurAccent: string;
  couleurAccentSecondaire: string;
  nombreColonnes: 1 | 2;
  positionSidebar?: "gauche" | "droite";
  largeurColonneGauche?: number;
  styleEnTete?: string;
  styleEnTeteSection?: string;
  photoUrl?: string;
  sections: Section[];
  couleurFond?: string;
  couleurFondSidebar?: string;
  couleurFondProfil?: string;
  couleurTexteProfil?: string;
  couleurTitreSection?: string;
  couleurTitreSectionSidebar?: string;
  couleurTexte?: string;
  couleurTexteSidebar?: string;
  couleurTitrePrincipal?: string;
  couleurSousTitrePrincipal?: string;
  styleCompetences?: string;
  photoForme?: string;
  photoPosition?: string;
  formeSidebarDecor?: string;
  timelineStyle?: string;
  cadrePhotoRing?: boolean;
  styleBadgesCoordonnees?: string;
  decorativeLayers?: any[];
  arrierePlanPattern?: string;
  alignementDatesExperience?: string;
  [key: string]: any;
}

export const TEMPLATE_PRESETS: Record<string, CustomPreset> = ${JSON.stringify(builtPresets, null, 2)};

export function getPresetForTemplate(templateId: string, langue?: Language): CustomPreset {
  return TEMPLATE_PRESETS[templateId] || TEMPLATE_PRESETS["modele-1"] || Object.values(TEMPLATE_PRESETS)[0];
}

/**
 * Returns preset with rich realistic sample sections guaranteed so templates are NEVER empty.
 */
export function getCleanPresetForTemplate(templateId: string, langue?: Language): CustomPreset {
  return getPresetForTemplate(templateId, langue);
}

export function applyTemplatePresetToCV(cv: CV, presetKey: string): CV {
  const preset = getPresetForTemplate(presetKey);
  return {
    ...cv,
    templateId: presetKey,
    police: preset.police,
    couleurAccent: preset.couleurAccent,
    couleurAccentSecondaire: preset.couleurAccentSecondaire,
    nombreColonnes: (preset.nombreColonnes === 1 ? 1 : 2) as 1 | 2,
    positionSidebar: preset.positionSidebar,
    largeurColonneGauche: preset.largeurColonneGauche
  };
}
`;

fs.writeFileSync('src/data/templatePresets.ts', presetsCode, 'utf8');
console.log('src/data/templatePresets.ts written successfully with all 42 full models!');
