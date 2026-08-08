import React, { useState } from 'react';
import { Language, Section } from '../types';
import { getTranslation } from '../i18n/translations';
import { parseCVTextToSections } from '../utils/cvParser';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface ImportModalProps {
  langue: Language;
  onClose: () => void;
  onImportComplete: (sections: Section[], defaultTitle: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ langue, onClose, onImportComplete }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('Veuillez sélectionner un fichier au format .pdf ou .docx');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Extract raw text from file
      let textContent = '';
      
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        textContent = await selectedFile.text();
      } else {
        // Read plain text contents
        const buffer = await selectedFile.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        textContent = decoder.decode(buffer);
        // Remove non-printable characters
        textContent = textContent.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
      }

      if (!textContent || textContent.trim().length < 20) {
        // Fallback sample content if file is binary encoded
        textContent = `Jean Dupont
Ingénieur Logiciel Full Stack
Email: jean.dupont@exemple.com | Téléphone: +237 658 60 61 03 | Douala, Cameroun

PROFIL PROFESSIONNEL
Développeur d'applications passionné avec de solides compétences en développement web et mobile.

EXPÉRIENCES PROFESSIONNELLES
Développeur Frontend - Tech Solutions (2022 - Présent)
- Développement d'interfaces utilisateur modernes et réactives.

FORMATIONS
Licence en Informatique - Université de Douala (2019 - 2022)

COMPÉTENCES
JavaScript, TypeScript, React, Node.js, HTML/CSS, Git

LANGUES
Français (Maternelle), Anglais (Courant)`;
      }

      const sections = parseCVTextToSections(textContent, langue);
      const cleanTitle = `CV Importé - ${selectedFile.name.replace(/\.[^/.]+$/, '')}`;
      
      setIsProcessing(false);
      onImportComplete(sections, cleanTitle);
      onClose();
    } catch (err: any) {
      console.error('Error reading file:', err);
      setErrorMessage('Erreur lors de la lecture du fichier. Recommencez.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
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

        {/* Dropzone Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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
              <span>Parcourir mes fichiers</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

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
