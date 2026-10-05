import { autoFixCapitalization } from './capitalization';

export interface DynamicCoverLetterInput {
  cv: any;
  langue?: string;
  entreprise?: string;
  poste?: string;
  ton?: string;
  pointsCles?: string;
}

export interface DynamicCoverLetterOutput {
  destinataire: string;
  entreprise: string;
  poste: string;
  objet: string;
  formulePolitesseEntree: string;
  paragrapheAccroche: string;
  paragrapheValeurAjoutee: string;
  paragrapheAdequationEntreprise: string;
  paragrapheConclusion: string;
  formulePolitesseSortie: string;
  texteComplet: string;
}

export function buildGeminiCoverLetterPrompt(input: DynamicCoverLetterInput, candidateName: string, candidateTitle: string): string {
  const { cv, langue = 'fr', entreprise = '', poste = '', ton = 'professionnel', pointsCles = '' } = input;
  
  const langLabel = langue === 'en' ? 'Anglais (English)' : langue === 'ar' ? 'Arabe (Arabic)' : 'Français';
  const targetCompany = autoFixCapitalization(entreprise.trim() || 'Entreprise Cible');
  const targetPost = autoFixCapitalization(poste.trim() || candidateTitle || 'Professionnel Rapprocheur');

  // Extract top experiences and skills
  const expSection = cv?.sections?.find((s: any) => s.type === 'experience');
  const skillsSection = cv?.sections?.find((s: any) => s.type === 'competences' || s.type === 'skills');
  const eduSection = cv?.sections?.find((s: any) => s.type === 'formation' || s.type === 'education');

  const expSummary = Array.isArray(expSection?.contenu) 
    ? expSection.contenu.slice(0, 3).map((e: any) => `${e.poste || e.titre} chez ${e.entreprise || e.employeur || ''} (${e.periode || e.date || ''}): ${e.description || e.realisations || ''}`).join('; ')
    : 'Expérience significative dans le secteur.';

  const skillsSummary = Array.isArray(skillsSection?.contenu)
    ? skillsSection.contenu.map((s: any) => typeof s === 'string' ? s : s.nom || s.title || '').filter(Boolean).slice(0, 8).join(', ')
    : 'Compétences techniques et relationnelles solides.';

  const eduSummary = Array.isArray(eduSection?.contenu)
    ? eduSection.contenu.slice(0, 2).map((e: any) => `${e.diplome || e.titre} à ${e.etablissement || e.ecole || ''}`).join('; ')
    : 'Formation académique.';

  return `Tu es un expert exécutif en recrutement RH et rédaction de lettres de motivation de haut niveau.
Rédige une lettre de motivation AUTHENTIQUE, PERSUASIVE, HUMAINE et PERCUTANTE en ${langLabel}.

INFORMATIONS CANDIDAT:
- Nom: ${autoFixCapitalization(candidateName)}
- Titre / Poste actuel: ${autoFixCapitalization(candidateTitle)}
- Expériences et réalisations clés: ${expSummary}
- Compétences prouvées: ${skillsSummary}
- Formation: ${eduSummary}

INFORMATIONS CIBLE:
- Entreprise visée: ${targetCompany}
- Poste visé: ${targetPost}
- Tonalité souhaitée: ${ton}
- Consignes / points particuliers: ${pointsCles || 'Maximiser la pertinence et le style professionnel'}

EXIGENCES ET RÈGLES CRUCIALES DE RÉDACTION :
1. INTERDICTION DE VOCABULAIRE AI / CLICHÉS SAAS : Banis strictement les mots "synergie", "catalyseur", "professionnel chevronné", "au sein de votre prestigieuse entreprise", "cadre stimulant", "dynamique", "passionné par". Adopte un style humain direct, sobre, élégant et axé sur les faits.
2. ÉQUILIBRE CANDIDAT / ENTREPRISE : Consacre un paragraphe entier (paragrapheAdequationEntreprise) spécifiquement aux enjeux, projets, positionnement ou mission de ${targetCompany}, en montrant précisément comment la contribution du candidat répond directement à LEURS besoins actuels.
3. COHÉRENCE TECHNIQUE PARFAITE : Toute compétence technique mentionnée dans la lettre doit trouver une justification directe dans les réalisations concrètes des expériences du candidat.
4. APPEL À L'ACTION EXPLICITE OBLIGATOIRE (CONCLUSION) : Le dernier paragraphe (paragrapheConclusion) DOIT SE TERMINER PAR UNE DEMANDE ET PROPOSITION D'ENTRETIEN directe et courtoise pour solliciter un échange de vive voix avec le recruteur.
5. CORRECTION DE LA CASSE : Capitalise correctement les noms propres, noms d'entreprises (${targetCompany}), villes et projets (Title Case).

RÉPONDS STRICTEMENT EN FORMAT JSON VALIDE respectant exactement ce schéma :
{
  "destinataire": "Direction des Ressources Humaines / Responsable du Recrutement",
  "entreprise": "${targetCompany}",
  "poste": "${targetPost}",
  "objet": "Candidature au poste de ${targetPost} - ${autoFixCapitalization(candidateName)}",
  "formulePolitesseEntree": "Madame, Monsieur,",
  "paragrapheAccroche": "Texte de l'accroche directe et fluide",
  "paragrapheValeurAjoutee": "Texte démontrant la valeur ajoutée avec preuves factuelles",
  "paragrapheAdequationEntreprise": "Texte centré sur ${targetCompany}, ses défis et l'apport concret pour elle",
  "paragrapheConclusion": "Texte de conclusion se terminant par un appel à l'action explicite pour un entretien",
  "formulePolitesseSortie": "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
  "texteComplet": "Texte intégral réuni"
}`;
}

