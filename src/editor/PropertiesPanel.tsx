import React, { useRef } from 'react';
import { CVElement, ElementStyle } from '../types/document';
import { FONT_OPTIONS } from '../data/templates';
import { ExperienceItem, FormationItem, CompetenceItem, LangueItem, Section } from '../types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
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
  FileText
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
  onAddElement
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedElement) {
    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 shadow-lg text-slate-800 dark:text-slate-200">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              onAddElement?.('image', { src: dataUrl, alt: 'Photo de profil' }, { width: 120, height: 120, borderRadius: 9999 });
            };
            reader.readAsDataURL(file);
          }}
          accept="image/*"
          className="hidden"
        />

        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
            Propriétés du Document
          </span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Personnalisation globale du CV :
          </p>
        </div>

        {/* Global Page Background */}
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
          <label className="text-xs font-bold flex items-center justify-between text-slate-700 dark:text-slate-200">
            <span>Arrière-plan du CV</span>
            <Palette className="w-4 h-4 text-blue-600" />
          </label>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="color"
              onChange={(e) => onApplyPageBackground?.(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 shrink-0"
              title="Choisir la couleur d'arrière-plan"
            />
            <div className="flex flex-wrap gap-1">
              {['#FFFFFF', '#F8FAFC', '#F1F5F9', '#FEFCE8', '#EFF6FF', '#F0FDF4', '#1E293B'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => onApplyPageBackground?.(bg)}
                  className="w-6 h-6 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: bg }}
                  title={bg}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Global Font Family */}
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
          <label className="text-xs font-bold flex items-center justify-between text-slate-700 dark:text-slate-200">
            <span>Police globale du CV</span>
            <Type className="w-4 h-4 text-blue-600" />
          </label>
          <select
            onChange={(e) => onApplyFontToAll?.(e.target.value)}
            className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Import Photo Button */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
          <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Photo de profil</span>
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importer une photo</span>
          </button>
        </div>

        {/* Layout Column Separator */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl space-y-2">
          <label className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
            <Columns className="w-4 h-4 text-purple-600" />
            <span>Séparer le CV en Colonnes</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddTwoColumnSection?.(30, 70)}
              className="p-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 hover:border-purple-600 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs text-center"
            >
              2 Colonnes (30/70)
            </button>
            <button
              onClick={() => onAddTwoColumnSection?.(40, 60)}
              className="p-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 hover:border-purple-600 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs text-center"
            >
              2 Colonnes (40/60)
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic pt-2">
          Cliquez sur un élément sur le CV pour modifier ses propriétés spécifiques.
        </p>
      </div>
    );
  }

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

  // Image Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'image') {
        updateContent({ src: dataUrl });
      } else if (type === 'section' || type === 'text') {
        updateContent({ photoUrl: dataUrl, showPhoto: true });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 shadow-lg text-slate-800 dark:text-slate-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Element Header Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
            Élément: {type}
          </span>
          <p className="text-xs font-bold mt-1 truncate max-w-[150px]">{id}</p>
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

      {/* DYNAMIC CONTENT EDITOR SECTION */}
      <div className="space-y-3 p-3 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-800 rounded-xl">
        <label className="block text-[11px] font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Éditer le Contenu</span>
          </span>
        </label>

        {/* 1. TEXT ELEMENT CONTENT */}
        {type === 'text' && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-medium">Texte du bloc:</span>
            <textarea
              rows={3}
              value={typeof content === 'string' ? content : content?.text || ''}
              onChange={(e) => onUpdateElement({ ...selectedElement, content: e.target.value })}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Saisissez votre texte..."
            />
          </div>
        )}

        {/* 2. LIST ELEMENT CONTROLS */}
        {type === 'list' && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-medium block mb-1">Style des puces:</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'disc', label: '• Disque' },
                  { id: 'square', label: '■ Carré' },
                  { id: 'arrow', label: '➢ Flèche' },
                  { id: 'check', label: '✓ Coche' },
                  { id: 'star', label: '★ Étoile' },
                  { id: 'dash', label: '- Tiret' },
                  { id: 'numbered', label: '1. Nombres' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => updateContent({ bulletStyle: b.id, type: b.id === 'numbered' ? 'numbered' : 'bullet' })}
                    className={`px-1.5 py-1 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                      (content?.bulletStyle || content?.type) === b.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-medium block mb-1">Titre de la liste (optionnel):</span>
              <input
                type="text"
                value={content?.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="ex: Projets majeurs..."
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Éléments de la liste:</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentItems = content?.items || [
                      { id: '1', text: 'Premier point', level: 0 }
                    ];
                    const items = currentItems.map((it: any, i: number) =>
                      typeof it === 'string' ? { id: `item-${i}`, text: it, level: 0 } : it
                    );
                    items.push({ id: `item-${Date.now()}`, text: 'Nouvel élément', level: 0 });
                    updateContent({ items });
                  }}
                  className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Puce</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(content?.items || []).map((it: any, idx: number) => {
                  const itemObj = typeof it === 'string' ? { id: `item-${idx}`, text: it, level: 0 } : it;
                  return (
                    <div key={itemObj.id || idx} className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...(content?.items || [])];
                          const curLevel = itemObj.level || 0;
                          items[idx] = { ...itemObj, level: Math.max(0, curLevel - 1) };
                          updateContent({ items });
                        }}
                        className="px-1 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-bold"
                        title="Désindenter"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...(content?.items || [])];
                          const curLevel = itemObj.level || 0;
                          items[idx] = { ...itemObj, level: Math.min(2, curLevel + 1) };
                          updateContent({ items });
                        }}
                        className="px-1 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-bold"
                        title="Indenter"
                      >
                        →
                      </button>
                      <input
                        type="text"
                        value={itemObj.text || ''}
                        onChange={(e) => {
                          const items = [...(content?.items || [])];
                          items[idx] = { ...itemObj, text: e.target.value };
                          updateContent({ items });
                        }}
                        className="flex-1 px-1.5 py-0.5 text-xs bg-transparent border-none outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = (content?.items || []).filter((_: any, i: number) => i !== idx);
                          updateContent({ items });
                        }}
                        className="text-red-500 hover:text-red-700 px-1 font-bold cursor-pointer"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. IMAGE ELEMENT / PHOTO */}
        {(type === 'image' || (type === 'section' && content?.section === undefined)) && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-medium">Photo de profil:</span>
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
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importer une Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. SECTION CONTENT (Profil, Experience, Formation, Competences, etc.) */}
        {type === 'section' && content?.section && (
          <div className="space-y-3 text-xs">
            {/* Section Title */}
            <div>
              <span className="text-[10px] text-slate-500 font-medium block mb-1">Titre de la section:</span>
              <input
                type="text"
                value={content.section.titre || ''}
                onChange={(e) => {
                  const updatedSec: Section = { ...content.section, titre: e.target.value };
                  updateContent({ section: updatedSec });
                }}
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            {/* Profil / Contact fields */}
            {content.section.type === 'profil' && (
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Résumé / Profil professionnel:</span>
                  <textarea
                    rows={3}
                    value={content.section.contenu?.resume || ''}
                    onChange={(e) => {
                      const updatedSec: Section = {
                        ...content.section,
                        contenu: { ...content.section.contenu, resume: e.target.value }
                      };
                      updateContent({ section: updatedSec });
                    }}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Email:</span>
                    <input
                      type="text"
                      value={content.section.contenu?.email || ''}
                      onChange={(e) => {
                        const updatedSec: Section = {
                          ...content.section,
                          contenu: { ...content.section.contenu, email: e.target.value }
                        };
                        updateContent({ section: updatedSec });
                      }}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Téléphone:</span>
                    <input
                      type="text"
                      value={content.section.contenu?.telephone || ''}
                      onChange={(e) => {
                        const updatedSec: Section = {
                          ...content.section,
                          contenu: { ...content.section.contenu, telephone: e.target.value }
                        };
                        updateContent({ section: updatedSec });
                      }}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Experience Items */}
            {content.section.type === 'experience' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">Postes ({Array.isArray(content.section.contenu) ? content.section.contenu.length : 0}):</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items: ExperienceItem[] = Array.isArray(content.section.contenu) ? [...content.section.contenu] : [];
                      items.push({
                        id: `exp-${Date.now()}`,
                        poste: 'Intitulé du Poste',
                        entreprise: 'Entreprise',
                        ville: '',
                        dateDebut: '2023',
                        dateFin: 'Présent',
                        actuel: true,
                        description: 'Missions et réalisations clés.'
                      });
                      updateContent({ section: { ...content.section, contenu: items } });
                    }}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter Poste</span>
                  </button>
                </div>

                {Array.isArray(content.section.contenu) && content.section.contenu.map((exp: ExperienceItem, idx: number) => (
                  <div key={exp.id || idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1.5 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const items = (content.section.contenu as ExperienceItem[]).filter((_, i) => i !== idx);
                        updateContent({ section: { ...content.section, contenu: items } });
                      }}
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                      title="Supprimer cette expérience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Intitulé du Poste"
                      value={exp.poste || ''}
                      onChange={(e) => {
                        const items = [...(content.section.contenu as ExperienceItem[])];
                        items[idx] = { ...items[idx], poste: e.target.value };
                        updateContent({ section: { ...content.section, contenu: items } });
                      }}
                      className="w-full px-1.5 py-1 font-bold border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="Entreprise"
                        value={exp.entreprise || ''}
                        onChange={(e) => {
                          const items = [...(content.section.contenu as ExperienceItem[])];
                          items[idx] = { ...items[idx], entreprise: e.target.value };
                          updateContent({ section: { ...content.section, contenu: items } });
                        }}
                        className="px-1.5 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Dates (ex: 2022 - 2024)"
                        value={`${exp.dateDebut || ''} ${exp.dateFin ? `- ${exp.dateFin}` : ''}`.trim()}
                        onChange={(e) => {
                          const items = [...(content.section.contenu as ExperienceItem[])];
                          items[idx] = { ...items[idx], dateDebut: e.target.value, dateFin: '' };
                          updateContent({ section: { ...content.section, contenu: items } });
                        }}
                        className="px-1.5 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Description des tâches / résultats"
                      value={exp.description || ''}
                      onChange={(e) => {
                        const items = [...(content.section.contenu as ExperienceItem[])];
                        items[idx] = { ...items[idx], description: e.target.value };
                        updateContent({ section: { ...content.section, contenu: items } });
                      }}
                      className="w-full p-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Formation Items */}
            {content.section.type === 'formation' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">Formations ({Array.isArray(content.section.contenu) ? content.section.contenu.length : 0}):</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items: FormationItem[] = Array.isArray(content.section.contenu) ? [...content.section.contenu] : [];
                      items.push({
                        id: `edu-${Date.now()}`,
                        diplome: 'Diplôme / Formation',
                        etablissement: 'École / Université',
                        ville: '',
                        dateDebut: '2020',
                        dateFin: '2023'
                      });
                      updateContent({ section: { ...content.section, contenu: items } });
                    }}
                    className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter Formation</span>
                  </button>
                </div>

                {Array.isArray(content.section.contenu) && content.section.contenu.map((edu: FormationItem, idx: number) => (
                  <div key={edu.id || idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1.5 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const items = (content.section.contenu as FormationItem[]).filter((_, i) => i !== idx);
                        updateContent({ section: { ...content.section, contenu: items } });
                      }}
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Diplôme"
                      value={edu.diplome || ''}
                      onChange={(e) => {
                        const items = [...(content.section.contenu as FormationItem[])];
                        items[idx] = { ...items[idx], diplome: e.target.value };
                        updateContent({ section: { ...content.section, contenu: items } });
                      }}
                      className="w-full px-1.5 py-1 font-bold border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="Établissement"
                        value={edu.etablissement || ''}
                        onChange={(e) => {
                          const items = [...(content.section.contenu as FormationItem[])];
                          items[idx] = { ...items[idx], etablissement: e.target.value };
                          updateContent({ section: { ...content.section, contenu: items } });
                        }}
                        className="px-1.5 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Années"
                        value={`${edu.dateDebut || ''} ${edu.dateFin ? `- ${edu.dateFin}` : ''}`.trim()}
                        onChange={(e) => {
                          const items = [...(content.section.contenu as FormationItem[])];
                          items[idx] = { ...items[idx], dateDebut: e.target.value };
                          updateContent({ section: { ...content.section, contenu: items } });
                        }}
                        className="px-1.5 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Competences Items */}
            {content.section.type === 'competences' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">Compétences:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items: CompetenceItem[] = Array.isArray(content.section.contenu) ? [...content.section.contenu] : [];
                      items.push({
                        id: `sk-${Date.now()}`,
                        nom: 'Nouvelle Compétence',
                        niveau: 4
                      });
                      updateContent({ section: { ...content.section, contenu: items } });
                    }}
                    className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(content.section.contenu) && content.section.contenu.map((sk: CompetenceItem, idx: number) => (
                    <div key={sk.id || idx} className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1.5 py-1">
                      <input
                        type="text"
                        value={sk.nom || ''}
                        onChange={(e) => {
                          const items = [...(content.section.contenu as CompetenceItem[])];
                          items[idx] = { ...items[idx], nom: e.target.value };
                          updateContent({ section: { ...content.section, contenu: items } });
                        }}
                        className="w-24 text-xs font-bold outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = (content.section.contenu as CompetenceItem[]).filter((_, i) => i !== idx);
                          updateContent({ section: { ...content.section, contenu: items } });
                        }}
                        className="text-red-500 hover:text-red-700 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 4. TWO-COLUMN LAYOUT EDITOR */}
        {type === 'two-column' && (
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 block">Répartition des Colonnes:</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { l: 30, r: 70, label: '30 / 70' },
                { l: 40, r: 60, label: '40 / 60' },
                { l: 50, r: 50, label: '50 / 50' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateContent({ leftWidthPercent: preset.l, rightWidthPercent: preset.r })}
                  className={`py-1 rounded font-bold border transition-all cursor-pointer ${
                    content?.leftWidthPercent === preset.l ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Alignments */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Alignement Rapide sur la Page
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <button
            onClick={() => onAlignElement('left')}
            className="py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Gauche"
          >
            <AlignLeft className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            onClick={() => onAlignElement('center')}
            className="py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Centrer"
          >
            <AlignCenter className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            onClick={() => onAlignElement('right')}
            className="py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Droite"
          >
            <AlignRight className="w-3.5 h-3.5 mx-auto" />
          </button>
        </div>
      </div>

      {/* Geometry Position & Size */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Maximize2 className="w-3 h-3" />
          <span>Position & Dimensions (px)</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">X:</span>
            <input
              type="number"
              value={Math.round(x)}
              onChange={(e) => onUpdateElement({ ...selectedElement, x: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Y:</span>
            <input
              type="number"
              value={Math.round(y)}
              onChange={(e) => onUpdateElement({ ...selectedElement, y: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Largeur:</span>
            <input
              type="number"
              value={Math.round(width)}
              onChange={(e) => onUpdateElement({ ...selectedElement, width: Math.max(20, parseFloat(e.target.value) || 20) })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Hauteur:</span>
            <input
              type="number"
              value={Math.round(height || 40)}
              onChange={(e) => onUpdateElement({ ...selectedElement, height: Math.max(10, parseFloat(e.target.value) || 10) })}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Type className="w-3 h-3" />
          <span>Typographie</span>
        </label>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Police:</span>
            <select
              value={style?.fontFamily || 'Inter'}
              onChange={(e) => updateStyle('fontFamily', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-bold cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Taille (pt):</span>
              <input
                type="number"
                min={6}
                max={48}
                value={style?.fontSize || 10}
                onChange={(e) => updateStyle('fontSize', parseFloat(e.target.value) || 10)}
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Casse:</span>
              <select
                value={style?.textTransform || 'none'}
                onChange={(e) => updateStyle('textTransform', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-bold cursor-pointer"
              >
                <option value="none">Normal</option>
                <option value="uppercase">MAJUSCULE</option>
                <option value="capitalize">Capitale</option>
              </select>
            </div>
          </div>

          {/* Text Style Buttons */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => updateStyle('fontWeight', style?.fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
                style?.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('fontStyle', style?.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
                style?.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('textDecoration', style?.textDecoration === 'underline' ? 'none' : 'underline')}
              className={`flex-1 py-1 text-xs font-bold rounded flex justify-center cursor-pointer ${
                style?.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Palette className="w-3 h-3" />
          <span>Couleurs de l'Élément</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Texte:</span>
            <div className="flex items-center space-x-2 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-800">
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
            <div className="flex items-center space-x-2 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-800">
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
      </div>

      {/* Opacity Control */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span>Opacité ({Math.round((style?.opacity ?? 1) * 100)}%)</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={Math.round((style?.opacity ?? 1) * 100)}
          onChange={(e) => updateStyle('opacity', parseInt(e.target.value, 10) / 100)}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Layering & Depth */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span>Ordre d'Affichage (Z-Index)</span>
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateElement({ ...selectedElement, zIndex: zIndex + 1 })}
            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
          >
            <MoveUp className="w-3.5 h-3.5" />
            <span>Avancer</span>
          </button>
          <button
            onClick={() => onUpdateElement({ ...selectedElement, zIndex: Math.max(0, zIndex - 1) })}
            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
          >
            <MoveDown className="w-3.5 h-3.5" />
            <span>Reculer</span>
          </button>
        </div>
      </div>

    </div>
  );
};

