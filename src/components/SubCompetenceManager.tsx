import React, { useState } from 'react';
import { SubCompetenceItem, Language } from '../types';
import { Plus, X, Star, Tag } from 'lucide-react';

interface SubCompetenceManagerProps {
  items: SubCompetenceItem[] | string[] | undefined;
  onChange: (items: SubCompetenceItem[]) => void;
  langue?: Language;
  label?: string;
  placeholder?: string;
  allowRating?: boolean;
  hideHeader?: boolean;
}

export const SubCompetenceManager: React.FC<SubCompetenceManagerProps> = ({
  items = [],
  onChange,
  langue = 'fr',
  label = 'Outils & Mots-clés associés',
  placeholder,
  allowRating = true,
  hideHeader = false
}) => {
  const isEn = langue === 'en';
  const isAr = langue === 'ar';

  const defaultPlaceholder = isEn
    ? 'Add tool (e.g. React, Docker...) press Enter or comma'
    : isAr
    ? 'أضف أداة (مثال: React, Docker...) واضغط Enter'
    : 'Ajouter un outil (ex: React, Docker...) puis Entrée ou virgule';

  // Normalize items to SubCompetenceItem[]
  const normalizedItems: SubCompetenceItem[] = (items || []).map((it, idx) => {
    if (typeof it === 'string') {
      return { id: `tool-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`, nom: it.trim() };
    }
    return it;
  }).filter(it => it.nom && it.nom.trim().length > 0);

  const [inputVal, setInputVal] = useState('');
  const [activeRatingId, setActiveRatingId] = useState<string | null>(null);

  const addTokens = (rawText: string) => {
    const tokens = rawText
      .split(/[,;\n]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tokens.length === 0) return;

    const existingNames = new Set(normalizedItems.map(i => i.nom.toLowerCase()));
    const newItems: SubCompetenceItem[] = [];

    tokens.forEach((token, i) => {
      if (!existingNames.has(token.toLowerCase())) {
        existingNames.add(token.toLowerCase());
        newItems.push({
          id: `tool-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          nom: token
        });
      }
    });

    if (newItems.length > 0) {
      onChange([...normalizedItems, ...newItems]);
    }
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTokens(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && normalizedItems.length > 0) {
      // Remove last tag when pressing backspace on empty input
      const last = normalizedItems[normalizedItems.length - 1];
      onChange(normalizedItems.filter(item => item.id !== last.id));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (paste.includes(',') || paste.includes(';') || paste.includes('\n')) {
      e.preventDefault();
      addTokens(paste);
    }
  };

  const handleRemove = (idToRemove: string) => {
    onChange(normalizedItems.filter(item => item.id !== idToRemove));
    if (activeRatingId === idToRemove) setActiveRatingId(null);
  };

  const handleSetRating = (id: string, newNote: number | undefined) => {
    onChange(
      normalizedItems.map(item => {
        if (item.id === id) {
          return {
            ...item,
            note: newNote,
            niveau: newNote ? newNote * 2 : undefined
          };
        }
        return item;
      })
    );
    setActiveRatingId(null);
  };

  return (
    <div className="space-y-1.5">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
            <span>{label}</span>
            {normalizedItems.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full font-bold">
                {normalizedItems.length}
              </span>
            )}
          </label>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            {isEn ? 'Press Enter or comma to validate' : isAr ? 'اضغط Enter أو فاصلة للإضافة' : 'Entrée ou virgule pour valider'}
          </span>
        </div>
      )}

      {/* Interactive Tag Container with embedded inline input */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus-within:border-black dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-neutral-950 transition-all min-h-[42px]">
        {normalizedItems.map((item) => {
          const isRatingOpen = activeRatingId === item.id;
          return (
            <div
              key={item.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-500 transition-all select-none group relative"
            >
              <span className="leading-none">{item.nom}</span>

              {/* Optional Rating Badge */}
              {allowRating && (
                <div className="relative">
                  <button
                    type="button"
                    title={isEn ? 'Rate mastery (1-5 stars)' : 'Noter la maîtrise (1 à 5 étoiles)'}
                    onClick={() => setActiveRatingId(isRatingOpen ? null : item.id)}
                    className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      item.note
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                        : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Star className={`w-2.5 h-2.5 ${item.note ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`} />
                    {item.note && <span className="text-[9.5px]">{item.note}</span>}
                  </button>

                  {/* Rating Dropdown Popover */}
                  {isRatingOpen && (
                    <div className="absolute top-full left-0 mt-1.5 z-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 shadow-xl flex items-center gap-1 animate-fadeIn">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSetRating(item.id, val)}
                          className={`p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors ${
                            (item.note || 0) >= val ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${(item.note || 0) >= val ? 'fill-amber-500' : ''}`} />
                        </button>
                      ))}
                      {item.note && (
                        <button
                          type="button"
                          onClick={() => handleSetRating(item.id, undefined)}
                          title="Effacer la note"
                          className="text-[10px] text-neutral-400 hover:text-red-500 px-1.5 py-0.5 ml-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Delete chip button */}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                title="Supprimer"
                className="p-0.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Seamless inline input */}
        <div className="flex-1 min-w-[140px] flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputVal.trim()) addTokens(inputVal);
            }}
            placeholder={normalizedItems.length === 0 ? (placeholder || defaultPlaceholder) : '+ Ajouter...'}
            className="w-full py-1 px-1.5 text-xs bg-transparent text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none font-medium"
          />
          {inputVal.trim() && (
            <button
              type="button"
              onClick={() => addTokens(inputVal)}
              className="px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg text-[11px] font-bold shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
