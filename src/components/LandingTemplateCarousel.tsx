import React, { useRef, useState, useEffect } from 'react';
import { CVTemplate, Language, CV } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { getPresetForTemplate } from '../data/templatePresets';
import { CVPreview } from './CVPreview';
import { getLocalizedTemplateName, getTranslation } from '../i18n/translations';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Layout } from 'lucide-react';

interface LandingTemplateCarouselProps {
  langue: Language;
  onSelectTemplate: (templateId: string) => void;
  onBrowseAllTemplates: () => void;
}

const CarouselItemCard: React.FC<{
  template: CVTemplate;
  dummyCv: CV;
  localizedName: string;
  langue: Language;
  onSelectTemplate: (templateId: string) => void;
}> = ({ template, dummyCv, localizedName, langue, onSelectTemplate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.44);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setScale(containerRef.current.clientWidth / 794);
      }
    };
    updateScale();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setScale(entry.contentRect.width / 794);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-[310px] sm:w-[350px] shrink-0 snap-start bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-black dark:hover:border-white shadow-md hover:shadow-xl transition-all flex flex-col group">
      {/* CV Canvas Thumbnail */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden bg-white cursor-pointer select-none"
        style={{ height: `${Math.round(scale * 1122)}px` }}
        onClick={() => onSelectTemplate(template.id)}
      >
        <div 
          className="w-[794px] h-[1122px] origin-top-left pointer-events-none select-none overflow-hidden bg-white shrink-0 absolute top-0 left-0"
          style={{ transform: `scale(${scale})` }}
        >
          <CVPreview cv={dummyCv} interactivePreview={false} />
        </div>

        {/* Top Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black shadow-xs">
            {template.layoutFamily === 'single-column' ? '1 Colonne' : '2 Colonnes'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTemplate(template.id);
            }}
            className="w-full py-2.5 px-4 bg-white text-black font-black text-xs rounded-xl shadow-lg hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{langue === 'en' ? 'Use This Template' : langue === 'ar' ? 'استخدم هذا النموذج' : 'Utiliser ce modèle'}</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="font-black text-neutral-900 dark:text-white text-sm truncate">
            {localizedName}
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
            {template.description[langue] || template.description.fr}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectTemplate(template.id)}
          className="w-full py-2 px-3 bg-neutral-100 hover:bg-black hover:text-white dark:bg-neutral-800 dark:hover:bg-white dark:hover:text-black text-neutral-900 dark:text-neutral-100 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{langue === 'en' ? 'Select Template' : langue === 'ar' ? 'اختيار النموذج' : 'Choisir ce modèle'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const LandingTemplateCarousel: React.FC<LandingTemplateCarouselProps> = ({
  langue,
  onSelectTemplate,
  onBrowseAllTemplates
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalTemplates = CV_TEMPLATES.length;
  const featuredTemplates = CV_TEMPLATES.slice(0, 12);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const autoplay = window.setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      el.scrollBy({ left: 380, behavior: 'smooth' });
    }, 2800);

    return () => window.clearInterval(autoplay);
  }, [featuredTemplates.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-black">
              <Layout className="w-3.5 h-3.5" />
              <span>{langue === 'en' ? 'Featured Models' : langue === 'ar' ? 'نماذج مميزة' : 'Galerie des Modèles'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {langue === 'en'
                ? 'Discover our Professional CV Templates'
                : langue === 'ar'
                ? 'استعرض أبرز نماذج السيرة الذاتية الاحترافية'
                : 'Découvrez nos Modèles de CV Professionnels'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
              {langue === 'en'
                ? 'Choose from high-impact single and dual column architectures. Fully customizable in 1 click.'
                : langue === 'ar'
                ? 'اختر من بين نماذج عمود واحد أو عمودين بتصميم متقن، قابلة للتعديل بضغطة واحدة.'
                : 'Sélectionnez parmi des architectures à 1 ou 2 colonnes ultra-soignées, éditables en 1 clic.'}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onBrowseAllTemplates}
              className="ml-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-black hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{langue === 'en' ? `View ${totalTemplates} Templates` : langue === 'ar' ? `عرض جميع النماذج (${totalTemplates})` : `Voir les ${totalTemplates} Modèles`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory focus:outline-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredTemplates.map((template) => {
            const preset = getPresetForTemplate(template.id, langue);
            const localizedName = getLocalizedTemplateName(template, langue);

            const dummyCv: CV = {
              id: `carousel-preview-${template.id}`,
              utilisateurId: 'demo',
              titre: preset.titre,
              templateId: template.id,
              langue: langue,
              couleurAccent: preset.couleurAccent || '#000000',
              police: preset.police || 'Inter',
              photoUrl: preset.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              afficherPhoto: true,
              photoPosition: preset.photoPosition || (template.layoutFamily === 'single-column' ? 'in-header' : 'in-sidebar'),
              statutPaiement: 'PAYE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...preset,
              pageCibleMode: '1_page',
              sections: preset.sections
            };

            return (
              <CarouselItemCard
                key={template.id}
                template={template}
                dummyCv={dummyCv}
                localizedName={localizedName}
                langue={langue}
                onSelectTemplate={onSelectTemplate}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};
