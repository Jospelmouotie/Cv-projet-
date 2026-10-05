import React, { useRef, useState } from 'react';
import { CVElement, ElementStyle } from '../types/document';
import { FONT_OPTIONS, ACCENT_COLORS } from '../data/templates';
import { ExperienceItem, FormationItem, CompetenceItem, Section, CV } from '../types';
import { processUploadedImage } from '../utils/imageUpload';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Copy,
  Trash2,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  Layers,
  Palette,
  Type,
  Maximize2,
  Sliders,
  Upload,
  Plus,
  Image as ImageIcon,
  Columns,
  List,
  Edit3,
  FileText,
  Square,
  Sparkles,
  User,
  Check,
  Crop,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: CVElement | null;
  onUpdateElement: (updated: CVElement) => void;
  onDuplicateElement: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onAlignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  pageWidth: number;
  pageHeight: number;
  onApplyPageBackground?: (color: string) => void;
  onApplyFontToAll?: (font: string) => void;
  onAddTwoColumnSection?: (leftPercent: number, rightPercent: number) => void;
  onAddElement?: (type: any, presetContent?: any, extraStyle?: any) => void;
  cv?: CV;
  onUpdateCV?: (cvPatch: Partial<CV>) => void;
  onOpenProfileEditor?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onAlignElement,
  pageWidth,
  pageHeight,
  onApplyPageBackground,
  onApplyFontToAll,
  onAddTwoColumnSection,
  onAddElement,
  cv,
  onUpdateCV,
  onOpenProfileEditor
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [underlineDropdown, setUnderlineDropdown] = useState<boolean>(false);

  // Direct image file upload handler for CV & Elements
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processUploadedImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.9 });
      if (onUpdateCV) {
        onUpdateCV({ photoUrl: dataUrl, afficherPhoto: true });
      }
      if (selectedElement) {
        if (selectedElement.type === 'image') {
          onUpdateElement({
            ...selectedElement,
            content: { ...(selectedElement.content || {}), src: dataUrl }
          });
        } else {
          onUpdateElement({
            ...selectedElement,
            content: { ...(selectedElement.content || {}), photoUrl: dataUrl, showPhoto: true }
          });
        }
      }
    } catch (err) {
      console.error('Error uploading photo in properties panel:', err);
    }
  };

  // =========================================================================
  // CASE 1: NO ELEMENT SELECTED -> DOCUMENT & GLOBAL STUDIO PROPERTIES
  // =========================================================================
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 shadow-lg text-slate-800 dark:text-slate-200 text-xs">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Panel Header */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
              Studio Document & Mise en Page
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
              Personnalisation globale du CV
            </p>
          </div>
        </div>

        {/* 1. PHOTO DE PROFIL ET POSITION */}
        <div className="p-3.5 bg-blue-50/60 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700/60 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>Photo de Profil & En-tête</span>
            </span>
            {onOpenProfileEditor && (
              <button
                type="button"
                onClick={onOpenProfileEditor}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Édition Complète
              </button>
            )}
          </div>

          {/* Photo Preview & Buttons */}
          <div className="flex items-center space-x-3">
            {cv?.photoUrl ? (
              <img
                src={cv.photoUrl}
                alt="Profile"
                style={{
                  width: `${Math.min(52, (cv.photoTaille || 90) * 0.5)}px`,
                  height: `${Math.min(52, (cv.photoTaille || 90) * 0.5)}px`
                }}
                className={`object-cover border-2 shadow-xs shrink-0 ${
                  cv.photoForme === 'ronde'
                    ? 'rounded-full'
                    : cv.photoForme === 'arrondie'
                    ? 'rounded-xl'
                    : cv.photoForme === 'galet'
                    ? 'rounded-[35%_65%_70%_30%/30%_30%_70%_70%]'
                    : cv.photoForme === 'arche'
                    ? 'rounded-t-full rounded-b-lg'
                    : cv.photoForme === 'hexagone'
                    ? 'rounded-2xl'
                    : 'rounded-none'
                }`}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}

            <div className="space-y-1 flex-1">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>{cv?.photoUrl ? 'Changer' : 'Importer'}</span>
                </button>
                {cv?.photoUrl && onUpdateCV && (
                  <button
                    type="button"
                    onClick={() => onUpdateCV({ photoUrl: '', afficherPhoto: false })}
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Retirer
                  </button>
                )}
              </div>
              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cv?.afficherPhoto !== false && Boolean(cv?.photoUrl)}
                  onChange={(e) => onUpdateCV?.({ afficherPhoto: e.target.checked })}
                  className="w-3 h-3 rounded accent-blue-600"
                />
                <span>Afficher sur le CV</span>
              </label>
            </div>
          </div>

          {/* Formes de photo */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Forme de découpe :</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'ronde', label: 'Ronde' },
                { id: 'arrondie', label: 'Arrondie' },
                { id: 'carree', label: 'Carrée' },
                { id: 'arche', label: 'Arche' },
                { id: 'hexagone', label: 'Hexagone' },
                { id: 'galet', label: 'Galet' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateCV?.({ photoForme: f.id as any })}
                  className={`py-1 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                    (cv?.photoForme || 'ronde') === f.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Taille Photo Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Taille Photo</span>
              <span className="text-blue-600 font-mono">{cv?.photoTaille || 90} px</span>
            </div>
            <input
              type="range"
              min={40}
              max={220}
              value={cv?.photoTaille || 90}
              onChange={(e) => onUpdateCV?.({ photoTaille: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Emplacement Photo & Bordure Photo */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Emplacement:</span>
              <select
                value={cv?.photoPosition || 'in-header'}
                onChange={(e) => onUpdateCV?.({ photoPosition: e.target.value as any })}
                className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <option value="in-header">En-tête</option>
                <option value="in-sidebar">Sidebar</option>
                <option value="free">Libre (X/Y)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Cadre Photo:</span>
              <select
                value={cv?.cadrePhotoRing || 'none'}
                onChange={(e) => onUpdateCV?.({ cadrePhotoRing: e.target.value as any })}
                className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <option value="none">Standard</option>
                <option value="double-ring">Double Anneau</option>
                <option value="gold-ring">Anneau Doré</option>
                <option value="accent-ring">Anneau Accent</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. TYPOGRAPHIE & INTERLIGNES GLOBAUX */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Type className="w-4 h-4 text-indigo-600" />
            <span>Typographie & Interlignes</span>
          </label>

          {/* Police Globale */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Police principale :</span>
            <select
              value={cv?.police || 'Inter'}
              onChange={(e) => {
                onApplyFontToAll?.(e.target.value);
                onUpdateCV?.({ police: e.target.value });
              }}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interligne Global (hauteurLigneValeur) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Interligne du CV</span>
              <span className="text-indigo-600 font-mono font-bold">{(cv?.hauteurLigneValeur ?? 1.5).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={2.2}
              step={0.05}
              value={cv?.hauteurLigneValeur ?? 1.5}
              onChange={(e) => onUpdateCV?.({ hauteurLigneValeur: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>0.6x (Compact)</span>
              <span>1.5x (Standard)</span>
              <span>2.0x (Aéré)</span>
            </div>
          </div>

          {/* Taille du corps de texte (taillePoliceValeur) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Taille Police du Corps</span>
              <span className="text-indigo-600 font-mono font-bold">{cv?.taillePoliceValeur ?? 9} pt</span>
            </div>
            <input
              type="range"
              min={5}
              max={16}
              step={0.5}
              value={cv?.taillePoliceValeur ?? 9}
              onChange={(e) => onUpdateCV?.({ taillePoliceValeur: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Taille Titres de Sections (tailleTitreSectionValeur) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Taille des Titres de Section</span>
              <span className="text-indigo-600 font-mono font-bold">{cv?.tailleTitreSectionValeur ?? 11} pt</span>
            </div>
            <input
              type="range"
              min={8}
              max={24}
              step={0.5}
              value={cv?.tailleTitreSectionValeur ?? 11}
              onChange={(e) => onUpdateCV?.({ tailleTitreSectionValeur: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Espacement entre les Sections (espacementSectionsPx) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Espacement entre Sections</span>
              <span className="text-indigo-600 font-mono font-bold">{cv?.espacementSectionsPx ?? 12} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              step={1}
              value={cv?.espacementSectionsPx ?? 12}
              onChange={(e) => onUpdateCV?.({ espacementSectionsPx: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Marge Pied de Page (margePiedDePagePx - Anti-Chevauchement) */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Marge Pied de Page (Marche sous le texte)</span>
              <span className="text-purple-600 font-mono font-bold">{cv?.margePiedDePagePx ?? 35} px</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Espace réglable pour empêcher le chevauchement du texte du CV avec le pied de page.
            </p>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={cv?.margePiedDePagePx ?? 35}
              onChange={(e) => onUpdateCV?.({ margePiedDePagePx: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Style d'En-tête du Modèle */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Style d'en-tête du modèle :</span>
            <select
              value={cv?.styleEnTete || 'banner'}
              onChange={(e) => onUpdateCV?.({ styleEnTete: e.target.value as any })}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              <optgroup label="🎨 En-têtes à 2 Couleurs (Bicolores)">
                <option value="two-tone-split">Deux Couleurs — Séparation Nette (Split)</option>
                <option value="two-tone-stripe">Deux Couleurs — Bandeau Supérieur & Accent</option>
                <option value="baxter-diagonal">Deux Couleurs — Diagonale Orange & Anthracite</option>
                <option value="modern-split">Deux Couleurs — Double Colonne (Modern Split)</option>
                <option value="diagonal-split">Deux Couleurs — Coupe Diagonale High-Tech</option>
              </optgroup>
              <optgroup label="🌊 En-têtes avec Vagues (Wave)">
                <option value="wave-bottom">Vague Inférieure Fluide (Wave Bottom)</option>
                <option value="wave-top">Vague Supérieure Incurvée (Wave Top)</option>
                <option value="wave-double">Double Vague Bicolore Fluide</option>
                <option value="ocean-wave">Vague Aquatique / Océan</option>
                <option value="curved-wave-badge">Onde Organique & Badge Portrait</option>
                <option value="sylvie-wave">Style Sylvie Loiseau (Vague & Sidebar)</option>
              </optgroup>
              <optgroup label="✨ En-têtes Normaux & Simples">
                <option value="clean">Normal & Épuré Editorial (Clean)</option>
                <option value="simple-minimal">Normal & Simple Aéré (Ligne Fine)</option>
                <option value="centered-clean">Normal & Centré Équilibré</option>
                <option value="minimal">Minimaliste Pur Sans Fond</option>
                <option value="executive-stripe">Exécutif Sobre avec Liseré</option>
              </optgroup>
              <optgroup label="🏛️ Autres Formats">
                <option value="banner">Bannière Classique (Banner)</option>
                <option value="card">Carte En-tête Encadrée (Card)</option>
                <option value="arch">Arche Supérieure / Arqué</option>
                <option value="tech-dark-band">Bande Sombre High-Tech</option>
                <option value="tech-arches">Terminal Développeur High-Tech</option>
                <option value="luxury-gold">Ruban Or & Prestige Executive</option>
                <option value="sidebar-top">Intégré dans la Sidebar</option>
              </optgroup>
            </select>
          </div>

          {/* Style d'En-tête de Section */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Style des titres de section :</span>
            <select
              value={cv?.styleEnTeteSection || 'underline'}
              onChange={(e) => onUpdateCV?.({ styleEnTeteSection: e.target.value as any })}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              <option value="underline">Souligné (Underline)</option>
              <option value="banner">Bannière pleine</option>
              <option value="left-border">Bordure gauche</option>
              <option value="boxed">Encadré (Boxed)</option>
              <option value="minimal">Minimaliste</option>
              <option value="double-line">Double ligne</option>
              <option value="arch-block">Bloc arrondi</option>
              <option value="badge-header">Badge icône</option>
              <option value="badge-line">Ligne avec badge</option>
            </select>
          </div>

          {/* Personnalisation Complète du Bandeau / Ruban Décoratif */}
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personnalisation du Bandeau & Ruban</span>
              </span>
            </div>

            {/* Forme / Motif du Bandeau */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">Forme & Style du bandeau :</span>
              <select
                value={cv?.formeSidebarDecor || 'straight'}
                onChange={(e) => onUpdateCV?.({ formeSidebarDecor: e.target.value as any })}
                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
              >
                <option value="wave-cut">Vagues Aquatiques Fluides (Wave Cut)</option>
                <option value="diagonal-cut">Polygones Biseautés / Géométrique Étudiant</option>
                <option value="arch-top">Arche Supérieure Arrondie (Arch Top)</option>
                <option value="card-float">Carte Flottante Suspendue (Card Float)</option>
                <option value="straight">Bandeau Droit Standard (Straight)</option>
              </select>
            </div>

            {/* Position du Bandeau */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">Position du bandeau / sidebar :</span>
              <select
                value={cv?.positionSidebar || 'gauche'}
                onChange={(e) => onUpdateCV?.({ positionSidebar: e.target.value as any })}
                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
              >
                <option value="gauche">Marge Gauche (Standard)</option>
                <option value="droite">Marge Droite (Inversé)</option>
              </select>
            </div>

            {/* Opacité du Bandeau / Ruban */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>Opacité du bandeau :</span>
                <span className="text-purple-600 font-black">{Math.round((cv?.ribbonOpacite ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={cv?.ribbonOpacite ?? 1}
                onChange={(e) => onUpdateCV?.({ ribbonOpacite: parseFloat(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Couleurs du Bandeau */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Couleur Primaire :</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={cv?.couleurAccent || '#E08D69'}
                    onChange={(e) => onUpdateCV?.({ couleurAccent: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{cv?.couleurAccent || '#E08D69'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Couleur Secondaire :</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={cv?.couleurAccentSecondaire || '#0B2545'}
                    onChange={(e) => onUpdateCV?.({ couleurAccentSecondaire: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{cv?.couleurAccentSecondaire || '#0B2545'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Style d'Affichage des Compétences */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Style d'affichage des compétences :</span>
            <select
              value={cv?.styleCompetences || 'progress'}
              onChange={(e) => onUpdateCV?.({ styleCompetences: e.target.value as any })}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              <option value="progress">Barres de progression (Jauges horizontales)</option>
              <option value="badges-multicolor">Badges bicolores harmonisés (Primaire / Secondaire)</option>
              <option value="badges">Badges pleins contrastés</option>
              <option value="pill-bars">Pilules de niveau avec barres (Pill-bars)</option>
              <option value="tags">Étiquettes modernes compactes (Tags)</option>
              <option value="cards-modern">Cartes modernes encadrées (Cards Modern)</option>
              <option value="tech-cards">Cartes techniques avec puces (Tech Cards)</option>
              <option value="icon-card-grid">Cartes avec icônes (Icon Cards Grid)</option>
              <option value="grid">Grille de compétences structurée (Grid)</option>
              <option value="grid-3">Grille dense à 3 colonnes (Grid 3)</option>
              <option value="minimal-cards">Cartes épurées (Minimal Cards)</option>
              <option value="striped-table">Tableau rayé bicolore (Striped Table)</option>
              <option value="stars">Étoiles de niveau (5 Stars ★★★★★)</option>
              <option value="circular-progress">Cercles de progression circulaire (%)</option>
            </select>
          </div>

          {/* Style Ligne du Temps (Timeline) */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Axe / Ligne du Temps (Timeline) :</span>
            <select
              value={cv?.timelineStyle || 'none'}
              onChange={(e) => onUpdateCV?.({ timelineStyle: e.target.value as any })}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              <option value="none">Aucune ligne du temps</option>
              <option value="line-dots">Axe vertical avec puces (Dots Timeline)</option>
              <option value="left-bar">Barre verticale accentuée</option>
              <option value="accent-pills">Pilules d'accentuation</option>
            </select>
          </div>

          {/* Style des Badges Coordonnées & Contact */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Style des icônes de coordonnées :</span>
            <select
              value={cv?.styleBadgesCoordonnees || 'none'}
              onChange={(e) => onUpdateCV?.({ styleBadgesCoordonnees: e.target.value as any })}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              <option value="none">Icônes alignées simples</option>
              <option value="filled-circle">Cercles d'icônes remplis</option>
              <option value="light-square">Carrés d'icônes arrondis</option>
              <option value="outlined">Icônes cerclées de bordures</option>
            </select>
          </div>
        </div>

        {/* 3. BORDURES GLOBALES, CARTES & ARRONDIR */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Square className="w-4 h-4 text-emerald-600" />
            <span>Bordures & Arrondis des Cartes</span>
          </label>

          {/* Rayon des bordures */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Arrondi des Cartes / Rayon</span>
              <span className="text-emerald-600 font-mono font-bold">{cv?.rayonBordure ?? 8} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={cv?.rayonBordure ?? 8}
              onChange={(e) => onUpdateCV?.({ rayonBordure: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Épaisseur des bordures */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Épaisseur des Bordures</span>
              <span className="text-emerald-600 font-mono font-bold">{cv?.epaisseurBordure ?? 0} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={cv?.epaisseurBordure ?? 0}
              onChange={(e) => onUpdateCV?.({ epaisseurBordure: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Ombre des Cartes */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Ombre des cartes / Relief :</span>
            <select
              value={cv?.ombreCarte || 'none'}
              onChange={(e) => onUpdateCV?.({ ombreCarte: e.target.value as any })}
              className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
            >
              <option value="none">Aucune ombre (Plat)</option>
              <option value="sm">Ombre légère (Subtile)</option>
              <option value="md">Ombre moyenne (Flottante)</option>
              <option value="lg">Ombre prononcée (Profonde)</option>
            </select>
          </div>
        </div>

        {/* 4. COULEURS ACCENTS & ARRIÈRE-PLANS */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Couleurs & Arrière-Plan Global</span>
          </label>

          {/* Accent Color Swatches */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Couleur Accent Principale :</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cv?.couleurAccent || '#2563EB'}
                onChange={(e) => onUpdateCV?.({ couleurAccent: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
              />
              <div className="flex flex-wrap gap-1">
                {ACCENT_COLORS.slice(0, 8).map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurAccent: c.hex })}
                    className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Accent Secondaire */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Couleur Accent Secondaire :</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cv?.couleurAccentSecondaire || '#F1F5F9'}
                onChange={(e) => onUpdateCV?.({ couleurAccentSecondaire: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
              />
              <div className="flex flex-wrap gap-1">
                {['#F1F5F9', '#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#0F172A'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurAccentSecondaire: hex })}
                    className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fond de Sidebar */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Couleur Fond de Sidebar :</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cv?.couleurFondSidebar || '#F8FAFC'}
                onChange={(e) => onUpdateCV?.({ couleurFondSidebar: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
              />
              <div className="flex flex-wrap gap-1">
                {['#F8FAFC', '#E0F2F1', '#2D2F36', '#0A2540', '#133842', '#222222', '#1E293B'].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurFondSidebar: bg })}
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: bg }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Page Background */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">Fond de Page CV :</span>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={cv?.couleurFond || '#FFFFFF'}
                onChange={(e) => {
                  onApplyPageBackground?.(e.target.value);
                  onUpdateCV?.({ couleurFond: e.target.value });
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
              />
              <div className="flex flex-wrap gap-1">
                {['#FFFFFF', '#F8FAFC', '#F1F5F9', '#FEFCE8', '#EFF6FF', '#F0FDF4', '#1E293B'].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => {
                      onApplyPageBackground?.(bg);
                      onUpdateCV?.({ couleurFond: bg });
                    }}
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: bg }}
                    title={bg}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* En-tête : Fond & Couleurs Spécifiques */}
          <div className="space-y-2 pt-2 border-t-2 border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Couleurs de l'En-tête (Profil) :
            </span>

            {/* Fond En-tête */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Fond du bloc en-tête :</span>
                {cv?.couleurFondProfil && (
                  <button
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurFondProfil: undefined })}
                    className="text-[9px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Auto / Défaut
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cv?.couleurFondProfil || cv?.couleurAccent || '#FFFFFF'}
                  onChange={(e) => onUpdateCV?.({ couleurFondProfil: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {['#FFFFFF', '#0A2540', '#0F172A', '#1E40AF', '#0D9488', '#EA580C', 'transparent'].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => onUpdateCV?.({ couleurFondProfil: bg })}
                      className="w-5 h-5 rounded border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                      style={{ backgroundColor: bg === 'transparent' ? '#FFFFFF' : bg }}
                      title={bg === 'transparent' ? 'Transparent' : bg}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Couleur Nom / Prénom */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Couleur Nom / Prénom :</span>
                {cv?.couleurTitrePrincipal && (
                  <button
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurTitrePrincipal: undefined })}
                    className="text-[9px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cv?.couleurTitrePrincipal || '#0F172A'}
                  onChange={(e) => onUpdateCV?.({ couleurTitrePrincipal: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {['#FFFFFF', '#0F172A', '#1E40AF', '#0D9488', '#EA580C', '#D97706'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdateCV?.({ couleurTitrePrincipal: hex })}
                      className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Couleur Titre de Poste / Sous-titre */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Couleur Titre de Poste (Sous-titre) :</span>
                {cv?.couleurSousTitrePrincipal && (
                  <button
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurSousTitrePrincipal: undefined })}
                    className="text-[9px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cv?.couleurSousTitrePrincipal || cv?.couleurAccentSecondaire || '#38BDF8'}
                  onChange={(e) => onUpdateCV?.({ couleurSousTitrePrincipal: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {['#38BDF8', '#F59E0B', '#10B981', '#64748B', '#FFFFFF', '#0284C7'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdateCV?.({ couleurSousTitrePrincipal: hex })}
                      className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Couleur Texte général Profil */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Texte général profil & résumé :</span>
                {cv?.couleurTexteProfil && (
                  <button
                    type="button"
                    onClick={() => onUpdateCV?.({ couleurTexteProfil: undefined })}
                    className="text-[9px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cv?.couleurTexteProfil || '#334155'}
                  onChange={(e) => onUpdateCV?.({ couleurTexteProfil: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {['#FFFFFF', '#E2E8F0', '#0F172A', '#334155', '#475569'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdateCV?.({ couleurTexteProfil: hex })}
                      className="w-5 h-5 rounded border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. COLONNES & MISE EN PAGE */}
        <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl space-y-3">
          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
            <Columns className="w-4 h-4 text-purple-600" />
            <span>Structure des Colonnes</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateCV?.({ nombreColonnes: 1 })}
              className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                cv?.nombreColonnes === 1
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-purple-200 text-slate-700 dark:text-slate-300'
              }`}
            >
              1 Colonne (Plein)
            </button>
            <button
              type="button"
              onClick={() => onUpdateCV?.({ nombreColonnes: 2 })}
              className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                (cv?.nombreColonnes || 2) === 2
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-purple-200 text-slate-700 dark:text-slate-300'
              }`}
            >
              2 Colonnes (Sidebar)
            </button>
          </div>

          {(cv?.nombreColonnes || 2) === 2 && (
            <div className="space-y-1 pt-1 border-t border-purple-200/60 dark:border-purple-800/60">
              <div className="flex justify-between text-[11px] font-bold">
                <span>Largeur Sidebar Gauche</span>
                <span className="text-purple-600 font-mono font-bold">{cv?.largeurColonneGauche || 32}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={50}
                value={cv?.largeurColonneGauche || 32}
                onChange={(e) => onUpdateCV?.({ largeurColonneGauche: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        <p className="text-[10px] text-slate-400 text-center italic">
          Cliquez directement sur n'importe quel texte ou bloc du CV pour régler ses paramètres spécifiques.
        </p>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: AN ELEMENT IS CURRENTLY SELECTED -> ELEMENT INSPECTOR STUDIO
  // =========================================================================
  const { id, type, x, y, width, height, style, locked, zIndex, content } = selectedElement;

  const updateStyle = (key: keyof ElementStyle, value: any) => {
    onUpdateElement({
      ...selectedElement,
      style: {
        ...(selectedElement.style || {}),
        [key]: value
      }
    });
  };

  const updateContent = (contentPatch: any) => {
    onUpdateElement({
      ...selectedElement,
      content: typeof content === 'object' ? { ...content, ...contentPatch } : contentPatch
    });
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 shadow-lg text-slate-800 dark:text-slate-200 text-xs">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. ELEMENT HEADER & ACTIONS */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
            Élément: {type}
          </span>
          <p className="text-[11px] font-mono font-bold mt-0.5 truncate max-w-[140px] text-slate-500">{id}</p>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onUpdateElement({ ...selectedElement, locked: !locked })}
            title={locked ? 'Déverrouiller' : 'Verrouiller'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              locked ? 'bg-amber-500 text-white border-amber-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDuplicateElement(id)}
            title="Dupliquer"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(id)}
            title="Supprimer"
            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC CONTENT SECTION */}
      <div className="space-y-3 p-3 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-800 rounded-xl">
        <label className="block text-[11px] font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Contenu & Données</span>
          </span>
        </label>

        {/* Text Area Content */}
        {type === 'text' && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Texte du bloc :</span>
            <textarea
              rows={3}
              value={typeof content === 'string' ? content : content?.text || ''}
              onChange={(e) => onUpdateElement({ ...selectedElement, content: e.target.value })}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Saisissez votre texte..."
            />
          </div>
        )}

        {/* Photo / Image Element Controls */}
        {(type === 'image' || (type === 'section' && content?.section === undefined)) && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-medium">Photo / Image :</span>
            <div className="flex items-center space-x-3">
              {(content?.photoUrl || content?.src) ? (
                <img
                  src={content?.photoUrl || content?.src}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Changer l'image</span>
              </button>
            </div>
          </div>
        )}

        {/* List Content Editor */}
        {type === 'list' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">Puces de la liste :</span>
              <button
                type="button"
                onClick={() => {
                  const currentItems = content?.items || [{ id: '1', text: 'Point 1', level: 0 }];
                  const items = currentItems.map((it: any, i: number) =>
                    typeof it === 'string' ? { id: `item-${i}`, text: it, level: 0 } : it
                  );
                  items.push({ id: `item-${Date.now()}`, text: 'Nouvelle puce', level: 0 });
                  updateContent({ items });
                }}
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Puce</span>
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {(content?.items || []).map((it: any, idx: number) => {
                const itemObj = typeof it === 'string' ? { id: `item-${idx}`, text: it, level: 0 } : it;
                return (
                  <div key={itemObj.id || `prop-item-${idx}`} className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg">
                    <input
                      type="text"
                      value={itemObj.text || ''}
                      onChange={(e) => {
                        const items = [...(content?.items || [])];
                        items[idx] = { ...itemObj, text: e.target.value };
                        updateContent({ items });
                      }}
                      className="flex-1 px-1 py-0.5 text-xs bg-transparent border-none outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = (content?.items || []).filter((_: any, i: number) => i !== idx);
                        updateContent({ items });
                      }}
                      className="text-red-500 hover:text-red-700 px-1 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. TYPOGRAPHIE, INTERLIGNES & ALIGNEMENT DE L'ÉLÉMENT */}
      <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-4 h-4 text-blue-600" />
          <span>Formatage de Texte & Interligne</span>
        </label>

        {/* Police */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block">Police de caractères :</span>
          <select
            value={style?.fontFamily || cv?.police || 'Inter'}
            onChange={(e) => updateStyle('fontFamily', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-bold cursor-pointer text-xs"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Taille de Police & Casse */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Taille (pt):</span>
            <input
              type="number"
              min={6}
              max={54}
              value={style?.fontSize || 10}
              onChange={(e) => updateStyle('fontSize', parseFloat(e.target.value) || 10)}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-bold text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Casse:</span>
            <select
              value={style?.textTransform || 'none'}
              onChange={(e) => updateStyle('textTransform', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-bold text-xs cursor-pointer"
            >
              <option value="none">Normal</option>
              <option value="uppercase">MAJUSCULE</option>
              <option value="capitalize">Capitale</option>
            </select>
          </div>
        </div>

        {/* Text Formatting Buttons (Gras, Italique, Souligné, Barré) */}
        <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => updateStyle('fontWeight', style?.fontWeight === 'bold' ? 'normal' : 'bold')}
            className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
              style?.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Gras"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateStyle('fontStyle', style?.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
              style?.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Italique"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateStyle('textDecoration', style?.textDecoration === 'underline' ? 'none' : 'underline')}
            className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
              style?.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Souligné"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateStyle('textDecoration', style?.textDecoration === 'line-through' ? 'none' : 'line-through')}
            className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
              style?.textDecoration === 'line-through' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Barré"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* INTERLIGNE (LINE HEIGHT) SLIDER */}
        <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-blue-600" />
              <span>Interligne du bloc</span>
            </span>
            <span className="text-blue-600 font-mono font-bold">{(style?.lineHeight || 1.4).toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={2.5}
            step={0.05}
            value={style?.lineHeight || 1.4}
            onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* ESPACEMENT DES LETTRES (TRACKING / LETTER SPACING) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span>Espacement Inter-lettres</span>
            <span className="text-blue-600 font-mono font-bold">{style?.letterSpacing || 0} px</span>
          </div>
          <input
            type="range"
            min={-2}
            max={10}
            step={0.5}
            value={style?.letterSpacing || 0}
            onChange={(e) => updateStyle('letterSpacing', parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* ALIGNEMENT DU TEXTE */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block">Alignement :</span>
          <div className="grid grid-cols-4 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => updateStyle('textAlign', 'left')}
              className={`py-1 rounded flex justify-center cursor-pointer ${
                (style?.textAlign || 'left') === 'left' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
              title="Gauche"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'center')}
              className={`py-1 rounded flex justify-center cursor-pointer ${
                style?.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
              title="Centrer"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'right')}
              className={`py-1 rounded flex justify-center cursor-pointer ${
                style?.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
              title="Droite"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'justify')}
              className={`py-1 rounded flex justify-center cursor-pointer ${
                style?.textAlign === 'justify' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
              title="Justifier"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. COULEURS & FOND DE L'ÉLÉMENT */}
      <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Couleurs & Arrière-Plan</span>
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Couleur Texte:</span>
            <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-white dark:bg-slate-900">
              <input
                type="color"
                value={style?.color || '#1E293B'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[10px] font-mono">{style?.color || '#1E293B'}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Fond de bloc:</span>
            <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-white dark:bg-slate-900">
              <input
                type="color"
                value={style?.backgroundColor || '#FFFFFF'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[10px] font-mono">{style?.backgroundColor || '#FFFFFF'}</span>
            </div>
          </div>
        </div>

        {/* Opacity slider */}
        <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span>Opacité</span>
            <span className="text-amber-500 font-mono">{Math.round((style?.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round((style?.opacity ?? 1) * 100)}
            onChange={(e) => updateStyle('opacity', parseInt(e.target.value, 10) / 100)}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 5. BORDURES, COULEURS DE BORDURE & ARRONDIS */}
      <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Square className="w-4 h-4 text-blue-600" />
          <span>Bordures, Couleurs & Arrondis</span>
        </label>

        {/* Border Color & Style */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Couleur Bordure:</span>
            <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-white dark:bg-slate-900">
              <input
                type="color"
                value={style?.borderColor || '#2563EB'}
                onChange={(e) => updateStyle('borderColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[10px] font-mono">{style?.borderColor || '#2563EB'}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Style de Trait:</span>
            <select
              value={style?.borderStyle || 'solid'}
              onChange={(e) => updateStyle('borderStyle', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="solid">Plein (Solid)</option>
              <option value="dashed">Tirets (Dashed)</option>
              <option value="dotted">Pointillé (Dotted)</option>
              <option value="double">Double (Double)</option>
              <option value="none">Aucun (None)</option>
            </select>
          </div>
        </div>

        {/* Épaisseur de Bordure */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span>Épaisseur de Bordure</span>
            <span className="text-blue-600 font-mono font-bold">{style?.borderWidth || 0} px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={style?.borderWidth || 0}
            onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Arrondi des Angles / Radius */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span>Arrondi des Angles (Radius)</span>
            <span className="text-blue-600 font-mono font-bold">{style?.borderRadius || 0} px</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            value={style?.borderRadius || 0}
            onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Ombre Portée / Shadow */}
        <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 block">Ombre / Élévation :</span>
          <select
            value={style?.shadow || 'none'}
            onChange={(e) => updateStyle('shadow', e.target.value)}
            className="w-full p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="none">Aucune ombre</option>
            <option value="sm">Ombre légère</option>
            <option value="md">Ombre moyenne</option>
            <option value="lg">Ombre prononcée</option>
          </select>
        </div>
      </div>

      {/* 6. POSITION & DIMENSIONS PRÉCISES */}
      <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Position & Dimensions (px)</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">X:</span>
            <input
              type="number"
              value={Math.round(x)}
              onChange={(e) => onUpdateElement({ ...selectedElement, x: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Y:</span>
            <input
              type="number"
              value={Math.round(y)}
              onChange={(e) => onUpdateElement({ ...selectedElement, y: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Largeur:</span>
            <input
              type="number"
              value={Math.round(width)}
              onChange={(e) => onUpdateElement({ ...selectedElement, width: Math.max(20, parseFloat(e.target.value) || 20) })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Hauteur:</span>
            <input
              type="number"
              value={Math.round(height || 40)}
              onChange={(e) => onUpdateElement({ ...selectedElement, height: Math.max(10, parseFloat(e.target.value) || 10) })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-mono font-bold"
            />
          </div>
        </div>

        {/* Quick alignment */}
        <div className="grid grid-cols-3 gap-1 pt-1">
          <button
            onClick={() => onAlignElement('left')}
            className="py-1 text-[10px] font-bold rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer"
          >
            <AlignLeft className="w-3 h-3" />
            <span>Gauche</span>
          </button>
          <button
            onClick={() => onAlignElement('center')}
            className="py-1 text-[10px] font-bold rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer"
          >
            <AlignCenter className="w-3 h-3" />
            <span>Centre</span>
          </button>
          <button
            onClick={() => onAlignElement('right')}
            className="py-1 text-[10px] font-bold rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer"
          >
            <AlignRight className="w-3 h-3" />
            <span>Droite</span>
          </button>
        </div>
      </div>

      {/* 7. CALQUES & PROFONDEUR */}
      <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Ordre des Calques (Z-Index)</span>
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateElement({ ...selectedElement, zIndex: zIndex + 1 })}
            className="flex-1 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
          >
            <MoveUp className="w-3.5 h-3.5" />
            <span>Avancer</span>
          </button>
          <button
            onClick={() => onUpdateElement({ ...selectedElement, zIndex: Math.max(0, zIndex - 1) })}
            className="flex-1 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
          >
            <MoveDown className="w-3.5 h-3.5" />
            <span>Reculer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
