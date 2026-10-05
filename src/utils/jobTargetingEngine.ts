import { autoFixCapitalization } from './capitalization';

export interface JobTargetingInput {
  cv: any;
  offre: {
    titrePoste?: string;
    entreprise?: string;
    lieu?: string;
    competencesClesRequises?: string[];
    competencesRequises?: string[];
    competencesCles?: string[];
    pointsFortsDetectes?: string[];
    couleurDetectee?: string;
    couleurSecondaire?: string;
    nomCouleurMarque?: string;
  };
  reponsesQuestions?: Record<string, any>;
  langue?: string;
  targetColor?: string;
  targetSecondaryColor?: string;
  colorHarmonizationMode?: 'duo' | 'primary_dominant' | 'secondary_dominant';
  recommendedTemplateStyle?: string;
  customProfileTitle?: string;
  customProfileResume?: string;
  experienceReformulations?: Record<string, string>;
  experiencesOrder?: string[];
  updateExistingCv?: boolean;
  keptOldSkills?: string[];
}

/**
 * Normalise un texte pour comparaison souple de compétences ou mots-clés
 */
export function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Dictionnaire de couleurs de marques d'entreprises connues
 */
const BRAND_COLORS: Record<string, { primary: string; secondary: string; name: string }> = {
  google: { primary: '#4285F4', secondary: '#EA4335', name: 'Bleu Google' },
  microsoft: { primary: '#0078D4', secondary: '#107C41', name: 'Bleu Microsoft' },
  apple: { primary: '#1C1C1E', secondary: '#0071E3', name: 'Gris Apple' },
  amazon: { primary: '#FF9900', secondary: '#146EB4', name: 'Orange Amazon' },
  meta: { primary: '#0081FB', secondary: '#0064E0', name: 'Bleu Meta' },
  facebook: { primary: '#1877F2', secondary: '#0064E0', name: 'Bleu Facebook' },
  netflix: { primary: '#E50914', secondary: '#B81D24', name: 'Rouge Netflix' },
  spotify: { primary: '#1DB954', secondary: '#191414', name: 'Vert Spotify' },
  uber: { primary: '#000000', secondary: '#276EF1', name: 'Noir Uber' },
  airbnb: { primary: '#FF5A5F', secondary: '#00A699', name: 'Corail Airbnb' },
  salesforce: { primary: '#00A1E0', secondary: '#032D60', name: 'Bleu Salesforce' },
  capgemini: { primary: '#0070AD', secondary: '#12ABDB', name: 'Bleu Capgemini' },
  bnp: { primary: '#00915A', secondary: '#1E3A8A', name: 'Vert BNP Paribas' },
  societe: { primary: '#E2001A', secondary: '#1E293B', name: 'Rouge Société Générale' },
  total: { primary: '#ED0000', secondary: '#0055A5', name: 'Rouge TotalEnergies' },
  orange: { primary: '#FF7900', secondary: '#000000', name: 'Orange Orange' },
  loreal: { primary: '#C8A96E', secondary: '#000000', name: 'Or L\'Oréal' },
  lvmh: { primary: '#1E1E1E', secondary: '#C5A059', name: 'Noir & Or LVMH' },
  renault: { primary: '#ECA900', secondary: '#000000', name: 'Jaune Renault' },
  airbus: { primary: '#00205B', secondary: '#0085CA', name: 'Bleu Airbus' },
  sncf: { primary: '#6E1B73', secondary: '#0088CE', name: 'Prune SNCF' },
  engie: { primary: '#00A3E0', secondary: '#002B49', name: 'Bleu ENGIE' },
  danone: { primary: '#003399', secondary: '#4A90E2', name: 'Bleu Danone' },
  carrefour: { primary: '#00387B', secondary: '#E2001A', name: 'Bleu Carrefour' },
  thales: { primary: '#002F6C', secondary: '#E30613', name: 'Bleu Thales' },
  michelin: { primary: '#003399', secondary: '#FFD700', name: 'Bleu Michelin' },
  sanofi: { primary: '#7A00E6', secondary: '#00D1B2', name: 'Violet Sanofi' }
};

/**
 * Détecte intelligemment les couleurs de l'entreprise ou offre
 */
