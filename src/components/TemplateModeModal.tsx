import React, { useState } from 'react';
import { CVTemplate, Language } from '../types';
import { Palette, FileText, Check, X } from 'lucide-react';
import { getTranslation, getLocalizedTemplateName } from '../i18n/translations';

interface TemplateModeModalProps {
  template: CVTemplate;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: CVTemplate, mode: 'visual' | 'form') => void;
  langue: Language;
}

export const TemplateModeModal: React.FC<TemplateModeModalProps> = ({
  template,
  isOpen,
  onClose,
  onConfirm,
  langue
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);
  const [selectedMode, setSelectedMode] = useState<'visual' | 'form'>('visual');

  if (!isOpen) return null;

  const localizedName = getLocalizedTemplateName(template, langue);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-[12px] max-w-xl w-full p-6 shadow-[0_20px_48px_rgba(0,0,0,0.2)] space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2 border-b border-black/8 dark:border-white/10">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
              {t('selectedTemplateLabel')}
            </span>
            <h2 className="font-serif text-lg text-black dark:text-white mt-0.5">{localizedName}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-black/60 dark:text-white/60">
          {t('chooseEditingModeTitle')}
        </p>

        {/* Choice Cards: two large options side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Visual Editor Option */}
          <div
            onClick={() => setSelectedMode('visual')}
            className={`p-5 rounded-lg border-2 transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
              selectedMode === 'visual'
                ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.03]'
                : 'border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white bg-white dark:bg-neutral-800'
            }`}
          >
            {selectedMode === 'visual' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
            <div className="space-y-2">
              <div className="w-9 h-9 rounded border border-black/15 dark:border-white/15 text-black dark:text-white flex items-center justify-center">
                <Palette className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-semibold text-sm text-black dark:text-white">
                {t('visualEditorTitle')}
              </h3>
              <p className="text-[11px] text-black/55 dark:text-white/55 leading-relaxed font-light">
                {t('visualEditorDesc')}
              </p>
            </div>

            <div className="pt-2 border-t border-black/8 dark:border-white/10 text-[10px] font-semibold text-black dark:text-white">
              {t('visualEditorFeature')}
            </div>
          </div>

          {/* Form Option */}
          <div
            onClick={() => setSelectedMode('form')}
            className={`p-5 rounded-lg border-2 transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
              selectedMode === 'form'
                ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.03]'
                : 'border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white bg-white dark:bg-neutral-800'
            }`}
          >
            {selectedMode === 'form' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
            <div className="space-y-2">
              <div className="w-9 h-9 rounded border border-black/15 dark:border-white/15 text-black dark:text-white flex items-center justify-center">
                <FileText className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-semibold text-sm text-black dark:text-white">
                {t('guidedFormTitle')}
              </h3>
              <p className="text-[11px] text-black/55 dark:text-white/55 leading-relaxed font-light">
                {t('guidedFormDesc')}
              </p>
            </div>

            <div className="pt-2 border-t border-black/8 dark:border-white/10 text-[10px] font-semibold text-black dark:text-white">
              {t('guidedFormFeature')}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-black/8 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-[1.5px] border-black/15 dark:border-white/15 hover:border-black/40 text-black dark:text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(template, selectedMode);
              onClose();
            }}
            className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{selectedMode === 'visual' ? t('continueToVisual') : t('continueToForm')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
