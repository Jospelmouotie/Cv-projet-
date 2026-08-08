import React, { useState } from 'react';
import { CVTemplate, Language, TemplateCategory } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { TemplateCard } from '../components/TemplateCard';
import { getTranslation } from '../i18n/translations';
import { Search, Sparkles } from 'lucide-react';

interface GalleryViewProps {
  langue: Language;
  onSelectTemplate: (template: CVTemplate) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ langue, onSelectTemplate }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Array<{ id: TemplateCategory | 'all'; label: string }> = [
    { id: 'all', label: t('catAll') },
    { id: 'moderne', label: t('catModerne') },
    { id: 'classique', label: t('catClassique') },
    { id: 'creatif', label: t('catCreatif') },
    { id: 'executif', label: t('catExecutif') }
  ];

  const filteredTemplates = CV_TEMPLATES.filter(tpl => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const desc = tpl.description[langue] || tpl.description.fr;
    const matchesSearch = 
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Gallery Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>20 Modèles Officiels Représentatifs</span>
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Choisissez votre modèle de CV</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Sélectionnez l'un des 20 modèles ci-dessous, conçus avec des contenus complets pré-remplis pour un rendu professionnel immédiat.
        </p>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un modèle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-blue-500 outline-hidden"
          />
        </div>

      </div>

      {/* Templates Grid (Showing the 5 representative models) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map(tpl => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            langue={langue}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>

    </div>
  );
};