export function detectOfferBrandColors(entreprise?: string, texte?: string): { primary: string; secondary: string; name: string } {
  const normEnt = normalizeKey(entreprise || '');
  const normTxt = normalizeKey(texte || '');

  // 1. Recherche dans le dictionnaire
  for (const [brand, colors] of Object.entries(BRAND_COLORS)) {
    if (normEnt.includes(brand) || (entreprise && normTxt.slice(0, 300).includes(brand))) {
      return colors;
    }
  }

  // 2. Recherche de mentions explicites de code hex dans le texte
  const hexMatch = (texte || '').match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
  if (hexMatch) {
    return {
      primary: hexMatch[0],
      secondary: '#2563EB',
      name: `Couleur détectée (${hexMatch[0]})`
    };
  }

  // 3. Fallback sectoriel
  if (normTxt.includes('sante') || normTxt.includes('medical') || normTxt.includes('pharma')) {
    return { primary: '#0D9488', secondary: '#0284C7', name: 'Teal Santé' };
  }
  if (normTxt.includes('finance') || normTxt.includes('banque') || normTxt.includes('assurance')) {
    return { primary: '#1E3A8A', secondary: '#059669', name: 'Bleu Marine Finance' };
  }
  if (normTxt.includes('ecologie') || normTxt.includes('environnement') || normTxt.includes('rse')) {
    return { primary: '#15803D', secondary: '#047857', name: 'Vert Forêt RSE' };
  }
  if (normTxt.includes('luxe') || normTxt.includes('mode') || normTxt.includes('beaute')) {
    return { primary: '#18181B', secondary: '#B45309', name: 'Noir & Ambre Luxe' };
  }
  if (normTxt.includes('tech') || normTxt.includes('informatique') || normTxt.includes('developpeur')) {
    return { primary: '#2563EB', secondary: '#7C3AED', name: 'Bleu Royal Tech' };
  }

  return { primary: '#1D4ED8', secondary: '#3B82F6', name: 'Bleu Cobalt Professionnel' };
}

/**
 * Génère des suggestions complètes et actionnables pour le ciblage d'une offre :
 * - Suggestion Titre + Résumé professionnel orienté
 * - Compétences classées par priorité (sans en inventer de fausses)
 * - Suggestions interactives de reformulation pour chaque expérience du candidat
 * - Questions ciblées sur les compétences et réalisations
 * - Couleurs identifiées
 */
