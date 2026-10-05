import React from 'react';
import { Language } from '../types';

interface DateRangePickerProps {
  dateDebut: string;
  dateFin: string;
  actuel?: boolean;
  onChange: (dateDebut: string, dateFin: string, actuel: boolean) => void;
  langue?: Language;
  className?: string;
  labelStart?: string;
  labelEnd?: string;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateDebut,
  dateFin,
  actuel = false,
  onChange,
  langue = 'fr',
  className = '',
  labelStart,
  labelEnd
}) => {
  const months = langue === 'en' ? MONTHS_EN : langue === 'ar' ? MONTHS_AR : MONTHS_FR;

  // Helper to parse "Mois Année" or "Année" or "MM/YYYY"
  const parseDateString = (str: string) => {
    if (!str) return { month: '', year: '' };
    const trimmed = str.trim();
    
    // Check if it matches any month name
    for (let i = 0; i < 12; i++) {
      const frM = MONTHS_FR[i];
      const enM = MONTHS_EN[i];
      const arM = MONTHS_AR[i];
      if (
        trimmed.toLowerCase().includes(frM.toLowerCase()) ||
        trimmed.toLowerCase().includes(enM.toLowerCase()) ||
        trimmed.includes(arM)
      ) {
        // Extract 4 digit year
        const yearMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/);
        return {
          month: months[i],
          year: yearMatch ? yearMatch[0] : ''
        };
      }
    }

    // Check for MM/YYYY or YYYY-MM
    const slashMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (slashMatch) {
      const mIdx = parseInt(slashMatch[1], 10) - 1;
      return {
        month: mIdx >= 0 && mIdx < 12 ? months[mIdx] : '',
        year: slashMatch[2]
      };
    }

    // Year only
    const pureYearMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/);
    if (pureYearMatch) {
      return { month: '', year: pureYearMatch[0] };
    }

    return { month: '', year: trimmed };
  };

  const startParsed = parseDateString(dateDebut || '');
  const endParsed = parseDateString(dateFin || '');

  const isCurrent = Boolean(
    actuel || 
    dateFin?.toLowerCase().includes('présent') || 
    dateFin?.toLowerCase().includes('present') || 
    dateFin?.toLowerCase().includes('aujourd') ||
    dateFin?.toLowerCase().includes('en cours') ||
    dateFin?.includes('حاليًا')
  );

  const handleStartChange = (newMonth: string, newYear: string) => {
    let combined = '';
    if (newMonth && newYear) {
      combined = `${newMonth} ${newYear}`;
    } else if (newYear) {
      combined = newYear;
    } else if (newMonth) {
      combined = newMonth;
    }
    onChange(combined, isCurrent ? (langue === 'en' ? 'Present' : langue === 'ar' ? 'حاليًا' : 'Présent') : dateFin, isCurrent);
  };

  const handleEndChange = (newMonth: string, newYear: string) => {
    let combined = '';
    if (newMonth && newYear) {
      combined = `${newMonth} ${newYear}`;
    } else if (newYear) {
      combined = newYear;
    } else if (newMonth) {
      combined = newMonth;
    }
    onChange(dateDebut, combined, false);
  };

  const handleToggleCurrent = (checked: boolean) => {
    if (checked) {
      const currentLabel = langue === 'en' ? 'Present' : langue === 'ar' ? 'حاليًا' : 'Présent';
      onChange(dateDebut, currentLabel, true);
    } else {
      onChange(dateDebut, '', false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear + 4; y >= 1970; y--) {
    yearOptions.push(y);
  }

  return (
    <div className={`space-y-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/80 ${className}`}>
      {/* START & END DATE INPUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* START DATE */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            {labelStart || (langue === 'en' ? 'Start Date' : langue === 'ar' ? 'تاريخ البدء' : 'Date de début')}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={startParsed.month}
              onChange={(e) => handleStartChange(e.target.value, startParsed.year)}
              className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium outline-none cursor-pointer"
            >
              <option value="">{langue === 'en' ? 'Month (Opt)' : langue === 'ar' ? 'الشهر (اختياري)' : 'Mois (Opt)'}</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <input
              type="text"
              list="start-year-list"
              value={startParsed.year}
              onChange={(e) => handleStartChange(startParsed.month, e.target.value)}
              placeholder={langue === 'en' ? 'Year (e.g. 2021)' : langue === 'ar' ? 'السنة (مثال: 2021)' : 'Année (ex: 2021)'}
              className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold outline-none"
            />
            <datalist id="start-year-list">
              {yearOptions.map((y) => (
                <option key={y} value={y} />
              ))}
            </datalist>
          </div>
        </div>

        {/* END DATE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {labelEnd || (langue === 'en' ? 'End Date' : langue === 'ar' ? 'تاريخ الانتهاء' : 'Date de fin')}
            </label>
            {isCurrent && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {langue === 'en' ? 'Active' : langue === 'ar' ? 'نشط' : 'En cours'}
              </span>
            )}
          </div>

          {isCurrent ? (
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 h-[34px]">
              <span>✓</span>
              <span>{langue === 'en' ? 'Until Today / Present' : langue === 'ar' ? 'حتى اليوم / مستمر' : "Jusqu'à aujourd'hui (En cours)"}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={endParsed.month}
                onChange={(e) => handleEndChange(e.target.value, endParsed.year)}
                className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium outline-none cursor-pointer"
              >
                <option value="">{langue === 'en' ? 'Month (Opt)' : langue === 'ar' ? 'الشهر (اختياري)' : 'Mois (Opt)'}</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <input
                type="text"
                list="end-year-list"
                value={endParsed.year}
                onChange={(e) => handleEndChange(endParsed.month, e.target.value)}
                placeholder={langue === 'en' ? 'Year (e.g. 2024)' : langue === 'ar' ? 'السنة (مثال: 2024)' : 'Année (ex: 2024)'}
                className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold outline-none"
              />
              <datalist id="end-year-list">
                {yearOptions.map((y) => (
                  <option key={y} value={y} />
                ))}
              </datalist>
            </div>
          )}
        </div>
      </div>

      {/* CHECKBOX: JUSQU'À AUJOURD'HUI / POSTE ACTUEL */}
      <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => handleToggleCurrent(e.target.checked)}
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
        />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {langue === 'en' 
            ? 'Currently ongoing / Until today' 
            : langue === 'ar' 
            ? 'مستمر حتى اليوم (المنصب الحالي)' 
            : "Jusqu'à aujourd'hui (Poste ou formation en cours)"}
        </span>
      </label>
    </div>
  );
};
