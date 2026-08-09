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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Gallery Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Catalogue de Modèles HD</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Choisissez votre modèle de CV d'exception</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Chaque modèle est optimisé pour le passage ATS (système de recrutement), entièrement personnalisable avec aperçu en temps réel.
        </p>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un modèle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-blue-500 outline-hidden"
          />
        </div>

      </div>

      {/* Compact Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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
