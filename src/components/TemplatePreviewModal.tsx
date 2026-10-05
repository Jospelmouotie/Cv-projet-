import React, { useState, useEffect } from 'react';
import { CVTemplate, Language, CV, SubscriptionTier } from '../types';
import { CVPreview } from './CVPreview';
import { getPresetForTemplate, getCleanPresetForTemplate } from '../data/templatePresets';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Eye, Crown } from 'lucide-react';
import { getTranslation, getLocalizedTemplateName, getLocalizedCategory } from '../i18n/translations';
import { isTemplateAllowed } from '../utils/subscriptionGates';

interface TemplatePreviewModalProps {
  template: CVTemplate;
  langue: Language;
  userTier?: SubscriptionTier;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: CVTemplate) => void;
  onOpenUpgradeModal?: (tier?: SubscriptionTier) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  langue,
  userTier = 'freemium',
  isOpen,
  onClose,
  onSelect,
  onOpenUpgradeModal
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);
  if (!isOpen) return null;

  const [showFilledExample, setShowFilledExample] = useState(true);
  
  // Calculate initial responsive zoom based on screen width (exact proportion fit without padding)
  const getInitialZoom = () => {
    if (typeof window === 'undefined') return 0.8;
    const width = window.innerWidth;
    if (width < 768) {
      return Math.min(1.0, width / 794);
    }
    return 0.85;
  };

  const [zoomLevel, setZoomLevel] = useState(getInitialZoom);

  useEffect(() => {
    const handleResize = () => {
      // Don't override if user adjusted manually, but provide good baseline
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const samplePreset = getPresetForTemplate(template.id, langue);
  const cleanPreset = getCleanPresetForTemplate(template.id, langue);

  const activePreset = showFilledExample ? samplePreset : cleanPreset;
  const localizedName = getLocalizedTemplateName(template, langue);
  const localizedCat = getLocalizedCategory(template.category, langue);

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cv_builder_user') : null;
  let effectiveTier = userTier;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'ADMIN' || parsed.subscriptionTier === 'premium') effectiveTier = 'premium';
    } catch (_) {}
  }

  const isAllowed = isTemplateAllowed(effectiveTier as SubscriptionTier, template.id, true);

  const dummyCv: CV = {
    id: `cv-modal-preview-${template.id}`,
    utilisateurId: 'demo',
    titre: activePreset.titre,
    templateId: template.id,
    langue: langue,
    couleurAccent: activePreset.couleurAccent,
    police: activePreset.police,
    photoUrl: activePreset.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    afficherPhoto: true,
    photoPosition: activePreset.photoPosition || (template.layoutFamily === 'single-column' ? 'in-header' : 'in-sidebar'),
    statutPaiement: 'PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...activePreset,
    pageCibleMode: '1_page',
    sections: activePreset.sections
  };

  const handleUnlockOrConfirm = () => {
    if (!isAllowed) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('classique');
      }
      return;
    }
    onSelect(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/95 backdrop-blur-md flex flex-col animate-fadeIn">
      
      {/* Top Navigation Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{localizedName}</h2>
          <span className="hidden xs:inline-block px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-md text-[10px] font-medium uppercase shrink-0">
            {localizedCat}
          </span>
          {!isAllowed && (
            <button
              type="button"
              onClick={() => onOpenUpgradeModal?.('classique')}
              className="p-1 sm:p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              title="Modèle Premium — Cliquez pour déverrouiller"
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Example Data Toggle */}
          <button
            type="button"
            onClick={() => setShowFilledExample(!showFilledExample)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              showFilledExample
                ? 'bg-neutral-800 text-white border-neutral-700'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showFilledExample ? t('filledExample') : t('blankPreview')}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-lg p-0.5 sm:p-1 text-neutral-300 gap-0.5 sm:gap-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.08))}
              className="p-1 hover:bg-neutral-700 rounded cursor-pointer transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono px-1 w-8 sm:w-10 text-center font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.08))}
              className="p-1 hover:bg-neutral-700 rounded cursor-pointer transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(getInitialZoom())}
              className="p-1 hover:bg-neutral-700 rounded cursor-pointer transition-colors hidden xs:block"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Button: Desktop & Tablet */}
          <div className="hidden sm:flex items-center">
            {isAllowed ? (
              <button
                type="button"
                onClick={handleUnlockOrConfirm}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm rounded-lg shadow-xs border border-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t('useThisTemplate')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenUpgradeModal?.('classique')}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4 text-black fill-black" />
                <span>Déverrouiller</span>
              </button>
            )}
          </div>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Canvas - Optimized for screen proportions with zero mobile padding */}
      <div className="flex-1 overflow-auto p-0 sm:p-6 flex justify-center items-start bg-black touch-pan-x touch-pan-y">
        <div 
          className="transition-transform duration-150 origin-top bg-white shadow-2xl overflow-hidden my-0 sm:my-4"
          style={{
            width: '794px',
            transform: `scale(${zoomLevel})`,
            marginBottom: `${(1 - zoomLevel) * -1123}px`
          }}
        >
          <CVPreview cv={dummyCv} interactivePreview={false} />
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-3 sm:hidden flex items-center justify-between text-xs text-neutral-300 shrink-0">
        <span className="font-semibold truncate max-w-[150px]">{localizedName}</span>
        {isAllowed ? (
          <button
            onClick={handleUnlockOrConfirm}
            className="px-4 py-2 font-semibold rounded-lg bg-white text-black shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('chooseButton')}</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenUpgradeModal?.('classique')}
            className="px-4 py-2 font-semibold rounded-lg bg-white text-black flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 fill-black text-black" />
            <span>Déverrouiller</span>
          </button>
        )}
      </div>

    </div>
  );
};
