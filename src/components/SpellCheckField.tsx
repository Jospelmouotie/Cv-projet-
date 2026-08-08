import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { checkTextSpelling, SpellError } from '../utils/spellcheck';
import { AlertCircle, Check, X, Bold, Italic } from 'lucide-react';

interface SpellCheckFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  langue: Language;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

export const SpellCheckField: React.FC<SpellCheckFieldProps> = ({
  label,
  value,
  onChange,
  langue,
  multiline = false,
  rows = 3,
  placeholder = ''
}) => {
  const [activeError, setActiveError] = useState<SpellError | null>(null);
  const [ignoredWords, setIgnoredWords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const errors = checkTextSpelling(value, langue, ignoredWords);

  const applyFormatting = (format: 'bold' | 'italic') => {
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const wrapper = format === 'bold' ? '**' : '*';

    let selectedText = value.substring(start, end);
    if (!selectedText) {
      selectedText = format === 'bold' ? 'texte gras' : 'texte italique';
    }

    // Toggle formatting if already wrapped
    const isWrapped = selectedText.startsWith(wrapper) && selectedText.endsWith(wrapper) && selectedText.length > wrapper.length * 2;
    let newSelectedText = '';
    if (isWrapped) {
      newSelectedText = selectedText.substring(wrapper.length, selectedText.length - wrapper.length);
    } else {
      newSelectedText = `${wrapper}${selectedText}${wrapper}`;
    }

    const newValue = value.substring(0, start) + newSelectedText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start, start + newSelectedText.length);
      }
    }, 50);
  };

  const applySuggestion = (err: SpellError, suggestion: string) => {
    const before = value.substring(0, err.startIndex);
    const after = value.substring(err.endIndex);
    const newValue = before + suggestion + after;
    onChange(newValue);
    setActiveError(null);
  };

  const ignoreWord = (word: string) => {
    setIgnoredWords(prev => [...prev, word]);
    setActiveError(null);
  };

  return (
    <div className="space-y-1.5 relative">
      <div className="flex items-center justify-between">
        {label ? (
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        ) : <span />}

        <div className="flex items-center gap-1.5">
          {/* Quick Selection Formatting Buttons (G / I) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="px-2 py-0.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer flex items-center gap-0.5"
              title="Sélectionnez un mot et cliquez sur G pour le mettre en gras"
            >
              <Bold className="w-3 h-3" />
              <span>G</span>
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('italic')}
              className="px-2 py-0.5 text-xs font-serif italic font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer flex items-center gap-0.5"
              title="Sélectionnez un mot et cliquez sur I pour le mettre en italique"
            >
              <Italic className="w-3 h-3" />
              <span>I</span>
            </button>
          </div>

          {errors.length > 0 && (
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.length}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            value={value}
            spellCheck={true}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            spellCheck={true}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        )}

        {/* Highlighted spelling suggestions pills */}
        {errors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {errors.slice(0, 3).map((err, idx) => (
              <div key={idx} className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveError(activeError?.word === err.word ? null : err)}
                  className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="underline underline-offset-2 decoration-amber-500 font-semibold">{err.word}</span>
                </button>

                {/* Suggestion Popover */}
                {activeError?.word === err.word && (
                  <div className="absolute left-0 bottom-full mb-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl p-2 w-52 space-y-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold px-1">Suggestions :</p>
                    {err.suggestions.length > 0 ? (
                      err.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => applySuggestion(err, sug)}
                          className="w-full text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1 rounded-md transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{sug}</span>
                          <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic px-2 py-1">Aucune suggestion</p>
                    )}
                    <button
                      type="button"
                      onClick={() => ignoreWord(err.word)}
                      className="w-full text-left text-[11px] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium px-2 py-1 rounded-md transition-colors flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-1 cursor-pointer"
                    >
                      <span>Ignorer le mot</span>
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
