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
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  if (emailMatch) email = emailMatch[0];

  const phoneMatch = rawText.match(/(\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}/);
  if (phoneMatch && phoneMatch[0].length >= 8) telephone = phoneMatch[0];

  // Try to find full name and job title from top lines
  const nonContactTopLines = lines.slice(0, 5).filter(l => !l.includes('@') && !l.match(/^\+?\d[\d\s.-]{7,}/));
  if (nonContactTopLines.length > 0) {
    nomComplet = nonContactTopLines[0].replace(/^[\s•*-]+/, '');
  }
  if (nonContactTopLines.length > 1 && nonContactTopLines[1].length < 80) {
    titreProfessionnel = nonContactTopLines[1].replace(/^[\s•*-]+/, '');
  }

  // Broad section headers matching regexes
  const sectionKeywords = {
    experience: /^(expér|experienc|parcours|travail|emploi|work|career|historique|activit|poste)/i,
    formation: /^(format|éducat|educat|diplôm|diplom|étude|etude|university|school|scolarit|académ)/i,
    competences: /^(compét|competenc|savoir|technolog|skill|tools|maîtrise|aptitude|atout|outils)/i,
    langues: /^(langue|language|linguistic)/i,
    profil: /^(profil|résumé|summary|about|à propos|presentation|présentation|objectif|intro)/i
  };

  const experienceList: ExperienceItem[] = [];
  const formationList: FormationItem[] = [];
  const competencesList: CompetenceItem[] = [];
  const languesList: LangueItem[] = [];

  let currentCategory: 'none' | 'profil' | 'experience' | 'formation' | 'competences' | 'langues' = 'none';
  let currentExpItem: ExperienceItem | null = null;
  let currentEduItem: FormationItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length === 0) continue;

    // Check header keywords
    const isHeaderLine = line.length < 50 && (
      sectionKeywords.profil.test(line) ||
      sectionKeywords.experience.test(line) ||
      sectionKeywords.formation.test(line) ||
      sectionKeywords.competences.test(line) ||
      sectionKeywords.langues.test(line)
    );

    if (isHeaderLine) {
      if (currentExpItem) { experienceList.push(currentExpItem); currentExpItem = null; }
      if (currentEduItem) { formationList.push(currentEduItem); currentEduItem = null; }

      if (sectionKeywords.profil.test(line)) currentCategory = 'profil';
      else if (sectionKeywords.experience.test(line)) currentCategory = 'experience';
      else if (sectionKeywords.formation.test(line)) currentCategory = 'formation';
      else if (sectionKeywords.competences.test(line)) currentCategory = 'competences';
      else if (sectionKeywords.langues.test(line)) currentCategory = 'langues';
      continue;
    }

    // Process line according to active category
    if (currentCategory === 'profil') {
      resume += (resume ? '\n' : '') + line;
    } else if (currentCategory === 'experience') {
      const isBullet = line.match(/^[\s•*-]+/);
      const containsDate = line.match(/\b(19\d\d|20\d\d|présent|present|actuel)\b/i);

      if (!currentExpItem || (containsDate && !isBullet)) {
        if (currentExpItem) experienceList.push(currentExpItem);
        const parts = line.split(/[-|–:]/);
        currentExpItem = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          poste: parts[0]?.trim().replace(/^[\s•*-]+/, '') || line,
          entreprise: parts[1]?.trim() || 'Entreprise',
          ville: parts[2]?.trim() || '',
          dateDebut: '',
          dateFin: '',
          actuel: false,
          description: ''
        };
      } else {
        currentExpItem.description += (currentExpItem.description ? '\n' : '') + line;
      }
    } else if (currentCategory === 'formation') {
      const isBullet = line.match(/^[\s•*-]+/);
      const containsDate = line.match(/\b(19\d\d|20\d\d|présent|present)\b/i);

      if (!currentEduItem || (containsDate && !isBullet)) {
        if (currentEduItem) formationList.push(currentEduItem);
        const parts = line.split(/[-|–:]/);
        currentEduItem = {
          id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          diplome: parts[0]?.trim().replace(/^[\s•*-]+/, '') || line,
          etablissement: parts[1]?.trim() || 'Université / École',
          ville: parts[2]?.trim() || '',
          dateDebut: '',
          dateFin: '',
          description: ''
        };
      } else {
        currentEduItem.description += (currentEduItem.description ? '\n' : '') + line;
      }
    } else if (currentCategory === 'competences') {
      const skills = line.split(/[,;•|\t]/).map(s => s.trim().replace(/^[\s•*-]+/, '')).filter(s => s.length > 0 && s.length < 50);
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
        langue: parts[0]?.trim().replace(/^[\s•*-]+/, '') || line,
        niveau: parts[1]?.trim() || 'Maternelle / Courant'
      });
    } else {
      if (i > 1 && line !== nomComplet && line !== titreProfessionnel) {
        resume += (resume ? '\n' : '') + line;
      }
    }
  }

  if (currentExpItem) experienceList.push(currentExpItem);
  if (currentEduItem) formationList.push(currentEduItem);

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

  return sections;
}
