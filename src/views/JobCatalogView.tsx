import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  ArrowRight,
  Filter,
  CheckCircle2,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';
import { Language, SubscriptionTier } from '../types';
import { JOB_LANDING_PAGES, SECTEUR_LABELS, JobLandingPage } from '../data/jobLandingPages';
import { CV_TEMPLATES } from '../data/templates';

interface JobCatalogViewProps {
  langue: Language;
  userTier?: SubscriptionTier;
  onCreateCVWithJob: (jobSlug: string) => void;
}

export const JobCatalogView: React.FC<JobCatalogViewProps> = ({
  langue,
  userTier = 'freemium',
  onCreateCVWithJob
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    document.title = 'Modèles de CV par Métier (36 professions) | MonCVGratuit';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Découvrez nos 36 modèles de CV par métier avec compétences clés recherchées, conseils recruteurs et templates recommandés pour décrocher votre prochain emploi.'
      );
    }
  }, []);

  const sectors = useMemo(() => {
    const list: { id: string; label: string; icon: string; count: number }[] = [
      { id: 'all', label: 'Tous les métiers', icon: '💼', count: JOB_LANDING_PAGES.length }
    ];
    Object.entries(SECTEUR_LABELS).forEach(([key, val]) => {
      const count = JOB_LANDING_PAGES.filter(p => p.secteur === key).length;
      if (count > 0) {
        const item = val as { fr: string; icon: string };
        list.push({ id: key, label: item.fr, icon: item.icon, count });
      }
    });
    return list;
  }, []);

  const filteredJobs = useMemo(() => {
    return JOB_LANDING_PAGES.filter(job => {
      const matchSector = selectedSector === 'all' || job.secteur === selectedSector;
      if (!matchSector) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const inTitle = job.metier.toLowerCase().includes(q);
      const inKeywords = (job.motsClesRecherches || []).some(k => k.toLowerCase().includes(q));
      const inSkills = job.competencesCles.some(s => s.toLowerCase().includes(q));
      const inTools = (job.outilsTypiques || []).some(t => t.toLowerCase().includes(q));
      return inTitle || inKeywords || inSkills || inTools;
    });
  }, [selectedSector, searchTerm]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-black dark:text-white pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#121212] border-b border-black/8 dark:border-white/10 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-black/45 dark:text-white/45 mb-4">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-black dark:text-white">Modèles de CV par Métier</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-xs font-semibold mb-3 border border-black/10 dark:border-white/10">
              <Award className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
              <span>36 Modèles Métiers Recommandés par les Recruteurs</span>
            </div>
            <h1 className="font-serif text-[32px] sm:text-[36px] text-black dark:text-white tracking-tight leading-tight">
              Trouvez le modèle de CV taillé pour votre profession
            </h1>
            <p className="mt-3 text-sm text-black/50 dark:text-white/50 leading-relaxed font-light">
              Chaque page métier comprend les compétences clés attendues par les recruteurs, un template graphique adapté, des conseils réels et un formulaire pré-orienté.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35 dark:text-white/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un métier, une compétence, un outil (ex. comptable, python, sage)..."
              className="w-full pl-10 pr-12 py-3 bg-white dark:bg-neutral-800 border-[1.5px] border-black/15 dark:border-white/15 rounded-lg text-sm text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40 hover:text-black dark:hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Sector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {sectors.map((sec) => {
            const isActive = selectedSector === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSector(sec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-transparent border-[1.5px] border-black/15 dark:border-white/15 text-black dark:text-white hover:border-black/50 dark:hover:border-white/50'
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-white/80 dark:text-black/80' : 'text-black/45 dark:text-white/45'}`}>
                  {sec.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="py-3 text-xs text-black/50 dark:text-white/50">
          Affichage de <span className="font-semibold text-black dark:text-white">{filteredJobs.length}</span> modèle(s) de CV
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {filteredJobs.map((job) => {
            const secInfo = SECTEUR_LABELS[job.secteur] || SECTEUR_LABELS.autre;
            const templateObj = CV_TEMPLATES.find(t => t.id === job.templateRecommandeId);
            const templateName = templateObj ? templateObj.name : 'Modèle Recommandé';
            return (
              <div
                key={job.slug}
                className="relative min-h-[380px] rounded-lg overflow-hidden shadow-sm hover:shadow-lg border border-black/10 dark:border-white/15 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Background Image of the job */}
                <img
                  src={job.imageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'}
                  alt={`Profession ${job.metier}`}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark gradient overlay for perfect readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/40" />

                {/* Content written on top of the image */}
                <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/15 shadow-xs">
                        <span>{secInfo.icon}</span>
                        <span>{secInfo.fr}</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xs">
                        {templateName}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white group-hover:text-white/80 transition-colors leading-snug">
                      CV {job.metier}
                    </h2>

                    <p className="text-xs text-white/80 mt-2 line-clamp-3 leading-relaxed font-light">
                      {job.descriptionHero || job.accroche}
                    </p>

                    {/* Top skills pills */}
                    <div className="mt-4 pt-3 border-t border-white/15">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 block mb-1.5">
                        Compétences clés suggérées :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.competencesCles.slice(0, 3).map((comp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-sm text-[11px] font-medium truncate max-w-[210px] border border-white/10"
                          >
                            {comp}
                          </span>
                        ))}
                        {job.competencesCles.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[11px] text-white/70 font-semibold">
                            +{job.competencesCles.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-3 border-t border-white/15 flex items-center gap-2">
                    <Link
                      to={`/${job.slug}`}
                      className="flex-1 px-3.5 py-2 text-center rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20 shadow-xs"
                    >
                      Voir le modèle & conseils
                    </Link>

                    <button
                      type="button"
                      onClick={() => onCreateCVWithJob(job.slug)}
                      className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                      title={`Créer mon CV de ${job.metier}`}
                    >
                      <span>Créer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/15 my-8">
            <Search className="w-10 h-10 text-black/30 dark:text-white/30 mx-auto mb-3" />
            <h3 className="font-serif text-base text-black dark:text-white">Aucun métier correspondant</h3>
            <p className="text-xs text-black/50 dark:text-white/50 mt-1 max-w-md mx-auto font-light">
              Essayez un autre mot-clé ou réinitialisez vos filtres pour découvrir nos 36 modèles.
            </p>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedSector('all'); }}
              className="mt-4 px-5 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-semibold rounded-lg cursor-pointer hover:bg-black/85 dark:hover:bg-white/85"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
