import React from 'react';
import { Language } from '../types';
import { Monitor, Smartphone, AlertTriangle, ArrowRight, X, Info } from 'lucide-react';

interface DeviceAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  langue: Language;
}

export const DeviceAdviceModal: React.FC<DeviceAdviceModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  langue
}) => {
  if (!isOpen) return null;

  const content = {
    fr: {
      badge: 'Conseil Ergonomie & Rendu HD',
      title: 'Mode Éditeur Optimisé pour Ordinateur',
      message: 'Pour une expérience de personnalisation confortable (glisser-déposer, aperçu en temps réel A4, réglages précis), l\'éditeur est idéalement conçu pour un écran d\'ordinateur ou de tablette.',
      mobileHint: 'Vous pouvez tout de même continuer sur votre téléphone ou utiliser notre assistant de saisie pas-à-pas.',
      continueBtn: 'Continuer vers l\'éditeur',
      cancelBtn: 'Retour'
    },
    en: {
      badge: 'Ergonomics & HD Preview Tip',
      title: 'Editor Mode is Best on Desktop',
      message: 'For the best editing experience (drag & drop, live A4 preview, fine-grained adjustments), the editor is ideally designed for desktop computers and laptops.',
      mobileHint: 'You can still continue on mobile and use the step-by-step assistant.',
      continueBtn: 'Continue to Editor',
      cancelBtn: 'Go Back'
    },
    ar: {
      badge: 'نصيحة لتجربة أفضل',
      title: 'وضع المحرر مصمم خصيصاً للكمبيوتر',
      message: 'للحصول على أفضل تجربة تعديل وسحب وإفلات مع معاينة A4 عالية الدقة، يفضل استخدام شاشة الكمبيوتر أو الجهاز اللوحي.',
      mobileHint: 'يمكنك المتابعة على الهاتف المحمول واستخدام المساعد خطوة بخطوة.',
      continueBtn: 'المتابعة إلى المحرر',
      cancelBtn: 'رجوع'
    }
  }[langue] || {
    badge: 'Conseil Ergonomie',
    title: 'Mode Éditeur Optimisé pour Ordinateur',
    message: 'L\'éditeur est idéalement conçu pour un écran d\'ordinateur ou de tablette.',
    mobileHint: 'Vous pouvez tout de même continuer sur mobile.',
    continueBtn: 'Continuer vers l\'éditeur',
    cancelBtn: 'Retour'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Device Indicator */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-500 text-blue-600 dark:text-blue-400">
            <Monitor className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300">Recommandé</span>
          </div>
          <div className="text-slate-300 dark:text-slate-600 font-black text-xl">vs</div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-400">
            <Smartphone className="w-8 h-8" />
            <span className="text-[10px] font-bold text-slate-400">Mobile</span>
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-full text-xs font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{content.badge}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {content.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {content.message}
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl text-left text-xs text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span className="font-semibold">{content.mobileHint}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-center"
          >
            {content.cancelBtn}
          </button>
          <button
            type="button"
            onClick={() => {
              onContinue();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{content.continueBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