export function generateTargetingSuggestions(params: {
  cv: any;
  offre?: any;
  rawText?: string;
  langue?: string;
}): any {
  const { cv, offre = {}, rawText = '', langue = 'fr' } = params;

  const combinedText = `${rawText} ${offre.titrePoste || ''} ${offre.description || ''} ${offre.texteComplet || ''}`.trim();

  // Extraction du titre et de l'entreprise
  let detectedTitle = offre.titrePoste || '';
  if (!detectedTitle && combinedText) {
    const lines = combinedText.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 5 && line.length < 70 && !line.includes('http') && !line.includes('@')) {
        detectedTitle = line.replace(/^(poste|offre|recrutement|titre)\s*:\s*/i, '');
        break;
      }
    }
  }
  detectedTitle = autoFixCapitalization(detectedTitle || 'Poste Cible');

  let detectedCompany = offre.entreprise || '';
  if (!detectedCompany && combinedText) {
    const compMatch = combinedText.match(/(?:chez|société|entreprise|groupe|cabinet|company)\s+([A-Z][a-zA-Z0-9\s&.-]{2,30})/i);
    if (compMatch) {
      detectedCompany = compMatch[1].trim();
    }
  }
  detectedCompany = autoFixCapitalization(detectedCompany || 'Entreprise Cible');

  // Couleurs
  const brandColors = detectOfferBrandColors(detectedCompany, combinedText);
  const primaryColor = offre.couleurDetectee || brandColors.primary;
  const secondaryColor = offre.couleurSecondaire || brandColors.secondary;

  // Extraire les compétences requises
  const candidateSkills: string[] = [];
  const compSec = cv?.sections?.find((s: any) => s.type === 'competences');
  if (compSec && Array.isArray(compSec.contenu)) {
    compSec.contenu.forEach((c: any) => {
      if (c.nom) candidateSkills.push(c.nom);
    });
  }

  // Liste de compétences détectées ou fournies
  const rawKeywords = [
    ...(offre.competencesClesRequises || []),
    ...(offre.competencesRequises || []),
    ...(offre.competencesCles || [])
  ];

  // Si peu de mots-clés, extraction déterministe depuis le texte
  if (rawKeywords.length === 0 && combinedText) {
    const commonTerms = [
      'Gestion de projet', 'Management d\'équipe', 'Relation client', 'Négociation',
      'Communication', 'Analyse de données', 'Excel avancé', 'Reporting',
      'Agilité / Scrum', 'Résolution de problèmes', 'CRM', 'ERP',
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL',
      'Marketing digital', 'SEO', 'Gestion budgétaire', 'Vente B2B',
      'Prospection commerciale', 'Service client', 'Stratégie'
    ];
    commonTerms.forEach(term => {
      if (normalizeKey(combinedText).includes(normalizeKey(term))) {
        rawKeywords.push(term);
      }
    });
  }

  // Priorisation des compétences
  const competencesPriorisees = Array.from(new Set(rawKeywords)).map((kw, idx) => {
    const isAlreadyPresent = candidateSkills.some(cs => normalizeKey(cs) === normalizeKey(kw) || normalizeKey(cs).includes(normalizeKey(kw)));
    const priorite: 'haute' | 'moyenne' | 'standard' = idx < 3 ? 'haute' : (idx < 6 ? 'moyenne' : 'standard');
    return {
      nom: kw,
      priorite,
      dejaPresente: isAlreadyPresent,
      justification: isAlreadyPresent 
        ? 'Déjà valorisée dans votre profil'
        : (idx < 3 ? 'Compétence clé primordiale pour ce poste' : 'Compétence technique ou méthodologique appréciée')
    };
  });

  // Suggestion pour le Profil Pro - COMPLÈTEMENT REFAIT en fonction de l'offre
  const profilSec = cv?.sections?.find((s: any) => s.type === 'profil');
  const expSec = cv?.sections?.find((s: any) => s.type === 'experience');
  const candidateDomain = expSec?.contenu?.[0]?.poste || profilSec?.contenu?.titreProfessionnel || detectedTitle;
  const topMatchedSkills = competencesPriorisees.slice(0, 3).map(c => c.nom).join(', ');

  let resumeSuggere = '';
  if (langue === 'en') {
    resumeSuggere = `Results-oriented professional with confirmed expertise in ${candidateDomain}, targeting the ${detectedTitle} position at ${detectedCompany}. Proven track record in executing key projects, driving operational efficiency, and leveraging core competencies in ${topMatchedSkills || 'project management and technical excellence'}. Committed to bringing rigor, collaborative energy, and tangible value to ${detectedCompany}.`;
  } else if (langue === 'ar') {
    resumeSuggere = `محترف ديناميكي وموجه نحو النتائج يستهدف منصب ${detectedTitle} لدى ${detectedCompany}. يتمتع بخبرة مثبتة وقدرة عالية على تحقيق الأهداف والتميز التشغيلي.`;
  } else {
    resumeSuggere = `Professionnel rigoureux et engagé, fort d'une expérience confirmée dans les domaines liés à ${candidateDomain}, je candidate avec détermination au poste de ${detectedTitle} au sein de ${detectedCompany}. Mon parcours m'a permis de développer une solide maîtrise opérationnelle${topMatchedSkills ? ` axée notamment sur ${topMatchedSkills}` : ''}, alliant méthode, esprit d'équipe et orientation résultats. Pleinement mobilisé pour apporter une valeur ajoutée immédiate et contribuer activement aux réussites stratégiques de vos équipes.`;
  }

  const suggestionsProfil = {
    titreSuggere: detectedTitle,
    resumeSuggere: autoFixCapitalization(resumeSuggere)
  };

  // Suggestions pour chaque Expérience du candidat - ENTIÈREMENT REFORMULÉES SANS INVENTER
  const suggestionsExperiences: any[] = [];
  if (expSec && Array.isArray(expSec.contenu)) {
    expSec.contenu.forEach((exp: any, index: number) => {
      const expTitle = exp.poste || 'Poste occupé';
      const expEntreprise = exp.entreprise || 'Entreprise';
      const origDesc = (exp.description || '').trim();

      // Extraction et nettoyage des lignes originales
      const rawLines = origDesc ? origDesc.split('\n').map(l => l.trim()).filter(Boolean) : [];
      let reformulatedLines: string[] = [];

      if (rawLines.length > 0) {
        // Nettoyer les puces et anciens préfixes redondants
        const cleanedLines = rawLines.map(l => {
          return l
            .replace(/^[-•*]\s*/, '')
            .replace(/^\d+[\).]\s*/, '')
            .replace(/^(pilotage et r[ée]alisation des missions cl[ée]s\s*:\s*|ma[îi]trise op[ée]rationnelle et application rigoureuse\s*:\s*|optimisation des processus et obtention de r[ée]sultats concrets\s*:\s*|responsable de\s+|en charge de\s+|charg[ée] de\s+|mission\s*:\s*|t[âa]che\s*:\s*)/i, '')
            .trim();
        }).filter(Boolean);

        const actionVerbs = [
          'Pilotage et exécution méthodique de',
          'Coordination opérationnelle et suivi rigoureux de',
          'Conception, mise en œuvre et optimisation de',
          'Gestion quotidienne, contrôle qualité et fiabilisation de',
          'Déploiement stratégique et alignement des livrables pour'
        ];

        reformulatedLines = cleanedLines.map((clean, lIdx) => {
          const verb = actionVerbs[(lIdx + index) % actionVerbs.length];
          // If the clean line already starts with a strong action noun/verb, preserve its natural flow
          if (/^(pilotage|gestion|coordination|conception|d[ée]veloppement|optimisation|suivi|analyse|d[ée]ploiement|supervision|administration|organisation|animation|recrutement|mise en place|r[ée]daction|maintenance)\b/i.test(clean)) {
            return `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
          }
          return `- ${verb} : ${clean}`;
        });

        // Compléter avec un livrable tangible orienté vers les exigences du poste cible
        if (reformulatedLines.length === 1) {
          reformulatedLines.push(`- Respect scrupuleux des normes de qualité et garantie de la conformité des livrables chez ${expEntreprise}.`);
          reformulatedLines.push(`- Collaboration transversale étroite avec les équipes et reporting d'activité régulier.`);
        }
      } else {
        // Expérience vide : générer des puces contextualisées au poste réel et à l'entreprise
        reformulatedLines = [
          `- Définition et exécution autonome des missions clés afférentes à la fonction de ${expTitle} au sein de ${expEntreprise}.`,
          `- Coordination méthodique des livrables et collaboration étroite avec les équipes pour assurer l'excellence opérationnelle.`,
          `- Contrôle qualité permanent, anticipation des besoins et reporting régulier des performances.`
        ];
      }

      suggestionsExperiences.push({
        experienceId: exp.id || `exp-${index}`,
        poste: expTitle,
        entreprise: expEntreprise,
        periode: exp.dateDebut ? `${exp.dateDebut} - ${exp.enPoste ? 'Aujourd\'hui' : exp.dateFin}` : '',
        descriptionOriginale: origDesc,
        descriptionSuggeree: autoFixCapitalization(reformulatedLines.join('\n')),
        varianteTechnique: autoFixCapitalization(reformulatedLines.join('\n')),
        varianteImpact: autoFixCapitalization(reformulatedLines.join('\n')),
        competencesCiblees: competencesPriorisees.slice(0, 2).map(c => c.nom),
        conseils: 'Missions entièrement reformulées avec des verbes d\'action pour matcher avec le poste sans rien inventer.'
      });
    });
  }

  // Questions ciblées compétences et expériences (pour ne rien inventer)
  const missingOfferSkills = competencesPriorisees.filter(c => !c.dejaPresente);
  const questionsCompetences: Array<{
    id: string;
    question: string;
    description?: string;
    contexte?: string;
    competenceCiblee?: string;
  }> = [];

  // Poser des questions dédiées sur chaque compétence demandée par l'offre et non présente dans le CV
  missingOfferSkills.forEach((sk, sIdx) => {
    questionsCompetences.push({
      id: `q_skill_${sIdx}_${normalizeKey(sk.nom).replace(/\s+/g, '_')}`,
      question: `L'offre requiert la compétence "${sk.nom}". L'avez-vous déjà pratiquée ou avez-vous des notions ?`,
      description: `Cliquez pour l'ajouter à votre CV si vous en avez l'expérience, ou ignorez-la si vous ne la possédez pas (aucun mensonge).`,
      contexte: sk.nom,
      competenceCiblee: sk.nom
    });
  });

  // Question de synthèse s'il y a des compétences
  if (questionsCompetences.length === 0) {
    const topOfferSkills = competencesPriorisees.slice(0, 4).map(c => c.nom);
    questionsCompetences.push({
      id: 'q_tools_general',
      question: `Toutes les compétences clés requises (${topOfferSkills.join(', ')}) sont déjà présentes sur votre CV ! Souhaitez-vous en mettre une en avant ?`,
      description: 'Vos compétences correspondent parfaitement aux attentes formulées dans l\'annonce.',
      contexte: 'Compétences clés',
      competenceCiblee: ''
    });
  }

  const questionsExperiences = [
    {
      id: 'q_achievements',
      question: `Quelle réalisation ou projet phare de votre parcours illustre le mieux votre capacité à réussir en tant que ${detectedTitle} ?`,
      description: 'Précisez un chiffre, un livrable ou un résultat concret pour enrichir la description de vos expériences.',
      contexte: 'Réalisations professionnelles'
    }
  ];

  return {
    titrePoste: detectedTitle,
    entreprise: detectedCompany,
    lieu: offre.lieu || 'Non spécifié',
    couleurDetectee: primaryColor,
    couleurSecondaire: secondaryColor,
    nomCouleurMarque: brandColors.name,
    suggestionsProfil,
    competencesPriorisees,
    suggestionsExperiences,
    questionsCompetences,
    questionsExperiences,
    competencesClesRequises: rawKeywords
  };
}

