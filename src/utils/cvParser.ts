import { Section, ProfilContenu, ExperienceItem, FormationItem, CompetenceItem, LangueItem } from '../types';

export function parseCVTextToSections(rawText: string, langue: 'fr' | 'en' = 'fr'): Section[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  let nomComplet = '';
  let titreProfessionnel = '';
  let email = '';
  let telephone = '';
  let adresse = '';
  let resume = '';

  // 1. Extract contact details via Regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  const phoneMatch = rawText.match(/(\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}/);
  if (phoneMatch && phoneMatch[0].length >= 8) telephone = phoneMatch[0];

  // First non-contact lines are likely Name & Job Title
  if (lines.length > 0 && !lines[0].includes('@')) {
    nomComplet = lines[0];
  }
  if (lines.length > 1 && !lines[1].includes('@') && lines[1].length < 60) {
    titreProfessionnel = lines[1];
  }

  // Group text lines into sections based on keywords
  const sectionKeywords = {
    experience: /expér|experienc|parcours|travail|emploi|work|career/i,
    formation: /format|éducat|educat|diplôm|diplom|étude|etude|university|school/i,
    competences: /compét|competenc|savoir|technolog|skill|tools|maîtrise/i,
    langues: /langue|language|linguistic/i,
    profil: /profil|résumé|summary|about|à propos|presentation|présentation/i
  };

  const experienceList: ExperienceItem[] = [];
  const formationList: FormationItem[] = [];
  const competencesList: CompetenceItem[] = [];
  const languesList: LangueItem[] = [];
  let rawUnsortedText = '';

  let currentCategory: 'none' | 'profil' | 'experience' | 'formation' | 'competences' | 'langues' = 'none';

  // Process lines according to active category or infer smartly
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length === 0) continue;

    // Check header keywords
    if (sectionKeywords.profil.test(line)) {
      currentCategory = 'profil';
      continue;
    } else if (sectionKeywords.experience.test(line)) {
      currentCategory = 'experience';
      continue;
    } else if (sectionKeywords.formation.test(line)) {
      currentCategory = 'formation';
      continue;
    } else if (sectionKeywords.competences.test(line)) {
      currentCategory = 'competences';
      continue;
    } else if (sectionKeywords.langues.test(line)) {
      currentCategory = 'langues';
      continue;
    }

    // Process line according to active category
    if (currentCategory === 'profil') {
      resume += (resume ? '\n' : '') + line;
    } else if (currentCategory === 'experience') {
      const parts = line.split(/[-|–:]/);
      experienceList.push({
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        poste: parts[0]?.trim() || line,
        entreprise: parts[1]?.trim() || 'Entreprise',
        ville: parts[2]?.trim() || '',
        dateDebut: '',
        dateFin: '',
        actuel: false,
        description: line
      });
    } else if (currentCategory === 'formation') {
      const parts = line.split(/[-|–:]/);
      formationList.push({
        id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        diplome: parts[0]?.trim() || line,
        etablissement: parts[1]?.trim() || 'Université / École',
        ville: parts[2]?.trim() || '',
        dateDebut: '',
        dateFin: '',
        description: line
      });
    } else if (currentCategory === 'competences') {
      const skills = line.split(/[,;•|\t]/).map(s => s.trim()).filter(s => s.length > 0);
      skills.forEach(skill => {
        competencesList.push({
          id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nom: skill,
          niveau: 4
        });
      });
    } else if (currentCategory === 'langues') {
      const parts = line.split(/[-:]/);
      languesList.push({
        id: `lang-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        langue: parts[0]?.trim() || line,
        niveau: parts[1]?.trim() || 'Maternelle / Courant'
      });
    } else {
      // If no category selected yet, append to resume summary
      if (i > 1) {
        resume += (resume ? '\n' : '') + line;
      }
    }
  }

  const sections: Section[] = [
    {
      id: 'sec-profil',
      type: 'profil',
      titre: langue === 'en' ? 'Profile & Contact' : 'Profil & Coordonnées',
      ordre: 1,
      visible: true,
      contenu: {
        nomComplet: nomComplet || 'Votre Nom',
        titreProfessionnel: titreProfessionnel || 'Intitulé de poste',
        email: email || '',
        telephone: telephone || '',
        adresse: adresse || '',
        website: '',
        linkedin: '',
        resume: resume || ''
      } as ProfilContenu
    },
    {
      id: 'sec-exp',
      type: 'experience',
      titre: langue === 'en' ? 'Work Experience' : 'Expériences professionnelles',
      ordre: 2,
      visible: true,
      contenu: experienceList
    },
    {
      id: 'sec-edu',
      type: 'formation',
      titre: langue === 'en' ? 'Education' : 'Formations & Diplômes',
      ordre: 3,
      visible: true,
      contenu: formationList
    },
    {
      id: 'sec-skills',
      type: 'competences',
      titre: langue === 'en' ? 'Skills' : 'Compétences',
      ordre: 4,
      visible: true,
      contenu: competencesList
    },
    {
      id: 'sec-lang',
      type: 'langues',
      titre: langue === 'en' ? 'Languages' : 'Langues',
      ordre: 5,
      visible: true,
      contenu: languesList
    }
  ];

  if (rawUnsortedText.trim().length > 0) {
    sections.push({
      id: 'sec-raw-unsorted',
      type: 'personnalisee',
      titre: langue === 'en' ? 'Raw Import to Sort' : 'Import brut à trier',
      ordre: 6,
      visible: true,
      contenu: {
        typeLayout: 'texte_libre',
        texteLibre: rawUnsortedText
      }
    });
  }

  return sections;
}
