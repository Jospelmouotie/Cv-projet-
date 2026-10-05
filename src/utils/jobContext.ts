import { CV, Section, Language } from '../types';
import { getJobLandingPageBySlug, JobLandingPage } from '../data/jobLandingPages';
import { getPresetForTemplate } from '../data/templatePresets';

/**
 * Applies a specific job context to a newly created CV.
 * Configures:
 * 1. Recommended template ID
 * 2. Section ordering tailored for this career profile (e.g. internships prioritising education/projects)
 * 3. Seeded professional headline & starter hook (amorce de profil)
 * 4. Suggested job skills pre-filled or ready for 1-click addition
 */
export function applyJobContext(cv: CV, jobSlug: string): CV {
  const job = getJobLandingPageBySlug(jobSlug);
  if (!job) return cv;

  const updatedCV: CV = {
    ...cv,
    jobContextSlug: job.slug,
    titre: `CV ${job.metier}`
  };

  // 1. Recommended template
  if (job.templateRecommandeId) {
    updatedCV.templateId = job.templateRecommandeId;
  }

  // Clone sections
  const sections: Section[] = JSON.parse(JSON.stringify(updatedCV.sections || []));

  // 2. Profile section customization: headline + starter summary
  const profilSection = sections.find((s) => s.type === 'profil');
  if (profilSection && profilSection.contenu) {
    if (!profilSection.contenu.titreProfessionnel || profilSection.contenu.titreProfessionnel === 'Titre professionnel') {
      profilSection.contenu.titreProfessionnel = job.metier;
    }
    // If summary is empty or default, seed with the job's authentic amorce
    if (!profilSection.contenu.resume || profilSection.contenu.resume.trim().length === 0 || profilSection.contenu.resume.includes('Professionnel passionné')) {
      profilSection.contenu.resume = job.amorceProfil;
    }
  }

  // 3. Competences section customization: seed key skills if empty or minimal
  const competencesSection = sections.find((s) => s.type === 'competences');
  if (competencesSection) {
    const existingSkills = Array.isArray(competencesSection.contenu) ? competencesSection.contenu : [];
    if (existingSkills.length <= 1) {
      // Seed with top 4 skills and tools
      const seeded = job.competencesCles.slice(0, 5).map((skName, idx) => ({
        id: `sk-seed-${Date.now()}-${idx}`,
        nom: skName,
        niveau: 8,
        listSousCompetences: (job.outilsTypiques && idx === 0)
          ? job.outilsTypiques.slice(0, 3).map((tool, tIdx) => ({ id: `sub-tool-${Date.now()}-${tIdx}`, nom: tool }))
          : []
      }));
      competencesSection.contenu = seeded;
    }
  }

  // 4. Section reordering if suggested
  if (job.ordreSectionsSuggere && job.ordreSectionsSuggere.length > 0) {
    const orderMap = new Map<string, number>();
    job.ordreSectionsSuggere.forEach((type, index) => {
      orderMap.set(type, index);
    });

    sections.sort((a, b) => {
      const orderA = orderMap.has(a.type) ? orderMap.get(a.type)! : 999;
      const orderB = orderMap.has(b.type) ? orderMap.get(b.type)! : 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.ordre || 0) - (b.ordre || 0);
    });

    // Re-assign 0..N order indexes
    sections.forEach((sec, idx) => {
      sec.ordre = idx;
    });
  }

  updatedCV.sections = sections;
  return updatedCV;
}

/**
 * Returns key skills and typical tools for a job slug
 */
export function getJobSkillsSuggestions(jobSlug?: string): { competences: string[]; outils: string[]; metier?: string } {
  if (!jobSlug) return { competences: [], outils: [] };
  const job = getJobLandingPageBySlug(jobSlug);
  if (!job) return { competences: [], outils: [] };
  return {
    metier: job.metier,
    competences: job.competencesCles,
    outils: job.outilsTypiques || []
  };
}

/**
 * Generates a realistic, tailored sample CV specifically representing the job
 * for live rendering inside JobLandingView!
 */
export function generateJobSampleCV(job: JobLandingPage, langue: Language = 'fr', templateIdOverride?: string): CV {
  const chosenTemplateId = templateIdOverride || job.templateRecommandeId;
  const basePreset = getPresetForTemplate(chosenTemplateId, langue);

  const sampleSections: Section[] = JSON.parse(JSON.stringify(basePreset.sections || []));

  // Customize profil section
  const profilSec = sampleSections.find(s => s.type === 'profil');
  if (profilSec && profilSec.contenu) {
    profilSec.contenu.titreProfessionnel = job.metier;
    profilSec.contenu.resume = job.amorceProfil;
  }

  // Customize skills section
  const compSec = sampleSections.find(s => s.type === 'competences');
  if (compSec) {
    compSec.contenu = job.competencesCles.slice(0, 6).map((nom, i) => ({
      id: `sample-sk-${i}`,
      nom,
      niveau: 8 + (i % 2),
      listSousCompetences: job.outilsTypiques
        ? job.outilsTypiques.slice(i * 2, i * 2 + 2).map((tool, ti) => ({ id: `sub-${i}-${ti}`, nom: tool }))
        : []
    }));
  }

  // Adjust order if recommended
  if (job.ordreSectionsSuggere && job.ordreSectionsSuggere.length > 0) {
    const orderMap = new Map<string, number>();
    job.ordreSectionsSuggere.forEach((type, index) => orderMap.set(type, index));

    sampleSections.sort((a, b) => {
      const oA = orderMap.has(a.type) ? orderMap.get(a.type)! : 999;
      const oB = orderMap.has(b.type) ? orderMap.get(b.type)! : 999;
      return oA - oB;
    });
    sampleSections.forEach((s, idx) => { s.ordre = idx; });
  }

  const sampleCV: CV = {
    id: `sample-${job.slug}`,
    utilisateurId: 'demo-sample',
    titre: `Modèle CV ${job.metier}`,
    templateId: chosenTemplateId,
    langue,
    couleurAccent: basePreset.couleurAccent || '#1E293B',
    couleurAccentSecondaire: basePreset.couleurAccentSecondaire || '#3B82F6',
    couleurFond: basePreset.couleurFond || '#FFFFFF',
    couleurFondSidebar: basePreset.couleurFondSidebar || '#F8FAFC',
    couleurTexte: basePreset.couleurTexte || '#0F172A',
    couleurTexteSidebar: basePreset.couleurTexteSidebar || '#0F172A',
    couleurTitreSection: basePreset.couleurTitreSection || '#1E293B',
    couleurTitreSectionSidebar: basePreset.couleurTitreSectionSidebar || '#1E293B',
    police: basePreset.police || 'Inter',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    afficherPhoto: true,
    statutPaiement: 'PAYE', // Preview sample has no watermark
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pageCibleMode: '1_page',
    jobContextSlug: job.slug,
    sections: sampleSections
  };

  return sampleCV;
}