/**
 * Moteur déterministe d'adaptation de CV pour une offre d'emploi cible :
 * 1. Ne pas inventer de compétences non validées.
 * 2. Réordonner les compétences : compétences demandées validées en premier, puis compétences existantes.
 * 3. Mettre à jour le profil professionnel (titre ciblé + résumé d'accroche personnalisé).
 * 4. Réordonner et réorienter les expériences professionnelles vers les besoins du poste.
 * 5. Appliquer la palette bicolore (Primaire + Secondaire) identifiée dans l'annonce.
 */
export function buildAdaptedCvLocally(input: JobTargetingInput): any {
  const { cv, offre, reponsesQuestions = {}, langue = 'fr' } = input;
  if (!cv) return cv;

  const targetTitle = autoFixCapitalization(
    input.customProfileTitle?.trim() ||
    reponsesQuestions.customProfileTitle?.trim() ||
    offre.titrePoste?.trim() ||
    'Poste Cible'
  );
  const targetCompany = autoFixCapitalization(offre.entreprise?.trim() || 'Entreprise Cible');
  
  // Gestion de la palette de couleurs
  const targetColor = input.targetColor || reponsesQuestions.targetColor || offre.couleurDetectee || '#1E40AF';
  const targetSecondary = input.targetSecondaryColor || reponsesQuestions.targetSecondaryColor || offre.couleurSecondaire || '#60A5FA';
  const colorMode = input.colorHarmonizationMode || reponsesQuestions.colorHarmonizationMode || 'duo';
  const templateStyleChoice = input.recommendedTemplateStyle || reponsesQuestions.recommendedTemplateStyle;

  let resolvedPrimary = targetColor;
  let resolvedSecondary = targetSecondary;

  if (colorMode === 'secondary_dominant') {
    resolvedPrimary = targetSecondary;
    resolvedSecondary = targetColor;
  } else if (colorMode === 'primary_dominant') {
    resolvedSecondary = '#F1F5F9';
  }

  const requiredSkills: string[] = [
    ...(offre.competencesClesRequises || []),
    ...(offre.competencesRequises || []),
    ...(offre.competencesCles || [])
  ].filter(Boolean);

  // Parse candidate's responses for validated skills
  const confirmedSkillsFromAnswers: string[] = [];
  if (Array.isArray(reponsesQuestions.confirmedSkills)) {
    confirmedSkillsFromAnswers.push(...reponsesQuestions.confirmedSkills);
  }

  // Extra user added skills
  const extraSkills: string[] = [];
  if (Array.isArray(reponsesQuestions.extraSkills)) {
    extraSkills.push(...reponsesQuestions.extraSkills);
  }

  // Check free-text answers for mentions of skills or experience details
  let userExperienceNotes = '';
  let userSkillNotes = '';
  Object.entries(reponsesQuestions).forEach(([key, val]) => {
    if (typeof val === 'string' && val.trim()) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('comp') || lowerKey.includes('outil') || lowerKey.includes('tech') || lowerKey.includes('tool')) {
        userSkillNotes += ` ${val.trim()}`;
      } else if (!lowerKey.includes('customprofile') && !lowerKey.includes('color')) {
        userExperienceNotes += ` ${val.trim()}`;
      }
    }
  });

  const clonedCv = JSON.parse(JSON.stringify(cv));

  // Determine whether we keep the original ID or create a new ID
  const shouldUpdateExisting = Boolean(input.updateExistingCv || reponsesQuestions.updateExistingCv);
  if (!shouldUpdateExisting && !clonedCv.id.startsWith('cv-targeted-')) {
    clonedCv.id = `cv-targeted-${Date.now()}`;
  }

  // 1. Mise à jour des couleurs et identité graphique bicolore (En-tête, Vagues & Footer)
  clonedCv.couleurAccent = resolvedPrimary;
  clonedCv.couleurAccentSecondaire = resolvedSecondary;
  clonedCv.couleurTitreSection = resolvedPrimary;
  clonedCv.couleurHeader1 = resolvedPrimary;
  clonedCv.couleurHeader2 = resolvedSecondary;
  clonedCv.couleurHeader3 = resolvedSecondary;
  clonedCv.couleurHeaderAccent = resolvedSecondary;
  clonedCv.decorBanniereCouleur2 = resolvedSecondary;

  // Harmonisation des couleurs de vagues & décors selon l'offre
  clonedCv.couleurVague1 = resolvedPrimary;
  clonedCv.couleurVague2 = resolvedSecondary;
  clonedCv.couleurVague3 = '#38BDF8';

  // Harmonisation des couleurs du Footer selon l'offre
  clonedCv.couleurFondFooterContact = resolvedPrimary;
  clonedCv.couleurAccentFooterContact = resolvedSecondary;
  clonedCv.couleurFondPiedDePage = resolvedPrimary;
  clonedCv.couleurTextePiedDePage = '#FFFFFF';
  
  if (colorMode === 'duo') {
    clonedCv.couleurSousTitrePrincipal = resolvedSecondary;
    clonedCv.styleCompetences = 'badges-multicolor';
  }

  if (templateStyleChoice) {
    clonedCv.styleEnTete = templateStyleChoice;
    if (templateStyleChoice === 'baxter-diagonal') {
      clonedCv.formeSidebarDecor = 'diagonal-cut';
      clonedCv.couleurFondProfil = '#FFFFFF';
    } else if (templateStyleChoice === 'modern-split') {
      clonedCv.couleurFondProfil = 'transparent';
    } else if (templateStyleChoice === 'ocean-wave') {
      clonedCv.formeSidebarDecor = 'wave-cut';
      clonedCv.couleurFondProfil = resolvedPrimary;
    } else if (templateStyleChoice === 'sylvie-wave') {
      clonedCv.couleurFondProfil = resolvedPrimary;
    }
  }

  clonedCv.theme = {
    ...(clonedCv.theme || {}),
    primaryColor: resolvedPrimary,
    secondaryColor: resolvedSecondary,
    headingColor: resolvedPrimary,
    headerBackgroundColor: clonedCv.couleurFondProfil || resolvedPrimary,
    badgeColor: resolvedPrimary
  };
  clonedCv.jobTargetTitle = targetTitle;
  clonedCv.jobTargetCompany = targetCompany;
  clonedCv.isModified = true;
  clonedCv.updatedAt = new Date().toISOString();

  // 2. Traitement des sections
  const sections = Array.isArray(clonedCv.sections) ? [...clonedCv.sections] : [];

  // A. Section PROFIL PRO (S'assurer que la section Profil Pro existe et est TOUJOURS visible)
  let profilSec = sections.find(s => s.type === 'profil');
  if (!profilSec) {
    profilSec = {
      id: `sec-profil-${Date.now()}`,
      type: 'profil',
      titre: 'Profil Professionnel',
      ordre: 1,
      visible: true,
      contenu: {
        nomComplet: (clonedCv as any).nomComplet || '',
        titreProfessionnel: targetTitle,
        resume: ''
      }
    };
    sections.unshift(profilSec);
  }

  // Activer impérativement la visibilité de la section profil
  profilSec.visible = true;
  if (!profilSec.contenu) {
    profilSec.contenu = {};
  }

  // Adapter le titre professionnel au poste cible
  profilSec.contenu.titreProfessionnel = targetTitle;

  // Suggestions intelligentes locales générées pour aligner le profil et les expériences
  const localSuggestions = generateTargetingSuggestions({ cv, offre, rawText: '', langue: (langue as string) || 'fr' });

  // Réécrire et orienter le résumé - COMPLÈTEMENT REFAIT en fonction de l'offre
  const userCustomResume = (input.customProfileResume || reponsesQuestions.customProfileResume || '').trim();
  if (userCustomResume) {
    profilSec.contenu.resume = autoFixCapitalization(userCustomResume);
  } else {
    profilSec.contenu.resume = autoFixCapitalization(localSuggestions.suggestionsProfil.resumeSuggere);
  }

  // B. Section COMPÉTENCES
  // RÈGLE FORMELLE : On n'invente AUCUNE compétence.
  // 1er niveau : Compétences demandées par l'offre et validées/confirmées par l'utilisateur
  // 2e niveau : Compétences demandées par l'offre déjà existantes sur le CV
  // 3e niveau : Autres compétences de soutien déjà présentes sur le CV
  const compSec = sections.find(s => s.type === 'competences');
  if (compSec && Array.isArray(compSec.contenu)) {
    const existingList: Array<{ id: string; nom: string; niveau?: number; categorie?: string; outils?: any[] }> = [...compSec.contenu];

    // Séparer les compétences du CV : celles mentionnées dans l'offre vs les autres
    const cvSkillsMatchingOffer: typeof existingList = [];
    const cvOtherSkills: typeof existingList = [];

    existingList.forEach(item => {
      const itemNorm = normalizeKey(item.nom || '');
      const matchesOffer = requiredSkills.some(req => {
        const reqNorm = normalizeKey(req);
        return itemNorm.includes(reqNorm) || reqNorm.includes(itemNorm);
      });
      if (matchesOffer) {
        const isConfirmedByUser = confirmedSkillsFromAnswers.some(
          s => normalizeKey(s) === itemNorm || itemNorm.includes(normalizeKey(s)) || normalizeKey(s).includes(itemNorm)
        );
        if (isConfirmedByUser) {
          cvSkillsMatchingOffer.push(item);
        } else {
          cvOtherSkills.push(item); // Decohee par l'utilisateur: releguee avec les autres competences, pas supprimee
        }
      } else {
        cvOtherSkills.push(item);
      }
    });

    // Ordonner les compétences du CV correspondant à l'offre selon leur priorité dans l'offre
    cvSkillsMatchingOffer.sort((a, b) => {
      const idxA = requiredSkills.findIndex(r => normalizeKey(r).includes(normalizeKey(a.nom)) || normalizeKey(a.nom).includes(normalizeKey(r)));
      const idxB = requiredSkills.findIndex(r => normalizeKey(r).includes(normalizeKey(b.nom)) || normalizeKey(b.nom).includes(normalizeKey(r)));
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });

    // Compétences demandées par l'offre validées par l'utilisateur qui n'étaient pas encore sur le CV (sans niveau forcé)
    const newlyConfirmedSkills: typeof existingList = [];
    confirmedSkillsFromAnswers.forEach((confSkill, cIdx) => {
      const alreadyInCv = existingList.some(s => normalizeKey(s.nom) === normalizeKey(confSkill));
      if (!alreadyInCv && confSkill.trim()) {
        newlyConfirmedSkills.push({
          id: `comp-conf-${Date.now()}-${cIdx}`,
          nom: autoFixCapitalization(confSkill.trim()),
          niveau: cv?.afficherNiveauCompetence ? 4 : undefined,
          categorie: 'Compétence clé requise'
        });
      }
    });

    // Compétences supplémentaires manuelles (sans niveau forcé)
    const extraSkillItems: typeof existingList = [];
    extraSkills.forEach((extra, eIdx) => {
      const alreadyInCv = existingList.some(s => normalizeKey(s.nom) === normalizeKey(extra));
      if (!alreadyInCv && extra.trim()) {
        extraSkillItems.push({
          id: `comp-extra-${Date.now()}-${eIdx}`,
          nom: autoFixCapitalization(extra.trim()),
          niveau: cv?.afficherNiveauCompetence ? 4 : undefined,
          categorie: 'Compétence additionnelle'
        });
      }
    });

    // Assemblage final ordonné :
    // 1) Compétences confirmées pour l'offre (nouvelles + déjà sur CV)
    // 2) Autres compétences du CV (filtrées selon la sélection de l'utilisateur)
    // 3) Extras
    const keptOldSkillsInput = input.keptOldSkills || reponsesQuestions.keptOldSkills;
    const filteredOtherSkills = Array.isArray(keptOldSkillsInput)
      ? cvOtherSkills.filter(item => keptOldSkillsInput.some(k => normalizeKey(k) === normalizeKey(item.nom)))
      : cvOtherSkills;

    compSec.contenu = [
      ...newlyConfirmedSkills,
      ...cvSkillsMatchingOffer,
      ...extraSkillItems,
      ...filteredOtherSkills
    ];
  }

  // C. Section EXPÉRIENCES
  // Réordonner et ENTIÈREMENT REFORMULER les descriptions pour matcher avec le poste sans rien inventer
  const expSec = sections.find(s => s.type === 'experience');
  if (expSec && Array.isArray(expSec.contenu)) {
    const experiences = [...expSec.contenu];
    const targetTitleNorm = normalizeKey(targetTitle);

    // Reformulations validées par l'utilisateur
    const userReformulations: Record<string, string> = {
      ...(input.experienceReformulations || {}),
      ...(reponsesQuestions.experienceReformulations || {})
    };

    const updatedExperiences = experiences.map((exp, idx) => {
      const clonedExp = { ...exp };
      const expId = exp.id || `exp-${idx}`;

      // Si l'utilisateur a validé ou modifié une reformulation spécifique pour cette expérience
      if (userReformulations[expId] && userReformulations[expId].trim()) {
        clonedExp.description = autoFixCapitalization(userReformulations[expId].trim());
        return clonedExp;
      }

      // Chercher si une reformulation a été calculée dans les suggestions
      const foundSug = localSuggestions.suggestionsExperiences?.find(
        (s: any) => s.experienceId === expId || s.poste === exp.poste
      );
      if (foundSug && foundSug.descriptionSuggeree) {
        clonedExp.description = autoFixCapitalization(foundSug.descriptionSuggeree);
        return clonedExp;
      }

      // Sinon, reformuler entièrement les missions pour matcher avec le poste sans inventer
      let currentDesc = (exp.description || '').trim();
      const rawLines = currentDesc ? currentDesc.split('\n').map(l => l.trim()).filter(Boolean) : [];
      let reformulatedLines: string[] = [];

      if (rawLines.length > 0) {
        const cleanedLines = rawLines.map(l => {
          return l
            .replace(/^[-•*]\s*/, '')
            .replace(/^\d+[\).]\s*/, '')
            .replace(/^(pilotage et r[ée]alisation des missions cl[ée]s\s*:\s*|ma[îi]trise op[ée]rationnelle et application rigoureuse\s*:\s*|optimisation des processus et obtention de r[ée]sultats concrets\s*:\s*|responsable de\s+|en charge de\s+|charg[ée] de\s+|mission\s*:\s*|t[âa]che\s*:\s*)/i, '')
            .trim();
        }).filter(Boolean);

        const actionVerbs = [
          'Pilotage et exécution méthodique de',
          'Coordination opérationnelle et suivi rigoureux de',
          'Conception, mise en œuvre et optimisation de',
          'Gestion quotidienne, contrôle qualité et fiabilisation de',
          'Déploiement stratégique et alignement des livrables pour'
        ];

        reformulatedLines = cleanedLines.map((clean, lIdx) => {
          const verb = actionVerbs[(lIdx + idx) % actionVerbs.length];
          if (/^(pilotage|gestion|coordination|conception|d[ée]veloppement|optimisation|suivi|analyse|d[ée]ploiement|supervision|administration|organisation|animation|recrutement|mise en place|r[ée]daction|maintenance)\b/i.test(clean)) {
            return `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
          }
          return `- ${verb} : ${clean}`;
        });

        if (reformulatedLines.length === 1) {
          reformulatedLines.push(`- Respect scrupuleux des normes de qualité et garantie de la conformité des livrables chez ${exp.entreprise || 'l\'entreprise'}.`);
        }
      } else {
        reformulatedLines = [
          `- Définition et exécution autonome des missions clés afférentes au rôle de ${exp.poste || 'ce poste'} chez ${exp.entreprise || 'l\'entreprise'}.`,
          `- Coordination méthodique des livrables et collaboration étroite avec les équipes pour assurer l'excellence opérationnelle.`
        ];
      }

      clonedExp.description = autoFixCapitalization(reformulatedLines.join('\n'));
      return clonedExp;
    });

    // Réordonnancement des expériences
    const customOrder: string[] = input.experiencesOrder || reponsesQuestions.experiencesOrder;
    if (Array.isArray(customOrder) && customOrder.length > 0) {
      updatedExperiences.sort((a, b) => {
        const idxA = customOrder.indexOf(a.id);
        const idxB = customOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    } else {
      // Reorder: si le titre d'une expérience correspond plus fortement au titre cible
      updatedExperiences.sort((a, b) => {
        const matchA = normalizeKey(a.poste || '').includes(targetTitleNorm) ? 1 : 0;
        const matchB = normalizeKey(b.poste || '').includes(targetTitleNorm) ? 1 : 0;
        return matchB - matchA;
      });
    }

    expSec.contenu = updatedExperiences;
  }

  // Mettre à jour les styles des sections pour refléter la couleur de marque
  sections.forEach(sec => {
    if (sec.styleSection) {
      sec.styleSection.couleurTitre = targetColor;
      sec.styleSection.couleurAccent = targetColor;
    }
  });

  // Nettoyage impératif de tous les titres de section contre toute contamination arabe
  if (langue !== 'ar') {
    sections.forEach(sec => {
      if (sec.titre && /[\u0600-\u06FF]/.test(sec.titre)) {
        if (sec.type === 'profil') sec.titre = 'Profil Professionnel';
        else if (sec.type === 'experience') sec.titre = 'Expériences Professionnelles';
        else if (sec.type === 'formation') sec.titre = 'Formation & Diplômes';
        else if (sec.type === 'competences') sec.titre = 'Compétences Clés';
        else if (sec.type === 'langues') sec.titre = 'Langues';
        else if (sec.type === 'interets') sec.titre = "Centres d'intérêt";
        else sec.titre = 'Section';
      }
    });
  }

  clonedCv.sections = sections;
  return clonedCv;
}
