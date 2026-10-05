import React, { useEffect, useState } from 'react';
import { CV, Section, SubscriptionTier, User } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { UnifiedCVCanvas } from './UnifiedCVCanvas';
import { Lock, Move, Eye, Palette } from 'lucide-react';
import { getTranslation } from '../i18n/translations';
import { isPaymentActive } from '../utils/adminPaidMatrix';

interface CVPreviewProps {
  cv: CV;
  id?: string;
  userTier?: SubscriptionTier;
  user?: User | null;
  onMoveSectionUp?: (sectionId: string) => void;
  onMoveSectionDown?: (sectionId: string) => void;
  onUpdateColor?: (color: string) => void;
  onUpdatePhotoShape?: (shape: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche') => void;
  onUpdatePhotoSize?: (size: number) => void;
  onSectionsReorder?: (newSections: Section[]) => void;
  onUpdateSectionZone?: (sectionId: string, newZone: 'gauche' | 'droite' | 'principale') => void;
  onUpdateCV?: (updated: Partial<CV>) => void;
  interactivePreview?: boolean;
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  cv,
  id = 'cv-preview-container',
  userTier,
  user,
  onUpdateColor,
  onUpdatePhotoShape,
  onUpdatePhotoSize,
  onSectionsReorder,
  onUpdateSectionZone,
  onUpdateCV,
  interactivePreview = true
}) => {
  const [isReorderActive, setIsReorderActive] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const lang = cv.langue || 'fr';
  const template = CV_TEMPLATES.find(t => t.id === cv.templateId) || CV_TEMPLATES[0];

  // Resolve user tier and admin status
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cv_builder_user') : null;
  let resolvedRole = user?.role;
  let resolvedTier = userTier || user?.subscriptionTier;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'ADMIN') resolvedRole = 'ADMIN';
      if (!resolvedTier) resolvedTier = (parsed.role === 'ADMIN' || parsed.subscriptionTier === 'premium') ? 'premium' : parsed.subscriptionTier;
    } catch (_) {}
  }
  if (resolvedRole === 'ADMIN') {
    resolvedTier = 'premium';
  }

  const isUnlocked = !isPaymentActive() || 
    resolvedRole === 'ADMIN' || 
    resolvedTier === 'premium' || 
    resolvedTier === 'classique' || 
    resolvedTier === 'decouverte' || 
    cv.statutPaiement === 'PAYE';

  // Anti-Screenshot Notice for Unpaid CVs
  useEffect(() => {
    if (!interactivePreview || isUnlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
        setToastNotice(getTranslation(lang, 'screenshotDetected'));
        setTimeout(() => setToastNotice(null), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactivePreview, isUnlocked, lang]);

  // Watermark Overlay for Anti-Screenshot Protection
  const renderWatermarkOverlay = () => {
    if (isUnlocked) return null;

    const watermarkText = getTranslation(lang, 'watermarkUnpaid') || "MONCVPRO — APERÇU PROTÉGÉ • NE PAS CAPTURER";

    return (
      <div
        data-watermark="true"
        className="watermark-overlay absolute inset-0 z-40 pointer-events-none overflow-hidden select-none print:hidden flex flex-col justify-between py-4 px-2 opacity-35"
      >
        {Array.from({ length: 12 }).map((_, rowIndex) => (
          <div
            key={`wm-row-${rowIndex}`}
            className="flex justify-around items-center transform -rotate-25 whitespace-nowrap my-3"
          >
            {Array.from({ length: 3 }).map((_, colIndex) => (
              <div
                key={`wm-col-${colIndex}`}
                className="flex items-center gap-2 border-2 border-slate-900/50 bg-slate-900/15 dark:border-white/50 dark:bg-white/15 backdrop-blur-[0.5px] text-slate-900 dark:text-white px-3.5 py-1.5 rounded-lg shadow-sm"
              >
                <Lock className="w-4 h-4 shrink-0 text-slate-900 dark:text-white" />
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase">
                  {watermarkText}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Interactive Reorder Toolbar Header
  const renderInteractiveToolbar = () => {
    if (!interactivePreview) return null;

    return (
      <div className="print:hidden mb-3 p-2.5 bg-black text-white rounded-lg flex flex-wrap items-center justify-between gap-2 select-none border border-white/10">
        {/* Reorder Switch */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsReorderActive(!isReorderActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
              isReorderActive
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            style={{ minHeight: '38px' }}
          >
            <Move className="w-4 h-4" />
            <span>{isReorderActive ? getTranslation(lang, 'reorderModeActive') : getTranslation(lang, 'enableReorderMode')}</span>
          </button>
          <span className="text-[10px] text-white/40 hidden sm:inline">
            {isReorderActive ? getTranslation(lang, 'reorderHintActive') : getTranslation(lang, 'reorderHintInactive')}
          </span>
        </div>

        {/* Quick Style Controls */}
        <div className="flex items-center space-x-1">
          {onUpdatePhotoShape && (
            <select
              value={cv.photoForme || 'ronde'}
              onChange={(e) => onUpdatePhotoShape(e.target.value as any)}
              className="text-[10px] font-medium bg-white/10 text-white border border-white/10 rounded-lg px-2 py-1 outline-none hover:bg-white/20 transition-colors"
            >
              <option value="ronde" className="text-black">{getTranslation(lang, 'photoRound')}</option>
              <option value="carree" className="text-black">{getTranslation(lang, 'photoSquare')}</option>
              <option value="arrondie" className="text-black">{getTranslation(lang, 'photoRounded')}</option>
              <option value="arche" className="text-black">{getTranslation(lang, 'photoArch')}</option>
            </select>
          )}

          {!isUnlocked && (
            <div className="flex items-center gap-1 bg-white/10 text-white/60 text-[9px] font-medium px-2 py-1 rounded-lg border border-white/10">
              <Lock className="w-3 h-3" />
              <span>{lang === 'en' ? 'Preview' : lang === 'ar' ? 'معاينة' : 'Aperçu'}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {/* Screenshot Toast Banner */}
      {toastNotice && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white border border-white/10 px-4 py-2.5 rounded-lg shadow-2xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Lock className="w-4 h-4 text-white/60 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {renderInteractiveToolbar()}

      {/* UNIFIED CANVAS */}
      <UnifiedCVCanvas
        id={id}
        cv={cv}
        template={template}
        userTier={resolvedTier as SubscriptionTier}
        user={user}
        isReorderActive={isReorderActive}
        onSectionsReorder={onSectionsReorder}
        onUpdateSectionZone={onUpdateSectionZone}
        onUpdateCV={onUpdateCV}
        watermarkContent={renderWatermarkOverlay()}
        hideStatusBanner={!interactivePreview}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};