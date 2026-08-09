import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { checkTextWithAi, AiSpellError } from '../utils/spellcheck';
import { AlertCircle, Check, X, Bold, Italic, Sparkles, Loader2 } from 'lucide-react';

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
  const [aiErrors, setAiErrors] = useState<AiSpellError[]>([]);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<AiSpellError | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Debounced AI spellcheck call on value change
  useEffect(() => {
    if (!value || value.trim().length < 8) {
      setAiErrors([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingAi(true);
      const errors = await checkTextWithAi(value, langue);
      setAiErrors(errors);
      setLoadingAi(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [value, langue]);

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

  const applyCorrection = (err: AiSpellError) => {
    if (!err.motOriginal || !err.correction) return;
    const updatedValue = value.replace(err.motOriginal, err.correction);
    onChange(updatedValue);
    setAiErrors(prev => prev.filter(e => e.motOriginal !== err.motOriginal));
    setActiveError(null);
  };

  const ignoreCorrection = (err: AiSpellError) => {
    setAiErrors(prev => prev.filter(e => e.motOriginal !== err.motOriginal));
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
          {loadingAi && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Vérification IA...</span>
            </span>
          )}

          {/* Quick Formatting Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="px-2 py-0.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer flex items-center gap-0.5"
              title="Gras"
            >
              <Bold className="w-3 h-3" />
              <span>G</span>
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('italic')}
              className="px-2 py-0.5 text-xs font-serif italic font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer flex items-center gap-0.5"
              title="Italique"
            >
              <Italic className="w-3 h-3" />
              <span>I</span>
            </button>
          </div>

          {aiErrors.length > 0 && (
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{aiErrors.length} suggestion{aiErrors.length > 1 ? 's' : ''} IA</span>
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

        {/* AI Error Pill Suggestions */}
        {aiErrors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {aiErrors.map((err, idx) => (
              <div key={idx} className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveError(activeError?.motOriginal === err.motOriginal ? null : err)}
                  className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="line-through decoration-amber-500 opacity-70">{err.motOriginal}</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">➔ {err.correction}</span>
                </button>

                {/* AI Suggestion Popover */}
                {activeError?.motOriginal === err.motOriginal && (
                  <div className="absolute left-0 bottom-full mb-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl p-2.5 w-60 space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs border-b border-slate-100 dark:border-slate-800 pb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Correction IA Gemini</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-500 dark:text-slate-400 line-through text-[11px]">{err.motOriginal}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{err.correction}</span>
                      </p>
                      {err.explication && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md leading-tight">
                          {err.explication}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => applyCorrection(err)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Appliquer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => ignoreCorrection(err)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Ignorer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
