import React, { useState } from 'react';
import { CV, Language } from '../types';
import { FileText, ArrowRight, X, Sparkles, Plus, CheckCircle2, Calendar } from 'lucide-react';
import { CVPreview } from './CVPreview';

interface CVPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvs: CV[];
  langue: Language;
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon?: React.ReactNode;
  onSelectCV: (cv: CV) => void;
  onCreateNew?: () => void;
}

export const CVPickerModal: React.FC<CVPickerModalProps> = ({
  isOpen,
  onClose,
  cvs,
  langue,
  title,
  subtitle,
  badge,
  badgeIcon,
  onSelectCV,
  onCreateNew
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const safeCvs = Array.isArray(cvs) ? cvs : [];
  const filteredCVs = safeCvs.filter(cv => 
    (cv?.titre || '').toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            {badgeIcon || <Sparkles className="w-3.5 h-3.5" />}
            <span>{badge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Search bar if many CVs */}
        {cvs.length > 3 && (
          <input
            type="text"
            placeholder={langue === 'en' ? 'Search in your CVs...' : langue === 'ar' ? 'البحث في سيرك الذاتية...' : 'Rechercher parmi vos CVs...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* List of User's CVs (Not templates) */}
        {filteredCVs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {filteredCVs.map((cvItem) => {
              const formattedDate = new Date(cvItem.updatedAt || Date.now()).toLocaleDateString(
                langue === 'en' ? 'en-US' : langue === 'ar' ? 'ar-EG' : 'fr-FR',
                { day: 'numeric', month: 'short', year: 'numeric' }
              );

              return (
                <div
                  key={cvItem.id}
                  onClick={() => {
                    onSelectCV(cvItem);
                    onClose();
                  }}
                  className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {cvItem.titre}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>{cvItem.sections.length} sections</span>
                        {cvItem.statutPaiement === 'PAYE' && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {langue === 'en' ? 'Paid' : 'Payé'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 group-hover:bg-blue-600 text-slate-700 dark:text-slate-200 group-hover:text-white border border-slate-200 dark:border-slate-700 group-hover:border-blue-600 rounded-xl text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>{langue === 'en' ? 'Select' : langue === 'ar' ? 'اختيار' : 'Sélectionner'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {langue === 'en' ? 'No created CVs found' : langue === 'ar' ? 'لا توجد سير ذاتية منشأة' : 'Aucun CV créé pour l\'instant'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {langue === 'en' 
                  ? 'Create or import your first CV before adapting it to job offers or generating letters.'
                  : 'Créez ou importez un premier CV pour pouvoir l\'adapter à des offres d\'emploi ou générer votre lettre.'}
              </p>
            </div>
            {onCreateNew && (
              <button
                type="button"
                onClick={() => {
                  onCreateNew();
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{langue === 'en' ? 'Create a CV now' : 'Créer un CV maintenant'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
