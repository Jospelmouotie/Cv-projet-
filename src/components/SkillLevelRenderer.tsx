import React from 'react';
import { Star } from 'lucide-react';

interface SkillLevelRendererProps {
  nom: string;
  niveau?: number; // 0 to 10
  sousTitre?: string;
  displayMode?: 'progress' | 'stars' | 'numeric' | 'percentage' | 'dots' | 'segmented' | 'badge-text' | 'none';
  accentColor?: string;
  gaugeColor?: string;
  textColor?: string;
  editableName?: boolean;
  onUpdateName?: (newName: string) => void;
  onUpdateLevel?: (newLevel: number) => void;
}

export const SkillLevelRenderer: React.FC<SkillLevelRendererProps> = ({
  nom,
  niveau,
  sousTitre,
  displayMode = 'progress',
  accentColor = '#2563EB',
  gaugeColor,
  textColor = '#1E293B',
  editableName = false,
  onUpdateName,
  onUpdateLevel
}) => {
  const hasLevel = typeof niveau === 'number' && !isNaN(niveau);
  const levelVal = hasLevel ? Math.min(10, Math.max(0, niveau)) : 0;
  const percent = Math.round((levelVal / 10) * 100);
  const score5 = Math.min(5, Math.max(1, Math.round(levelVal / 2)));
  const activeGaugeColor = gaugeColor || accentColor;

  const getLevelLabel = (lvl: number) => {
    if (lvl <= 3) return 'Débutant';
    if (lvl <= 5) return 'Intermédiaire';
    if (lvl <= 7) return 'Avancé';
    if (lvl <= 9) return 'Expert';
    return 'Maître';
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span
            contentEditable={editableName}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateName?.(e.currentTarget.innerText)}
            className={`font-extrabold outline-none text-xs leading-tight ${editableName ? 'cursor-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1' : ''}`}
            style={{ color: textColor }}
          >
            {nom}
          </span>
          {sousTitre && (
            <span className="text-[10px] font-medium opacity-70 italic">{sousTitre}</span>
          )}
        </div>

        {hasLevel && displayMode !== 'none' && (
          <>
            {/* 1. Numeric Score Indicator (8/10 or 4/5) */}
            {displayMode === 'numeric' && (
              <span
                className="text-[10.5px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0"
                style={{ color: activeGaugeColor }}
              >
                {levelVal}/10
              </span>
            )}

            {/* 2. Percentage Indicator (80%) */}
            {displayMode === 'percentage' && (
              <span
                className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0"
                style={{ color: activeGaugeColor }}
              >
                {percent}%
              </span>
            )}

            {/* 3. Text Badge Level (Débutant, Avancé, Expert...) */}
            {displayMode === 'badge-text' && (
              <span
                className="text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 border"
                style={{
                  backgroundColor: `${activeGaugeColor}15`,
                  color: activeGaugeColor,
                  borderColor: `${activeGaugeColor}40`
                }}
              >
                {getLevelLabel(levelVal)}
              </span>
            )}

            {/* 4. Stars in header line if compact */}
            {displayMode === 'stars' && (
              <div className="flex items-center space-x-0.5 shrink-0" style={{ color: activeGaugeColor }}>
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = s <= score5;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onUpdateLevel?.(s * 2)}
                      className={`p-0.5 ${onUpdateLevel ? 'cursor-pointer hover:scale-125' : ''}`}
                      title={`${s}/5`}
                    >
                      <Star className={`w-3.5 h-3.5 ${filled ? 'fill-current' : 'opacity-25'}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5. Dots in header line */}
            {displayMode === 'dots' && (
              <div className="flex items-center space-x-1 shrink-0">
                {[1, 2, 3, 4, 5].map((d) => {
                  const filled = d <= score5;
                  return (
                    <span
                      key={d}
                      onClick={() => onUpdateLevel?.(d * 2)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        filled ? 'shadow-2xs' : 'opacity-25'
                      } ${onUpdateLevel ? 'cursor-pointer' : ''}`}
                      style={{ backgroundColor: filled ? activeGaugeColor : '#94A3B8' }}
                      title={`${d}/5`}
                    />
                  );
                })}
              </div>
            )}

            {/* 6. Segmented Bar */}
            {displayMode === 'segmented' && (
              <div className="flex items-center gap-1 shrink-0">
                {[1, 2, 3, 4, 5].map((seg) => {
                  const filled = seg <= score5;
                  return (
                    <span
                      key={seg}
                      onClick={() => onUpdateLevel?.(seg * 2)}
                      className="w-3.5 h-1.5 rounded-xs transition-all"
                      style={{
                        backgroundColor: filled ? activeGaugeColor : `${activeGaugeColor}25`
                      }}
                      title={`${seg}/5`}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Progress Bar (mode 'progress') */}
      {hasLevel && displayMode === 'progress' && (
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%`, backgroundColor: activeGaugeColor }}
          />
        </div>
      )}
    </div>
  );
};
