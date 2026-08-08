import { Language } from '../types';

// Comprehensive French dictionary and common word list to prevent false positives
const DICTIONARY_FR = new Set([
  // Stop words, articles, prepositions, pronouns, conjunctions
  'a', 'au', 'aux', 'avec', 'ce', 'ces', 'cet', 'cette', 'd', 'de', 'des', 'du', 'elle', 'elles',
  'en', 'et', 'eux', 'il', 'ils', 'je', 'l', 'la', 'les', 'leur', 'leurs', 'lui', 'm', 'ma',
  'me', 'mes', 'moi', 'mon', 'n', 'ne', 'nos', 'notre', 'nous', 'on', 'ou', 'où', 'par', 'pas',
  'pour', 'qu', 'que', 'qui', 'sa', 'se', 'ses', 'si', 'soi', 'son', 'sur', 't', 'ta', 'te',
  'tes', 'toi', 'ton', 'tous', 'tout', 'toute', 'toutes', 'tu', 'un', 'une', 'vos', 'votre', 'vous',
  'y', 'à', 'ça', 'étaient', 'était', 'étant', 'été', 'être', 'avoir', 'eu', 'fait', 'faire',

  // Common verbs in present, past, participle, infinitive
  'fait', 'faisant', 'fais', 'créer', 'creer', 'créé', 'gérer', 'gerer', 'géré', 'diriger', 'dirigé',
  'développer', 'developper', 'développé', 'developpe', 'développe', 'assurer', 'assuré', 'assurer',
  'analyser', 'analysé', 'concevoir', 'conçu', 'coordonner', 'coordonné', 'optimiser', 'optimisé',
  'réaliser', 'realiser', 'réalisé', 'superviser', 'supervisé', 'participer', 'participé', 'suivre',
  'travailler', 'travaillé', 'piloter', 'piloté', 'mettre', 'mis', 'conduire', 'conduit', 'contribuer',

  // Nouns & Professional vocabulary
  'bonjour', 'developpeur', 'développeur', 'ingenieur', 'ingénieur', 'gestionnaire', 'projet', 'projets',
  'experience', 'expérience', 'professionnelle', 'professionnel', 'professionnels', 'formation', 'diplome', 'diplôme',
  'competence', 'compétence', 'competences', 'compétences', 'langue', 'langues', 'profil', 'adresse',
  'telephone', 'téléphone', 'entreprise', 'societe', 'société', 'responsable', 'directeur', 'chef',
  'equipe', 'équipe', 'equipes', 'équipes', 'informatique', 'gestion', 'analyse', 'analyste', 'management', 'strategie',
  'stratégie', 'conception', 'realisation', 'réalisation', 'développement', 'developpement', 'marketing',
  'commercial', 'client', 'clients', 'service', 'services', 'communication', 'anglais', 'francais',
  'français', 'espagnol', 'allemand', 'maternelle', 'courant', 'intermediaire', 'intermédiaire', 'notions',
  'baccalaureat', 'baccalauréat', 'licence', 'master', 'doctorat', 'universite', 'université', 'ecole',
  'école', 'institut', 'certificat', 'certification', 'technique', 'techniques', 'organisation', 'autonome',
  'rigoureux', 'polyvalent', 'motivation', 'passionne', 'passionné', 'coordination', 'suivi',
  'optimisation', 'digital', 'digitale', 'systeme', 'système', 'reseaux', 'réseaux', 'application', 'applications',
  'logiciel', 'logiciels', 'database', 'base', 'donnees', 'données', 'consultant', 'stage', 'stagiaire',
  'cdi', 'cdd', 'freelance', 'mission', 'missions', 'resultats', 'résultats', 'objectifs', 'collaboratif',
  'douala', 'yaounde', 'yaoundé', 'cameroun', 'afrique', 'paris', 'france', 'intitulé', 'poste', 'emploi',
  'travail', 'activités', 'responsabilités', 'compétent', 'diplômé', 'spécialisé', 'spécialité',
  'mention', 'bien', 'très', 'excellent', 'parfait', 'capacité', 'capacités', 'esprit', 'synthèse',
  'référence', 'références', 'présent', 'actuel', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'aout', 'septembre', 'octobre', 'novembre', 'décembre', 'decembre'
]);

const DICTIONARY_EN = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
  'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'you', 'your',
  'hello', 'developer', 'engineer', 'manager', 'project', 'projects', 'experience', 'experiences',
  'professional', 'education', 'degree', 'skill', 'skills', 'language', 'languages', 'profile', 'address',
  'phone', 'email', 'company', 'organization', 'director', 'lead', 'team', 'information', 'management',
  'strategy', 'design', 'development', 'marketing', 'sales', 'client', 'clients', 'service', 'services',
  'communication', 'english', 'french', 'spanish', 'german', 'native', 'fluent', 'intermediate', 'basic',
  'bachelor', 'master', 'phd', 'university', 'college', 'institute', 'certificate', 'certification',
  'technical', 'organization', 'autonomous', 'motivated', 'passionate', 'coordination', 'optimization',
  'digital', 'system', 'systems', 'networks', 'application', 'applications', 'software', 'database', 'data',
  'consultant', 'internship', 'intern', 'fulltime', 'parttime', 'freelance', 'mission', 'results', 'objectifs',
  'collaborative', 'leadership', 'agile', 'scrum', 'problem', 'solving', 'analytical'
]);

export interface SpellError {
  word: string;
  startIndex: number;
  endIndex: number;
  suggestions: string[];
}

export function checkTextSpelling(text: string, lang: Language, ignoredWords: string[] = []): SpellError[] {
  if (!text || text.trim().length === 0) return [];

  const dict = lang === 'en' ? DICTIONARY_EN : DICTIONARY_FR;
  const wordRegex = /[a-zA-ZàâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ']+/g;
  const errors: SpellError[] = [];
  const ignoredSet = new Set(ignoredWords.map(w => w.toLowerCase()));

  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const cleanWord = rawWord.toLowerCase().replace(/^'|'$/g, '');

    // Ignore short words (<= 2 chars), numbers, ignored words, or capitalized proper nouns
    if (cleanWord.length <= 2 || /^\d+$/.test(cleanWord) || ignoredSet.has(cleanWord)) continue;

    if (!dict.has(cleanWord)) {
      const suggestions = findSuggestions(cleanWord, Array.from(dict));
      
      errors.push({
        word: rawWord,
        startIndex: match.index,
        endIndex: match.index + rawWord.length,
        suggestions
      });
    }
  }

  return errors;
}

function findSuggestions(target: string, dictionaryWords: string[]): string[] {
  return dictionaryWords
    .map(dictWord => ({ word: dictWord, dist: levenshteinDistance(target, dictWord) }))
    .filter(item => item.dist <= 3)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map(item => item.word);
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
