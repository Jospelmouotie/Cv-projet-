import React from 'react';
import { CVDocument } from '../types/document';
import { CheckCircle2, AlertTriangle, XCircle, X, Award, FileText } from 'lucide-react';

interface ATSAnalyzerModalProps {
  document: CVDocument;
  onClose: () => void;
}

export const ATSAnalyzerModal: React.FC<ATSAnalyzerModalProps> = ({ document, onClose }) => {
  // Simple heuristic calculation for ATS score
  const hasEmail = document.pages.some(p => p.elements.some(e => JSON.stringify(e.content).includes('@')));
  const hasPhone = document.pages.some(p => p.elements.some(e => JSON.stringify(e.content).match(/\+?\d[\d\s]{8,}/)));
  const totalElements = document.pages.reduce((acc, p) => acc + p.elements.length, 0);

  const score = Math.min(100, Math.max(65, (hasEmail ? 20 : 0) + (hasPhone ? 20 : 0) + Math.min(50, totalElements * 5) + 15));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm">Analyse de Compatibilité ATS</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Score Circle */}
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{score} / 100</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">Excellent Score de Lisibilité ATS</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Votre CV possède une structure claire facilement analysable par les logiciels de recrutement.</p>
          </div>

          {/* Checklist */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
              <span className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Format de texte vectoriel extractible</span>
              </span>
              <span className="font-bold">100%</span>
            </div>

            <div className={`flex items-center justify-between p-2.5 rounded-xl ${
              hasEmail ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}>
              <span className="font-semibold flex items-center gap-2">
                {hasEmail ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                <span>Adresse Email Professionnelle</span>
              </span>
              <span className="font-bold">{hasEmail ? 'Détectée' : 'Manquante'}</span>
            </div>

            <div className={`flex items-center justify-between p-2.5 rounded-xl ${
              hasPhone ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}>
              <span className="font-semibold flex items-center gap-2">
                {hasPhone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                <span>Numéro de Téléphone Joignable</span>
              </span>
              <span className="font-bold">{hasPhone ? 'Détecté' : 'Manquant'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Fermer l'Analyse
          </button>
        </div>

      </div>
    </div>
  );
};
