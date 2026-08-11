import React, { useState } from 'react';
import { TEMPLATE_PRESETS } from '../data/templatePresets';
import { Section } from '../types';
import { CVElement, ElementType } from '../types/document';
import { X, Plus, Sparkles, User, Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react';

interface PresetElementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: Section) => void;
  onApplyProfileHeader?: (profileData: any, photoUrl?: string) => void;
}

export const PresetElementsModal: React.FC<PresetElementsModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
  onApplyProfileHeader
}) => {
  const [activeCategory, setActiveCategory] = useState<'profil' | 'experience' | 'formation' | 'competences' | 'langues'>('profil');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const presetList = Object.entries(TEMPLATE_PRESETS).map(([id, preset]) => ({
    id,
    titre: preset.titre,
    photoUrl: preset.photoUrl,
    couleurAccent: preset.couleurAccent,
    sections: preset.sections
  }));

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Bibliothèque d'Éléments & Sections par Défaut (30 Modèles)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choisissez un exemple pré-rempli parmi nos 30 modèles de CV professionnels à insérer sur votre canvas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
          {[
            { id: 'profil', label: 'Profils & En-têtes (30 Types)', icon: User },
            { id: 'experience', label: 'Expériences (30 Types)', icon: Briefcase },
            { id: 'formation', label: 'Formations (30 Types)', icon: GraduationCap },
            { id: 'competences', label: 'Compétences (30 Types)', icon: Award },
            { id: 'langues', label: 'Langues & Intérêts', icon: CheckCircle2 }
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content List */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {presetList.map((preset) => {
            const matchingSection = preset.sections.find((s) => s.type === activeCategory);
            if (!matchingSection && activeCategory !== 'profil') return null;

            return (
              <div
                key={preset.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: preset.couleurAccent }}>
                      {preset.titre}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400"># {preset.id}</span>
                  </div>

                  {activeCategory === 'profil' && (
                    <div className="flex items-start space-x-3 pt-1">
                      {preset.photoUrl && (
                        <img
                          src={preset.photoUrl}
                          alt="Profil"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                        />
                      )}
                      <div className="text-xs space-y-1 flex-1">
                        {matchingSection?.contenu?.nomComplet && (
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {matchingSection.contenu.nomComplet}
                          </p>
                        )}
                        {matchingSection?.contenu?.titreProfessionnel && (
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {matchingSection.contenu.titreProfessionnel}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                          "{matchingSection?.contenu?.resume || 'Résumé de présentation professionnel...'}"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCategory === 'experience' && matchingSection && (
                    <div className="space-y-1.5 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{matchingSection.titre}</h4>
                      {Array.isArray(matchingSection.contenu) && matchingSection.contenu.slice(0, 2).map((item: any, i: number) => (
                        <div key={i} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <p className="font-bold text-blue-600 dark:text-blue-400">{item.poste} - {item.entreprise}</p>
                          <p className="text-[10px] text-slate-500">{item.dateDebut} - {item.dateFin || 'Présent'}</p>
                          {item.description && <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeCategory === 'formation' && matchingSection && (
                    <div className="space-y-1.5 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{matchingSection.titre}</h4>
                      {Array.isArray(matchingSection.contenu) && matchingSection.contenu.map((item: any, i: number) => (
                        <div key={i} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.diplome}</p>
                          <p className="text-[11px] text-slate-500">{item.etablissement} ({item.dateDebut} - {item.dateFin})</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeCategory === 'competences' && matchingSection && (
                    <div className="space-y-1.5 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{matchingSection.titre}</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(matchingSection.contenu) && matchingSection.contenu.map((sk: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-bold text-[10px]">
                            {sk.nom || sk.domaine} {sk.niveau ? `(${sk.niveau}/5)` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeCategory === 'langues' && matchingSection && (
                    <div className="space-y-1.5 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{matchingSection.titre}</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(matchingSection.contenu) && matchingSection.contenu.map((lg: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[10px]">
                            {lg.langue || lg.nom} ({lg.niveau || 'Courant'})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                  {activeCategory === 'profil' && onApplyProfileHeader && matchingSection?.contenu && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyProfileHeader(matchingSection.contenu, preset.photoUrl);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Appliquer comme profil principal</span>
                    </button>
                  )}

                  {matchingSection && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddSection({
                          ...matchingSection,
                          id: `sec-preset-${Date.now()}`
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insérer cette section sur le CV</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>💡 Astuce : Vous pouvez modifier tout texte directement après insertion sur le canvas.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 font-bold text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
