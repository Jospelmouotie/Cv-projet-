import { CV, Language, Section } from '../types';
import { CV_TEMPLATES, canUseDecorativeWave } from './templates';

const makeSection = (
  type: Section['type'],
  titre: string,
  colonne: 'gauche' | 'droite' | 'principale',
  contenu: any,
  zone: 'gauche' | 'droite' | 'principale' = 'principale',
  ordre: number
): Section => ({
  id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
  type,
  titre,
  colonne,
  zone,
  ordre,
  visible: true,
  contenu
});

const baseProfile = (name: string, job: string, langue: Language): any => ({
  nomComplet: name,
  titreProfessionnel: job,
  email: 'contact@example.com',
  telephone: '+33 6 12 34 56 78',
  adresse: 'Paris, France',
  siteWeb: 'www.moncv.fr',
  linkedin: 'linkedin.com/in/moncv',
  github: 'github.com/moncv',
  resume: langue === 'en'
    ? 'Dynamic and results-oriented professional with a strong track record in delivering structured projects and creating value for teams and customers.'
    : langue === 'ar'
      ? 'محترف ديناميكي يركز على النتائج ويحسن الأداء من خلال تنظيم المشاريع وتقديم قيمة ملموسة للفريق والعملاء.'
      : 'Professionnel dynamique et orienté résultats, capable de structurer des projets, accompagner les équipes et créer de la valeur concrète.'
});

const baseExperience = () => ([
  {
    id: 'exp-1',
    poste: 'Chef de projet digital',
    entreprise: 'Entreprise de services',
    ville: 'Paris',
    dateDebut: '2022',
    dateFin: 'Aujourd’hui',
    actuel: true,
    description: 'Pilotage de projets digitaux à forte valeur ajoutée, coordination de plusieurs parties prenantes et optimisation des processus.',
    taches: ['Conduite de projets', 'Analyse de besoins', 'Pilotage de roadmap'],
    outils: [{ id: 'tool-1', nom: 'Notion' }, { id: 'tool-2', nom: 'Power BI' }]
  },
  {
    id: 'exp-2',
    poste: 'Consultant junior',
    entreprise: 'Cabinet conseil',
    ville: 'Lyon',
    dateDebut: '2020',
    dateFin: '2022',
    actuel: false,
    description: 'Accompagnement des équipes dans la mise en place d’outils et l’amélioration des performances opérationnelles.',
    taches: ['Audit', 'Process optimisation', 'Support client'],
    outils: [{ id: 'tool-3', nom: 'Excel' }, { id: 'tool-4', nom: 'Tableau' }]
  }
]);

const baseFormation = () => ([
  {
    id: 'edu-1',
    diplome: 'Master Management / Marketing digital',
    etablissement: 'Université Paris-Saclay',
    ville: 'Paris',
    dateDebut: '2018',
    dateFin: '2020',
    actuel: false,
    description: 'Spécialisation en gestion de projet et innovation digitale.'
  },
  {
    id: 'edu-2',
    diplome: 'Licence Economie et gestion',
    etablissement: 'Université de Lyon',
    ville: 'Lyon',
    dateDebut: '2015',
    dateFin: '2018',
    actuel: false,
    description: 'Formation orientée gestion, statistiques et stratégie.'
  }
]);

const baseCompetences = () => ([
  { id: 'skill-1', nom: 'Gestion de projet', niveau: 9, listSousCompetences: [{ id: 'sub-1', nom: 'Planning' }, { id: 'sub-2', nom: 'Pilotage' }] },
  { id: 'skill-2', nom: 'Analyse de données', niveau: 8, listSousCompetences: [{ id: 'sub-3', nom: 'Power BI' }, { id: 'sub-4', nom: 'Excel' }] },
  { id: 'skill-3', nom: 'Communication', niveau: 8, listSousCompetences: [{ id: 'sub-5', nom: 'Rédaction' }, { id: 'sub-6', nom: 'Présentation' }] },
  { id: 'skill-4', nom: 'Méthodes agiles', niveau: 7, listSousCompetences: [{ id: 'sub-7', nom: 'Scrum' }, { id: 'sub-8', nom: 'Kanban' }] }
]);

const baseProjects = () => ([
  {
    id: 'project-1',
    titre: 'Transformation digitale RH',
    role: 'Chef de projet',
    sousTitre: 'Optimisation utilisateur',
    dateDebut: '2023',
    dateFin: '2024',
    description: 'Mise en place d’outils de gestion, amélioration de la productivité et automatisation des processus de suivi.'
  }
]);

const baseLanguages = () => ([
  { id: 'lang-1', langue: 'Français', niveau: 'Natif' },
  { id: 'lang-2', langue: 'Anglais', niveau: 'Courant' },
  { id: 'lang-3', langue: 'Espagnol', niveau: 'Intermédiaire' }
]);

