import React, { useState } from 'react';
import { CV, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Plus, Search, Edit3, Copy, Trash2, Download, CreditCard, Clock, CheckCircle2, FileText, Upload, X, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
  cvs: CV[];
  langue: Language;
  onCreateNew: () => void;
  onImportClick: () => void;
  onEditCV: (cv: CV) => void;
  onDuplicateCV: (cvId: string) => void;
  onRenameCV: (cvId: string, currentTitle: string) => void;
  onDeleteCV: (cvId: string) => void;
  onPayOrExport: (cv: CV) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cvs,
  langue,
  onCreateNew,
  onImportClick,
  onEditCV,
  onDuplicateCV,
  onRenameCV,
  onDeleteCV,
  onPayOrExport
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAYE' | 'NON_PAYE'>('ALL');

  // Interactive Modal States for Rename and Delete
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCVs = cvs.filter(cv => {
    const matchesSearch = cv.titre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PAYE' && cv.statutPaiement === 'PAYE') ||
      (statusFilter === 'NON_PAYE' && cv.statutPaiement !== 'PAYE');

    return matchesSearch && matchesStatus;
  });

  const handleOpenRename = (cv: CV) => {
    setRenameTarget({ id: cv.id, title: cv.titre });
    setNewTitleInput(cv.titre);
  };

  const handleConfirmRename = () => {
    if (renameTarget && newTitleInput.trim()) {
      onRenameCV(renameTarget.id, newTitleInput.trim());
      showToast('CV renommé avec succès !');
      setRenameTarget(null);
    }
  };

  const handleOpenDelete = (cv: CV) => {
    setDeleteTarget({ id: cv.id, title: cv.titre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteCV(deleteTarget.id);
      showToast('CV supprimé avec succès.');
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = (cv: CV) => {
    onDuplicateCV(cv.id);
    showToast(`Copie de "${cv.titre}" créée avec succès !`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('myResumes')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gérez vos CVs, personnalisez-les et exportez vos fichiers PDF.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onImportClick}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{t('importCVBtn')}</span>
          </button>

          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createNewCV')}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Filter */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('filterAll')} ({cvs.length})
          </button>
          
          <button
            onClick={() => setStatusFilter('PAYE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              statusFilter === 'PAYE' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('filterPaid')} ({cvs.filter(c => c.statutPaiement === 'PAYE').length})
          </button>

          <button
            onClick={() => setStatusFilter('NON_PAYE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              statusFilter === 'NON_PAYE' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('filterPending')} ({cvs.filter(c => c.statutPaiement !== 'PAYE').length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:border-blue-500 outline-hidden"
          />
        </div>

      </div>

      {/* Grid of Resumes */}
      {filteredCVs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('noCVsFound')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t('noCVsSubtitle')}</p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createNewCV')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCVs.map((cv) => (
            <div
              key={cv.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Header & Status Badge */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs font-mono text-slate-400">{cv.police}</span>

                {cv.statutPaiement === 'PAYE' && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {t('statusPaid')}
                  </span>
                )}
                {cv.statutPaiement === 'EN_ATTENTE_VALIDATION' && (
                  <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                    {t('statusPending')}
                  </span>
                )}
                {cv.statutPaiement === 'NON_PAYE' && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-slate-200 dark:border-slate-700">
                    {t('statusUnpaid')} (500 FCFA)
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cv.couleurAccent }} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {cv.titre}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t('lastUpdated')} : {new Date(cv.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 space-y-2">
                
                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onEditCV(cv)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('actionEdit')}</span>
                  </button>

                  <button
                    onClick={() => onPayOrExport(cv)}
                    className={`w-full font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                      cv.statutPaiement === 'PAYE'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white'
                    }`}
                  >
                    {cv.statutPaiement === 'PAYE' ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payer (500 FCFA)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Secondary Actions (Dupliquer, Renommer, Supprimer) */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleDuplicate(cv)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    title="Dupliquer ce CV"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Dupliquer</span>
                  </button>

                  <button
                    onClick={() => handleOpenRename(cv)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer font-medium"
                    title="Renommer ce CV"
                  >
                    Renommer
                  </button>

                  <button
                    onClick={() => handleOpenDelete(cv)}
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Supprimer ce CV"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* RENAME MODAL */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Renommer le CV</h3>
              <button onClick={() => setRenameTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nouveau nom du document</label>
              <input
                type="text"
                value={newTitleInput}
                onChange={(e) => setNewTitleInput(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 outline-hidden font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRename}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/80 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Supprimer ce CV ?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cette action est définitive et irréversible.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              Voulez-vous vraiment supprimer <span className="font-bold text-slate-900 dark:text-white">"{deleteTarget.title}"</span> ?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
