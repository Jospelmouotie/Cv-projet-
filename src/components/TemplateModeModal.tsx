import React, { useState } from 'react';
import { CVTemplate, Language } from '../types';
import { Palette, FileText, Check, X, Sparkles, LayoutGrid } from 'lucide-react';

interface TemplateModeModalProps {
  template: CVTemplate;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: CVTemplate, mode: 'visual' | 'form') => void;
  langue: Language;
}

export const TemplateModeModal: React.FC<TemplateModeModalProps> = ({
  template,
  isOpen,
  onClose,
  onConfirm,
  langue
}) => {
  const [selectedMode, setSelectedMode] = useState<'visual' | 'form'>('visual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                Modèle Sélectionné
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{template.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Comment souhaitez-vous personnaliser et rédiger votre document avec ce modèle ?
        </p>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Visual Editor Option */}
          <div
            onClick={() => setSelectedMode('visual')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
              selectedMode === 'visual'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            {selectedMode === 'visual' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Éditeur Visuel (Canva / Word)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Modifiez le texte directement sur la feuille A4. Glissez-déposez, ajustez les blocs, couleurs et polices avec précision visuelle.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              ✓ Mode Création Libre & Wysiwyg
            </div>
          </div>

          {/* Form Option */}
          <div
            onClick={() => setSelectedMode('form')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
              selectedMode === 'form'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            {selectedMode === 'form' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Formulaire Guidé
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Remplissez vos informations étape par étape. Idéal pour les débutants avec aperçu en temps réel et correction orthographique.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Saisie Étape par Étape & 1/2 Colonnes
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(template, selectedMode);
              onClose();
            }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Continuer vers {selectedMode === 'visual' ? "l'Éditeur Visuel" : 'le Formulaire'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
