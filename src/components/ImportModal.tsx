import React, { useState, useEffect } from 'react';
import { Language, Section } from '../types';
import { getTranslation } from '../i18n/translations';
import { parseCVTextToSections } from '../utils/cvParser';
import { Upload, FileText, AlertCircle, X, AlignLeft, RefreshCw } from 'lucide-react';

interface ImportModalProps {
  langue: Language;
  onClose: () => void;
  onImportComplete: (sections: Section[], defaultTitle: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ langue, onClose, onImportComplete }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualText, setManualText] = useState('');

  useEffect(() => {
    let timer: any;
    if (isProcessing) {
      setProgressPercent(15);
      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 35) return prev + 10;
          if (prev < 75) return prev + 6;
          if (prev < 94) return prev + 2;
          return prev;
        });
      }, 300);
    } else {
      setProgressPercent(0);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(pdf|docx|txt)$/i)) {
      setErrorMessage('Veuillez sélectionner un fichier au format .pdf, .docx ou .txt');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('cv_builder_token');
      const response = await fetch('/api/import/parse', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        if (response.status === 429 || data.error?.includes('quota') || data.error?.includes('token') || data.error?.includes('Resource')) {
          throw new Error('Le quota de traitement automatique est temporairement saturé. Veuillez copier et coller le texte directement dans l\'onglet "Coller du texte brut".');
        }
        throw new Error(data.error || 'Erreur lors de l\'extraction du document. Essayez l\'onglet "Coller du texte brut".');
      }

      const extractedText = data.text;
      let sections: Section[] = [];

      if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
        sections = data.sections;
      } else if (extractedText && typeof extractedText === 'string' && extractedText.trim().length >= 10) {
        sections = parseCVTextToSections(extractedText.trim(), langue);
      } else {
        throw new Error(
          'Impossible d\'extraire les informations de ce document. Vous pouvez copier-coller le texte directement dans l\'onglet "Coller du texte brut".'
        );
      }

      const cleanTitle = `CV Importé - ${selectedFile.name.replace(/\.[^/.]+$/, '')}`;

      setIsProcessing(false);
      onImportComplete(sections, cleanTitle);
      onClose();
    } catch (err: any) {
      console.error('Error importing file:', err);
      setErrorMessage(err.message || 'Erreur lors de l\'extraction du fichier. Essayez de copier-coller votre texte manuellement.');
      setIsProcessing(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualText || manualText.trim().length < 20) {
      setErrorMessage('Veuillez coller au moins un texte de CV valide (au moins 20 caractères).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const response = await fetch('/api/import/parse-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: manualText.trim(), langue })
      });

      let sections: Section[] = [];
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
          sections = data.sections;
        }
      }

      if (sections.length === 0) {
        sections = parseCVTextToSections(manualText.trim(), langue);
      }

      const cleanTitle = `CV Importé - Saisie Manuelle`;
      setIsProcessing(false);
      onImportComplete(sections, cleanTitle);
      onClose();
    } catch (err: any) {
      console.error('Error in manual import:', err);
      const sections = parseCVTextToSections(manualText.trim(), langue);
      setIsProcessing(false);
      onImportComplete(sections, 'CV Importé - Saisie Manuelle');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('importModalTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reconnaissance automatique et OCR intelligent de CV (PDF, Word, Scans, Images)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-850 p-1">
          <button
            onClick={() => { setActiveTab('file'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Fichier (PDF, Word, Scanné, Image)</span>
          </button>
          <button
            onClick={() => { setActiveTab('text'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            <span>Coller du texte brut</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">{errorMessage}</span>
                {activeTab === 'file' && (
                  <button
                    onClick={() => setActiveTab('text')}
                    className="block text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer mt-1"
                  >
                    Essayer de coller le texte manuellement →
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'file' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shadow-xs transition-colors">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dropzoneText')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, DOCX, TXT ou scan image (.png, .jpg) jusqu'à 15 Mo</p>
              </div>

              <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                <span>Parcourir mes fichiers (PDF, Word, Scan, Image)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Collez l'intégralité du contenu texte de votre CV :
              </label>
              <textarea
                rows={8}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Ex: Jean Dupont&#10;Ingénieur Logiciel&#10;Email: jean@exemple.com&#10;&#10;EXPÉRIENCES...&#10;FORMATIONS..."
                className="w-full p-3 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleManualImport}
                disabled={isProcessing || !manualText.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Importer et convertir en CV
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="p-5 bg-slate-900 border border-blue-500/40 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                <span className="flex items-center gap-2 text-white">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  {progressPercent < 35
                    ? (langue === 'ar' ? '1. قراءة وتحليل المستند...' : langue === 'en' ? '1. Reading and analyzing document...' : '1. Lecture et analyse du fichier...')
                    : progressPercent < 75
                    ? (langue === 'ar' ? '2. التعرف الضوئي OCR واستخراج الأقسام...' : langue === 'en' ? '2. OCR & Section Extraction...' : '2. Extraction OCR & reconnaissance des sections...')
                    : (langue === 'ar' ? '3. الهيكلة والتوزيع الذكي في النموذج...' : langue === 'en' ? '3. Smart Section Structuring...' : '3. Structuration intelligente des données...')}
                </span>
                <span className="font-mono text-emerald-400 font-black text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-md"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center pt-1">
                {langue === 'ar' ? 'يرجى الانتظار بضع ثوانٍ بينما يقوم المساعد الذكي بمعالجة السيرة.' : langue === 'en' ? 'Please hold on a moment while AI builds your structured resume.' : 'Veuillez patienter quelques secondes pendant l\'extraction et la conversion.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

