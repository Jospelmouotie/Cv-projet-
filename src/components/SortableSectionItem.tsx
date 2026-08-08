import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Section } from '../types';

interface SortableSectionItemProps {
  section: Section;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateColonne?: (colonne: 'gauche' | 'droite' | 'principale') => void;
  children: React.ReactNode;
}

export const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onUpdateTitle,
  onUpdateColonne,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-slate-900 rounded-xl border transition-all mb-3 overflow-hidden ${
        isDragging 
          ? 'border-blue-500 shadow-xl z-20 ring-2 ring-blue-500/20' 
          : section.visible 
            ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs' 
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 opacity-75'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 select-none">
        
        {/* Left Drag Handle & Title */}
        <div className="flex items-center space-x-2 flex-1 mr-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded transition-colors"
            title="Glisser pour réordonner"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={section.titre}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="font-bold text-slate-800 dark:text-slate-100 text-sm bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 rounded px-1.5 py-0.5 outline-hidden transition-colors flex-1"
            placeholder="Titre de la section"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          {onUpdateColonne && (
            <select
              value={section.colonne || 'principale'}
              onChange={(e) => onUpdateColonne(e.target.value as any)}
              className="text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 outline-hidden"
              title="Positionnement de la section (Gauche / Droite)"
            >
              <option value="principale">🎯 Principale</option>
              <option value="gauche">◀️ Gauche</option>
              <option value="droite">▶️ Droite</option>
            </select>
          )}

          <button
            type="button"
            onClick={onToggleVisibility}
            title={section.visible ? 'Masquer la section' : 'Afficher la section'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              section.visible ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800' : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
            }`}
          >
            {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            title="Dupliquer cette section"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Supprimer la section"
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Section Content Area when expanded */}
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
          {children}
        </div>
      )}

    </div>
  );
};
