import React from 'react';
import { CVElement, ElementStyle } from '../types/document';
import { FONT_OPTIONS } from '../data/templates';
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
  Sliders
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: CVElement | null;
  onUpdateElement: (updated: CVElement) => void;
  onDuplicateElement: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onAlignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  pageWidth: number;
  pageHeight: number;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onAlignElement,
  pageWidth,
  pageHeight
}) => {
  if (!selectedElement) {
    return (
      <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 shrink-0 select-none">
        <Sliders className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aucun élément sélectionné</p>
        <p className="text-[11px] mt-1 opacity-80">Cliquez sur un élément du CV pour ajuster ses propriétés (taille, couleur, police, position).</p>
      </div>
    );
  }

  const { id, type, x, y, width, height, style, locked, zIndex } = selectedElement;

  const updateStyle = (key: keyof ElementStyle, value: any) => {
    onUpdateElement({
      ...selectedElement,
      style: {
        ...selectedElement.style,
        [key]: value
      }
    });
  };

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 shadow-lg text-slate-800 dark:text-slate-200">
      
      {/* Element Header Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
            {type}
          </span>
          <p className="text-xs font-bold mt-1 truncate max-w-[140px]">{id}</p>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onUpdateElement({ ...selectedElement, locked: !locked })}
            title={locked ? 'Déverrouiller' : 'Verrouiller'}
            className={`p-1.5 rounded-lg border transition-colors ${
              locked ? 'bg-amber-500 text-white border-amber-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDuplicateElement(id)}
            title="Dupliquer"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(id)}
            title="Supprimer"
            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alignments */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Alignement Rapide
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <button
            onClick={() => onAlignElement('left')}
            className="py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Gauche"
          >
            <AlignLeft className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            onClick={() => onAlignElement('center')}
            className="py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Centrer"
          >
            <AlignCenter className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            onClick={() => onAlignElement('right')}
            className="py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
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
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-bold"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.name} value={f.name}>
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
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none font-bold"
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
              className={`flex-1 py-1 text-xs font-bold rounded flex justify-center ${
                style?.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('fontStyle', style?.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`flex-1 py-1 text-xs font-bold rounded flex justify-center ${
                style?.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateStyle('textDecoration', style?.textDecoration === 'underline' ? 'none' : 'underline')}
              className={`flex-1 py-1 text-xs font-bold rounded flex justify-center ${
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
          <span>Couleurs & Arrière-Plan</span>
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
            <span className="text-[10px] text-slate-400 block mb-0.5">Fond:</span>
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

      {/* Layering & Depth */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span>Ordre d'Affichage (Z-Index)</span>
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateElement({ ...selectedElement, zIndex: zIndex + 1 })}
            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center justify-center space-x-1"
          >
            <MoveUp className="w-3.5 h-3.5" />
            <span>Avancer</span>
          </button>
          <button
            onClick={() => onUpdateElement({ ...selectedElement, zIndex: Math.max(0, zIndex - 1) })}
            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center justify-center space-x-1"
          >
            <MoveDown className="w-3.5 h-3.5" />
            <span>Reculer</span>
          </button>
        </div>
      </div>

    </div>
  );
};
