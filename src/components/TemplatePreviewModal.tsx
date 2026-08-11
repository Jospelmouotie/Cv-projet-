import React, { useState } from 'react';
import { CVTemplate, Language, CV } from '../types';
import { CVPreview } from './CVPreview';
import { getPresetForTemplate, getCleanPresetForTemplate } from '../data/templatePresets';
import { X, Check, Sparkles, ZoomIn, ZoomOut, RotateCcw, FileText, Eye } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: CVTemplate;
  langue: Language;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: CVTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  langue,
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  const [showFilledExample, setShowFilledExample] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0.8);

  const samplePreset = getPresetForTemplate(template.id, langue);
  const cleanPreset = getCleanPresetForTemplate(template.id, langue);

  const activePreset = showFilledExample ? samplePreset : cleanPreset;

  const dummyCv: CV = {
    id: `cv-modal-preview-${template.id}`,
    utilisateurId: 'demo',
    titre: activePreset.titre,
    templateId: template.id,
    langue: langue,
    couleurAccent: activePreset.couleurAccent,
    police: activePreset.police,
    photoUrl: activePreset.photoUrl,
    afficherPhoto: true,
    statutPaiement: 'PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: activePreset.sections
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex flex-col animate-fadeIn">
      
      {/* Modal Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between text-white shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight">{template.name}</h2>
              <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-md text-[10px] font-bold uppercase">
                {template.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Aperçu haute-définition du modèle avant création</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Example Data Toggle */}
          <button
            type="button"
            onClick={() => setShowFilledExample(!showFilledExample)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border cursor-pointer ${
              showFilledExample
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{showFilledExample ? 'Exemple Rempli' : 'Aperçu Vierge'}</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-slate-300 space-x-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
              className="p-1 hover:bg-slate-700 rounded-lg cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 w-10 text-center font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
              className="p-1 hover:bg-slate-700 rounded-lg cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(0.8)}
              className="p-1 hover:bg-slate-700 rounded-lg cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => {
              onSelect(template);
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Utiliser ce modèle</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container with Scrollable Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90 touch-pan-x touch-pan-y">
        <div 
          className="transition-transform duration-150 origin-top bg-white shadow-2xl rounded-sm overflow-hidden my-4"
          style={{
            width: '794px',
            transform: `scale(${zoomLevel})`,
            marginBottom: `${(1 - zoomLevel) * -200}px`
          }}
        >
          <CVPreview cv={dummyCv} interactivePreview={false} />
        </div>
      </div>

      {/* Bottom bar info on mobile */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 sm:hidden flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold">{template.name}</span>
        <button
          onClick={() => {
            onSelect(template);
            onClose();
          }}
          className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
        >
          Choisir
        </button>
      </div>

    </div>
  );
};
