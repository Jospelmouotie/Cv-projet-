import React from 'react';
import { ElementType, CVElement } from '../types/document';
import {
  Type,
  Heading1,
  Heading2,
  Pilcrow,
  Square,
  Minus,
  Image,
  Briefcase,
  GraduationCap,
  Sparkles,
  PhoneCall,
  Languages,
  Plus
} from 'lucide-react';

interface ElementsSidebarProps {
  onAddElement: (type: ElementType, presetContent?: any) => void;
}

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({ onAddElement }) => {
  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 overflow-y-auto shrink-0 select-none shadow-sm">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Ajouter des Éléments
        </h3>

        {/* Text Category */}
        <div className="space-y-2 mb-5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-600" />
            <span>Texte & Titres</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddElement('text', { text: 'GRAND TITRE (NOM)' })}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-1.5">
                <Heading1 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Titre H1</span>
              </div>
            </button>
            <button
              onClick={() => onAddElement('text', { text: 'Sous-titre / Posté Pro' })}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-1.5">
                <Heading2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Titre H2</span>
              </div>
            </button>
            <button
              onClick={() => onAddElement('text', { text: 'Description ou paragraphe résumant votre profil professionnel avec clarté.' })}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors cursor-pointer col-span-2 group"
            >
              <div className="flex items-center space-x-1.5">
                <Pilcrow className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Paragraphe Texte Libre</span>
              </div>
            </button>
          </div>
        </div>

        {/* Shapes & Graphics */}
        <div className="space-y-2 mb-5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-blue-600" />
            <span>Formes & Séparateurs</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddElement('shape', { shapeType: 'rectangle' })}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-1.5">
                <Square className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Bloc Couleur</span>
              </div>
            </button>
            <button
              onClick={() => onAddElement('line', { orientation: 'horizontal' })}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-1.5">
                <Minus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ligne Séparateur</span>
              </div>
            </button>
          </div>
        </div>

        {/* Pre-built CV Section Blocks */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Blocs Sections Prêts</span>
          </span>
          <div className="space-y-1.5">
            <button
              onClick={() => onAddElement('contact', { value: 'email@exemple.com | +237 600 00 00 00' })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Badge Coordonnées</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={() => onAddElement('image', { alt: 'Photo de profil', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <Image className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Cadre Photo Profil</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
