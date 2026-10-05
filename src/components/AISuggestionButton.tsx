import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Lock, Wand2 } from 'lucide-react';
import { isPaymentActive } from '../utils/adminPaidMatrix';

interface AISuggestionButtonProps {
  fieldName: string;
  currentValue?: string;
  context?: string;
  fullCvContext?: string;
  userTier?: 'freemium' | 'classique' | 'premium';
  onApplySuggestion: (suggestion: string) => void;
  onOpenUpgradeModal?: (tier?: 'classique' | 'premium') => void;
  langue?: string;
  className?: string;
  compact?: boolean;
}

export const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({
  fieldName,
  currentValue = '',
  context = '',
  fullCvContext = '',
  userTier = 'freemium',
  onApplySuggestion,
  onOpenUpgradeModal,
  langue = 'fr',
  className = '',
  compact = false
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cv_builder_user') : null;
  let effectiveTier = userTier;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'ADMIN' || parsed.subscriptionTier === 'premium') effectiveTier = 'premium';
    } catch (_) {}
  }
  const isPremium = !isPaymentActive() || effectiveTier === 'premium';

  const handleFetchSuggestion = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isPremium) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('premium');
      }
      return;
    }

    setLoading(true);
    setErrorNotice(null);

    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/suggest-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fieldName,
          currentValue,
          context,
          fullCvContext,
          langue
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && onOpenUpgradeModal) {
          onOpenUpgradeModal('premium');
          return;
        }
        if (res.status === 429 || data.error?.includes('quota') || data.error?.includes('token')) {
          throw new Error('Le quota de requêtes IA est temporairement atteint. Veuillez réessayer dans un instant.');
        }
        throw new Error(data.error || 'Erreur lors de la suggestion IA');
      }

      const data = await res.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
        setShowPreview(true);
      } else {
        throw new Error('Aucune suggestion retournée');
      }
    } catch (err: any) {
      console.error('AISuggestionButton error:', err);
      setErrorNotice(err.message || 'Suggestion IA indisponible');
      setTimeout(() => setErrorNotice(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (suggestion) {
      onApplySuggestion(suggestion);
    }
    setShowPreview(false);
    setSuggestion(null);
  };

  return (
    <div
      className={`relative inline-flex items-center group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleFetchSuggestion}
        disabled={loading}
        className={`inline-flex items-center gap-1 font-bold rounded-lg transition-all cursor-pointer select-none ${
          compact
            ? 'p-1.5 text-[10px]'
            : 'px-2.5 py-1 text-xs'
        } ${
          isPremium
            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 border border-black/20 dark:border-white/20 shadow-xs'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30 shrink-0" />
        )}
        <span className={compact ? 'hidden sm:inline-block' : 'inline-block'}>
          {loading ? 'Génération IA...' : 'Suggestion AI'}
        </span>
        {!isPremium && <Lock className="w-3 h-3 text-neutral-400 shrink-0 ml-0.5" />}
      </button>

      {/* Floating Hover Tooltip: 'Suggestion AI' clearly visible on hover */}
      {isHovered && !showPreview && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-extrabold rounded-md shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-1 animate-in fade-in zoom-in duration-100">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>Suggestion AI {isPremium ? 'Disponible' : '(Pack Premium)'}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
        </div>
      )}

      {/* Error Notice */}
      {errorNotice && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap animate-fade-in">
          {errorNotice}
        </div>
      )}

      {/* Suggestion Popover Preview */}
      {showPreview && suggestion && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 sm:w-80 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl text-xs space-y-2 animate-in fade-in zoom-in duration-150">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
            <span className="font-extrabold flex items-center gap-1.5 text-black dark:text-white text-[11px] uppercase tracking-wider">
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              Suggestion AI
            </span>
            <span className="text-[10px] font-semibold text-neutral-400">Pack Premium</span>
          </div>

          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed font-normal bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 max-h-36 overflow-y-auto font-sans">
            "{suggestion}"
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPreview(false);
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              Ignorer
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="px-3 py-1 text-[11px] font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-neutral-800 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
