import React, { useState } from 'react';
import { CV, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { getActiveCVDraft, getLastSavedTime, formatSavedTimeAgo } from '../utils/cvDraftStorage';
import { CVPreview } from '../components/CVPreview';
import { 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Upload, 
  X, 
  AlertTriangle, 
  FilePlus,
  Target,
  Mail,
  Linkedin,
  Sparkles,
  Layers,
  ArrowRight,
  Globe
} from 'lucide-react';
import { translateCV } from '../utils/cvTranslator';

interface DashboardViewProps {
  cvs: CV[];
  langue: Language;
  lettersCount?: number;
  initialTypeFilter?: 'ALL' | 'ORIGINAL' | 'MODIFIED';
  onCreateNew: () => void;
  onCreateBlankCV?: () => void;
  onImportClick: () => void;
  onEditCV: (cv: CV) => void;
  onDuplicateCV: (cvId: string) => void;
  onRenameCV: (cvId: string, currentTitle: string) => void;
  onDeleteCV: (cvId: string) => void;
  onPayOrExport: (cv: CV) => void;
  onGoToTranslator?: (cv: CV) => void;
  onGoToLetters?: () => void;
  onGoToJobTargeting?: () => void;
  onGoToLetterGenerator?: () => void;
  onGoToLinkedIn?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cvs = [],
  langue,
  lettersCount = 0,
  initialTypeFilter = 'ALL',
  onCreateNew,
  onCreateBlankCV,
  onImportClick,
  onEditCV,
  onDuplicateCV,
  onRenameCV,
  onDeleteCV,
  onPayOrExport,
  onGoToTranslator,
  onGoToLetters,
  onGoToJobTargeting,
  onGoToLetterGenerator,
  onGoToLinkedIn
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ORIGINAL' | 'MODIFIED'>(initialTypeFilter);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAYE' | 'NON_PAYE'>('ALL');

  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const safeCvs = Array.isArray(cvs) ? cvs : [];
  const originalCount = safeCvs.filter(c => !c.isModified).length;
  const modifiedCount = safeCvs.filter(c => c.isModified).length;

  const filteredCVs = safeCvs.filter(cv => {
    const matchesSearch = (cv.titre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.jobTargetTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.jobTargetCompany || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      typeFilter === 'ALL' ||
      (typeFilter === 'ORIGINAL' && !cv.isModified) ||
      (typeFilter === 'MODIFIED' && cv.isModified === true);

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PAYE' && cv.statutPaiement === 'PAYE') ||
      (statusFilter === 'NON_PAYE' && cv.statutPaiement !== 'PAYE');

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenRename = (cv: CV) => {
    setRenameTarget({ id: cv.id, title: cv.titre });
    setNewTitleInput(cv.titre);
  };

  const handleConfirmRename = () => {
    if (renameTarget && newTitleInput.trim()) {
      onRenameCV(renameTarget.id, newTitleInput.trim());
      showToast('CV renommé avec succès');
      setRenameTarget(null);
    }
  };

  const handleOpenDelete = (cv: CV) => {
    setDeleteTarget({ id: cv.id, title: cv.titre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteCV(deleteTarget.id);
      showToast('CV supprimé avec succès');
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = (cv: CV) => {
    onDuplicateCV(cv.id);
    showToast(`Copie de "${cv.titre}" créée`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-fade-in border border-white/10">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <h1 className="font-serif text-[28px] leading-tight text-black dark:text-white tracking-tight">
            {t('myResumes')}
          </h1>
          <p className="text-[14px] text-black/50 dark:text-white/50 mt-1 font-light">
            {safeCvs.length} {langue === 'en' ? 'resumes created' : langue === 'ar' ? 'سير ذاتية' : 'CVs créés au total'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onImportClick}
            className="px-4 py-2 bg-white dark:bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white text-xs font-semibold rounded-lg transition-all border border-black/15 dark:border-white/15 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('importCVBtn')}</span>
          </button>

          {onCreateBlankCV && (
            <button
              type="button"
              onClick={onCreateBlankCV}
              className="px-4 py-2 bg-white dark:bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white text-xs font-semibold rounded-lg transition-all border border-black/15 dark:border-white/15 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>{langue === 'en' ? 'Blank' : langue === 'ar' ? 'صفحة بيضاء' : 'Page vierge'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{langue === 'en' ? 'New CV' : langue === 'ar' ? 'سيرة جديدة' : 'Nouveau CV'}</span>
          </button>
        </div>
      </div>

      {/* 3 Indicators Strip */}
      <div className="grid grid-cols-3 border-y border-black/8 dark:border-white/8 py-4 my-2">
        <div className="text-center">
          <div className="font-serif text-[28px] leading-tight text-black dark:text-white">
            {safeCvs.length}
          </div>
          <div className="text-[12px] text-black/50 dark:text-white/50 mt-0.5">
            {langue === 'en' ? 'Created resumes' : langue === 'ar' ? 'سير ذاتية منشأة' : 'CV créés'}
          </div>
        </div>
        <div className="text-center border-x border-black/8 dark:border-white/8">
          <div className="font-serif text-[28px] leading-tight text-black dark:text-white">
            {modifiedCount}
          </div>
          <div className="text-[12px] text-black/50 dark:text-white/50 mt-0.5">
            {langue === 'en' ? 'Targeted / Adapted' : langue === 'ar' ? 'مخصصة لوظائف' : 'CV ciblés & adaptés'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-serif text-[28px] leading-tight text-black dark:text-white">
            {lettersCount}
          </div>
          <div className="text-[12px] text-black/50 dark:text-white/50 mt-0.5">
            {langue === 'en' ? 'Cover letters' : langue === 'ar' ? 'رسائل دافع' : 'Lettres enregistrées'}
          </div>
        </div>
      </div>

      {/* Quick Shortcuts - Minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {onGoToLetters && (
          <div
            onClick={onGoToLetters}
            className="border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 p-4 rounded-lg transition-all cursor-pointer flex items-center justify-between group bg-white dark:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-black/30 dark:group-hover:border-white/30 transition-colors">
                <Mail className="w-4 h-4 text-black/50 dark:text-white/50" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-black dark:text-white">
                  {langue === 'en' ? 'Cover Letters' : langue === 'ar' ? 'رسائل الدافع' : 'Lettres'}
                </h4>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {lettersCount} {langue === 'en' ? 'saved' : langue === 'ar' ? 'محفوظة' : 'enregistrée'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {onGoToJobTargeting && (
          <div
            onClick={onGoToJobTargeting}
            className="border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 p-4 rounded-lg transition-all cursor-pointer flex items-center justify-between group bg-white dark:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-black/30 dark:group-hover:border-white/30 transition-colors">
                <Target className="w-4 h-4 text-black/50 dark:text-white/50" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-black dark:text-white">
                  {langue === 'en' ? 'Target Job' : langue === 'ar' ? 'استهداف وظيفة' : 'Cibler offre'}
                </h4>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {langue === 'en' ? 'Adapt your CV' : langue === 'ar' ? 'تكييف السيرة' : 'Adapter le CV'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {onGoToLinkedIn && (
          <div
            onClick={onGoToLinkedIn}
            className="border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 p-4 rounded-lg transition-all cursor-pointer flex items-center justify-between group bg-white dark:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-black/30 dark:group-hover:border-white/30 transition-colors">
                <Linkedin className="w-4 h-4 text-black/50 dark:text-white/50" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-black dark:text-white">
                  {langue === 'en' ? 'LinkedIn Pro' : langue === 'ar' ? 'لينكد إن احترافي' : 'LinkedIn Pro'}
                </h4>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {langue === 'en' ? 'Optimize profile' : langue === 'ar' ? 'تحسين الملف' : 'Optimiser le profil'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>

      {/* In-Progress Auto-Saved Draft Quick Resume */}
      {(() => {
        const activeDraft = getActiveCVDraft();
        if (!activeDraft || !activeDraft.id) return null;
        const lastTime = formatSavedTimeAgo(activeDraft.updatedAt || getLastSavedTime(activeDraft.id), langue);
        return (
          <div className="bg-[#F9F9F9] dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFEFEF] dark:bg-white/10 text-black dark:text-white flex items-center justify-center shrink-0 border border-black/8 dark:border-white/10">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAEAEA] dark:bg-white/10 text-black dark:text-white">
                    {langue === 'en' ? 'Active Work Session' : langue === 'ar' ? 'جلسة العمل الحالية' : 'Session en cours'}
                  </span>
                  <span className="text-[11px] text-black/50 dark:text-white/50">
                    {lastTime}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-black dark:text-white mt-0.5 line-clamp-1">
                  {activeDraft.titre || (activeDraft as any).titreCV || 'Mon CV'}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditCV(activeDraft)}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{langue === 'en' ? 'Resume editing' : langue === 'ar' ? 'متابعة التعديل' : 'Reprendre l\'édition'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Filter Tabs - Minimal */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Type Filter Buttons */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              typeFilter === 'ALL'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            {langue === 'en' ? 'All' : langue === 'ar' ? 'الكل' : 'Tous'}
            <span className="ml-1.5 text-[10px] opacity-50">{safeCvs.length}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setTypeFilter('ORIGINAL')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'ORIGINAL'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{langue === 'en' ? 'Original' : langue === 'ar' ? 'أصلي' : 'Originaux'}</span>
            <span className="text-[10px] opacity-50">{originalCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('MODIFIED')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'MODIFIED'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{langue === 'en' ? 'Adapted' : langue === 'ar' ? 'مكيف' : 'Adaptés'}</span>
            <span className="text-[10px] opacity-50">{modifiedCount}</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/10 dark:border-white/10 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50'
              }`}
            >
              {langue === 'en' ? 'All' : langue === 'ar' ? 'الكل' : 'Tous'}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PAYE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                statusFilter === 'PAYE' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50'
              }`}
            >
              {langue === 'en' ? 'Paid' : langue === 'ar' ? 'مدفوع' : 'Payés'}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('NON_PAYE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                statusFilter === 'NON_PAYE' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50'
              }`}
            >
              {langue === 'en' ? 'Unpaid' : langue === 'ar' ? 'غير مدفوع' : 'À payer'}
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent border border-black/20 dark:border-white/20 hover:border-black/30 dark:hover:border-white/30 rounded-lg text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:border-black/50 dark:focus:border-white/50 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid of Resumes */}
      {filteredCVs.length === 0 ? (
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-12 text-center space-y-4 bg-white dark:bg-transparent max-w-lg mx-auto">
          {/* Simple fine black lines illustration */}
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
            {typeFilter === 'MODIFIED' 
              ? (langue === 'en' ? 'No adapted CVs yet' : langue === 'ar' ? 'لا توجد سير مكيفة' : 'Aucun CV adapté')
              : (langue === 'en' ? 'No resumes yet' : langue === 'ar' ? 'لا توجد سير ذاتية' : 'Aucun CV créé')}
          </h3>
          <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mx-auto font-light">
            {typeFilter === 'MODIFIED'
              ? (langue === 'en' ? 'Use "Target Job" to create a tailored version' : langue === 'ar' ? 'استخدم "استهداف وظيفة" لإنشاء نسخة مخصصة' : 'Utilisez "Cibler offre" pour créer une version sur-mesure')
              : (langue === 'en' ? 'Start building your professional resume in seconds' : 'Commencez à créer votre premier CV professionnel gratuitement.')}
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={typeFilter === 'MODIFIED' && onGoToJobTargeting ? onGoToJobTargeting : onCreateNew}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg hover:bg-black/85 dark:hover:bg-white/85 transition-colors cursor-pointer"
            >
              {typeFilter === 'MODIFIED' 
                ? (langue === 'en' ? 'Target a job' : 'Cibler une offre') 
                : (langue === 'en' ? 'Create my first resume' : 'Créer mon premier CV')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCVs.map((cv) => {
            const parentCV = cv.parentCvId ? cvs.find(c => c.id === cv.parentCvId) : null;
            const isModified = cv.isModified === true;
            
            return (
              <div
                key={cv.id}
                className="bg-white dark:bg-[#121212] border border-black/8 dark:border-white/10 rounded-none hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* A4 Miniature Preview Container */}
                <div 
                  onClick={() => onEditCV(cv)}
                  className="relative w-full aspect-[1/1.414] overflow-hidden bg-white border-b border-black/8 dark:border-white/10 cursor-pointer select-none"
                >
                  <div className="w-[794px] h-[1122px] origin-top-left pointer-events-none select-none scale-[0.44] sm:scale-[0.44] lg:scale-[0.46] absolute top-0 left-0 bg-white">
                    <CVPreview cv={cv} interactivePreview={false} />
                  </div>

                  {/* Status Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                    {isModified && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black shadow-xs">
                        {langue === 'en' ? 'Adapted' : langue === 'ar' ? 'مكيف' : 'Adapté'}
                      </span>
                    )}
                  </div>

                  {cv.statutPaiement === 'PAYE' && (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 dark:bg-black/95 text-black dark:text-white text-[10px] font-semibold px-2 py-0.5 border border-black/10 dark:border-white/10 shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-black dark:text-white" />
                      <span>{langue === 'en' ? 'Paid' : langue === 'ar' ? 'مدفوع' : 'Payé'}</span>
                    </div>
                  )}
                </div>

                {/* Card Info & Meta */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 
                      onClick={() => onEditCV(cv)}
                      className="font-semibold text-[15px] text-black dark:text-white line-clamp-1 hover:underline cursor-pointer"
                    >
                      {cv.titre}
                    </h3>
                    <p className="text-[12px] text-black/50 dark:text-white/50 mt-0.5">
                      {t('lastUpdated')} : {new Date(cv.updatedAt).toLocaleDateString()}
                    </p>
                    {isModified && (
                      <p className="text-[11px] text-black/70 dark:text-white/70 mt-1 line-clamp-1">
                        {cv.jobTargetTitle || 'Poste ciblé'}{cv.jobTargetCompany ? ` · ${cv.jobTargetCompany}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-black/8 dark:border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onEditCV(cv)}
                      className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('actionEdit')}</span>
                    </button>

                    <div className="flex items-center gap-2 text-black/40 dark:text-white/40">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(cv)}
                        className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5"
                        title={langue === 'en' ? 'Duplicate' : 'Dupliquer'}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {onGoToTranslator && (
                        <button
                          type="button"
                          onClick={() => onGoToTranslator(cv)}
                          className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5"
                          title={langue === 'en' ? 'Translate' : 'Traduire'}
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenRename(cv)}
                        className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5"
                        title={langue === 'en' ? 'Rename' : 'Renommer'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onPayOrExport(cv)}
                        className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5"
                        title={cv.statutPaiement === 'PAYE' ? 'Exporter PDF' : 'Payer & Exporter'}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(cv)}
                        className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5"
                        title={langue === 'en' ? 'Delete' : 'Supprimer'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENAME MODAL */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-[12px] max-w-md w-full p-6 space-y-4 shadow-[0_20px_48px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base text-black dark:text-white">
                {langue === 'en' ? 'Rename CV' : langue === 'ar' ? 'إعادة تسمية السيرة' : 'Renommer le CV'}
              </h3>
              <button onClick={() => setRenameTarget(null)} className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black dark:text-white">
                {langue === 'en' ? 'New name' : langue === 'ar' ? 'اسم جديد' : 'Nouveau nom'}
              </label>
              <input
                type="text"
                value={newTitleInput}
                onChange={(e) => setNewTitleInput(e.target.value)}
                autoFocus
                className="w-full h-12 px-4 text-sm bg-white dark:bg-neutral-800 border-[1.5px] border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 border-[1.5px] border-black/15 dark:border-white/15 hover:border-black/40 text-black dark:text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors"
              >
                {langue === 'en' ? 'Cancel' : langue === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRename}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-lg hover:bg-black/85 dark:hover:bg-white/85 transition-colors cursor-pointer"
              >
                {langue === 'en' ? 'Save' : langue === 'ar' ? 'حفظ' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-black/60 dark:text-white/60" />
              </div>
              <div>
                <h3 className="font-medium text-base text-black dark:text-white">
                  {langue === 'en' ? 'Delete CV?' : langue === 'ar' ? 'حذف السيرة؟' : 'Supprimer le CV ?'}
                </h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5 font-light">
                  {langue === 'en' ? 'This action cannot be undone' : langue === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'Cette action est irréversible'}
                </p>
              </div>
            </div>

            <p className="text-sm text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10 p-3 rounded-lg">
              {langue === 'en' ? 'Delete' : langue === 'ar' ? 'حذف' : 'Supprimer'} <span className="font-medium text-black dark:text-white">"{deleteTarget.title}"</span> ?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60 font-medium text-xs rounded-lg cursor-pointer transition-colors"
              >
                {langue === 'en' ? 'Cancel' : langue === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-medium text-xs rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition-colors cursor-pointer"
              >
                {langue === 'en' ? 'Delete' : langue === 'ar' ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};