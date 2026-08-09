import React, { useEffect, useState } from 'react';
import { CV, Section } from '../types';
import { CV_TEMPLATES } from '../data/templates';
import { UnifiedCVCanvas } from './UnifiedCVCanvas';
import { Lock, Move, Eye, Palette } from 'lucide-react';

interface CVPreviewProps {
  cv: CV;
  id?: string;
  onMoveSectionUp?: (sectionId: string) => void;
  onMoveSectionDown?: (sectionId: string) => void;
  onUpdateColor?: (color: string) => void;
  onUpdatePhotoShape?: (shape: 'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche') => void;
  onUpdatePhotoSize?: (size: number) => void;
  onSectionsReorder?: (newSections: Section[]) => void;
  interactivePreview?: boolean;
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  cv,
  id = 'cv-preview-container',
  onUpdateColor,
  onUpdatePhotoShape,
  onUpdatePhotoSize,
  onSectionsReorder,
  interactivePreview = true
}) => {
  const [isReorderActive, setIsReorderActive] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const template = CV_TEMPLATES.find(t => t.id === cv.templateId) || CV_TEMPLATES[0];

  // Anti-Screenshot Notice for Unpaid CVs
  useEffect(() => {
    if (!interactivePreview || cv.statutPaiement === 'PAYE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
        setToastNotice("🔒 Capture d'écran détectée ! Cet aperçu est filigrané. Téléchargez le PDF HD sans filigrane après validation.");
        setTimeout(() => setToastNotice(null), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactivePreview, cv.statutPaiement]);

  // Watermark Overlay
  const renderWatermarkOverlay = () => {
    if (cv.statutPaiement === 'PAYE') return null;

    return (
      <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden flex flex-col justify-between p-8 opacity-15 select-none print:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-around items-center -rotate-12 transform my-6">
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-slate-900 border-2 border-slate-900 px-4 py-1 rounded">
              CV PRO — APERÇU FILIGRANÉ — NON PAYÉ
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Interactive Reorder Toolbar Header
  const renderInteractiveToolbar = () => {
    if (!interactivePreview) return null;

    return (
      <div className="print:hidden mb-3 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-2 select-none border border-slate-800">
        {/* Reorder Switch */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsReorderActive(!isReorderActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isReorderActive
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            style={{ minHeight: '38px' }}
          >
            <Move className="w-4 h-4" />
            <span>{isReorderActive ? 'Mode Réorganisation [ACTIF]' : 'Activer Mode Réorganisation'}</span>
          </button>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {isReorderActive ? 'Glissez-déposez les blocs de section' : 'Aperçu fixe (scroll fluide)'}
          </span>
        </div>

        {/* Quick Style Controls */}
        <div className="flex items-center space-x-1">
          {onUpdatePhotoShape && (
            <select
              value={cv.photoForme || 'ronde'}
              onChange={(e) => onUpdatePhotoShape(e.target.value as any)}
              className="text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 outline-none"
            >
              <option value="ronde">Photo Ronde</option>
              <option value="carree">Photo Carrée</option>
              <option value="arrondie">Photo Coins Arrondis</option>
              <option value="arche">Photo Arche</option>
            </select>
          )}

          {cv.statutPaiement !== 'PAYE' && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-amber-500/30">
              <Lock className="w-3 h-3" />
              <span>Aperçu Filigrané</span>
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
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/50 px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {renderInteractiveToolbar()}

      {/* UNIFIED CANVAS */}
      <UnifiedCVCanvas
        id={id}
        cv={cv}
        template={template}
        isReorderActive={isReorderActive}
        onSectionsReorder={onSectionsReorder}
        watermarkContent={renderWatermarkOverlay()}
      />
    </div>
  );
};
