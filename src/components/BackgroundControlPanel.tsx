import React from 'react';
import { Palette } from 'lucide-react';

interface BackgroundControlPanelProps {
  label: string;
  backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
  colorSolid?: string;
  opacity?: number;
  colorStart?: string;
  colorEnd?: string;
  patternName?: string;
  imageUrl?: string;
  onChange: (updates: {
    backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
    colorSolid?: string;
    opacity?: number;
    colorStart?: string;
    colorEnd?: string;
    patternName?: string;
    imageUrl?: string;
  }) => void;
}

export const BackgroundControlPanel: React.FC<BackgroundControlPanelProps> = ({
  label,
  backgroundType = 'solid',
  colorSolid = '#FFFFFF',
  opacity = 1,
  colorStart = '#3B82F6',
  colorEnd = '#1E3A8A',
  patternName = 'dots',
  imageUrl = '',
  onChange,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        onChange({
          backgroundType: 'image',
          imageUrl: evt.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
          <span>{label}</span>
        </span>
        <span className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 uppercase">
          {backgroundType}
        </span>
      </div>

      {/* Type Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-200/60 dark:bg-neutral-800 rounded-lg">
        {[
          { id: 'solid', label: 'Couleur' },
          { id: 'gradient', label: 'Dégradé' },
          { id: 'pattern', label: 'Motif' },
          { id: 'image', label: 'Image' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange({ backgroundType: tab.id as any })}
            className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
              backgroundType === tab.id
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SOLID COLOR */}
      {backgroundType === 'solid' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorSolid || '#FFFFFF'}
            onChange={(e) => onChange({ colorSolid: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">{colorSolid}</span>
        </div>
      )}

      {/* GRADIENT */}
      {backgroundType === 'gradient' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 block">Départ :</label>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="color"
                value={colorStart || '#3B82F6'}
                onChange={(e) => onChange({ colorStart: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[11px] font-mono uppercase text-neutral-800 dark:text-neutral-200">{colorStart}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-500 block">Arrivée :</label>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="color"
                value={colorEnd || '#1E3A8A'}
                onChange={(e) => onChange({ colorEnd: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[11px] font-mono uppercase text-neutral-800 dark:text-neutral-200">{colorEnd}</span>
            </div>
          </div>
        </div>
      )}

      {/* PATTERN */}
      {backgroundType === 'pattern' && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-500 block">Motif géométrique :</label>
          <select
            value={patternName || 'dots'}
            onChange={(e) => onChange({ patternName: e.target.value })}
            className="w-full p-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-bold text-neutral-900 dark:text-neutral-100"
          >
            <option value="dots">Points fins (Dots)</option>
            <option value="grid">Quadrillage (Grid)</option>
            <option value="lines">Lignes diagonales (Lines)</option>
            <option value="waves">Vagues élégantes (Waves)</option>
            <option value="hexagons">Hexagones ATS</option>
          </select>
        </div>
      )}

      {/* IMAGE */}
      {backgroundType === 'image' && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-500 block">Image d'arrière-plan :</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-xs text-neutral-600 dark:text-neutral-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white"
          />
        </div>
      )}

      {/* OPACITY SLIDER */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
          <span>Opacité de l'arrière-plan</span>
          <span className="text-neutral-900 dark:text-neutral-100">{Math.round((opacity ?? 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity ?? 1}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-100"
        />
      </div>
    </div>
  );
};
