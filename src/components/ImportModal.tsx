import React, { useState } from 'react';
import { Language, Section } from '../types';
import { getTranslation } from '../i18n/translations';
import { parseCVTextToSections } from '../utils/cvParser';
import { Upload, FileText, AlertCircle, X, AlignLeft } from 'lucide-react';

interface ImportModalProps {
  langue: Language;
  onClose: () => void;
  onImportComplete: (sections: Section[], defaultTitle: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ langue, onClose, onImportComplete }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualText, setManualText] = useState('');

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

      const response = await fetch('/api/import/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de l\'extraction du texte.');
      }

      const extractedText = data.text;
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('Impossible d\'extraire du texte de ce fichier. Il s\'agit peut-être d\'un document scanné.');
      }

      const sections = parseCVTextToSections(extractedText, langue);
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

  const handleManualImport = () => {
    if (!manualText || manualText.trim().length < 20) {
      setErrorMessage('Veuillez coller au moins un texte de CV valide (au moins 20 caractères).');
      return;
    }

    setIsProcessing(true);
    try {
      const sections = parseCVTextToSections(manualText.trim(), langue);
      const cleanTitle = `CV Importé - Saisie Manuelle`;
      setIsProcessing(false);
      onImportComplete(sections, cleanTitle);
      onClose();
    } catch (err: any) {
      setErrorMessage('Erreur lors du traitement du texte. Veuillez vérifier le contenu.');
      setIsProcessing(false);
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Extraction et conversion fidèle sans réécriture par IA</p>
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
            <span>Fichier PDF / DOCX / TXT</span>
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
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('dropzoneHint')}</p>
              </div>

              <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                <span>Parcourir mes fichiers (.pdf, .docx, .txt)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
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
            <div className="p-4 bg-blue-50 dark:bg-blue-950/80 rounded-xl text-center text-xs text-blue-700 dark:text-blue-300 font-bold animate-pulse border border-blue-200 dark:border-blue-800">
              {t('importing')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

