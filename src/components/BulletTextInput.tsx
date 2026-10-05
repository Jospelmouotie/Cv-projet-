import React, { useState, useRef } from 'react';
import { List, ListOrdered, CheckSquare, ArrowRight, Star, Minus, ChevronDown, Bold, Italic } from 'lucide-react';

interface BulletTextInputProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  className?: string;
  langue?: string;
}

export const BulletTextInput: React.FC<BulletTextInputProps> = ({
  value,
  onChange,
  placeholder = 'Saisissez du texte...',
  rows = 3,
  label,
  className = '',
  langue = 'fr'
}) => {
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const BULLET_STYLES = [
    { id: 'bullet', symbol: '• ', label: langue === 'ar' ? 'نقطة (•)' : 'Puce ronde (•)', icon: List },
    { id: 'dash', symbol: '- ', label: langue === 'ar' ? 'شرطة (-)' : 'Tiret (-)', icon: Minus },
    { id: 'arrow', symbol: '➔ ', label: langue === 'ar' ? 'سهم (➔)' : 'Flèche (➔)', icon: ArrowRight },
    { id: 'check', symbol: '✔ ', label: langue === 'ar' ? 'علامة صح (✔)' : 'Coche (✔)', icon: CheckSquare },
    { id: 'star', symbol: '⭐ ', label: langue === 'ar' ? 'نجمة (⭐)' : 'Étoile (⭐)', icon: Star },
    { id: 'numbered', symbol: '1. ', label: langue === 'ar' ? 'ترقيم (1.)' : 'Numérotée (1.)', icon: ListOrdered },
  ];

  const handleFormatText = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';

    if (start !== end) {
      const selected = currentVal.substring(start, end);
      const formatted = `${wrapper}${selected}${wrapper}`;
      const updated = currentVal.substring(0, start) + formatted + currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
      }, 50);
    } else {
      const formatted = `${wrapper}${langue === 'en' ? 'text' : langue === 'ar' ? 'نص' : 'texte'}${wrapper}`;
      const updated = currentVal.substring(0, start) + formatted + currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wrapper.length, start + formatted.length - wrapper.length);
      }, 50);
    }
  };

  const handleInsertBullet = (symbol: string) => {
    setShowBulletDropdown(false);
    if (!value) {
      onChange(symbol);
      return;
    }

    const lines = value.split('\n');
    const lastIdx = lines.length - 1;
    const cleanLast = lines[lastIdx].replace(/^[•\-➔✔⭐\d+\.]\s*/, '');
    lines[lastIdx] = `${symbol}${cleanLast}`;

    onChange(lines.join('\n'));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center flex-wrap gap-1">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
            {label}
          </label>

          {/* Formatting & Bullet Selector Toolbar */}
          <div className="flex items-center gap-1">
            {/* Bold Button */}
            <button
              type="button"
              onClick={() => handleFormatText('**')}
              className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={langue === 'en' ? 'Bold (Ctrl+B / **text**)' : langue === 'ar' ? 'غامق' : 'Gras (G / **texte**)'}
            >
              <Bold className="w-3.5 h-3.5 text-slate-800 dark:text-slate-100" />
            </button>

            {/* Italic Button */}
            <button
              type="button"
              onClick={() => handleFormatText('*')}
              className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-serif italic font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={langue === 'en' ? 'Italic (*text*)' : langue === 'ar' ? 'مائل' : 'Italique (I / *texte*)'}
            >
              <Italic className="w-3.5 h-3.5 text-slate-800 dark:text-slate-100" />
            </button>

            {/* Bullets Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBulletDropdown(!showBulletDropdown)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                title="Insérer des puces"
              >
                <List className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xs:inline">{langue === 'ar' ? 'نقاط' : 'Puces'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showBulletDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1 space-y-0.5">
                  {BULLET_STYLES.map((b) => {
                    const IconComp = b.icon;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleInsertBullet(b.symbol)}
                        className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <IconComp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans leading-relaxed ${value ? '!pr-9' : ''}`}
        />
        {Boolean(value) && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Effacer le texte"
            aria-label="Effacer le texte"
            className="absolute right-2.5 top-2.5 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
          >
            <Minus className="w-3.5 h-3.5 hidden" />
            <span className="sr-only">Effacer</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>
    </div>
  );
};
