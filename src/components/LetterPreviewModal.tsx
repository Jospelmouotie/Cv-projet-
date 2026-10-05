import React, { useState, useRef, useEffect } from 'react';
import { SavedLetter } from '../types';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Download,
  ChevronDown,
  FileText,
  FileType,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { 
  exportLetterToPDF, 
  exportLetterToWord, 
  exportLetterToPlainText, 
  printLetterDocument 
} from '../utils/pdfExport';

interface LetterPreviewModalProps {
  letter: SavedLetter | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (letter: SavedLetter) => void;
  onPrint?: (letter: SavedLetter) => void;
}

export const LetterPreviewModal: React.FC<LetterPreviewModalProps> = ({
  letter,
  isOpen,
  onClose,
  onEdit,
  onPrint
}) => {
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);

  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !letter) return null;

  const accentColor = letter.couleurAccent || '#1e40af';
  const fontFamily = letter.police || 'Inter';
  const fontSize = letter.taillePolice || 11;

  const handleCopy = () => {
    const formatted = `${letter.expediteur?.nomComplet || ''}
${letter.expediteur?.adresse || ''}
${letter.expediteur?.telephone || ''} | ${letter.expediteur?.email || ''}

${letter.entreprise || ''}
${letter.destinataire || 'Direction des Ressources Humaines'}

${letter.villeDate || ''}

Objet : ${letter.objet || 'Candidature'}

${letter.formulePolitesseEntree || 'Madame, Monsieur,'}

${letter.paragrapheAccroche || ''}

${letter.paragrapheValeurAjoutee || ''}

${letter.paragrapheAdequationEntreprise || ''}

${letter.paragrapheConclusion || ''}

${letter.formulePolitesseSortie || 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.'}

${letter.signature || letter.expediteur?.nomComplet || ''}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintDocument = () => {
    if (onPrint) {
      onPrint(letter);
    } else {
      printLetterDocument(letter);
    }
  };

  const handleExportPDF = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    setExportNotice({ type: 'loading', message: 'Génération du PDF HD...' });
    try {
      const letterEl = document.getElementById('modal-letter-a4-sheet');
      const res = await exportLetterToPDF(letterEl || letter, letter.titre || 'lettre-motivation');
      if (res.success) {
        setExportNotice({ type: 'success', message: 'PDF téléchargé avec succès !' });
        setTimeout(() => setExportNotice(null), 3000);
      } else {
        setExportNotice({ type: 'error', message: res.message || 'Erreur export PDF' });
      }
    } catch (err: any) {
      setExportNotice({ type: 'error', message: `Erreur : ${err?.message || 'Erreur'}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    setExportNotice({ type: 'loading', message: 'Génération du fichier Word (.doc)...' });
    try {
      const res = await exportLetterToWord(letter, letter.titre || 'lettre-motivation');
      if (res.success) {
        setExportNotice({ type: 'success', message: 'Document Word (.doc) exporté avec succès !' });
        setTimeout(() => setExportNotice(null), 3000);
      } else {
        setExportNotice({ type: 'error', message: res.message || 'Erreur export Word' });
      }
    } catch (err: any) {
      setExportNotice({ type: 'error', message: `Erreur : ${err?.message || 'Erreur'}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPlainText = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    setExportNotice({ type: 'loading', message: 'Génération du fichier texte brut (.txt)...' });
    try {
      const res = await exportLetterToPlainText(letter, letter.titre || 'lettre-motivation');
      if (res.success) {
        setExportNotice({ type: 'success', message: 'Fichier texte (.txt) exporté avec succès !' });
        setTimeout(() => setExportNotice(null), 3000);
      } else {
        setExportNotice({ type: 'error', message: res.message || 'Erreur export texte' });
      }
    } catch (err: any) {
      setExportNotice({ type: 'error', message: `Erreur : ${err?.message || 'Erreur'}` });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-neutral-100 dark:bg-neutral-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-neutral-300 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="absolute top-16 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className={`px-4 py-2 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
              exportNotice.type === 'loading'
                ? 'bg-blue-600 text-white border-blue-500'
                : exportNotice.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}>
              {exportNotice.type === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {exportNotice.type === 'success' && <Check className="w-3.5 h-3.5" />}
              <span>{exportNotice.message}</span>
            </div>
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <Eye className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                  {letter.titre || 'Prévisualisation de la Lettre'}
                </h3>
                {letter.couleurAccent && (
                  <span 
                    className="w-3 h-3 rounded-full shrink-0 border border-white dark:border-neutral-800 shadow-xs"
                    style={{ backgroundColor: accentColor }}
                    title={`Couleur appliquée : ${accentColor}`}
                  />
                )}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2 truncate">
                <span>{letter.poste || 'Candidature'}</span>
                <span>•</span>
                <span className="font-semibold">{letter.entreprise || 'Entreprise'}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-0.5 border border-neutral-200 dark:border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.1))}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Zoom arrière"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-bold text-[10px] text-neutral-600 dark:text-neutral-400 select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.25, prev + 0.1))}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Zoom avant"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 sm:px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copier le texte"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copier</span>
                </>
              )}
            </button>

            {/* Multi-format Export Dropdown Menu */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Exporter dans différents formats"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exporter</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] font-black uppercase text-neutral-400">Exporter en format</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors text-neutral-900 dark:text-white"
                  >
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span>PDF Haute Définition (.pdf)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportWord}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors text-neutral-900 dark:text-white"
                  >
                    <FileType className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Document Word (.doc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPlainText}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors text-neutral-900 dark:text-white"
                  >
                    <FileCheck className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>Texte Brut (.txt)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrintDocument}
              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Imprimer avec couleurs exactes préservées"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            {/* Edit Button if handler provided */}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(letter);
                }}
                className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Modifier dans l'éditeur"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Éditer</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Real A4 Sheet Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-neutral-200/70 dark:bg-neutral-950/80">
          <div 
            id="modal-letter-a4-sheet"
            className="letter-a4-sheet bg-white text-neutral-900 p-8 sm:p-12 md:p-16 rounded-2xl shadow-xl border border-neutral-300 w-full max-w-[760px] min-h-[960px] relative transition-transform origin-top"
            style={{
              fontFamily,
              fontSize: `${fontSize}pt`,
              lineHeight: 1.6,
              transform: `scale(${zoomLevel})`
            }}
          >
            {/* Top Accent Strip with exact print color adjust */}
            <div 
              className="h-1.5 w-20 rounded-full mb-8"
              style={{ 
                backgroundColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            />

            {/* Sender & Recipient Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-neutral-200">
              {/* Sender Block */}
              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-sm text-neutral-900">{letter.expediteur?.nomComplet || 'Nom du Candidat'}</p>
                {letter.expediteur?.titreProfessionnel && (
                  <p className="font-semibold text-neutral-600">{letter.expediteur.titreProfessionnel}</p>
                )}
                {letter.expediteur?.adresse && (
                  <p className="text-neutral-500">{letter.expediteur.adresse}</p>
                )}
                <div className="text-neutral-500 pt-1 space-y-0.5">
                  {letter.expediteur?.telephone && <p>{letter.expediteur.telephone}</p>}
                  {letter.expediteur?.email && <p>{letter.expediteur.email}</p>}
                </div>
              </div>

              {/* Recipient Block */}
              <div className="text-left sm:text-right space-y-1 text-xs">
                <p 
                  className="font-black text-sm uppercase tracking-wider"
                  style={{ 
                    color: accentColor,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}
                >
                  {letter.entreprise || 'Entreprise Cible'}
                </p>
                <p className="font-bold text-neutral-800">{letter.destinataire || 'Direction des Ressources Humaines'}</p>
                <p className="text-neutral-500">{letter.villeDate || `Fait le ${new Date().toLocaleDateString('fr-FR')}`}</p>
              </div>
            </div>

            {/* Subject / Objet */}
            <div className="my-8">
              <div 
                className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-1"
                style={{ 
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                  borderLeft: `3px solid ${accentColor}`,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}
              >
                Objet
              </div>
              <p className="font-black text-base text-neutral-900 mt-1">
                {letter.objet || `Candidature au poste de ${letter.poste || 'Professionnel'}`}
              </p>
            </div>

            {/* Salutation */}
            <div className="mb-6 font-bold text-neutral-900">
              {letter.formulePolitesseEntree || 'Madame, Monsieur,'}
            </div>

            {/* Letter Body Paragraphs */}
            <div className="space-y-5 text-neutral-800 text-justify">
              {letter.paragrapheAccroche && (
                <p className="leading-relaxed">
                  {letter.paragrapheAccroche}
                </p>
              )}

              {letter.paragrapheValeurAjoutee && (
                <p className="leading-relaxed">
                  {letter.paragrapheValeurAjoutee}
                </p>
              )}

              {letter.paragrapheAdequationEntreprise && (
                <p className="leading-relaxed">
                  {letter.paragrapheAdequationEntreprise}
                </p>
              )}

              {letter.paragrapheConclusion && (
                <p className="leading-relaxed">
                  {letter.paragrapheConclusion}
                </p>
              )}

              {letter.texteComplet && !letter.paragrapheAccroche && (
                <div className="whitespace-pre-line leading-relaxed">
                  {letter.texteComplet}
                </div>
              )}
            </div>

            {/* Closing Salutation */}
            <div className="mt-8 font-medium text-neutral-800">
              {letter.formulePolitesseSortie || 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.'}
            </div>

            {/* Signature Block */}
            <div className="mt-12 text-right">
              <p className="font-extrabold text-sm text-neutral-900">
                {letter.signature || letter.expediteur?.nomComplet || 'Signature'}
              </p>
              {letter.expediteur?.titreProfessionnel && (
                <p className="text-xs text-neutral-500 font-medium">
                  {letter.expediteur.titreProfessionnel}
                </p>
              )}
              <div 
                className="h-0.5 w-24 ml-auto mt-2 rounded" 
                style={{ 
                  backgroundColor: accentColor, 
                  opacity: 0.7,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
