import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { FileText, Sparkles, Layout, ShieldCheck, Download, Upload, ArrowRight, CheckCircle2, FilePlus, Sliders } from 'lucide-react';

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
            <span>Plateforme Professionnelle de Création de CV SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Deux Façons Intelligentes de Créer Votre CV
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Commencez sur une page blanche dans notre éditeur visuel complet type MS Word, ou utilisez un formulaire guidé et un modèle professionnel réutilisable dans l'éditeur.
          </p>

          {/* TWO MAIN MODES HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left max-w-4xl mx-auto">
            
            {/* MODE 1: PAGE BLANCHE / ÉDITEUR WORD */}
            <div
              onClick={onStartCreate}
              className="group bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl shadow-blue-500/20 border border-blue-500/30 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                  <FilePlus className="w-6 h-6 text-white" />
                </div>
                <div className="inline-block bg-blue-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Mode Page Blanche
                </div>
                <h3 className="text-2xl font-black tracking-tight">Éditeur Visuel MS Word</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Commencez sur une page A4 vierge. Insérez des formes, listes à puces, colonnes (30/70), zones de texte et personnalisez chaque détail visuellement avec un ruban Word complet.
                </p>
              </div>

              <div className="flex items-center space-x-2 font-bold text-sm text-white pt-2 group-hover:translate-x-1 transition-transform">
                <span>Démarrer l'Éditeur Visuel</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* MODE 2: FORMULAIRE & TEMPLATES */}
            <div
              onClick={onBrowseTemplates}
              className="group bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Sliders className="w-6 h-6" />
                </div>
                <div className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Mode Modèles & Formulaire
                </div>
                <h3 className="text-2xl font-black tracking-tight">Modèles Pro & Formulaire</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Choisissez un modèle de CV design, remplissez le formulaire structuré (Expériences, Formations, Compétences) puis basculez librement dans l'Éditeur Word pour retoucher la disposition.
                </p>
              </div>

              <div className="flex items-center space-x-2 font-bold text-sm text-blue-600 dark:text-blue-400 pt-2 group-hover:translate-x-1 transition-transform">
                <span>Parcourir les Modèles</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onImportClick}
              className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-2xl transition-all flex items-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Ou Importer un CV existant (PDF / DOCX)</span>
            </button>
          </div>

          {/* Highlights bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Éditeur Type Word & Canva</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Bascule Modèle &lt;&gt; Éditeur Libre</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Analyseur de Score ATS (0-100)</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Assistant IA Gemini Intégré</span>
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Éditeur Type Microsoft Word</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Ruban avec onglets Accueil, Insertion (formes, puces, colonnes), Création, Disposition, Affichage et IA.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">CV à 1 & 2 Colonnes Réglables</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Réglez le ratio de largeur (30/70, 40/60, 50/50), les marges et déplacez vos blocs de compétences et d'expériences.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Export PDF Vectoriel Pixel-Perfect</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Générez un fichier PDF identique au canvas visualisé, prêt pour les recruteurs et les systèmes ATS.</p>
          </div>

        </div>
      </section>

    </div>
  );
};
