import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { FileText, Sparkles, Layout, ShieldCheck, Download, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingViewProps {
  langue: Language;
  onStartCreate: () => void;
  onBrowseTemplates: () => void;
  onImportClick: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  langue,
  onStartCreate,
  onBrowseTemplates,
  onImportClick
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Modèles de CV Professionnels sur Mesure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartCreate}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer"
            >
              <span>{t('ctaCreateCV')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onBrowseTemplates}
              className="w-full sm:w-auto px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{t('ctaBrowseTemplates')}</span>
            </button>

            <button
              onClick={onImportClick}
              className="w-full sm:w-auto px-6 py-4 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-base rounded-2xl transition-all flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Upload className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span>Importer un PDF/DOCX</span>
            </button>
          </div>

          {/* Highlights bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Personnalisable</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Glisser-Déposer des Sections</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Correcteur Orthographique FR/EN</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Paiement 500 FCFA Mobile Money</span>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('feature1Title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t('feature1Desc')}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('feature2Title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t('feature2Desc')}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('feature3Title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t('feature3Desc')}</p>
          </div>

        </div>
      </section>

    </div>
  );
};
