import React, { useState } from 'react';
import { SavedLetter, Language, CV } from '../types';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Briefcase, 
  Building, 
  Calendar, 
  Sparkles,
  ExternalLink,
  Target,
  FileCheck,
  Download,
  Eye
} from 'lucide-react';
import { LetterPreviewModal } from '../components/LetterPreviewModal';
import { printLetterDocument, exportLetterToWord, exportLetterToPlainText } from '../utils/pdfExport';

interface LettersDashboardViewProps {
  letters?: SavedLetter[];
  cvs?: CV[];
  langue: Language;
  onCreateNewLetter: () => void;
  onEditLetter: (letter: SavedLetter) => void;
  onDuplicateLetter?: (letterId: string) => void;
  onRenameLetter?: (letterId: string, newTitle: string) => void;
  onDeleteLetter?: (letterId: string) => void;
  onPrintLetter?: (letter: SavedLetter) => void;
  onGoToJobTargeting?: () => void;
  onGoToDashboard?: () => void;
}

export const LettersDashboardView: React.FC<LettersDashboardViewProps> = ({
  letters: initialLetters,
  cvs = [],
  langue,
  onCreateNewLetter,
  onEditLetter,
  onDuplicateLetter,
  onRenameLetter,
  onDeleteLetter,
  onPrintLetter,
  onGoToJobTargeting,
  onGoToDashboard
}) => {
  const [lettersList, setLettersList] = useState<SavedLetter[]>(initialLetters || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewModalLetter, setPreviewModalLetter] = useState<SavedLetter | null>(null);

  // Fetch letters from API if not supplied
  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/lettres', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        setLettersList(data.letters || []);
      }
    } catch (err) {
      console.error('Error fetching letters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialLetters) {
      setLettersList(initialLetters);
    } else {
      fetchLetters();
    }
  }, [initialLetters]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyText = (letter: SavedLetter) => {
    const fullContent = `${letter.expediteur?.nomComplet || ''}
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

${letter.formulePolitesseSortie || 'Cordialement,'}

${letter.signature || letter.expediteur?.nomComplet || ''}`;

    navigator.clipboard.writeText(letter.texteComplet || fullContent);
    setCopiedId(letter.id);
    showToast('Texte complet de la lettre copié dans le presse-papier !');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const safeLetters = lettersList || [];
  const filteredLetters = safeLetters.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchesTitle = (l.titre || '').toLowerCase().includes(q);
    const matchesCompany = (l.entreprise || '').toLowerCase().includes(q);
    const matchesPoste = (l.poste || '').toLowerCase().includes(q);
    const matchesObjet = (l.objet || '').toLowerCase().includes(q);
    return matchesTitle || matchesCompany || matchesPoste || matchesObjet;
  });

  const handleOpenRename = (letter: SavedLetter) => {
    setRenameTarget({ id: letter.id, title: letter.titre });
    setNewTitleInput(letter.titre);
  };

  const handleConfirmRename = async () => {
    if (renameTarget && newTitleInput.trim()) {
      if (onRenameLetter) {
        onRenameLetter(renameTarget.id, newTitleInput.trim());
      } else {
        try {
          const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
          await fetch(`/api/lettres/${renameTarget.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ titre: newTitleInput.trim() })
          });
          setLettersList(prev => prev.map(l => l.id === renameTarget.id ? { ...l, titre: newTitleInput.trim() } : l));
        } catch (e) {
          console.error(e);
        }
      }
      showToast('Lettre renommée avec succès !');
      setRenameTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      if (onDeleteLetter) {
        onDeleteLetter(deleteTarget.id);
      } else {
        try {
          const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
          await fetch(`/api/lettres/${deleteTarget.id}`, {
            method: 'DELETE',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          setLettersList(prev => prev.filter(l => l.id !== deleteTarget.id));
        } catch (e) {
          console.error(e);
        }
      }
      showToast('Lettre supprimée.');
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (letterId: string) => {
    if (onDuplicateLetter) {
      onDuplicateLetter(letterId);
    } else {
      try {
        const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
        const res = await fetch(`/api/lettres/${letterId}/duplicate`, {
          method: 'POST',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.letter) {
            setLettersList(prev => [data.letter, ...prev]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    showToast('Copie de la lettre créée avec succès !');
  };

  const handlePrint = (letter: SavedLetter) => {
    if (onPrintLetter) {
      onPrintLetter(letter);
    } else {
      printLetterDocument(letter);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-white/10 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <h1 className="font-serif text-[28px] text-black dark:text-white leading-tight">
            {langue === 'en' ? 'My Cover Letters' : langue === 'ar' ? 'رسائل التحفيز الخاصة بي' : 'Mes Lettres de Motivation'}
          </h1>
          <p className="text-sm text-black/50 dark:text-white/50 mt-1 font-light">
            {langue === 'en'
              ? 'Manage, edit, customize and print your targeted application cover letters.'
              : langue === 'ar'
              ? 'إدارة وتعديل وتخصيص وطباعة رسائل التحفيز الخاصة بك.'
              : 'Gérez, éditez, personnalisez et imprimez vos lettres de candidature enregistrées.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onGoToJobTargeting}
            className="px-4 py-2 bg-white dark:bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white font-semibold text-xs rounded-lg border border-black/15 dark:border-white/15 transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{langue === 'en' ? 'Tailor to Job Offer' : langue === 'ar' ? 'تخصيص حسب عرض عمل' : 'Cibler une offre'}</span>
          </button>

          <button
            type="button"
            onClick={onCreateNewLetter}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{langue === 'en' ? 'New Cover Letter' : langue === 'ar' ? 'رسالة جديدة' : 'Rédiger une lettre'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/35 dark:text-white/35" />
          <input
            type="text"
            placeholder={langue === 'en' ? 'Search by title, company, position...' : langue === 'ar' ? 'بحث بالعنوان أو الشركة...' : 'Rechercher par titre, entreprise, poste...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-neutral-800 border-[1.5px] border-black/15 dark:border-white/15 text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 rounded-lg focus:border-black dark:focus:border-white outline-none transition-colors"
          />
        </div>

        <div className="text-xs font-semibold text-black/50 dark:text-white/50">
          <span>{filteredLetters.length} {filteredLetters.length > 1 ? 'lettres enregistrées' : 'lettre enregistrée'}</span>
        </div>
      </div>

      {/* Grid of Letters */}
      {filteredLetters.length === 0 ? (
        <div className="bg-white dark:bg-transparent rounded-lg border border-black/10 dark:border-white/10 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-20 mx-auto border border-black/30 dark:border-white/30 rounded-none p-2 flex flex-col justify-between">
            <div className="w-8 h-1 bg-black/40 dark:bg-white/40" />
            <div className="space-y-1">
              <div className="w-full h-0.5 bg-black/20 dark:bg-white/20" />
              <div className="w-3/4 h-0.5 bg-black/20 dark:bg-white/20" />
              <div className="w-5/6 h-0.5 bg-black/20 dark:bg-white/20" />
            </div>
            <div className="w-1/2 h-0.5 bg-black/20 dark:bg-white/20" />
          </div>
          <h3 className="font-serif text-lg text-black dark:text-white">
            {langue === 'en' ? 'No cover letters found' : langue === 'ar' ? 'لا توجد رسائل تحفيزية' : 'Aucune lettre de motivation trouvée'}
          </h3>
          <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mx-auto font-light">
            {langue === 'en'
              ? 'Generate a personalized cover letter using your CV, or tailor one directly for a job offer.'
              : langue === 'ar'
              ? 'أنشئ رسالة تحفيز مخصصة باستخدام سيرتك الذاتية أو استهدف عرض عمل.'
              : 'Générez une lettre de motivation percutante avec l\'IA à partir de votre CV, ou créez-en une sur-mesure pour une offre d\'emploi.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onCreateNewLetter}
              className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-lg hover:bg-black/85 dark:hover:bg-white/85 transition-all inline-flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{langue === 'en' ? 'Create Cover Letter' : langue === 'ar' ? 'إنشاء رسالة' : 'Rédiger une Lettre'}</span>
            </button>
            <button
              type="button"
              onClick={onGoToJobTargeting}
              className="px-5 py-2.5 bg-white dark:bg-transparent border border-black/15 dark:border-white/15 text-black dark:text-white font-semibold text-xs rounded-lg hover:border-black/50 transition-all inline-flex items-center space-x-2 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>{langue === 'en' ? 'Target a Job Offer' : langue === 'ar' ? 'استهداف وظيفة' : 'Cibler une Offre'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLetters.map((letter) => {
            const linkedCV = cvs.find(c => c.id === letter.cvId);
            return (
              <div
                key={letter.id}
                className="bg-white dark:bg-[#121212] rounded-lg border border-black/8 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Header Card Info */}
                <div className="p-4 border-b border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">
                      Lettre IA Pro
                    </span>
                    <h3 className="font-semibold text-black dark:text-white text-base line-clamp-1">
                      {letter.titre}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="space-y-1.5 text-xs text-black/60 dark:text-white/60">
                    <div className="flex items-center gap-2 font-medium">
                      <Building className="w-3.5 h-3.5 text-black/40 dark:text-white/40 shrink-0" />
                      <span className="font-semibold text-black dark:text-white">{letter.entreprise || 'Entreprise Cible'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-black/40 dark:text-white/40 shrink-0" />
                      <span className="text-black/60 dark:text-white/60 line-clamp-1">{letter.poste || 'Poste visé'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-black/40 dark:text-white/40 pt-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{letter.updatedAt ? new Date(letter.updatedAt).toLocaleDateString('fr-FR') : 'Récemment'}</span>
                      {linkedCV && (
                        <span className="ml-auto bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] text-black/60 dark:text-white/60 font-medium truncate max-w-[120px]">
                          CV: {linkedCV.titre}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Letter Snippet Preview */}
                  <div className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/8 dark:border-white/10 text-[11px] text-black/60 dark:text-white/60 italic line-clamp-3 leading-relaxed font-light">
                    "{letter.paragrapheAccroche || letter.texteComplet?.slice(0, 150) || 'Contenu de la lettre...'}"
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/8 dark:border-white/10 space-y-2">
                  
                  {/* Primary Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewModalLetter(letter)}
                      className="w-full bg-white dark:bg-neutral-800 border border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white text-black dark:text-white font-semibold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      title="Prévisualiser la lettre au format A4"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aperçu</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditLetter(letter)}
                      className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 font-semibold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      title="Éditer et modifier les textes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrint(letter)}
                      className="w-full bg-white dark:bg-neutral-800 border border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white text-black dark:text-white font-semibold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      title="Imprimer ou enregistrer en PDF A4"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>

                  {/* Secondary Quick Actions */}
                  <div className="flex items-center justify-between pt-2 text-xs text-black/50 dark:text-white/50 font-medium">
                    <button
                      type="button"
                      onClick={() => handleCopyText(letter)}
                      className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copier le texte complet"
                    >
                      {copiedId === letter.id ? (
                        <span className="text-black dark:text-white font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Copié !
                        </span>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(letter.id)}
                      className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Dupliquer
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenRename(letter)}
                      className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Renommer
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: letter.id, title: letter.titre })}
                      className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                      title="Supprimer la lettre"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename Modal Dialog */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-[12px] p-6 max-w-md w-full shadow-[0_20px_48px_rgba(0,0,0,0.2)] space-y-4">
            <h3 className="font-serif text-base text-black dark:text-white">Renommer la lettre de motivation</h3>
            <input
              type="text"
              value={newTitleInput}
              onChange={(e) => setNewTitleInput(e.target.value)}
              placeholder="Nouveau titre de la lettre..."
              className="w-full h-12 px-4 text-xs bg-white dark:bg-neutral-800 border-[1.5px] border-black/15 dark:border-white/15 text-black dark:text-white rounded-lg focus:border-black dark:focus:border-white outline-none transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename();
                if (e.key === 'Escape') setRenameTarget(null);
              }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 text-xs font-semibold border-[1.5px] border-black/15 dark:border-white/15 text-black dark:text-white hover:border-black/40 rounded-lg cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRename}
                className="px-5 py-2 text-xs font-semibold bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 rounded-lg cursor-pointer shadow-xs transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-[12px] p-6 max-w-md w-full shadow-[0_20px_48px_rgba(0,0,0,0.2)] space-y-4">
            <h3 className="font-serif text-base text-black dark:text-white">Confirmer la suppression</h3>
            <p className="text-xs text-black/60 dark:text-white/60 font-light">
              Êtes-vous sûr de vouloir supprimer définitivement la lettre <strong>"{deleteTarget.title}"</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold border-[1.5px] border-black/15 dark:border-white/15 text-black dark:text-white hover:border-black/40 rounded-lg cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time A4 Letter Preview Modal */}
      <LetterPreviewModal
        letter={previewModalLetter}
        isOpen={!!previewModalLetter}
        onClose={() => setPreviewModalLetter(null)}
        onEdit={(letter) => {
          setPreviewModalLetter(null);
          onEditLetter(letter);
        }}
        onPrint={(letter) => {
          handlePrint(letter);
        }}
      />
    </div>
  );
};
