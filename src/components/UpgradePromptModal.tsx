import React, { useState } from 'react';
import { Language, SubscriptionTier, FeatureKey } from '../types';
import { usePricingSettings } from '../state/usePricingSettings';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { X, Check, Sparkles, ShieldCheck, ArrowRight, Crown, Zap } from 'lucide-react';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  langue?: Language;
  currentTier?: SubscriptionTier;
  targetFeature?: FeatureKey;
  onSelectPlan?: (tier: SubscriptionTier) => void;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  langue = 'fr',
  currentTier = 'freemium',
  onSelectPlan
}) => {
  const { formatPlanPrice, pricingPlans } = usePricingSettings();
  const [currencyToggle, setCurrencyToggle] = useState<'usd-first' | 'usd' | 'fcfa'>('usd-first');

  if (!isOpen || !isPaymentActive()) return null;

  const isAr = langue === 'ar';
  const isEn = langue === 'en';

  const handleChoosePlan = (tier: SubscriptionTier) => {
    if (onSelectPlan) {
      onSelectPlan(tier);
    }
  };

  const getHighlights = (tierKey: SubscriptionTier | string) => {
    if (isAr) {
      if (tierKey === 'freemium') {
        return [
          'نماذج مجانية مختارة',
          'محرر النصوص وإدارة الأقسام',
          'تصدير PDF قياسي',
          'حفظ سيرة ذاتية'
        ];
      }
      if (tierKey === 'decouverte') {
        return [
          'وصول كامل إلى أكثر من 59 نموذجاً احترافياً',
          'استوديو التصميم الكامل (Creator Studio)',
          'تصدير PDF عالي الدقة 300 DPI بدون قيود',
          'اشتراك تجريبي لمدة 7 أيام (أسبوع واحد)'
        ];
      }
      if (tierKey === 'classique') {
        return [
          'وصول كامل إلى أكثر من 59 نموذجاً احترافياً',
          'استوديو التصميم الكامل (Creator Studio)',
          'تصدير PDF عالي الدقة 300 DPI بدون قيود',
          'أقسام وتخصيصات غير محدودة',
          'اشتراك لمدة 1 شهر (30 يوماً)'
        ];
      }
      return [
        'كل مزايا باقة كلاسيك',
        'تخصيص السيرة وفق عروض العمل بالذكاء الاصطناعي',
        'إنشاء خطابات تحفيزية احترافية بالذكاء الاصطناعي',
        'تحسين وتجهيز حساب LinkedIn الاحترافي',
        'تصدير بصيغ متعددة',
        'اشتراك VIP كامل لمدة 1 شهر (30 يوماً)'
      ];
    }
    if (isEn) {
      if (tierKey === 'freemium') {
        return [
          'Selected free templates',
          'Text editor & section manager',
          'Standard PDF export',
          '1 CV saved in cloud'
        ];
      }
      if (tierKey === 'decouverte') {
        return [
          'Full access to 59+ HD templates',
          'Complete Creator Studio design tools',
          'Ultra HD 300 DPI PDF export without watermarks',
          'Valid for 7 days (1 week trial)'
        ];
      }
      if (tierKey === 'classique') {
        return [
          'Full access to 59+ HD templates',
          'Complete Creator Studio design tools',
          'Ultra HD 300 DPI PDF export without watermarks',
          'Unlimited custom sections & layouts',
          '1 Month full subscription (30 days)'
        ];
      }
      return [
        'Everything in Classique pack',
        'AI Job Offer Tailoring & Screenshot adaptation',
        'AI Cover Letter Generator tailored to job posts',
        'Complete LinkedIn Profile Optimizer',
        'Multi-format high-speed exports',
        '1 Month VIP full subscription (30 days)'
      ];
    }
    // French (Default)
    if (tierKey === 'freemium') {
      return [
        'Modèles gratuits de départ',
        'Éditeur de texte et gestion des rubriques',
        'Export PDF standard',
        'Sauvegarde de votre CV'
      ];
    }
    if (tierKey === 'decouverte') {
      return [
        'Accès illimité aux 59+ modèles professionnels',
        'Creator Studio complet : colonnes, bordures & polices',
        'Export PDF Ultra HD 300 DPI sans restriction',
        'Valable 7 jours (1 semaine complète)'
      ];
    }
    if (tierKey === 'classique') {
      return [
        'Accès illimité aux 59+ modèles professionnels',
        'Creator Studio complet : colonnes, bordures & polices',
        'Export PDF Ultra HD 300 DPI sans restriction',
        'Rubriques et mises en page personnalisées',
        'Abonnement 1 mois complet (30 jours)'
      ];
    }
    return [
      'Tous les avantages du Pack Classique',
      'Ciblage d\'offres d\'emploi par IA (photo / texte)',
      'Générateur IA de Lettres de motivation sur mesure',
      'Optimiseur complet de profil LinkedIn',
      'Exports multi-formats haute fidélité',
      'Abonnement VIP 1 mois complet (30 jours)'
    ];
  };

  const validLangue: Language = (langue === 'en' || langue === 'ar') ? langue : 'fr';
  const activePlans = pricingPlans.filter(p => p.actif !== false);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start md:items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-neutral-950 rounded-2xl sm:rounded-3xl max-w-6xl w-full overflow-hidden shadow-2xl border border-neutral-800 my-2 sm:my-8 max-h-[98vh] md:max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="relative p-5 sm:p-6 md:p-8 bg-neutral-950 text-white text-center shrink-0 border-b border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-neutral-200 rounded-full text-xs font-bold mb-3 border border-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
            <span>
              {isAr ? 'عروض وباقات الاشتراك' : isEn ? 'Subscription Plans' : 'Formules d\'Abonnement'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white mb-1.5">
            {isAr ? 'اختر باقة الاشتراك المناسبة' : isEn ? 'Choose Your Subscription Plan' : 'Choisissez votre formule d\'abonnement'}
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto font-normal px-2">
            {isAr
              ? 'أسعار واضحة ومباشرة بالدولار والفرنك سيفا مع تفعيل فوري'
              : isEn
              ? 'Clear and direct pricing displayed in USD & FCFA with instant activation'
              : 'Tarifs clairs et directs affichés en USD ($) et FCFA avec activation instantanée'}
          </p>

          {/* Currency Switcher Toggle */}
          <div className="inline-flex items-center gap-1 mt-4 p-1 bg-neutral-900 rounded-full border border-neutral-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrencyToggle('usd-first')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                currencyToggle === 'usd-first'
                  ? 'bg-white text-neutral-950 shadow-xs font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              USD $ + FCFA
            </button>
            <button
              type="button"
              onClick={() => setCurrencyToggle('usd')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                currencyToggle === 'usd'
                  ? 'bg-white text-neutral-950 shadow-xs font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrencyToggle('fcfa')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                currencyToggle === 'fcfa'
                  ? 'bg-white text-neutral-950 shadow-xs font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              FCFA
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-neutral-950">
          <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
            activePlans.length >= 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'
          }`}>
            
            {/* 1. FREEMIUM */}
            <div
              className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between border bg-neutral-900 transition-all ${
                currentTier === 'freemium'
                  ? 'border-neutral-700 shadow-md'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    {isAr ? 'مجاني' : 'Freemium'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-950 text-neutral-300 border border-neutral-800">
                    {isAr ? 'بداية' : 'Start'}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    $0 USD
                  </div>
                  <div className="text-xs text-neutral-400 font-bold mt-0.5">
                    0 FCFA / {isAr ? 'مجاني دائماً' : isEn ? 'Free forever' : 'Gratuit'}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-800 mb-6">
                  {getHighlights('freemium').map((item, idx) => (
                    <div key={`freemium-hl-${idx}`} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={currentTier === 'freemium'}
                onClick={() => handleChoosePlan('freemium')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  currentTier === 'freemium'
                    ? 'bg-neutral-950 text-neutral-600 cursor-default border border-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer'
                }`}
              >
                {currentTier === 'freemium'
                  ? (isAr ? 'الباقة الحالية' : isEn ? 'Current Plan' : 'Forfait actuel')
                  : (isAr ? 'اختيار' : isEn ? 'Select' : 'Sélectionner')}
              </button>
            </div>

            {/* DYNAMIC ACTIVE PLANS FROM ADMIN SETTINGS */}
            {activePlans.map((plan) => {
              const planPrices = formatPlanPrice(plan.code, currencyToggle, validLangue);
              const isSelected = currentTier === plan.code;
              const isDecouverte = plan.code === 'decouverte';
              const isPremium = plan.code === 'premium';
              const isClassique = plan.code === 'classique';

              const durationLabel = plan.dureeJours === 7
                ? (isAr ? '7 أيام (أسبوع)' : isEn ? '7 Days (1 Wk)' : '7 Jours (1 sem.)')
                : (isAr ? '1 شهر (30 يوماً)' : isEn ? '1 Month (30 Days)' : '1 Mois (30 Jours)');

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between border relative bg-neutral-900 transition-all ${
                    isSelected
                      ? 'border-white shadow-xl ring-2 ring-white/50'
                      : isPremium
                      ? 'border-amber-500/50 hover:border-amber-400'
                      : isDecouverte
                      ? 'border-emerald-500/50 hover:border-emerald-400'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {(isDecouverte || isClassique || isPremium) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap flex items-center gap-1 ${
                        isPremium
                          ? 'bg-neutral-950 text-amber-400 border border-amber-500/50'
                          : isDecouverte
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : 'bg-white text-neutral-950'
                      }`}>
                        {isPremium ? <Crown className="w-3 h-3 fill-amber-400" /> : <Zap className="w-3 h-3" />}
                        <span>{plan.nom}</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {plan.nom}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400">
                        {durationLabel}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        {planPrices.primary}
                      </div>
                      <div className="text-xs text-neutral-400 font-bold mt-0.5">
                        {planPrices.secondary} &bull; {durationLabel}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-neutral-800 mb-6">
                      {getHighlights(plan.code).map((item, idx) => (
                        <div key={`tier-${plan.code}-hl-${idx}`} className="flex items-start gap-2 text-xs text-neutral-200">
                          {isPremium ? (
                            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                          )}
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChoosePlan(plan.code as SubscriptionTier)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 text-white'
                        : isPremium
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg font-black'
                        : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-md'
                    }`}
                  >
                    <span>
                      {isSelected
                        ? (isAr ? 'الباقة الحالية' : isEn ? 'Current Plan' : 'Forfait actuel')
                        : (isAr ? `تفعيل ${plan.nom}` : isEn ? `Activate ${plan.nom}` : `Choisir ${plan.nom}`)}
                    </span>
                    {!isSelected && (isPremium ? <Crown className="w-3.5 h-3.5 fill-black" /> : <ArrowRight className="w-3.5 h-3.5" />)}
                  </button>
                </div>
              );
            })}

          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 text-center shrink-0">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>
              {isAr
                ? 'دفع آمن 100% — تفعيل فوري مع خيارات دفع متنوعة'
                : isEn
                ? '100% Secure Checkout — Instant activation with Mobile Money & Cards'
                : 'Paiement 100% Sécurisé — Activation immédiate via Mobile Money & Carte'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
