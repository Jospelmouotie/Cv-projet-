import React from 'react';
import { CVTemplate, Language, CV } from '../types';
import { CVPreview } from './CVPreview';
import { getPresetForTemplate } from '../data/templatePresets';
import { Sparkles, Eye } from 'lucide-react';

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
    statutPaiement: 'PAYE', // Clean preview for gallery cards
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: preset.sections
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:border-blue-500 dark:hover:border-blue-400 transition-all flex flex-col group relative">
      
      {/* Thumbnail Container with Scaled Full CVPreview */}
      <div 
        className="relative aspect-[210/297] bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 overflow-hidden flex items-start justify-center cursor-pointer select-none"
        onClick={() => onSelect(template)}
      >
        {/* Scaled A4 Container */}
        <div className="w-[800px] h-[1131px] origin-top transform scale-[0.38] sm:scale-[0.41] md:scale-[0.36] lg:scale-[0.39] pointer-events-none select-none shadow-lg my-2">
          <CVPreview cv={dummyCv} interactivePreview={false} />
        </div>

        {/* Badge if available */}
        {template.badgeText && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3" />
            {template.badgeText}
          </div>
        )}

        {/* Hover Overlay Button */}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center p-6 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm py-3 px-5 rounded-xl shadow-xl transition-all transform group-hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Utiliser ce modèle complet</span>
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="p-4 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {template.name}
            </h3>
            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs shrink-0" style={{ backgroundColor: template.defaultAccent }} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          <span className="capitalize px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] text-slate-700 dark:text-slate-300">{template.category}</span>
          <span className="font-mono text-[11px] text-slate-400">{template.defaultFont}</span>
        </div>
      </div>

    </div>
  );
};
