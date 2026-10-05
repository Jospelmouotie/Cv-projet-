import React from 'react';
import { Language, SubscriptionTier } from '../types';
import { PaidFeatureUsage } from '../utils/paidUsageDetector';
import { Lock, Sparkles, Check, ArrowRight, X, RefreshCw, Crown } from 'lucide-react';

interface PaidUsageExportModalProps {
  isOpen: boolean;
  langue: Language;
  paidUsages: PaidFeatureUsage[];
  onClose: () => void;
  onUpgrade: (tier: SubscriptionTier) => void;
  onResetToFreeDefaults: () => void;
}

export const PaidUsageExportModal: React.FC<PaidUsageExportModalProps> = ({
  isOpen,
  langue,
  paidUsages,
  onClose,
  onUpgrade,
  onResetToFreeDefaults
}) => {
  if (!isOpen || paidUsages.length === 0) return null;

  const isAr = langue === 'ar';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-black border border-black/20 dark:border-white/20 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border-2 border-black/20 dark:border-white/20 flex items-center justify-center text-black/60 dark:text-white/60 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-black/20 dark:border-white/20 text-[10px] font-medium uppercase tracking-wider text-black/50 dark:text-white/50 mb-1">
                <span>{isAr ? 'تصدير مقفل' : 'Export verrouillé'}</span>
              </div>
              <h2 className="text-xl font-light tracking-tight text-black dark:text-white">
                {isAr ? 'ميزات مدفوعة' : 'Fonctionnalités payantes'}
              </h2>
            </div>
          </div>

          <p className="text-sm text-black/50 dark:text-white/50 mt-3 leading-relaxed font-light">
            {isAr
              ? 'لقد استخدمت عناصر مخصصة محفوظة للباقات المدفوعة.'
              : 'Votre CV contient des options de personnalisation réservées aux membres payants.'}
          </p>
        </div>

        {/* Paid Usages List */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
            {isAr ? 'الميزات المدفوعة المستخدمة:' : 'Éléments payants détectés :'}
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {paidUsages.map((usage) => (
              <div
                key={usage.id}
                className="p-3.5 border border-black/10 dark:border-white/10 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-black dark:text-white">{usage.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider border border-black/20 dark:border-white/20 text-black/50 dark:text-white/50">
                      {usage.requiredTier === 'premium' ? 'Premium' : 'Classique'}
                    </span>
                  </div>
                  <p className="text-xs text-black/40 dark:text-white/40">{usage.description}</p>
                </div>
                <Lock className="w-4 h-4 text-black/30 dark:text-white/30 shrink-0" />
              </div>
            ))}
          </div>

          {/* Upgrade Buttons */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose();
                  onUpgrade('classique');
                }}
                className="p-3.5 border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white text-black dark:text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Sparkles className="w-4 h-4 text-black/60 dark:text-white/60" />
                <span>{isAr ? 'Classique (2 500 FCFA)' : 'Classique (2 500 FCFA)'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onUpgrade('premium');
                }}
                className="p-3.5 bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>{isAr ? 'Premium (5 000 FCFA)' : 'Premium (5 000 FCFA)'}</span>
              </button>
            </div>

            <div className="w-full rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2 font-medium">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة الضبط مجمدة' : 'Réinitialisation bloquée'}</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                {isAr
                  ? 'لا يمكن العودة إلى الإصدار المجاني لأن هذا CV contient عناصر مدفوعة.'
                  : 'Aucune réinitialisation gratuite n’est possible car ce CV contient des éléments payants.'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};