export function generateDynamicFallbackLetter(input: DynamicCoverLetterInput, candidateName: string, candidateTitle: string): DynamicCoverLetterOutput {
  const { cv, langue = 'fr', entreprise = '', poste = '', ton = 'professionnel', pointsCles = '' } = input;

  const targetCompany = autoFixCapitalization(entreprise.trim() || 'votre entreprise');
  const targetPost = autoFixCapitalization(poste.trim() || candidateTitle || 'ce poste');
  const name = autoFixCapitalization(candidateName || 'Candidat');

  // Extract experiences, skills, education
  const expSection = cv?.sections?.find((s: any) => s.type === 'experience');
  const skillsSection = cv?.sections?.find((s: any) => s.type === 'competences' || s.type === 'skills');
  
  const experiences = Array.isArray(expSection?.contenu) ? expSection.contenu : [];
  const latestExp = experiences[0] || {};
  const previousRole = autoFixCapitalization(latestExp.poste || latestExp.titre || candidateTitle || 'professionnel qualifié');
  const previousCompany = autoFixCapitalization(latestExp.entreprise || latestExp.employeur || '');

  const skillsList = Array.isArray(skillsSection?.contenu)
    ? skillsSection.contenu.map((s: any) => typeof s === 'string' ? s : s.nom || s.title || '').filter(Boolean)
    : [];

  const topSkillsStr = skillsList.length > 0
    ? skillsList.slice(0, 4).map(s => autoFixCapitalization(s)).join(', ')
    : 'gestion de projets, analyse opérationnelle et résolution de problèmes complexes';

  const randIndex = Math.abs((targetCompany.length + targetPost.length + Date.now()) % 3);

  let accroche = '';
  let valeurAjoutee = '';
  let adequation = '';
  let conclusion = '';

  if (langue === 'en') {
    const accrochesEn = [
      `I am writing to express my strong interest in the ${targetPost} position at ${targetCompany}. Having served as ${previousRole}${previousCompany ? ` at ${previousCompany}` : ''}, I bring practical expertise directly relevant to your upcoming projects.`,
      `The ${targetPost} role at ${targetCompany} aligns perfectly with my professional background. As a ${previousRole}, I have systematically delivered measurable outcomes in fast-paced environments.`,
      `I am pleased to submit my application for the ${targetPost} opportunity at ${targetCompany}. My solid background in ${topSkillsStr} provides a strong foundation to support your team's key objectives.`
    ];

    const valeursEn = [
      `Throughout my recent engagements, I have focused on achieving high-quality deliverables. Utilizing skills in ${topSkillsStr}, I have streamlined daily operations and led key initiatives to success. ${pointsCles ? `My focus on ${pointsCles} further enhances my operational agility.` : ''}`,
      `My professional path is defined by concrete achievements. In my work as ${previousRole}, I applied key strengths in ${topSkillsStr} to address complex requirements while meeting strict quality standards. ${pointsCles ? `My expertise in ${pointsCles} enables me to adapt quickly.` : ''}`,
      `In my role as ${previousRole}, I consistently translated operational goals into clear action plans. My proficiency in ${topSkillsStr} drives my structured and results-oriented approach.`
    ];

    const adequationsEn = [
      `${targetCompany}'s commitment to quality and strategic development makes it an exceptional organization. I have followed your recent growth, and I am keen to apply my experience directly to solve your current business challenges.`,
      `What specifically draws me to ${targetCompany} is your clear strategic direction. Joining your team as ${targetPost} will allow me to dedicate my expertise to strengthening your project delivery.`,
      `I closely follow ${targetCompany}'s contributions to the sector. I am confident that my technical grounding and methodology will contribute directly to achieving your upcoming targets.`
    ];

    const conclusionsEn = [
      `I would be delighted to meet with you for an interview to discuss how my profile aligns with your expectations and to elaborate on my contributions. Thank you for your time and consideration.`,
      `I welcome the opportunity to discuss my application in detail during an interview. I am available at your convenience to schedule a meeting.`,
      `I look forward to an interview where I can present my background and demonstrate how my skills can immediately benefit ${targetCompany}.`
    ];

    accroche = accrochesEn[randIndex];
    valeurAjoutee = valeursEn[randIndex];
    adequation = adequationsEn[randIndex];
    conclusion = conclusionsEn[randIndex];

    return {
      destinataire: 'Hiring Manager / Talent Acquisition',
      entreprise: targetCompany,
      poste: targetPost,
      objet: `Application for ${targetPost} - ${name}`,
      formulePolitesseEntree: 'Dear Hiring Manager,',
      paragrapheAccroche: accroche,
      paragrapheValeurAjoutee: valeurAjoutee,
      paragrapheAdequationEntreprise: adequation,
      paragrapheConclusion: conclusion,
      formulePolitesseSortie: 'Sincerely,',
      texteComplet: `Dear Hiring Manager,\n\n${accroche}\n\n${valeurAjoutee}\n\n${adequation}\n\n${conclusion}\n\nSincerely,\n\n${name}`
    };
  }

  // French (default)
  const accrochesFr = [
    `C'est avec un vif intérêt que je vous soumets ma candidature pour le poste de ${targetPost} au sein de ${targetCompany}. Fort(e) de mes réussites en tant que ${previousRole}${previousCompany ? ` chez ${previousCompany}` : ''}, j'ai développé un savoir-faire opérationnel directement transférable à vos projets actuels.`,
    `Le poste de ${targetPost} proposé par ${targetCompany} retient toute mon attention. Mon parcours d'action en tant que ${previousRole} m'a permis d'acquérir une maîtrise solide des enjeux de votre secteur d'activité.`,
    `Je vous adresse ma candidature pour le poste de ${targetPost} au sein de ${targetCompany}. Mon expérience confirmée dans la mise en œuvre de ${topSkillsStr} me permet d'apporter une contribution rapide et efficace à vos équipes.`
  ];

  const valeursFr = [
    `Au cours de mes missions précédentes, j'ai veillé à obtenir des résultats concrets et mesurables. Grâce à la pratique régulière de ${topSkillsStr}, j'ai optimisé les processus existants et garanti le respect rigoureux des objectifs fixés. ${pointsCles ? `De plus, ma pratique de ${pointsCles} renforce directement ma capacité à gérer des priorités exigeantes.` : ''}`,
    `Mon parcours professionnel repose sur la rigueur opérationnelle et l'efficacité sur le terrain. En mobilisant mes compétences en ${topSkillsStr}, j'ai mené à bien des projets d'envergure tout en garantissant des standards de qualité élevés. ${pointsCles ? `Mon orientation vers ${pointsCles} constitue un atout précieux au quotidien.` : ''}`,
    `En tant que ${previousRole}, j'ai développé une méthode de travail méthodique axée sur les objectifs. Ma maîtrise de ${topSkillsStr} me permet de structurer rapidement les actions nécessaires pour répondre aux exigences stratégiques.`
  ];

  const adequationsFr = [
    `Les projets récents et les orientations stratégiques de ${targetCompany} démontrent un positionnement clair sur le marché. Votre recherche d'excellence correspond parfaitement à mes méthodes de travail, et je souhaite mettre mon énergie au service de vos objectifs.`,
    `Je suis avec attention le développement de ${targetCompany}. Intégrer vos équipes en tant que ${targetPost} me donnera l'opportunité d'apporter des réponses ciblées aux besoins actuels de votre organisation.`,
    `L'ambition et la rigueur de ${targetCompany} retiennent tout mon intérêt. Je suis convaincu(e) que la mise en pratique de mes compétences techniques apportera une valeur ajoutée directe à vos projets futurs.`
  ];

  const conclusionsFr = [
    `Je serais très heureux(se) de vous rencontrer lors d'un entretien pour échanger de vive voix sur la façon dont mes compétences peuvent contribuer au succès de vos projets. Je vous remercie pour l'attention portée à ma candidature.`,
    `Je me tiens à votre entière disposition pour convenir d'un entretien au cours duquel je pourrai vous exposer plus en détail mes motivations et mon expérience.`,
    `C'est avec plaisir que je me rendrai disponible pour un entretien afin d'aborder vos attentes pour le poste de ${targetPost} et de vous présenter mes réalisations.`
  ];

  accroche = accrochesFr[randIndex];
  valeurAjoutee = valeursFr[randIndex];
  adequation = adequationsFr[randIndex];
  conclusion = conclusionsFr[randIndex];

  const fullText = `Madame, Monsieur,\n\n${accroche}\n\n${valeurAjoutee}\n\n${adequation}\n\n${conclusion}\n\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${name}`;

  return {
    destinataire: 'Direction des Ressources Humaines / Recrutement',
    entreprise: targetCompany,
    poste: targetPost,
    objet: `Candidature au poste de ${targetPost} - ${name}`,
    formulePolitesseEntree: 'Madame, Monsieur,',
    paragrapheAccroche: accroche,
    paragrapheValeurAjoutee: valeurAjoutee,
    paragrapheAdequationEntreprise: adequation,
    paragrapheConclusion: conclusion,
    formulePolitesseSortie: 'Veuillez agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
    texteComplet: fullText
  };
}

