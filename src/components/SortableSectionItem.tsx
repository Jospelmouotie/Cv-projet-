import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, Copy, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isTwoColumnMode?: boolean;
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
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  isTwoColumnMode = true,
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

  // Compute item count or summary for collapsed state
  const getItemSummary = () => {
    if (Array.isArray(section.contenu)) {
      return `${section.contenu.length} élément${section.contenu.length > 1 ? 's' : ''}`;
    }
    if (section.type === 'profil') return 'Infos & Contact';
    if (section.type === 'personnalisee') return 'Texte libre';
    return '';
  };

  const summary = getItemSummary();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all mb-3 overflow-hidden ${
        isDragging 
          ? 'border-blue-500 shadow-xl z-20 ring-2 ring-blue-500/20' 
          : section.visible 
            ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs' 
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 opacity-75'
      }`}
    >
      {/* Header Bar - Entire row can be clicked to toggle expand */}
      <div 
        onClick={(e) => {
          // Only expand/collapse if click wasn't on an input, select, or action button
          const target = e.target as HTMLElement;
          if (!target.closest('input') && !target.closest('select') && !target.closest('button')) {
            onToggleExpand();
          }
        }}
        className="flex items-center justify-between px-3 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 select-none cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors gap-2"
      >
        
        {/* Left Drag Handle & Title Input */}
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded transition-colors shrink-0"
            title="Glisser pour réordonner"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Quick Up/Down Move Buttons */}
          <div className="flex items-center space-x-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {onMoveUp && (
              <button
                type="button"
                disabled={isFirst}
                onClick={onMoveUp}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-25 disabled:hover:text-slate-500 rounded transition-colors"
                title="Déplacer la section vers le haut"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                disabled={isLast}
                onClick={onMoveDown}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-25 disabled:hover:text-slate-500 rounded transition-colors"
                title="Déplacer la section vers le bas"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <input
            type="text"
            value={section.titre}
            onChange={(e) => onUpdateTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 rounded px-1.5 py-0.5 outline-hidden transition-colors flex-1 truncate"
            placeholder="Titre de la section"
          />

          {!isExpanded && summary && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0 hidden sm:inline">
              {summary}
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onUpdateColonne && isTwoColumnMode && (
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/60 dark:border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onUpdateColonne('gauche')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  section.colonne === 'gauche'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                }`}
                title="Déplacer dans la Colonne Gauche (Latérale)"
              >
                ◀ Col. 1
              </button>
              <button
                type="button"
                onClick={() => onUpdateColonne('droite')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  section.colonne === 'droite'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                }`}
                title="Déplacer dans la Colonne Droite (Principale)"
              >
                ▶ Col. 2
              </button>
            </div>
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
            className={`p-1.5 rounded-lg transition-colors ml-0.5 cursor-pointer font-bold text-xs flex items-center gap-1 ${
              isExpanded
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
            }`}
            title={isExpanded ? 'Réduire la section' : 'Déplier pour éditer'}
          >
            <span className="text-[10px] hidden sm:inline">{isExpanded ? 'Fermer' : 'Éditer'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Section Content Area when expanded */}
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-900 space-y-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
          {children}
        </div>
      )}

    </div>
  );
};

