import React, { useRef, useState, useEffect } from 'react';
import { CVTemplate, Language, CV, SubscriptionTier } from '../types';
import { CVPreview } from './CVPreview';
import { getPresetForTemplate } from '../data/templatePresets';
import { getTranslation, getLocalizedTemplateName, getLocalizedBadgeText, getLocalizedCategory } from '../i18n/translations';
import { Crown, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { isTemplateAllowed } from '../utils/subscriptionGates';

interface TemplateCardProps {
  template: CVTemplate;
  langue: Language;
  userTier?: SubscriptionTier;
  onSelect: (template: CVTemplate) => void;
  onPreviewModal: (template: CVTemplate) => void;
  onApplyToActiveCV?: (template: CVTemplate) => void;
  onOpenUpgradeModal?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  langue,
  userTier = 'freemium',
  onSelect,
  onPreviewModal,
  onApplyToActiveCV,
  onOpenUpgradeModal
}) => {
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [cardScale, setCardScale] = useState<number>(0.45);

  useEffect(() => {
    if (!thumbnailRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          // Scale so 794px fills 100% of card width seamlessly
          setCardScale((entry.contentRect.width + 2) / 794);
        }
      }
    });
    observer.observe(thumbnailRef.current);
    return () => observer.disconnect();
  }, []);

  const description = template.description[langue] || template.description.fr;
  const preset = getPresetForTemplate(template.id, langue);
  const localizedName = getLocalizedTemplateName(template, langue);
  const localizedBadge = getLocalizedBadgeText(template.badgeText, langue);
  const localizedCategory = getLocalizedCategory(template.category, langue);

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cv_builder_user') : null;
  let effectiveTier = userTier;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'ADMIN' || parsed.subscriptionTier === 'premium') effectiveTier = 'premium';
    } catch (_) {}
  }

  const isAllowed = isTemplateAllowed(effectiveTier as SubscriptionTier, template.id, true);

  const handleAction = (actionCallback: () => void) => {
    if (!isAllowed) {
      if (onOpenUpgradeModal) onOpenUpgradeModal();
      return;
    }
    actionCallback();
  };

  // Construct full dummy CV for gallery preview
  const dummyCv: CV = {
    id: `cv-preview-${template.id}`,
    utilisateurId: 'demo',
    titre: preset.titre,
    templateId: template.id,
    langue: langue,
    couleurAccent: preset.couleurAccent,
    police: preset.police,
    photoUrl: preset.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    afficherPhoto: true,
    photoPosition: preset.photoPosition || (template.layoutFamily === 'single-column' ? 'in-header' : 'in-sidebar'),
    statutPaiement: 'PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...preset,
    pageCibleMode: '1_page',
    sections: preset.sections
  };

  const isPremiumTemplate = !isAllowed || template.badgeText?.toLowerCase().includes('premium') || template.requiredTier === 'premium' || template.requiredTier === 'classique';

  return (
    <div className="bg-white dark:bg-[#121212] rounded-none border border-black/8 dark:border-white/10 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col group relative w-full h-full">
      
      {/* Thumbnail Container - Full Width Model Preview */}
      <div 
        ref={thumbnailRef}
        className="relative w-full overflow-hidden bg-white border-b border-black/8 dark:border-white/10 cursor-pointer select-none"
        style={{ height: `${Math.round(cardScale * 1122)}px` }}
        onClick={() => handleAction(() => onSelect(template))}
      >
        {/* Full Width Scaled A4 Page Paper Box */}
        <div 
          className="w-[794px] h-[1122px] origin-top-left pointer-events-none select-none overflow-hidden bg-white shrink-0 absolute top-0 left-0"
          style={{ transform: `scale(${cardScale})` }}
        >
          <CVPreview cv={dummyCv} interactivePreview={false} />
        </div>

        {/* Top-Left Badge: GRATUIT or premium crown icon */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          {isAllowed ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-black/40 dark:border-white/40 bg-white/95 dark:bg-black/95 text-black dark:text-white shadow-xs">
              {langue === 'ar' ? 'مجاني' : 'GRATUIT'}
            </span>
          ) : (
            <span className="flex items-center justify-center w-7 h-7 border border-amber-400/80 bg-amber-400/15 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)] rounded-sm">
              <Crown className="w-3.5 h-3.5 fill-current" />
            </span>
          )}
        </div>

        {/* Hover Overlay: 40% black opacity with 200ms transition */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center p-4 z-20 space-y-2">
          {onApplyToActiveCV && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onApplyToActiveCV(template));
              }}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold text-xs py-2 px-3 rounded shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{getTranslation(langue, 'applyToMyCVKeepData')}</span>
            </button>
          )}

          {/* "Aperçu" contour blanc */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreviewModal(template);
            }}
            className="w-full border border-white text-white hover:bg-white/15 font-semibold text-xs py-2 px-3 rounded shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{getTranslation(langue, 'fullscreenPreview')}</span>
          </button>

          {/* "Utiliser ce modèle" fond blanc / texte noir */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(() => onSelect(template));
            }}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold text-xs py-2 px-3 rounded shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{isAllowed ? getTranslation(langue, 'chooseThisTemplate') : 'Utiliser ce modèle'}</span>
          </button>
        </div>
      </div>

      {/* Meta Info Footer */}
      <div className="p-3.5 bg-white dark:bg-[#121212] flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-semibold text-black dark:text-white text-sm truncate pr-2">
              {localizedName}
            </h3>
          </div>
          <p className="text-[11px] text-black/50 dark:text-white/50 line-clamp-2 leading-relaxed font-light">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-black/8 dark:border-white/10 text-[11px]">
          <span className="uppercase text-[10px] font-semibold text-black/45 dark:text-white/45 tracking-wider">
            {localizedCategory}
          </span>
          <button
            type="button"
            onClick={() => handleAction(() => onSelect(template))}
            className="font-semibold text-[11px] flex items-center gap-1 cursor-pointer text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            <span>{isAllowed ? getTranslation(langue, 'chooseThisTemplate') : 'Utiliser ce modèle'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
};

