import React, { useState } from 'react';
import { Language, CVTemplate, CV } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { getPresetForTemplate } from '../data/templatePresets';
import { CVPreview } from './CVPreview';
import { getTranslation } from '../i18n/translations';
import { 
  FileText, 
  Sparkles, 
  FilePlus, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Layout, 
  Check, 
  Palette,
  Eye,
  Monitor
} from 'lucide-react';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface EditorChoiceModalProps {
  langue: Language;
  onClose: () => void;
  onSelectTemplate: (template: CVTemplate) => void;
  onCreateBlankCV: () => void;
  activeCV?: CV | null;
  onContinueActiveCV?: () => void;
}

export const EditorChoiceModal: React.FC<EditorChoiceModalProps> = ({
  langue,
  onClose,
  onSelectTemplate,
  onCreateBlankCV,
  activeCV,
  onContinueActiveCV
}) => {
  const [tab, setTab] = useState<'options' | 'templates'>('options');
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  const labels = {
    title: langue === 'en' ? 'Start Your CV' : langue === 'ar' ? 'ابدأ سيرتك الذاتية' : 'Créer ou Modifier votre CV',
    subtitle: langue === 'en' 
      ? 'Choose a professional template or start directly on a blank page.' 
      : langue === 'ar' 
      ? 'اختر قالباً احترافياً أو ابدأ مباشرة بصفحة فارغة.' 
      : 'Choisissez un modèle haute définition ou partez d\'une page vierge.',
    continueActive: langue === 'en' ? 'Resume Current CV' : langue === 'ar' ? 'متابعة السيرة الحالية' : 'Reprendre le CV en cours',
    continueDesc: langue === 'en' ? 'Continue editing' : langue === 'ar' ? 'متابعة التعديل' : 'Continuer les modifications sur',
    chooseTemplate: langue === 'en' ? 'Pick a Template' : langue === 'ar' ? 'اختيار نموذج جاهز' : 'Choisir un Modèle / Template',
    chooseTemplateDesc: langue === 'en' 
      ? 'Browse all curated templates with pre-configured themes and styling.' 
      : langue === 'ar' 
      ? 'استعرض النماذج المهنية الجاهزة مع التنسيقات والألوان.' 
      : 'Parcourez les modèles professionnels pré-remplis et stylisés.',
    blankPage: langue === 'en' ? 'Blank Page' : langue === 'ar' ? 'صفحة فارغة' : 'Page Vierge (Partir de zéro)',
    blankPageDesc: langue === 'en' 
      ? 'Start with a clean layout and fill in your details step-by-step.' 
      : langue === 'ar' 
      ? 'ابدأ بتخطيط نظيف وأدخل بياناتك خطوة بخطوة.' 
      : 'Commencez sur une structure épurée et remplissez pas à pas.',
    viewAllTemplates: langue === 'en' ? 'All Templates' : langue === 'ar' ? 'جميع النماذج' : 'Tous les Modèles'
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{langue === 'en' ? 'CV Editor Hub' : langue === 'ar' ? 'محرر السيرة الذاتية' : 'Éditeur de CV'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {labels.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {labels.subtitle}
            </p>

            {/* Desktop Experience Alert Banner */}
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <Monitor className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold">
                  {langue === 'en' ? 'Optimal on Computer:' : langue === 'ar' ? 'الأفضل على الكمبيوتر:' : 'Idéal sur Ordinateur :'}
                </span>{' '}
                {langue === 'en' 
                  ? 'The editor mode with real-time A4 rendering and fine layout adjustments is ideally designed for a computer or tablet rather than a phone.'
                  : langue === 'ar'
                  ? 'وضع المحرر مع العرض الفوري A4 والضبط الدقيق مصمم بشكل مثالي لشاشات الكمبيوتر بدلاً من الهواتف.'
                  : 'Le mode éditeur avec aperçu A4 en temps réel et glisser-déposer est idéalement conçu pour un ordinateur ou une tablette plutôt qu\'un téléphone.'}
              </div>
            </div>
          </div>

          {/* If there is an active CV in progress */}
          {activeCV && onContinueActiveCV && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block">
                    {labels.continueActive}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block max-w-[240px] sm:max-w-xs">
                    {activeCV.titre || 'Mon CV en cours'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onContinueActiveCV();
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>{langue === 'en' ? 'Resume' : langue === 'ar' ? 'متابعة' : 'Reprendre'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* OPTION 1: CHOOSE A TEMPLATE */}
            <div 
              onClick={() => setTab('templates')}
              className="group p-5 rounded-2xl bg-gradient-to-b from-blue-50/60 to-indigo-50/30 dark:from-slate-800/80 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-900/60 hover:border-blue-600 dark:hover:border-blue-500 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Layout className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {labels.chooseTemplate}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {labels.chooseTemplateDesc}
                </p>
              </div>

              <div className="pt-2 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>{langue === 'en' ? 'Browse Models' : langue === 'ar' ? 'تصفح النماذج' : 'Choisir parmi les modèles'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* OPTION 2: START ON BLANK PAGE */}
            <div 
              onClick={() => {
                onCreateBlankCV();
                onClose();
              }}
              className="group p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-800/40 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <FilePlus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {labels.blankPage}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {labels.blankPageDesc}
                </p>
              </div>

              <div className="pt-2 flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:translate-x-1 transition-transform">
                <span>{langue === 'en' ? 'Start blank' : langue === 'ar' ? 'بدء صفحة فارغة' : 'Démarrer page vierge'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

          </div>

          {/* TEMPLATE PICKER EMBEDDED IF TAB = 'templates' */}
          {tab === 'templates' && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {labels.viewAllTemplates} ({CV_TEMPLATES.length})
                </span>
                <button
                  type="button"
                  onClick={() => setTab('options')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  ← {langue === 'en' ? 'Back' : langue === 'ar' ? 'رجوع' : 'Retour aux options'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {CV_TEMPLATES.map((tpl) => {
                  const preset = getPresetForTemplate(tpl.id, langue);
                  const miniCv: CV = {
                    id: `choice-${tpl.id}`,
                    utilisateurId: 'demo',
                    titre: preset.titre,
                    templateId: tpl.id,
                    langue: langue,
                    couleurAccent: preset.couleurAccent,
                    police: preset.police,
                    photoUrl: preset.photoUrl,
                    afficherPhoto: true,
                    statutPaiement: 'PAYE',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...preset,
                    pageCibleMode: '1_page',
                    sections: preset.sections
                  };

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        onSelectTemplate(tpl);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between space-y-2 hover:shadow-md"
                    >
                      <div className="h-36 rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-700 relative flex items-start justify-center">
                        <div className="w-[794px] h-[1122px] origin-top transform scale-[0.23] pointer-events-none select-none bg-white shrink-0">
                          <CVPreview cv={miniCv} interactivePreview={false} />
                        </div>
                        <div 
                          className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                          style={{ backgroundColor: tpl.defaultAccent }}
                        />
                      </div>

                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                          {tpl.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block capitalize truncate">
                          {tpl.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="w-full py-1 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                      >
                        {langue === 'en' ? 'Use Model' : langue === 'ar' ? 'اختيار' : 'Choisir'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          langue={langue}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(tpl) => {
            setPreviewTemplate(null);
            onSelectTemplate(tpl);
            onClose();
          }}
        />
      )}
    </>
  );
};