const buildSections = (templateId: string, langue: Language): Section[] => {
  const templateName = templateId.includes('tc-') ? 'Professionnel' : 'Profil';
  const roleLabel = langue === 'en' ? 'Project Manager' : langue === 'ar' ? 'مدير مشروع' : 'Chef de projet';

  return [
    makeSection('profil', 'Profil', 'principale', baseProfile('Alexandre Martin', roleLabel, langue), 'principale', 0),
    makeSection('experience', 'Expérience', templateId.includes('tc-') ? 'gauche' : 'principale', baseExperience(), templateId.includes('tc-') ? 'gauche' : 'principale', 1),
    makeSection('formation', 'Formation', templateId.includes('tc-') ? 'droite' : 'principale', baseFormation(), templateId.includes('tc-') ? 'droite' : 'principale', 2),
    makeSection('competences', 'Compétences', templateId.includes('tc-') ? 'gauche' : 'principale', baseCompetences(), templateId.includes('tc-') ? 'gauche' : 'principale', 3),
    makeSection('projets', 'Projets', templateId.includes('tc-') ? 'droite' : 'principale', baseProjects(), templateId.includes('tc-') ? 'droite' : 'principale', 4),
    makeSection('langues', 'Langues', templateId.includes('tc-') ? 'gauche' : 'principale', baseLanguages(), templateId.includes('tc-') ? 'gauche' : 'principale', 5)
  ];
};

const buildPresetForTemplate = (templateId: string, langue: Language = 'fr'): Partial<CV> => {
  const template = CV_TEMPLATES.find((item) => item.id === templateId) || CV_TEMPLATES[0];
  const isTwoColumn = template.layoutFamily === 'two-column-left';
  const theme = (template.themeConfig || {}) as Record<string, any>;
  const headerStyle = theme.headerStyle || (isTwoColumn ? 'modern-split' : 'clean');
  const sectionHeaderStyle = theme.sectionHeaderStyle || 'underline';
  const skillsMode = theme.skillsDisplayMode || 'badges';
  const photoPosition = theme.photoPosition || (isTwoColumn ? 'in-sidebar' : 'in-header');
  const photoFrameStyle = theme.photoFrameStyle || 'ronde';
  const footerStyle = theme.footerStyle || 'banner-solid';

  const preset: Partial<CV> = {
    id: `${templateId}-${Date.now()}`,
    templateId,
    langue,
    titre: `${template.name} • ${langue === 'en' ? 'Resume' : langue === 'ar' ? 'سيرة ذاتية' : 'CV'}`,
    couleurAccent: template.defaultAccent,
    couleurAccentSecondaire: template.defaultSecondaryAccent,
    couleurFond: '#FFFFFF',
    couleurFondSidebar: isTwoColumn ? '#F8FAFC' : '#FFFFFF',
    couleurTexte: '#0F172A',
    couleurTexteSidebar: '#0F172A',
    couleurTitreSection: template.defaultAccent,
    couleurTitreSectionSidebar: template.defaultAccent,
    couleurFondProfil: template.defaultAccent,
    couleurTexteProfil: '#FFFFFF',
    police: template.defaultFont,
    nombreColonnes: isTwoColumn ? 2 : 1,
    positionSidebar: isTwoColumn ? 'gauche' : 'gauche',
    largeurColonneGauche: 32,
    styleEnTete: headerStyle,
    styleEnTeteSection: sectionHeaderStyle,
    styleCompetences: skillsMode,
    timelineStyle: theme.timelineStyle || 'line-dots',
    typeVague: canUseDecorativeWave(template.id) && theme.typeVague ? theme.typeVague : undefined,
    typeVaguePosition: canUseDecorativeWave(template.id) ? 'haut' : undefined,
    displayTitle: 'nom',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    afficherPhoto: true,
    photoPosition,
    photoForme: photoFrameStyle,
    formePhoto: photoFrameStyle,
    stylePiedDePage: footerStyle,
    styleFooterContact: footerStyle,
    couleurFondFooterContact: theme.footerBackgroundColor || '#0F172A',
    couleurTexteFooterContact: theme.footerTextColor || '#FFFFFF',
    couleurFondPiedDePage: theme.footerBackgroundColor || '#0F172A',
    couleurTextePiedDePage: theme.footerTextColor || '#FFFFFF',
    sections: buildSections(templateId, langue),
    statutPaiement: 'NON_PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return preset;
};

export const TEMPLATE_PRESETS: Record<string, Partial<CV>> = Object.fromEntries(
  CV_TEMPLATES.map((template) => [template.id, buildPresetForTemplate(template.id, 'fr')])
);

export function getPresetForTemplate(templateId: string, langue: Language = 'fr'): Partial<CV> {
  const preset = TEMPLATE_PRESETS[templateId];
  if (preset) {
    return {
      ...preset,
      langue,
      sections: JSON.parse(JSON.stringify(preset.sections || buildSections(templateId, langue))),
      titre: `${templateId} • ${langue === 'en' ? 'Resume' : langue === 'ar' ? 'سيرة ذاتية' : 'CV'}`
    };
  }

  const fallback = buildPresetForTemplate(CV_TEMPLATES[0].id, langue);
  return { ...fallback, templateId: templateId, langue };
}

export function getCleanPresetForTemplate(templateId: string, langue: Language = 'fr'): Partial<CV> {
  const preset = getPresetForTemplate(templateId, langue);
  return {
    ...preset,
    sections: JSON.parse(JSON.stringify(preset.sections || [])),
    titre: `Nouveau CV ${langue === 'en' ? 'resume' : langue === 'ar' ? 'سيرة ذاتية' : 'CV'}`
  };
}
