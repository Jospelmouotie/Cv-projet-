import React, { useState } from 'react';
import { CV, CVTemplate, Section, CustomPreset } from '../types';
import { CV_TEMPLATES, ACCENT_COLORS, FONT_OPTIONS } from '../data/templates';
import { Palette, Layout, Type, Sliders, RotateCcw, Save, Check, Sparkles, Layers, Grid } from 'lucide-react';

interface CreatorStudioPanelProps {
  cv: CV;
  onChangeCV: (updatedCV: CV) => void;
  template: CVTemplate;
}

export const CreatorStudioPanel: React.FC<CreatorStudioPanelProps> = ({
  cv,
  onChangeCV,
  template
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(cv.sections[0]?.id || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Quick helper to update CV root properties
  const updateCvProp = (key: keyof CV, value: any) => {
    onChangeCV({ ...cv, [key]: value });
  };

  // Helper for updating section overrides
  const selectedSection = cv.sections.find(s => s.id === selectedSectionId);

  const updateSectionStyle = (overrideKey: string, val: any) => {
    if (!selectedSectionId) return;
    const updatedSections = cv.sections.map(sec => {
      if (sec.id !== selectedSectionId) return sec;
      const currentOverrides = sec.styleSection || {};
      return {
        ...sec,
        styleSection: {
          ...currentOverrides,
          [overrideKey]: val
        }
      };
    });
    onChangeCV({ ...cv, sections: updatedSections });
  };

  // Reset custom studio styles to default template theme
  const handleResetToTemplateDefault = () => {
    const theme = template.themeConfig || {};
    onChangeCV({
      ...cv,
      couleurAccent: template.defaultAccent || theme.primaryColor || '#006666',
      couleurAccentSecondaire: template.defaultSecondaryAccent || theme.secondaryColor || '#E6F0F2',
      couleurFond: theme.backgroundColor || '#FFFFFF',
      couleurFondSidebar: theme.sidebarBackgroundColor || '#F8FAFC',
      couleurTexte: theme.textColor || '#1E293B',
      couleurTexteSidebar: theme.sidebarTextColor || '#0F172A',
      couleurTitreSection: theme.headingColor || template.defaultAccent || '#006666',
      police: template.defaultFont || 'Inter',
      taillePoliceValeur: 10,
      hauteurLigneValeur: 1.3,
      largeurColonneGauche: theme.defaultLeftWidth || 34,
      margeGlobalePage: 0,
      styleEnTete: theme.headerStyle || 'banner',
      styleEnTeteSection: theme.sectionHeaderStyle || 'underline',
      styleCompetences: theme.skillsDisplayMode || 'grid',
      alignementDatesExperience: theme.experienceDatesAlignment || 'left'
    });
    setSaveSuccessMsg('Style réinitialisé aux valeurs par défaut du modèle');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Save current style as Custom Preset in localStorage
  const handleSaveCustomPreset = () => {
    const presetName = prompt('Donnez un nom à votre modèle personnalisé (ex: Mon Style Luxe) :') || 'Modèle Personnalisé';
    const newPreset: CustomPreset = {
      id: `preset-custom-${Date.now()}`,
      name: presetName,
      updatedAt: new Date().toISOString(),
      cvData: {
        couleurAccent: cv.couleurAccent,
        couleurAccentSecondaire: cv.couleurAccentSecondaire,
        couleurFond: cv.couleurFond,
        couleurFondSidebar: cv.couleurFondSidebar,
        couleurTexte: cv.couleurTexte,
        couleurTexteSidebar: cv.couleurTexteSidebar,
        couleurTitreSection: cv.couleurTitreSection,
        police: cv.police,
        styleEnTete: cv.styleEnTete,
        styleEnTeteSection: cv.styleEnTeteSection,
        styleCompetences: cv.styleCompetences,
        alignementDatesExperience: cv.alignementDatesExperience
      }
    };

    try {
      const existingPresetsRaw = localStorage.getItem('cv_custom_presets');
      const existingPresets: CustomPreset[] = existingPresetsRaw ? JSON.parse(existingPresetsRaw) : [];
      existingPresets.push(newPreset);
      localStorage.setItem('cv_custom_presets', JSON.stringify(existingPresets));
      setSaveSuccessMsg(`Modèle "${presetName}" sauvegardé avec succès !`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to save preset', err);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Toast Banner */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* HEADER BAR FOR BUILDER MODE */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Mode Créateur Libre</h3>
            <p className="text-[11px] text-blue-200">Personnalisez 100% de la structure, des couleurs et des typographies sans limites.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToTemplateDefault}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Réinitialiser le style aux paramètres d'origine du modèle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={handleSaveCustomPreset}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sauvegarder mon style</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: TEMPLATE SELECTOR */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Grid className="w-4 h-4 text-blue-600" />
            <span>1. Sélectionner un modèle de base ({CV_TEMPLATES.length} modèles)</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
          {CV_TEMPLATES.map(tmpl => {
            const isSelected = cv.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  const theme = (tmpl.themeConfig || {}) as any;
                  onChangeCV({
                    ...cv,
                    templateId: tmpl.id,
                    couleurAccent: tmpl.defaultAccent || theme.primaryColor || '#006666',
                    couleurAccentSecondaire: tmpl.defaultSecondaryAccent || theme.secondaryColor || '#E6F0F2',
                    couleurFond: theme.backgroundColor || '#FFFFFF',
                    couleurFondSidebar: theme.sidebarBackgroundColor || '#F8FAFC',
                    couleurTexte: theme.textColor || '#1E293B',
                    couleurTexteSidebar: theme.sidebarTextColor || '#0F172A',
                    couleurTitreSection: theme.headingColor || tmpl.defaultAccent || '#006666',
                    police: tmpl.defaultFont || 'Inter',
                    styleEnTete: theme.headerStyle || 'banner',
                    styleEnTeteSection: theme.sectionHeaderStyle || 'underline',
                    styleCompetences: theme.skillsDisplayMode || 'grid',
                    alignementDatesExperience: theme.experienceDatesAlignment || 'left'
                  });
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/30 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-extrabold truncate text-slate-800 dark:text-slate-200">
                    {tmpl.name.split('—')[0]}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tmpl.defaultAccent }} />
                  {tmpl.defaultSecondaryAccent && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tmpl.defaultSecondaryAccent }} />
                  )}
                  <span className="text-[9px] text-slate-500 ml-auto uppercase">{tmpl.layoutFamily}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MISE EN PAGE & ARCHITECTURE */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Layout className="w-4 h-4 text-blue-600" />
          <span>2. Architecture & Colonnes</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Column Count */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Disposition des colonnes :</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateCvProp('nombreColonnes', 1)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  (cv.nombreColonnes || 2) === 1
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                📄 1 Colonne Simple
              </button>
              <button
                type="button"
                onClick={() => updateCvProp('nombreColonnes', 2)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  (cv.nombreColonnes || 2) === 2
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                📊 2 Colonnes
              </button>
            </div>
          </div>

          {/* Sidebar Position */}
          {(cv.nombreColonnes || 2) === 2 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Position de la colonne latérale :</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateCvProp('positionSidebar', 'gauche')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    (cv.positionSidebar || 'gauche') === 'gauche'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ⬅️ Sidebar à Gauche
                </button>
                <button
                  type="button"
                  onClick={() => updateCvProp('positionSidebar', 'droite')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    (cv.positionSidebar || 'gauche') === 'droite'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ➡️ Sidebar à Droite
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column Width & Margins Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {(cv.nombreColonnes || 2) === 2 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Largeur de la Sidebar :</span>
                <span className="text-blue-600 dark:text-blue-400">{cv.largeurColonneGauche || 34}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                value={cv.largeurColonneGauche || 34}
                onChange={(e) => updateCvProp('largeurColonneGauche', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Marge Globale de la Page (A4) :</span>
              <span className="text-blue-600 dark:text-blue-400">{cv.margeGlobalePage || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={cv.margeGlobalePage || 0}
              onChange={(e) => updateCvProp('margeGlobalePage', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: TYPOGRAPHY & TEXT SIZES */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Type className="w-4 h-4 text-blue-600" />
          <span>3. Typographie & Réglage fin des Tailles</span>
        </label>

        {/* Font Select */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Police de caractères principale :</span>
          <select
            value={cv.police || template.defaultFont || 'Inter'}
            onChange={(e) => updateCvProp('police', e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Line Height Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Font size value (4pt to 30pt) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Taille des textes (de 4 à 30 pt) :</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="4"
                  max="30"
                  value={cv.taillePoliceValeur || 10}
                  onChange={(e) => updateCvProp('taillePoliceValeur', Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-xs font-black bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
                <span className="text-[11px] text-slate-500">pt</span>
              </div>
            </div>
            <input
              type="range"
              min="4"
              max="30"
              value={cv.taillePoliceValeur || 10}
              onChange={(e) => updateCvProp('taillePoliceValeur', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Line height value (0.5 to 2.0) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Interligne (de 0.5 à 2.0) :</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  value={cv.hauteurLigneValeur || 1.3}
                  onChange={(e) => updateCvProp('hauteurLigneValeur', Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-xs font-black bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
            </div>
            <input
              type="range"
              step="0.05"
              min="0.5"
              max="2.0"
              value={cv.hauteurLigneValeur || 1.3}
              onChange={(e) => updateCvProp('hauteurLigneValeur', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: PALETTE DE COULEURS COMPLÈTE */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Palette className="w-4 h-4 text-blue-600" />
          <span>4. Palette de Couleurs Intégrale</span>
        </label>

        {/* Quick Accent Swatches */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500">Préréglages rapides d'accents :</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map(color => (
              <button
                key={color.hex}
                type="button"
                onClick={() => updateCvProp('couleurAccent', color.hex)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 shadow-2xs ${
                  cv.couleurAccent === color.hex ? 'scale-125 border-blue-600 ring-2 ring-blue-400' : 'border-white'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Individual Color Pickers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Couleur Accent Principale */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Accent Principal :</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={cv.couleurAccent || '#006666'}
                onChange={(e) => updateCvProp('couleurAccent', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{cv.couleurAccent || '#006666'}</span>
            </div>
          </div>

          {/* Couleur Accent Secondaire */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Accent Secondaire :</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={cv.couleurAccentSecondaire || '#E6F0F2'}
                onChange={(e) => updateCvProp('couleurAccentSecondaire', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{cv.couleurAccentSecondaire || '#E6F0F2'}</span>
            </div>
          </div>

          {/* Couleur Fond Page */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Fond de la Page :</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={cv.couleurFond || '#FFFFFF'}
                onChange={(e) => updateCvProp('couleurFond', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{cv.couleurFond || '#FFFFFF'}</span>
            </div>
          </div>

          {/* Couleur Fond Sidebar */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Fond Sidebar :</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={cv.couleurFondSidebar || '#F8FAFC'}
                onChange={(e) => updateCvProp('couleurFondSidebar', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{cv.couleurFondSidebar || '#F8FAFC'}</span>
            </div>
          </div>

          {/* Couleur Texte Principal */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Texte Principal :</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={cv.couleurTexte || '#1E293B'}
                onChange={(e) => updateCvProp('couleurTexte', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{cv.couleurTexte || '#1E293B'}</span>
            </div>
          </div>

          {/* Couleur Titres Section */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Titres de Sections :</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={cv.couleurTitreSection || cv.couleurAccent || '#006666'}
                onChange={(e) => updateCvProp('couleurTitreSection', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{cv.couleurTitreSection || cv.couleurAccent || '#006666'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: MODE PAGE CIBLE & BUDGET DE PAGES */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>5. Calibrage des Pages & Adaptation Automatique</span>
        </label>

        {/* Page Cible Mode Select */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Objectif de Nombre de Pages :</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => updateCvProp('pageCibleMode', '1_page')}
              className={`p-2.5 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${
                (cv.pageCibleMode || 'auto') === '1_page'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="font-extrabold text-[11px] uppercase">🎯 1 Page Strict</div>
              <div className="text-[10px] opacity-80 mt-0.5">S'adapte sans déborder</div>
            </button>
            <button
              type="button"
              onClick={() => updateCvProp('pageCibleMode', '2_pages')}
              className={`p-2.5 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${
                cv.pageCibleMode === '2_pages'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="font-extrabold text-[11px] uppercase">📄📄 2 Pages</div>
              <div className="text-[10px] opacity-80 mt-0.5">Espacement aéré</div>
            </button>
            <button
              type="button"
              onClick={() => updateCvProp('pageCibleMode', 'compact')}
              className={`p-2.5 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${
                cv.pageCibleMode === 'compact'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="font-extrabold text-[11px] uppercase">⚡ Ultra-Compact</div>
              <div className="text-[10px] opacity-80 mt-0.5">Maximum de données</div>
            </button>
            <button
              type="button"
              onClick={() => updateCvProp('pageCibleMode', 'auto')}
              className={`p-2.5 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${
                (cv.pageCibleMode || 'auto') === 'auto'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="font-extrabold text-[11px] uppercase">🔄 Auto (Standard)</div>
              <div className="text-[10px] opacity-80 mt-0.5">Selon contenu</div>
            </button>
          </div>
        </div>

        {/* Section Spacing Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Espacement entre les sections :</span>
              <span className="text-blue-600 dark:text-blue-400">{cv.espacementSectionsPx ?? ((cv.pageCibleMode === '1_page' || cv.pageCibleMode === 'compact') ? 8 : 16)}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={cv.espacementSectionsPx ?? ((cv.pageCibleMode === '1_page' || cv.pageCibleMode === 'compact') ? 8 : 16)}
              onChange={(e) => updateCvProp('espacementSectionsPx', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Bullet Style Selector */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Style des puces (Listes / Missions) :</span>
            <select
              value={cv.stylePucesListes || 'disc'}
              onChange={(e) => updateCvProp('stylePucesListes', e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value="disc">• Disque classique (•)</option>
              <option value="square">▪ Carré plein (▪)</option>
              <option value="arrow">▸ Flèche élégante (▸)</option>
              <option value="check">✓ Coche de validation (✓)</option>
              <option value="star">★ Étoile d'accent (★)</option>
              <option value="dash">— Tiret long (—)</option>
              <option value="numbered">1. Numéroté (1. 2. 3.)</option>
              <option value="none">Sans puces (Texte simple)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 6: STYLE DES TITRES & ÉLÉMENTS GRAPHIQUES */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Type className="w-4 h-4 text-blue-600" />
          <span>6. Personnalisation Avancée des Titres & Compétences</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Section Header Style */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Style Visuel des Titres de Sections :</span>
            <select
              value={cv.styleEnTeteSection || 'underline'}
              onChange={(e) => updateCvProp('styleEnTeteSection', e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value="underline">✍️ Ligne de Soulignement Colorée</option>
              <option value="pill">💊 Pilule / Badge Coloré Rounded</option>
              <option value="banner">🎗️ Banderole / Cartouche Coloré</option>
              <option value="arch-block">🏛️ Blocs Arche Empilés</option>
              <option value="badge-header">🏷️ Tag / Badge avec Bordure</option>
              <option value="left-border">▍ Barre Verticale à Gauche</option>
              <option value="boxed">📦 Cadre Encadré avec Bordure</option>
              <option value="stars">✨ Titre avec Étoiles Décoratives</option>
              <option value="double-line">═ Double Ligne d'Accent</option>
              <option value="minimal">🔤 Minimaliste Sans Ligne</option>
            </select>
          </div>

          {/* Title Font Size Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Taille des Titres de Sections :</span>
              <span className="text-blue-600 dark:text-blue-400">{cv.tailleTitreSectionValeur || 11}pt</span>
            </div>
            <input
              type="range"
              min="8"
              max="24"
              value={cv.tailleTitreSectionValeur || 11}
              onChange={(e) => updateCvProp('tailleTitreSectionValeur', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Title Case */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Casse du texte des Titres :</span>
            <select
              value={cv.casseTitreSection || 'uppercase'}
              onChange={(e) => updateCvProp('casseTitreSection', e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value="uppercase">MAJUSCULES (ex: EXPÉRIENCES)</option>
              <option value="capitalize">Capitalize (ex: Expériences)</option>
              <option value="normal">Minuscules / Normal (ex: expériences)</option>
            </select>
          </div>

          {/* Title Alignment */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Alignement des Titres :</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateCvProp('alignementTitreSection', 'left')}
                className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                  (cv.alignementTitreSection || 'left') === 'left' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                ⬅️ Gauche
              </button>
              <button
                type="button"
                onClick={() => updateCvProp('alignementTitreSection', 'center')}
                className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                  cv.alignementTitreSection === 'center' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                ↔️ Centre
              </button>
              <button
                type="button"
                onClick={() => updateCvProp('alignementTitreSection', 'right')}
                className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                  cv.alignementTitreSection === 'right' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                ➡️ Droite
              </button>
            </div>
          </div>

          {/* Skills Display Mode */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Affichage des Compétences :</span>
            <select
              value={cv.styleCompetences || 'grid'}
              onChange={(e) => updateCvProp('styleCompetences', e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value="grid">▦ Grille de Cartes Répartition</option>
              <option value="badges">🏷️ Pilules / Badges Unicolores</option>
              <option value="badges-multicolor">🎨 Badges / Qualités Bicolores</option>
              <option value="circular-progress">⭕ Anneaux de Progression Circulaires (%)</option>
              <option value="progress">📊 Barres de Progression (%)</option>
              <option value="stars">★ Étoiles de Niveau (1-5)</option>
              <option value="tags"># Tags Minimalistes avec cadre</option>
              <option value="list">• Liste à Puces Simple</option>
            </select>
          </div>

          {/* Experience Dates Alignment */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Alignement des Dates d'Expériences :</span>
            <select
              value={cv.alignementDatesExperience || 'left'}
              onChange={(e) => updateCvProp('alignementDatesExperience', e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value="left">👈 Colonne Dédiée à Gauche (01/2020 - 05/2023)</option>
              <option value="inline">👉 Badges à Droite du Titre du Poste</option>
              <option value="top">☝️ Au-dessus de la Raison Sociale</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 6: PERSONNALISATION PAR SECTION INDIVIDUELLE */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>6. Personnalisation Sur-Mesure par Section</span>
        </label>

        <p className="text-xs text-slate-500">
          Sélectionnez une section spécifique pour appliquer des styles sur-mesure (couleur, titre, style d'en-tête, colonne) uniquement à cette section.
        </p>

        {/* Section Select */}
        <div className="space-y-2">
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
          >
            {cv.sections.map(s => (
              <option key={s.id} value={s.id}>
                {s.titre} (Type : {s.type})
              </option>
            ))}
          </select>
        </div>

        {selectedSection && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-extrabold uppercase text-blue-600">
              Retouches exclusives pour : "{selectedSection.titre}"
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Style d'en-tête de cette section */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">En-tête spécifique :</span>
                <select
                  value={selectedSection.styleSection?.styleEntete || ''}
                  onChange={(e) => updateSectionStyle('styleEntete', e.target.value || undefined)}
                  className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="">(Hériter du style global)</option>
                  <option value="underline">Ligne de soulignement</option>
                  <option value="pill">Pilule colorée</option>
                  <option value="banner">Banderole plein bloc</option>
                  <option value="left-border">Barre à gauche</option>
                  <option value="boxed">Encadré</option>
                  <option value="stars">Étoiles</option>
                  <option value="double-line">Double ligne</option>
                </select>
              </div>

              {/* Position Colonne de cette section */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">Colonne d'affichage :</span>
                <select
                  value={selectedSection.colonne || 'principale'}
                  onChange={(e) => {
                    const updated = cv.sections.map(sec => sec.id === selectedSectionId ? { ...sec, colonne: e.target.value as any } : sec);
                    onChangeCV({ ...cv, sections: updated });
                  }}
                  className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="principale">🎯 Colonne Principale</option>
                  <option value="gauche">⬅️ Sidebar / Colonne Gauche</option>
                  <option value="droite">➡️ Colonne Droite</option>
                </select>
              </div>

              {/* Couleur Titre Spécifique */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">Couleur Titre :</span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={selectedSection.styleSection?.couleurTitre || cv.couleurAccent || '#006666'}
                    onChange={(e) => updateSectionStyle('couleurTitre', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono">{selectedSection.styleSection?.couleurTitre || 'Par défaut'}</span>
                </div>
              </div>

              {/* Couleur Fond Spécifique */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">Couleur Fond de carte :</span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={selectedSection.styleSection?.couleurFond || '#FFFFFF'}
                    onChange={(e) => updateSectionStyle('couleurFond', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono">{selectedSection.styleSection?.couleurFond || 'Transparent'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
