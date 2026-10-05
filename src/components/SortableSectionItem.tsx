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
      className={`bg-white dark:bg-black rounded-xl border transition-all mb-3 overflow-hidden ${
        isDragging 
          ? 'border-black dark:border-white shadow-xl z-20 ring-2 ring-black/20 dark:ring-white/20' 
          : section.visible 
            ? 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 shadow-2xs' 
            : 'border-black/10 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-900/50 opacity-75'
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
        className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-black/10 dark:border-white/10 select-none cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors gap-2"
      >
        
        {/* Left Drag Handle & Title Input */}
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors shrink-0"
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
                className="p-1 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-25 disabled:hover:text-neutral-500 rounded transition-colors"
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
                className="p-1 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-25 disabled:hover:text-neutral-500 rounded transition-colors"
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
            className="font-bold text-black dark:text-white text-xs sm:text-sm bg-transparent border border-transparent hover:border-black/20 dark:hover:border-white/20 focus:border-black dark:focus:border-white rounded px-1.5 py-0.5 outline-hidden transition-colors flex-1 truncate"
            placeholder="Titre de la section"
          />

          {!isExpanded && summary && (
            <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded-full shrink-0 hidden sm:inline">
              {summary}
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onUpdateColonne && isTwoColumnMode && (
            <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800 p-0.5 rounded-lg border border-black/10 dark:border-white/10 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onUpdateColonne('gauche')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  section.colonne === 'gauche'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
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
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
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
              section.visible ? 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800' : 'text-neutral-400 bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            title="Dupliquer cette section"
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Supprimer la section"
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className={`p-1.5 rounded-lg transition-colors ml-0.5 cursor-pointer font-bold text-xs flex items-center gap-1 ${
              isExpanded
                ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
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
        <div className="p-4 bg-white dark:bg-black space-y-4 border-t border-black/10 dark:border-white/10 animate-fadeIn">
          {children}
        </div>
      )}

    </div>
  );
};

