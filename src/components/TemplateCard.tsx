import React from 'react';
import { CVTemplate, Language, CV } from '../types';
import { CVPreview } from './CVPreview';
import { getPresetForTemplate } from '../data/templatePresets';
import { Sparkles, Eye, ArrowRight } from 'lucide-react';

interface TemplateCardProps {
  template: CVTemplate;
  langue: Language;
  onSelect: (template: CVTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, langue, onSelect }) => {
  const description = template.description[langue] || template.description.fr;
  const preset = getPresetForTemplate(template.id, langue);

  // Construct full dummy CV for gallery preview
  const dummyCv: CV = {
    id: `cv-preview-${template.id}`,
    utilisateurId: 'demo',
    titre: preset.titre,
    templateId: template.id,
    langue: langue,
    couleurAccent: preset.couleurAccent,
    police: preset.police,
    photoUrl: preset.photoUrl,
    afficherPhoto: true,
    statutPaiement: 'PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: preset.sections
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col group relative">
      
      {/* Thumbnail Container - Compact Scaled A4 Preview */}
      <div 
        className="relative h-64 sm:h-72 bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 overflow-hidden flex items-start justify-center cursor-pointer select-none"
        onClick={() => onSelect(template)}
      >
        {/* Scaled A4 Page Container */}
        <div className="w-[800px] h-[1131px] origin-top transform scale-[0.24] sm:scale-[0.26] pointer-events-none select-none shadow-md mt-2 rounded-sm overflow-hidden">
          <CVPreview cv={dummyCv} interactivePreview={false} />
        </div>

        {/* Badge if available */}
        {template.badgeText && (
          <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3" />
            {template.badgeText}
          </div>
        )}

        {/* Hover Overlay Button */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center p-4 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all transform group-hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Utiliser ce modèle</span>
          </button>
        </div>
      </div>

      {/* Meta Info Footer */}
      <div className="p-3.5 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2">
              {template.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs" style={{ backgroundColor: template.defaultAccent }} title="Couleur accent" />
              {template.supportsSecondaryAccent && template.defaultSecondaryAccent && (
                <span className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs" style={{ backgroundColor: template.defaultSecondaryAccent }} title="Couleur secondaire" />
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
          <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {template.category}
          </span>
          <button
            type="button"
            onClick={() => onSelect(template)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <span>Choisir</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
};
